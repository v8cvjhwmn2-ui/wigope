# Wigope Pay — API surface (v1)

Base URL: `/api/v1`. All responses use the envelope:

```json
{ "ok": true,  "data": ... }
{ "ok": false, "error": { "code": "...", "message": "...", "details": ... } }
```

## Auth

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/auth/send-otp` | `{ mobile }` | Rate-limited 3/hr/mobile. Dev mode returns `devOtp`. |
| POST | `/auth/verify-otp` | `{ mobile, otp }` | Returns `{ accessToken, refreshToken, user }`. |
| POST | `/auth/refresh` | `{ refreshToken }` | _Phase 3_ — rotates refresh, detects reuse. |
| POST | `/auth/logout` | — | _Phase 3_. |

## User

| Method | Path | Notes |
|---|---|---|
| GET | `/user/me` | _Phase 3_ |
| PATCH | `/user/me` | _Phase 3_ |
| POST | `/user/upload-avatar` | _Phase 3_ |
| GET | `/user/kyc-status` | _Phase 7_ |
| POST | `/user/kyc/pan` | _Phase 7_ |
| POST | `/user/kyc/aadhaar` | _Phase 7_ |

## Wallet — _Phase 4_
## Recharge — _Phase 5_
## DMT — _Phase 7_
## Transactions — _Phase 6_
## Webhooks — _Phase 5_ (`/webhooks/{a1topup,razorpay,wigope-upi}`)
## Admin — _Phase 9_ (separate JWT scope)

Full OpenAPI 3.0 spec is generated in Phase 10. Endpoint inventory mirrors §5.3 of the master brief.
# Phase 4 Wallet API

All wallet endpoints require `Authorization: Bearer <accessToken>`.

```yaml
paths:
  /api/v1/profile:
    get:
      summary: Current user profile and wallet summary
      responses:
        "200":
          description: Profile loaded
  /api/v1/wallet:
    get:
      summary: Current wallet balance
      responses:
        "200":
          description: Wallet summary
  /api/v1/wallet/ledger:
    get:
      summary: Wallet ledger entries
      parameters:
        - in: query
          name: limit
          schema: { type: integer, default: 20, maximum: 50 }
      responses:
        "200":
          description: Append-only wallet ledger
  /api/v1/wallet/add-money/order:
    post:
      summary: Create Razorpay order for wallet top-up
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [amount]
              properties:
                amount: { type: number, minimum: 10, maximum: 100000 }
      responses:
        "200":
          description: Razorpay order metadata
```

# Hubble Partner API

Register `/api/v1/hubble` as the Hubble integration base URL.

```yaml
paths:
  /api/v1/rewards/sso-token:
    post:
      summary: Mint a short-lived Hubble SSO token for the signed-in user
  /api/v1/hubble/sso:
    post:
      summary: Hubble SSO callback
      security:
        - HubbleSecret: []
  /api/v1/hubble/balance:
    get:
      summary: Hubble coin balance callback
  /api/v1/hubble/debit:
    post:
      summary: Debit Wigope coins/wallet balance for a Hubble purchase
  /api/v1/hubble/reverse:
    post:
      summary: Reverse a Hubble coin debit idempotently
```

# Phase 6 Transactions + Notifications API

All endpoints require `Authorization: Bearer <accessToken>`.

```yaml
paths:
  /api/v1/transactions:
    get:
      summary: List transactions with optional filters
      parameters:
        - { in: query, name: status, schema: { type: string } }
        - { in: query, name: type, schema: { type: string } }
        - { in: query, name: limit, schema: { type: integer, default: 30 } }
  /api/v1/transactions/{id}:
    get:
      summary: Transaction detail
  /api/v1/transactions/{id}/receipt.pdf:
    get:
      summary: Download receipt PDF
  /api/v1/notifications:
    get:
      summary: In-app notification center list and unread count
  /api/v1/notifications/{id}/read:
    post:
      summary: Mark one notification as read
  /api/v1/notifications/read-all:
    post:
      summary: Mark all notifications as read
```
