# A1Topup integration notes

> **Source of truth:** A1Topup vendor docs (request from `support@a1topup.com`). This file captures *our* integration shape — what fields we send, what we map back to internal status, and how webhooks are verified.

## Endpoints (provisional — confirm with vendor)

| Purpose | Method | Path |
|---|---|---|
| Operator detect | GET | `/operator-detect?number={mobile}` |
| Plans | GET | `/plans?operator&circle&type` |
| Recharge | POST | `/recharge` |
| Status | GET | `/status/{txnId}` |

Auth header: `Authorization: Bearer <A1TOPUP_API_KEY>`.

## Status mapping

| A1Topup | Internal |
|---|---|
| `SUCCESS`, `COMPLETE`, `COMPLETED` | `success` |
| `FAILED`, `FAIL`, `REJECTED` | `failed` |
| anything else | `pending` |

## Webhook flow

1. Vendor POSTs `{ txnId, status, reference, amount, ... }` + `X-Signature: <hmac-sha256>`.
2. We verify HMAC against `A1TOPUP_WEBHOOK_SECRET`.
3. We upsert `WebhookEvent { eventId: txnId+status, payload, processed }` — duplicates are ignored.
4. We resolve our `Transaction` by `a1topupTxnId == reference`. On `success`: credit cashback, fire FCM push, write commission entry. On `failed`: refund wallet (new credit ledger entry).

## Reconciliation

Cron every 15 min: scan `Transaction { status: 'pending', createdAt < now-5min }`, call `/status/{a1topupTxnId}`, transition state. Caps at 200 txns/run.

## Credentials needed (blocked on vendor)

- `A1TOPUP_API_KEY`
- `A1TOPUP_WEBHOOK_SECRET`
- Sandbox base URL (currently assuming prod is `https://api.a1topup.com`)
