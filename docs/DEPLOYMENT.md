# Deployment

## Backend → Render or Railway

- Health check path: `/health`
- Env: paste from `backend/.env.example` and fill secrets in the dashboard
- Start command: `npm run build && npm start`
- Region: Singapore (lowest IN latency)

## Admin → Vercel

```bash
cd admin && vercel
```

Set `NEXT_PUBLIC_API_BASE_URL` in Project → Settings → Environment Variables.

## MongoDB Atlas

- Cluster tier M10 (replica set required for ADR-0004)
- IP allow-list: backend host + admin (Vercel egress IPs) + dev machines
- DB name: `wigope_pay`
- User: `wigope-app` with `readWrite` on `wigope_pay`

## Redis (Upstash)

- Region: `aps1` (Mumbai) or `aps2` (Singapore)
- TLS required — set `REDIS_URL=rediss://...`

## Mobile (Play Store)

```bash
cd mobile
flutter build appbundle --release --split-per-abi
```

Keystore lives outside the repo. Do not check it in. Configure in `android/key.properties` (gitignored).
