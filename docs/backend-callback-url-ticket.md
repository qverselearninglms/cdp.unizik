# Accept `callback_url` on payment initiation

**Component:** Payments / Admission API
**Priority:** High — students are paying successfully and the payment is not being applied
**Frontend status:** integrated and deployed-ready; it already sends the field and ignores it being ignored

---

## Problem

When a student returns from Credo, the callback carries no indication of **which fee they just paid**. A real callback from production:

```
https://cdp.unizik.edu.ng/verify-payments
  ?transAmount=15100.00
  &reference=1429L6ZR6Z1786863566
  &transRef=ZT8l00IVe914YxSy29kG
  &processorFee=75.50
  &errorMessage=AUTHENTICATION_SUCCESSFUL
  &currency=NGN
  &gateway=
  &status=0
```

The frontend must call one of three different verification endpoints depending on the fee:

| Fee | Verification endpoint |
|---|---|
| Access | `GET /application/verify-payment` |
| Acceptance | `GET /application/verify-acceptance-payment` |
| Tuition | `GET /application/verify-tuition-payment` |

With nothing in the callback to distinguish them, it cannot reliably choose. Students see:

> Your payment went through, but we could not tell which fee it was for, so it has not been applied yet.

The money is taken; the admission step does not advance.

## Why the frontend cannot solve this alone

Three fallbacks exist today, and each has a hard limit:

1. **`fee_type` query param** — never present, because the callback URL is fixed server-side.
2. **A browser-local ledger** keyed by payment reference, written before redirecting. Works, but only on the **same browser and same origin**. A student who pays on their phone and opens the receipt on a laptop is not covered, and neither is any non-production environment (see below).
3. **Matching the transaction amount** against known fee amounts. Unreliable by construction — the amounts are per-programme, so `₦15,100` matches none of the configured defaults, and where two fees share a figure it would silently verify the *wrong* fee. It now refuses to guess rather than risk that.

Only the server can close the gap, because only the server decides the callback URL.

## Requested change

`POST /application/initialize-payment`, `/application/initialize-acceptance-payment` and `/application/initialize-tuition-payment` should accept an optional **`callback_url`** in the request body and pass it to Credo as the transaction's callback, instead of using a hardcoded value.

The frontend already sends it on all three endpoints:

```json
{
  "amount": 30000,
  "fee_type": "access_fee",
  "callback_url": "https://cdp.unizik.edu.ng/verify-payments?fee_type=access"
}
```

Credo appends its own parameters to whatever callback it is given, so the returned URL becomes:

```
https://cdp.unizik.edu.ng/verify-payments?fee_type=access&transAmount=...&reference=...&transRef=...
```

`fee_type` is then present on every callback, on every device, first try. The frontend already reads it and accepts both `access` and `access_fee` spellings.

### Validation

`callback_url` is attacker-controllable, so it **must be validated, not trusted**:

- Accept only an allowlist of hosts (production frontend, staging, and `localhost` in non-production).
- Reject anything else and fall back to the current hardcoded URL — never redirect to an arbitrary host.
- Keep the current behaviour when the field is absent, so nothing breaks for older clients.

### Acceptance criteria

- [ ] All three initiation endpoints accept `callback_url`.
- [ ] The value is host-allowlisted; a rejected or missing value falls back to today's hardcoded callback.
- [ ] Credo is configured with the supplied callback, and its own params are appended to it.
- [ ] A completed access-fee payment returns to `…/verify-payments?fee_type=access&transRef=…`.
- [ ] The same holds for acceptance and tuition.

## Alternative, if `callback_url` is not viable

Return the fee type from the verification endpoints instead — for example `data.fee_type` on `GET /application/verify-payment`. This does not fully solve it (the frontend must still pick *which* endpoint to call), so it is a weaker option, but combined with a single unified `GET /application/verify-payment?reference=…` that resolves the fee type server-side, it would work just as well:

```
GET /application/verify-payment?reference=ZT8l00IVe914YxSy29kG
→ { "fee_type": "access_fee", "status": "paid", "amount": 15100, ... }
```

A single verification endpoint that figures out the fee type from the reference it issued is arguably the cleanest design of all — the frontend would not need to know the fee type before verifying at all.

---

## Two related issues found while investigating

These are separate from the main request but were surfaced by the same callback.

### 1. Which reference does verification expect?

The callback returns **two** references:

- `reference=1429L6ZR6Z1786863566` — merchant reference
- `transRef=ZT8l00IVe914YxSy29kG` — Credo's transaction reference

The frontend currently sends **`transRef`** to `verify-payment?reference=…`. If the endpoint keys on the reference it generated at initiation, verification will fail even once the fee type is resolved. **Please confirm which one is expected** — it is a one-line frontend change either way.

### 2. `status` and `errorMessage` are not acted on

The callback carries `status=0` and `errorMessage=AUTHENTICATION_SUCCESSFUL`. The frontend currently ignores both, so a declined or abandoned payment follows the same path as a successful one. A documented list of Credo status codes for this integration would let the frontend short-circuit to a proper failure view instead of attempting verification.

---

## Impact until this ships

The browser-local ledger covers the common case — same device, same browser, production. It does **not** cover cross-device returns, cleared storage, or private browsing, and it cannot work in local or staging environments at all, since the hardcoded callback always lands on production while the ledger was written on `localhost`. That also means this flow is currently **untestable outside production**, which is its own argument for the change.

Stuck payments can be recovered manually today by appending `&fee_type=access` (or `acceptance` / `tuition`) to the callback URL and reloading it.
