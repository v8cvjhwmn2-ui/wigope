# Phase 10 Launch Runbook

Target: production-ready Wigope Pay with live OTP, live wallet top-up, production API/admin, and UAT/staging providers for KwikAPI + Hubble until final provider approval.

## What Can Stay Staging/UAT

- KwikAPI: keep `KWIKAPI_ENVIRONMENT=uat` and `KWIKAPI_BASE_URL=https://uat.kwikapi.com`.
- Hubble: keep staging SDK credentials and staging `X-Hubble-Secret`.

## Required Live Credentials

### Backend Production

- `MONGO_URI`: MongoDB Atlas production URI.
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `JWT_ACCESS_SECRET`: 64-byte random hex.
- `JWT_REFRESH_SECRET`: different 64-byte random hex.
- `PII_ENCRYPTION_KEY`: 32-byte key as 64 hex chars or base64.
- `CORS_ALLOWED_ORIGINS`: comma-separated production domains, for example `https://admin.wigope.com,https://wigope.com`.

### Live OTP

- `SMS_PROVIDER=inboxraja`
- `INBOXRAJA_API_KEY`: rotated production/live key.
- `INBOXRAJA_SENDER_ID=WIGOPE`
- `INBOXRAJA_TEMPLATE_ID`: approved consumer OTP DLT template ID.
- `INBOXRAJA_BASE_URL`: provider live URL confirmed by InboxRaja.

### Razorpay Live Wallet Top-Up

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- Razorpay webhook URL: `https://api.wigope.com/api/v1/webhooks/razorpay` after route is enabled.

### Hubble Staging

- `HUBBLE_X_SECRET`
- `HUBBLE_WEBHOOK_SECRET`
- Staging integration base URL to register in Hubble: `https://api.wigope.com/api/v1/hubble`
- Staging webhook URL to register in Hubble: `https://api.wigope.com/api/v1/webhooks/hubble`

### KwikAPI UAT

- `KWIKAPI_API_KEY`
- `KWIKAPI_WEBHOOK_SECRET`, if KwikAPI supports signed webhooks.
- KwikAPI UAT callback URL: `https://api.wigope.com/api/v1/webhooks/kwikapi`
- Render outbound IPs must be whitelisted in KwikAPI dashboard if provider requires it.

### Monitoring

- `SENTRY_DSN`: backend project DSN.
- `POSTHOG_KEY`
- `POSTHOG_HOST`
- Uptime monitor URL: `https://api.wigope.com/api/v1/health`.

### Admin on Vercel

- Vercel account/team access.
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- Admin env vars:
  - `NEXT_PUBLIC_API_BASE_URL=https://api.wigope.com/api/v1`
  - `NEXT_PUBLIC_SENTRY_DSN`
  - `NEXT_PUBLIC_POSTHOG_KEY`
  - `NEXT_PUBLIC_POSTHOG_HOST`
  - `NEXTAUTH_URL=https://admin.wigope.com`
  - `NEXTAUTH_SECRET`

### Android Release

- Android SDK installed locally or in CI.
- Play signing decision: Google Play App Signing or self-managed.
- Release keystore file, alias, store password, key password.
- `key.properties` kept outside git.
- Play Console access for:
  - Package upload.
  - Screenshots.
  - Feature graphic.
  - Listing copy.
  - Privacy policy URL.
  - Data safety form.

## Backend Deploy to Render

1. Push repo to GitHub `main`.
2. Render → Blueprint → select this repo.
3. Use root `render.yaml`.
4. Paste all production env vars marked `sync: false`.
5. Attach domain `api.wigope.com`.
6. Confirm `https://api.wigope.com/api/v1/health` returns `ok: true`.
7. Add uptime monitoring for `/api/v1/health`.

## Admin Deploy to Vercel

From `admin/`:

```bash
vercel pull --yes --environment=production --token=$VERCEL_TOKEN
vercel build --prod --token=$VERCEL_TOKEN
vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN
```

Set production domain `admin.wigope.com`.

## Mobile Release Build

```bash
cd mobile
flutter clean
flutter pub get
flutter build apk --release \
  --obfuscate \
  --split-debug-info=build/symbols \
  --dart-define=API_BASE_URL=https://api.wigope.com/api/v1 \
  --dart-define=WIGOPE_MOCK_AUTH=false
```

Target APK size: under 25 MB. If APK exceeds target, inspect with:

```bash
flutter build apk --analyze-size --release
```

## Acceptance Before Going Public

- OTP received through InboxRaja live DLT.
- Login → refresh token rotation → logout tested.
- Wallet top-up Razorpay live test flow verified with small amount.
- KwikAPI UAT recharge flow still clearly marked in ops dashboard.
- Hubble staging SDK opens with real SSO.
- Admin production route protected.
- Health monitor green for 24 hours.
- No PII in logs.
- OpenAPI docs published.
