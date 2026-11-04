# Proposal: instant, definite payment status — no waiting

**For:** Backend team
**From:** Frontend (CDP portal)
**Affects:** `GET /student/course-access-status`, `POST /student/initiate-access-fee-payment`. Phase 2: the admission fees.
**Related:** [enrollment-access-fee-api-contract.md](enrollment-access-fee-api-contract.md), [from-backend/ACCESS_FEE_API.md](from-backend/ACCESS_FEE_API.md), [from-backend/VERIFY_RESPONSES.md](from-backend/VERIFY_RESPONSES.md)

---

## Summary

A student should never have to wait for a timer to find out where their payment stands. We propose three changes:

1. **Check TransactPay whenever the status is read.** `course-access-status` asks TransactPay about any open payment before it answers.
2. **Report one precise state** instead of the catch-all `payment_initiated`.
3. **Make "pay again" always safe.** `initiate` settles the previous checkout before opening a new one, so a double charge can't happen and the pay button never has to be hidden "just in case".

With these, the **2-hour abandonment rule can be removed**.

---

## The problem today

`payment_status: "payment_initiated"` covers two opposite situations:

| | What happened | Money taken? | What the student should see |
|---|---|---|---|
| **A** | Opened checkout, then closed it or changed their mind | No | "Not completed. Pay now." |
| **B** | Paid; TransactPay has the money, but it isn't applied to the account yet | **Yes** | "Payment received. Don't pay again." |

The frontend can't tell A from B. To protect B students from paying twice, it would have to hide the pay button for everyone, and an A student is then stuck until the 2-hour rule resets them to `not_started`. Two hours of "please wait" for a student who simply closed a tab is not acceptable.

## What the frontend does in the meantime (already shipped)

When the status is `payment_initiated` and `reference` is set, the page immediately calls `GET /application/verify-access-payment?transRef={reference}` and maps the answer:

| Verify `status` | Student sees |
|---|---|
| `paid` | Unlocked, with **Continue Learning** |
| `pending` | "Checkout not completed; no money taken" and a **Pay now** button |
| `needs_attention`, `amount_mismatch` | "Payment received; don't pay again" and a support link |
| `failed` | "Payment failed" and **Try again** |
| `error` | "Couldn't reach TransactPay" and **Check again** (no pay button) |

The page re-checks every 15 s in the background, but the student never waits for it: they always have a button that works.

**The remaining gap:** verify's `pending` can mean "checkout abandoned" **or** "the bank is still processing". In the second case the student is shown **Pay now** and could pay twice. Only the backend can close this gap, through changes 2 and 3 below.

---

## Proposed changes

### 1. Check TransactPay whenever the status is read

When `GET /student/course-access-status` finds the student's latest access-fee payment still open, it should:

1. Ask TransactPay for that transaction's status, using the same call `verify-access-payment` makes, with a short timeout (≈ 5 s).
2. Apply the result exactly as verify would. If it's paid, credit the payment and grant access in the same transaction.
3. Answer with the **settled** state.

- Cache the TransactPay answer per reference for about 10 s, so page polling doesn't flood TransactPay.
- If TransactPay doesn't answer in time, return the last known state with `gateway_check: "unavailable"` (see §4). Don't block the response.

### 2. Report one precise state

Replace the ambiguous `payment_initiated` with these values:

| `payment_status` | Meaning | `can_pay` | Student sees |
|---|---|---|---|
| `not_started` | No payment yet | `true` | **Pay access fee** |
| `checkout_open` | Checkout created; TransactPay has **no** payment for it (abandoned or in progress) | `true` | "Checkout not completed. No money taken." **Resume payment** / **Pay now** |
| `processing` | TransactPay reports the payment as **processing at the bank** | `false` | "Your bank is processing this. Don't pay again." Auto-refresh. |
| `received_not_applied` | Money received, not applied (support alerted) | `false` | "Payment received. Don't pay again." Support link. |
| `paid` | Access granted (includes waivers) | `false` | **Continue Learning** |
| `failed` | Declined, or underpaid and refunded/rejected | `true` | "Payment failed. No money taken." **Try again** |

- `processing` only applies if TransactPay exposes a processing/pending-at-bank state that is distinct from "never paid". **Please confirm whether it does.** If it doesn't, `checkout_open` is enough, and change 3 keeps it safe.
- Keep `payable` and `message` as they are. `can_pay` is simply "`payable` and the state allows it", so the frontend doesn't have to re-derive it.

The frontend already accepts `checkout_open`, `processing` and `received_not_applied`, so this can ship on the backend alone.

### 3. Make "pay again" safe: `initiate` settles the previous checkout first

When `POST /student/initiate-access-fee-payment` is called while an earlier checkout is still open:

1. Check the earlier checkout with TransactPay first (as in §1).
2. If it turns out **paid**, grant access and return **409** "Your courses are already unlocked." No new charge.
3. If it's **processing**, return **409** with `payment_status: "processing"` and a message. No new charge.
4. Otherwise, mark the earlier checkout `superseded` (and cancel it at TransactPay if their API allows), then create the new checkout.
5. If a superseded checkout is somehow paid later, **verify must still credit it** and grant access. If the student ends up paying twice, flag the second payment for refund.

This makes the pay button safe whenever `can_pay` is `true`, with no timer.

### 4. Response shape

```json
{
  "status": "success",
  "data": {
    "course_group_id": 34,
    "requires_access_fee": true,
    "payable": true,
    "can_pay": true,
    "message": null,
    "access_granted": false,
    "access_fee_amount": 20000,
    "currency": "NGN",

    "payment_status": "checkout_open",
    "status_message": "Your last checkout wasn't completed, so no money was taken. You can pay now.",
    "reference": "TP-AXS-01JC…",
    "checkout_url": "https://checkout.transactpay.ai/…",
    "gateway_check": "ok",
    "checked_at": "2026-11-04T14:03:12Z",
    "updated_at": "2026-11-04T14:00:00Z"
  }
}
```

| Field | Purpose |
|---|---|
| `can_pay` | Whether the pay button should be shown. Single source of truth. |
| `status_message` | One sentence written for the student about the **current** state. Shown as-is. |
| `checkout_url` | **Optional.** If the open TransactPay checkout link is still valid, return it so the student can resume the same checkout instead of creating a new one. Omit it if links expire or can't be reused. |
| `gateway_check` | `ok` when TransactPay answered just now; `unavailable` when it didn't (the frontend then shows "Couldn't reach TransactPay", with a re-check button and no pay button). |
| `checked_at` | When TransactPay was last asked. Shown to the student as "Last checked". |

### 5. TransactPay webhook (recommended)

If TransactPay supports payment webhooks, settle payments as soon as TransactPay reports them, whether or not the student is on the page. Then the status is usually already final by the time the student looks, and §1 becomes a safety net.

### 6. Remove the 2-hour rule

With §1–§3 in place, "`payment_initiated` older than 2 hours becomes `not_started`" is no longer needed. **Please remove it.** Nothing should change state just because time passed.

---

## Phase 2: admission fees

Application, acceptance and tuition payments have the same ambiguity on `/process-admission`. Once the access fee works this way, we propose the same treatment: a `payment_status`, `can_pay`, `status_message` and `reference` per fee on `GET /admission/student`.

---

## Acceptance criteria

- [ ] `course-access-status` checks TransactPay (cached about 10 s, timeout about 5 s) whenever the latest payment is open, and returns the settled state.
- [ ] `payment_status` is one of `not_started`, `checkout_open`, `processing`, `received_not_applied`, `paid`, `failed`. `payment_initiated` is no longer returned.
- [ ] `can_pay`, `status_message`, `gateway_check` and `checked_at` are returned. `checkout_url` is returned when the checkout can be resumed.
- [ ] `initiate` settles the previous open checkout first: **409** if it was paid or is processing, otherwise it supersedes the old checkout and creates a new one.
- [ ] A superseded checkout that gets paid is still credited, and a duplicate payment is flagged for refund.
- [ ] The 2-hour abandonment rule is removed.
- [ ] (Recommended) TransactPay webhook settles payments without a student visit.

## Questions for the backend

1. Does TransactPay report a "processing at the bank" state distinct from "no payment"? (This decides whether `processing` is needed.)
2. Can an open TransactPay checkout link be reused, and can an open checkout be cancelled through their API?
3. Does TransactPay offer webhooks for this merchant account?

---

## Appendix: separate small request on HTTP status codes

The verify endpoints answer a **declined** payment with **HTTP 401**. 401 conventionally means "you are not logged in", and many HTTP clients automatically log the user out when they see it. Ours did: a student whose card was declined was sent to the sign-in page.

We've fixed this on our side. Other apps that call these endpoints (mobile, admin) will hit the same problem, though.

**Request:** for a declined payment, return **HTTP 200** with `"status": "failed"` in the body. Keep 401 only for "missing or invalid login token". If changing it would break an existing client, tell us and we'll leave it.
