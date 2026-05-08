# Wigope Pay — Backend

Node 20 + Express + TypeScript + MongoDB (Mongoose) + Redis (ioredis) + BullMQ.

## Local setup

```bash
cp .env.example .env
# Set MONGODB_URI, REDIS_URL, JWT secrets at minimum
npm install
npm run dev
```

Health check: `curl http://localhost:4000/health`

In dev mode (`NODE_ENV=development`), `/auth/send-otp` returns the OTP in the response body and accepts `123456` as a fixed code — no SMS provider needed for the mobile flow.

## Layout

```
src/
  config/        # env, db, redis
  middleware/    # auth, error, validation
  modules/
    auth/        # OTP, JWT
    user/        # profile, KYC
    wallet/      # ledger + projection
    recharge/    # A1Topup facade
    payment/     # Razorpay + Wigope UPI
    transaction/ # txn list, detail, receipt
    webhook/     # signed callbacks
  utils/         # logger, crypto
  jobs/          # BullMQ workers (reconciliation)
  server.ts
```

## Money-handling rules

- Wallet balance is a **projection**. The append-only `WalletLedger` is the source of truth (ADR-0005).
- Every wallet-funded recharge happens inside a Mongo transaction (ADR-0004). On upstream network errors we mark the txn `pending` and let the reconciliation job (Phase 5) resolve it.
- Webhooks (A1Topup, Razorpay, Wigope UPI) are HMAC-verified and idempotent on `WebhookEvent.eventId`.

## Testing

```bash
npm run test
```
