# Verify responses (for the frontend)

After checkout, Transactpay sends the student to `/verify-payments?transRef=TP-…`. The page calls **one** of these with that reference (all four behave the same — the fee comes from the reference, `TP-APP-…` / `TP-ACC-…` / `TP-TUI-…` / `TP-AXS-…`):

```
GET /api/v1/application/verify-payment?transRef=TP-…
GET /api/v1/application/verify-acceptance-payment?transRef=TP-…
GET /api/v1/application/verify-tuition-payment?transRef=TP-…
GET /api/v1/application/verify-access-payment?transRef=TP-…
```

No login is needed. Calling it again is safe: a payment is never credited twice.

**Any of them works for any fee.** The backend reads the fee from the reference it issued, so calling the "wrong" endpoint still verifies and credits the right fee. Every reply also says which fee it was (`fee_type`).

**Which reference to send.** Send everything the return URL carries: `transRef`, `reference`, `trans_ref`, `merchant_reference`. The backend picks ours, which starts with `TP-`; Transactpay puts it in `transRef`. A Transactpay id (`TRNPAY-…`) also works once the payment has been checked once.

References without `TP-` (for example `reference=1429L6ZR6Z1786863566&transRef=ZT8l00IVe914YxSy29kG`) come from the previous gateway, used until August 2026. This backend can't verify them; they are answered with `unknown_reference`, and support handles them by hand.

**Ignore `status` and `errorMessage` on the return URL.** Transactpay doesn't add them to our return URL, and anything in the URL can be edited by the student. Always call verify: it asks Transactpay directly, and its `status` (below) is the answer.

## Saying which fee on the return URL

All checkouts accept an optional `callback_url`:
- `POST /application/initialize-payment`
- `POST /application/generate-purchase-link`
- `POST /application/initialize-acceptance-payment`
- `POST /application/initialize-tuition-payment`
- `POST /student/initiate-access-fee-payment`

```json
{ "callback_url": "https://cdp.unizik.edu.ng/verify-payments?fee_type=application" }
```

- **Allowed hosts:** the frontend's own host (`FRONTEND_BASE_URL`), any host in the server's `PAYMENT_CALLBACK_HOSTS` (for example staging), and `localhost` outside production. It must be `https` (except `localhost`), with no `user@` and no `#fragment`.
- **Anything else, or no `callback_url`:** today's default, `FRONTEND_BASE_URL/verify-payments`.
- **`fee_type` is always present.** If the URL has none, the server adds `fee_type=application_fee`, `acceptance_fee`, `tuition_fee` or `access_fee`.
- **What Transactpay adds:** `&transRef=TP-…&src=transactpay`. The student comes back to, for example, `…/verify-payments?fee_type=application&transRef=TP-APP-…&src=transactpay`.

## Shape

Every answer, success or not:

```json
{
  "success": false,
  "status": "needs_attention",
  "reference": "TP-APP-01M6FAHCNG3AS4NMBXH0D2BCJE",
  "payment_type": "application_fee",
  "message": "Your payment was received, but …"
}
```

- Pick the screen from **`status`**, and the fee from **`payment_type`** (`application_fee`, `acceptance_fee`, `tuition_fee`, `access_fee`).
  Don't work out the fee from the URL: only tuition and access checkouts carry `?payment_type=`.
- `message` is written for the student and can be shown as is.

| `status` | HTTP | Money taken? | Show the student |
|---|---|---|---|
| `paid` | 200 | yes, credited | Success. Also has `amount`. Refresh the profile. |
| `pending` | 202 | not yet | "Still being confirmed" — call verify again in a minute or two. |
| `failed` | 401* | no | Payment failed; they may try again. |
| `needs_attention` | 404 | **yes** | Received, not yet on their account; support has been alerted. **Don't offer "pay again".** |
| `amount_mismatch` | 409 | **yes**, too little | Not credited; support will contact them. Don't offer "pay again". |
| `error` | 500 | unknown | We couldn't reach Transactpay. Retry button; don't offer "pay again". |
| `missing_reference` | 422 | — | No reference in the link. |
| `unknown_reference` | 422 | — | Not one of our references; contact support. |
| `ignored` | 422 | — | Not a portal payment (test order). |

\* `failed` keeps the HTTP 401 it has always had. If the app's HTTP client logs the user out on 401, skip that for these three endpoints.
