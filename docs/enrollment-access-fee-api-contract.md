# Access-fee enrollment API contract

**Component:** Student / Payments API
**Status:** ✅ **Implemented by backend**. Their notes are in [from-backend/ACCESS_FEE_API.md](from-backend/ACCESS_FEE_API.md) and [from-backend/VERIFY_RESPONSES.md](from-backend/VERIFY_RESPONSES.md). The frontend now calls these endpoints directly; the legacy fallbacks have been removed.
**Related:** [backend-callback-url-ticket.md](backend-callback-url-ticket.md) (resolved)

## Where the backend differs from this contract

| Topic | Backend behaviour | Frontend handling |
|---|---|---|
| When the fee can be paid | Only after the application fee is paid and tuition is paid **in full**. `course-access-status` adds `payable` and a student-facing `message`; initiate returns **422** with `message`. | A "Finish your admission payments first" state shows the backend's message, a disabled pay button and a link to `/process-admission`. |
| `payment_initiated` | Also means "money received, not applied yet" (support is alerted). | The page immediately asks TransactPay through `verify-access-payment` and shows the real state. See [proposal-instant-payment-status.md](proposal-instant-payment-status.md). |
| `failed` | Also covers underpayment. | "Try payment again" button. |
| `paid` | Includes waivers (`requires_access_fee: false`). | Unlocked. |
| Course fields | `level`, `semester` and `credit_units` are not sent, because the LMS doesn't store them. | Removed from the cards. |
| Verify | The canonical endpoint is `GET /application/verify-access-payment` (no login, same reply format as the other fees). Declined payments return **401**. | All four fees go through `src/lib/payment-verification.ts`, which never triggers the 401 logout. |
| Reference format | `TP-AXS-…` (ours) or `TRNPAY-…` (TransactPay's). | Both are forwarded; the `TP-AXS-` prefix identifies the fee. |
| `POST /student/lms-launch` | Not built yet: it needs a token check on the Moodle side first. | Still uses the SSO link (see the security note). |

---

## Purpose

A student must pay a one-time **access fee** for their programme before its courses are unlocked on the LMS. The frontend page is `/course-enrollment`.

1. The student opens `/course-enrollment`.
2. The page loads the student's programme (`lms_category` on `GET /admission/student`) and the courses in it.
3. The page asks whether the programme is unlocked. If it is not, a large **Pay access fee** button is shown and every course card is marked locked.
4. The student clicks the button. The frontend calls **initiate** and redirects to `authorizationUrl` (TransactPay).
5. TransactPay returns the student to `/verify-payments?fee_type=access&redirect=/course-enrollment&reference=…&transRef=…`.
6. The frontend calls **verify**. **The backend grants access as part of a successful verify.**
7. The student is sent to `/course-enrollment?access=granted`. The pay button is hidden, and every course card shows **Continue Learning**, which opens the LMS through the existing SSO link.

"Programme" and "course group" mean the same thing here: the LMS category id. It is sent as `course_group_id` throughout, matching the existing endpoints.

## Access-state model

`payment_status` takes exactly one of these values:

| Value | Meaning | What the student sees |
|---|---|---|
| `not_started` | No payment yet, or the last one was abandoned | Pay button and locked courses |
| `payment_initiated` | A payment was created and not yet confirmed | "Confirming your payment" banner. The page re-checks every 10 s. |
| `paid` | Verified, and access is granted | Pay button hidden, **Continue Learning** on every course |
| `failed` | The last payment was declined or failed verification | "Didn't go through" banner and a **Pay again** button |

```
not_started → payment_initiated → paid
                     ↓
                   failed → payment_initiated (retry)
```

`access_granted` is the gate for the UI. When it is `true`, the frontend treats the programme as unlocked whatever `payment_status` says.

> **Changed from the previous draft:** `payment_verified` and `continue_learning_unlocked` were merged into `paid` / `access_granted`, because verification and the access grant must happen in one step (see §4). The old `POST /student/mark-access-fee-paid` has been **removed**: a client-callable "grant me access" endpoint would let anyone unlock courses without paying.

---

## Endpoints

All endpoints need the student's bearer token. The student is taken from the token, never from the request body.

### 1) List the courses in the student's programme — **new**

`GET /student/program-courses?course_group_id={id}`

```json
{
  "status": "success",
  "data": {
    "course_group_id": 34,
    "course_group_name": "Business Administration",
    "courses": [
      {
        "course_id": 101,
        "course_name": "Principles of Management",
        "short_name": "BUS101",
        "summary": "<p>Introduction to…</p>",
        "level": "100 Level",
        "semester": "First",
        "credit_units": 3
      }
    ]
  }
}
```

- `course_id`, `course_name`, `short_name` and `summary` are required. HTML in `summary` is fine; the frontend strips it.
- `level`, `semester` and `credit_units`: **not sent**, because the LMS doesn't store them.
- Return only courses that are visible to students.
- Return the list **whether or not** the fee has been paid. Students should see what they are paying for.
- If `course_group_id` is not the student's own programme, return `403`.

### 2) Get the programme's access state

`GET /student/course-access-status?course_group_id={id}`

```json
{
  "status": "success",
  "data": {
    "course_group_id": 34,
    "course_group_name": "Business Administration",
    "requires_access_fee": true,
    "payment_status": "not_started",
    "access_granted": false,
    "access_fee_amount": 20000,
    "currency": "NGN",
    "reference": null,
    "updated_at": "2026-11-04T14:00:00Z"
  }
}
```

- `access_fee_amount` is **the** price. The frontend displays it and charges it, and has no other source for it.
- `requires_access_fee: false` unlocks the programme without payment (for scholarships, waivers or staff).
- `reference` is the latest payment reference, or `null`. Support uses it.
- **`payable`** (backend addition) is `false` until the application fee and full tuition are paid. **`message`** then explains why, e.g. "Pay your tuition in full first (outstanding: NGN 95,000.00)."
- ~~A `payment_initiated` payment older than about 2 hours should be reported as `not_started`.~~ **Withdrawn.** Students must not wait for a timeout. See [proposal-instant-payment-status.md](proposal-instant-payment-status.md).

### 3) Initiate the access-fee payment

`POST /student/initiate-access-fee-payment`

Request:

```json
{
  "course_group_id": 34,
  "course_group_name": "Business Administration",
  "amount": 20000,
  "currency": "NGN",
  "fee_type": "access_fee",
  "callback_url": "https://cdp.unizik.edu.ng/verify-payments?fee_type=access&redirect=%2Fcourse-enrollment"
}
```

Response:

```json
{
  "status": "success",
  "message": "Access fee payment initialized",
  "data": {
    "authorizationUrl": "https://checkout.transactpay.ai/…",
    "reference": "CDP-AC-20261104-000123",
    "amount": 20000,
    "currency": "NGN",
    "fee_type": "access_fee",
    "course_group_id": 34,
    "status": "payment_initiated"
  }
}
```

Rules:

- **Charge the server-side `access_fee_amount`, not the request's `amount`.** The request amount is for logging and mismatch detection only. Trusting it would let a student pay ₦1.
- If access is already granted, return `409` with a clear `message`. Do not create a second charge.
- If the fee isn't payable yet, return `422` with a student-facing `message`.
- `callback_url` follows the same rules as [backend-callback-url-ticket.md](backend-callback-url-ticket.md): honour it only if its host is allowlisted, otherwise use the default. **The `fee_type=access` in it is how the verify page knows which fee to verify.** Without it, verification works only on the same browser that started the payment.
- The gateway may add its own processing fee. The frontend neither adds nor subtracts it.
- Set `payment_status` to `payment_initiated`.

The frontend reads the URL from `authorizationUrl`, `authorization_url` or `gateway_url`, under `data` or at the top level. Any of these works.

### 4) Verify the payment and grant access

`GET /application/verify-access-payment?transRef={transRef}&reference={reference}&trans_ref=…&merchant_reference=…`

> **Confirmed by backend:** this is the endpoint to use. It needs no login and replies in the same format as the other three verify endpoints (`status: paid | pending | failed | needs_attention | amount_mismatch | error | missing_reference | unknown_reference | ignored`, plus `payment_type`), as described in [from-backend/VERIFY_RESPONSES.md](from-backend/VERIFY_RESPONSES.md). `/student/verify-access-fee-payment` is not used by the frontend. The example replies below are from the original draft.

The callback carries two references: `transRef` (the gateway's) and `reference` (the merchant's). The frontend sends both. Match on whichever one identifies the payment you created.

Success:

```json
{
  "status": "success",
  "success": true,
  "message": "Access fee payment verified successfully",
  "data": {
    "fee_type": "access_fee",
    "course_group_id": 34,
    "reference": "CDP-AC-20261104-000123",
    "trans_ref": "TP-XYZ-987654",
    "amount": 20000,
    "currency": "NGN",
    "status": "paid",
    "access_granted": true
  }
}
```

Failure (use HTTP 200 or 4xx; the frontend handles both):

```json
{
  "status": "failed",
  "success": false,
  "message": "Payment was declined by the bank",
  "data": { "fee_type": "access_fee", "reference": "CDP-AC-20261104-000123", "status": "failed" }
}
```

Rules:

- **Verify server-to-server with TransactPay.** Never trust the callback's `status` or amount query params; the student can edit them.
- In **one transaction**: mark the payment `paid`, set `access_granted = true`, and **enrol the student in every course of the programme on the LMS**, so the SSO landing page already lists them.
- **Idempotent.** Verifying an already-paid reference returns the same success response and does not double-grant or double-enrol. Students refresh this page.
- Check that the paid amount is at least `access_fee_amount` (excluding gateway fees).
- `message` on failure is shown to the student as-is, so write it for them.

### 5) Paid categories — existing, unchanged

`GET /student/paid-courses-category` returns `[{course_group_id, course_group}]`. This page no longer uses it.

---

## Backend checklist

- [x] `GET /student/program-courses` returns the visible courses of the student's own programme
- [x] `GET /student/course-access-status` returns the four-value `payment_status`, `access_granted` and the server-side price (plus `payable` and `message`)
- [x] Initiate charges the **server-side** amount, honours an allowlisted `callback_url`, and returns `409` when access is already granted (`422` when not payable)
- [x] Verify checks with TransactPay server-to-server, then grants access and enrols on the LMS atomically
- [x] Verify is idempotent and accepts either reference
- [ ] Replace the 2-hour abandonment timeout with a live status check. See [proposal-instant-payment-status.md](proposal-instant-payment-status.md).
- [x] `POST /student/mark-access-fee-paid` is **not** implemented
- [ ] `POST /student/lms-launch`: blocked until Moodle can check the token (see below)

## Security note: the LMS SSO link

The current SSO URL authenticates with only the student's registration number (`u=…&password=1`). Anyone who knows or guesses a registration number can open that student's LMS session. This predates the access fee, but the access fee makes it matter more: it is a way into paid content without paying. Recommended replacement:

`POST /student/lms-launch` → `{ "url": "https://lms…/auth/launch?token=<short-lived signed token>" }`

When it ships, the frontend will switch to it with a one-line change.

**Backend reply:** the SSO script runs on the Moodle server, not in this API. A signed launch token needs this API to issue the token **and** Moodle to check it before signing the student in. The Moodle side has to be built first. **This needs an owner on the Moodle/LMS side.** Until then, the link stays as it is.

## Contract summary

| Endpoint | Method | Status | Purpose |
|---|---|---|---|
| `/student/program-courses` | GET | ✅ Live | Courses in the student's programme |
| `/student/course-access-status` | GET | ✅ Live | Locked/unlocked state and the price |
| `/student/initiate-access-fee-payment` | POST | ✅ Live | Create the payment and return the TransactPay URL |
| `/application/verify-access-payment` | GET | ✅ Live (canonical) | Verify, grant access and enrol (atomic, idempotent) |
| `/student/paid-courses-category` | GET | Existing | No longer used by this page |
| ~~`/student/mark-access-fee-paid`~~ | ~~POST~~ | **Removed** | Folded into verify |
| `/student/lms-launch` | POST | Blocked on Moodle | Replaces the unauthenticated SSO link |
