# KwikAPI UAT Integration

Phase 5 is wired against KwikAPI UAT only.

## Environment

- `KWIKAPI_BASE_URL=https://uat.kwikapi.com`
- `KWIKAPI_API_KEY` must be set locally or in staging secrets.
- `KWIKAPI_ENVIRONMENT=uat`
- Production credential switch is deferred to Phase 10.

## Implemented Adapter

The backend now uses a provider abstraction at `backend/src/modules/recharge/providers/recharge-provider.interface.ts`.
`KwikApiProvider` is the first concrete provider and maps provider responses into normalized Wigope statuses:

- `SUCCESS`
- `FAILURE`
- `PENDING`

## Routes

- `GET /api/v1/catalog/services`
- `GET /api/v1/catalog/operators?service=Prepaid`
- `GET /api/v1/catalog/circles`
- `POST /api/v1/catalog/refresh`
- `GET /api/v1/recharge/detect-operator?number=9876543210`
- `GET /api/v1/recharge/mobile-plans?opid=11&circle=5`
- `GET /api/v1/recharge/dth-plans?opid=101`
- `GET /api/v1/recharge/r-offers?opid=11&mobile=9876543210`
- `POST /api/v1/recharge/fetch-bill`
- `POST /api/v1/recharge/mobile`
- `POST /api/v1/recharge/dth`
- `POST /api/v1/recharge/postpaid`
- `POST /api/v1/recharge/bill-payment`
- `GET /api/v1/recharge/transactions`
- `GET /api/v1/recharge/transactions/:orderId`
- `POST /api/v1/recharge/transactions/:orderId/poll-status`
- `POST /api/v1/webhooks/kwikapi`

## UAT Notes

- API key is always read from env and masked in logs.
- Catalog and plan endpoints include local UAT fallback data so the mobile flow remains testable if UAT is temporarily down.
- Recharge submit and status polling remain provider-driven. Network errors mark the transaction `pending` so polling can settle it later.
- Webhook signature format is not confirmed in the supplied KwikAPI notes. If `KWIKAPI_WEBHOOK_SECRET` is blank, webhook requests are accepted and status polling remains the source of truth.

## Pending Verification

Capture these once KwikAPI UAT dashboard/webhook docs are confirmed:

- Exact operator list endpoint response shape.
- Exact plan endpoint names and response shape.
- Exact recharge `SUCCESS`, `FAILURE`, and `PENDING` payloads.
- Signed webhook header name and HMAC algorithm.
- UAT test numbers and biller IDs that force success/failure/pending.
