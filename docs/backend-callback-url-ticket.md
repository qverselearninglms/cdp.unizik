# Accept `callback_url` on payment initiation

**Component:** Payments / Admission API
**Priority:** High — students are paying successfully and the payment is not being applied
**Status:** ✅ **Resolved by backend** — see [from-backend/VERIFY_RESPONSES.md](from-backend/VERIFY_RESPONSES.md). The original request is kept below for history.

## Resolution (from the backend)

- **`callback_url` is honoured** on all five checkouts, including `generate-purchase-link` and the access fee. Allowed hosts are the frontend host, `PAYMENT_CALLBACK_HOSTS` (e.g. staging), and `localhost` outside production. The URL must be `https` with no `user@` and no `#fragment`. Anything else falls back to `FRONTEND_BASE_URL/verify-payments`.
- **`fee_type` is always on the return URL.** If our URL has none, the server adds it. TransactPay appends `&transRef=TP-…&src=transactpay`.
- **The verify endpoints don't care which fee they are called for.** The fee is read from the reference (`TP-APP-` / `TP-ACC-` / `TP-TUI-` / `TP-AXS-`), and every reply names it in `payment_type`. An unknown fee type can no longer strand a payment.
- **Which reference (related issue 1):** send everything the URL carries (`transRef`, `reference`, `trans_ref`, `merchant_reference`). Our `TP-…` reference arrives in `transRef`.
- **`status` / `errorMessage` on the URL (related issue 2):** ignore them, because TransactPay doesn't send them and students can edit them. The verify reply's `status` is the answer.
- **The production example below** (`reference=1429L6ZR6Z1786863566`) came from the previous gateway, which was used until August 2026. Those references get the reply `unknown_reference`, and support handles them by hand.

**Frontend changes made in response** ([verify-payments/page.tsx](../src/app/(admission)/(routes)/verify-payments/page.tsx), [payment-verification.ts](../src/lib/payment-verification.ts)):

- The verify page no longer guesses the fee from the amount. It picks an endpoint from the fee type in the URL, then the reference prefix, then the browser ledger, and finally falls back to the application endpoint. The `payment_type` in the reply decides where the student goes next.
- One screen per verify `status`. "Pay again" is never offered when money may have been taken (`pending`, `needs_attention`, `amount_mismatch`, `error`).
- **Declined payments return HTTP 401**, which the API client treated as an expired session: it logged the student out. Verify calls now go through `apiClient.getWithStatus`, which bypasses that interceptor.
- The manual recovery tip at the end of this ticket is no longer needed.

---

## Problem

When a student returns from TransactPay, the callback carries no indication of **which fee they just paid**. A real callback from production:

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
| Application | `GET /application/verify-payment` |
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

`POST /application/initialize-payment`, `/application/initialize-acceptance-payment` and `/application/initialize-tuition-payment` should accept an optional **`callback_url`** in the request body and pass it to TransactPay as the transaction's callback, instead of using a hardcoded value.

The same applies to the course access fee, `POST /student/initiate-access-fee-payment` (and its legacy `/student/course-payment`), whose callback is `…/verify-payments?fee_type=access&redirect=%2Fcourse-enrollment`. See [enrollment-access-fee-api-contract.md](enrollment-access-fee-api-contract.md) §3.

The frontend already sends it on all three endpoints:

```json
{
  "amount": 30000,
  "fee_type": "application_fee",
  "callback_url": "https://cdp.unizik.edu.ng/verify-payments?fee_type=application"
}
```

TransactPay appends its own parameters to whatever callback it is given, so the returned URL becomes:

```
https://cdp.unizik.edu.ng/verify-payments?fee_type=application&transAmount=...&reference=...&transRef=...
```

`fee_type` is then present on every callback, on every device, first try. The frontend already reads it and accepts both spellings (`application` and `application_fee`, likewise for `acceptance` and `tuition`).

### Validation

`callback_url` is attacker-controllable, so it **must be validated, not trusted**:

- Accept only an allowlist of hosts (production frontend, staging, and `localhost` in non-production).
- Reject anything else and fall back to the current hardcoded URL — never redirect to an arbitrary host.
- Keep the current behaviour when the field is absent, so nothing breaks for older clients.

### Acceptance criteria

- [ ] All three initiation endpoints accept `callback_url`.
- [ ] The value is host-allowlisted; a rejected or missing value falls back to today's hardcoded callback.
- [ ] TransactPay is configured with the supplied callback, and its own params are appended to it.
- [ ] A completed application-fee payment returns to `…/verify-payments?fee_type=application&transRef=…`.
- [ ] The same holds for acceptance and tuition.

## Alternative, if `callback_url` is not viable

Return the fee type from the verification endpoints instead — for example `data.fee_type` on `GET /application/verify-payment`. This does not fully solve it (the frontend must still pick *which* endpoint to call), so it is a weaker option, but combined with a single unified `GET /application/verify-payment?reference=…` that resolves the fee type server-side, it would work just as well:

```
GET /application/verify-payment?reference=ZT8l00IVe914YxSy29kG
→ { "fee_type": "application_fee", "status": "paid", "amount": 15100, ... }
```

A single verification endpoint that figures out the fee type from the reference it issued is arguably the cleanest design of all — the frontend would not need to know the fee type before verifying at all.

---

## Two related issues found while investigating

These are separate from the main request but were surfaced by the same callback.

### 1. Which reference does verification expect?

The callback returns **two** references:

- `reference=1429L6ZR6Z1786863566` — merchant reference
- `transRef=ZT8l00IVe914YxSy29kG` — TransactPay's transaction reference

The frontend currently sends **`transRef`** to `verify-payment?reference=…`. If the endpoint keys on the reference it generated at initiation, verification will fail even once the fee type is resolved. **Please confirm which one is expected** — it is a one-line frontend change either way.

### 2. `status` and `errorMessage` are not acted on

The callback carries `status=0` and `errorMessage=AUTHENTICATION_SUCCESSFUL`. The frontend currently ignores both, so a declined or abandoned payment follows the same path as a successful one. A documented list of TransactPay status codes for this integration would let the frontend short-circuit to a proper failure view instead of attempting verification.

---

## Impact until this ships

The browser-local ledger covers the common case — same device, same browser, production. It does **not** cover cross-device returns, cleared storage, or private browsing, and it cannot work in local or staging environments at all, since the hardcoded callback always lands on production while the ledger was written on `localhost`. That also means this flow is currently **untestable outside production**, which is its own argument for the change.

Stuck payments can be recovered manually today by appending `&fee_type=application` (or `acceptance` / `tuition`) to the callback URL and reloading it.
