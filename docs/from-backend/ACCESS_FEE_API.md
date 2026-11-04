# Access fee on /course-enrollment (for the frontend)

This is how the backend implements `enrollment-access-fee-api-contract.md`. Where it differs from the contract, it says so.

- **Course group = programme.** It is the student's LMS category id, `users.program_id`. Any other `course_group_id` gets `403`.
- **Login.** Every endpoint needs the student's bearer token (either login), and the student is taken from the token.
- **When the fee can be paid.** The access fee is paid once per programme, after the Application Fee and after tuition is paid in full.

## Endpoints

| Endpoint | What it does |
|---|---|
| `GET /student/program-courses?course_group_id=` | The programme's **visible** courses, paid or not: `course_id`, `course_name`, `short_name`, `summary`. `level`, `semester` and `credit_units` are not sent, because the LMS doesn't store them. |
| `GET /student/course-access-status?course_group_id=` | `payment_status`, `access_granted`, `access_fee_amount` (from the server's `PAYMENT_FEE_ACCESS`), `currency`, `reference`, `updated_at`, `requires_access_fee`. Extras: `payable`, and `message` (why it can't be paid yet, e.g. "Pay your tuition in full first (outstanding: NGN 95,000.00).") |
| `POST /student/initiate-access-fee-payment` | Charges the server price; the request's `amount` is only compared. Honours an allowlisted `callback_url`. Returns `data.authorizationUrl` and `data.status: payment_initiated`. **409** if access is already granted. **422** with `message` if it can't be paid yet. |
| `GET /student/verify-access-fee-payment?reference=&trans_ref=&merchant_reference=` | Asks Transactpay, then credits the payment and grants access in one database transaction, then enrols the student in every course of the programme on the LMS. Safe to repeat: each repeat also retries a failed LMS enrolment. Accepts our `TP-AXS-…` reference or Transactpay's `TRNPAY-…`. |
| `GET /student/paid-courses-category` | `[{course_group_id, course_group}]`: the programme, once unlocked. |
| `POST /student/mark-access-fee-paid` | Not implemented, as the contract asks. |

## `payment_status`

| Value | When |
|---|---|
| `not_started` | No payment, or the last one wasn't completed within 2 hours |
| `payment_initiated` | Checkout created and not finished, **or** money received but not applied yet (support has been alerted; never ask to pay again) |
| `paid` | Access granted, including a waiver (`requires_access_fee: false`) |
| `failed` | Last payment declined, or less than the fee was paid |

## Verify replies

| HTTP | `status` | `data.status` | Meaning |
|---|---|---|---|
| 200 | `success` | `paid` | Unlocked (`access_granted: true`) |
| 200 | `failed` | `failed` | Declined. `message` is written for the student |
| 202 | `pending` | `payment_initiated` | Still being confirmed |
| 409 | `pending` / `failed` | `payment_initiated` / `failed` | Received but not applied yet / underpaid |
| 403 | `failed` | `failed` | Another student's payment |
| 422 | `failed` | `failed` | No reference, or one this backend didn't issue |
| 503 | `pending` | `payment_initiated` | Transactpay unreachable. Try again; don't pay again |

## Waivers

An admin sets `users.access_fee_payment_status = 'waived'` (scholarship, staff). The programme then unlocks without payment.

## Not built here: `POST /student/lms-launch`

The LMS sign-in link (`{LMS}/ssotester/index.php?sso_loggers=1&u={reg_number}&password=1`) is served by a script on the Moodle server, not by this backend. A signed, short-lived launch token needs both sides:
- this API issues the token;
- Moodle checks it before signing the student in.

The Moodle side has to be built there first, so the endpoint hasn't been added yet.
