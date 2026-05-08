# Wigope Recharge Web

Standalone production frontend for Wigope recharge, wallet, rewards, and transactions.

## Production API

`https://recharge-api.wigope.com/api/v1`

## Local Setup

```bash
cp .env.example .env.local
npm install
npm run build
npm run dev
```

## Vercel

1. Push only the `recharge-web/` folder or import the monorepo with root directory set to `recharge-web`.
2. Add domain `recharge.wigope.com`.
3. Set env vars from `.env.example`.
4. Build command: `npm run build`.
5. Output: Next.js default.

No backend, admin, or mobile source is required for this deployment.
