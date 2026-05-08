# InboxRaja DLT integration

> Source of truth for our SMS provider integration. Update this file every time
> we discover a new edge case in their API behaviour.

## Endpoint

```
GET {INBOXRAJA_BASE_URL}/bulkV2

Query params:
  authorization     = INBOXRAJA_API_KEY  (yes — in the URL, per their docs)
  sender_id         = WIGOPE             (your DLT-registered header)
  message           = <numeric template id from DLT Manager>
  variables_values  = <the OTP itself, replaces {#var#}>
  route             = dlt
  numbers           = 10-digit mobile (no +91, no spaces)
  flash             = 0
  sms_details       = 1
```

## Success response shape

> _Captured from real send on YYYY-MM-DD — replace this once the first SMS lands._

```jsonc
// EXPECTED — confirm and update on first real call:
{
  "return": true,
  "status": "success",
  "message_id": "1234567890",   // unique provider id, store as Transaction.providerMessageId
  "credits_used": 1,
  "credits_remaining": 999
}
```

## Failure response shape

InboxRaja returns HTTP 200 even on logical failure. Detect failure via:

- `return === false`, OR
- `status === "error"`, OR
- `error` field present, OR
- `success === false`

## Common error messages

| Provider message | Likely cause |
|---|---|
| `Invalid Authorization` | API key wrong or rotated |
| `Invalid Sender ID` | Sender ID not whitelisted on DLT for this template |
| `Invalid Template ID` | Numeric ID not registered or template body mismatch |
| `Variable count mismatch` | Template has N vars, you sent ≠ N values |
| `Daily limit exceeded` | Account credit / daily quota out |

## Quirks

- **Auth is in the query string.** Don't move to a header — their gateway only reads the param.
- **Variable separator** is `|` if the template has multiple `{#var#}` slots. Our OTP template has exactly one slot, so we send a single value.
- **Timeouts** can occasionally take ~9s on first request after idle. Our client uses 10s timeout + one retry on 5xx/timeout.
- **Rate limits** at the provider — not documented publicly. Stay under 30 req/sec to be safe.

## Operational checklist

- [ ] DLT principal entity registered with TRAI
- [ ] DLT-approved template containing **single** `{#var#}` token
- [ ] Template's numeric ID stored in `INBOXRAJA_TEMPLATE_ID`
- [ ] Sender ID `WIGOPE` mapped to that template
- [ ] API key rotated after every leak (also rotate when an engineer leaves)

## Switching to a different provider

Implement `SmsProvider` from `backend/src/modules/sms/inboxraja.service.ts` — that's the only contract callers depend on. Set `SMS_PROVIDER` env var and the rest of the auth flow just works.
# InboxRaja OTP Integration

Phase 3 uses InboxRaja DLT SMS for consumer OTP login.

## Endpoint

`GET {INBOXRAJA_BASE_URL}/bulkV2`

Query params:

- `authorization`: `INBOXRAJA_API_KEY`
- `sender_id`: `WIGOPE`
- `message`: numeric DLT template/message id
- `variables_values`: OTP only
- `route`: `dlt`
- `numbers`: 10-digit mobile number, no `+91`
- `flash`: `0`
- `sms_details`: `1`

## Security Notes

- Never log OTP, token, API key, or OTP hash.
- Mobile numbers are masked in logs.
- The shared InboxRaja key must be rotated before real testing.

## Response Shapes

Pending real credential test. The service currently treats these as failure:

- `return === false`
- `status === "error"`
- `error` present
- `success === false`

After the first staging SMS send, paste sanitized success/failure samples here.
