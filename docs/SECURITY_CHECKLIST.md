# Wigope Security Checklist

Last updated: 2026-05-07

## Backend

- HTTPS-only production traffic is enforced via `x-forwarded-proto`; HTTP requests receive `HTTPS_REQUIRED`.
- Helmet is enabled. HSTS is enabled in production with preload and subdomain coverage.
- CORS is allow-list based. Browser origins must be configured in `CORS_ALLOWED_ORIGINS`.
- JWT access tokens use `JWT_ACCESS_TTL=15m`; refresh tokens use `JWT_REFRESH_TTL=30d`.
- Refresh tokens rotate on every refresh. Reuse/hash mismatch revokes the token family.
- OTP send limits are enforced per mobile and per IP. OTP verify/login attempts are limited to 5 per 15 minutes.
- Request bodies, query params, and route params are sanitized before routes run. Mongo operator keys (`$...`) and dotted keys are stripped.
- Zod schemas validate endpoint payloads in feature controllers.
- High-risk KYC PII is encrypted at rest with AES-256-GCM. Production must provide `PII_ENCRYPTION_KEY`.
- Logs redact auth headers, tokens, mobile, PAN, Aadhaar, OTP, account values, and provider API keys.
- Webhook handlers verify HMAC-SHA256 signatures when the provider webhook secret is configured.
- SQL injection is not applicable; persistence is MongoDB/Mongoose. Query inputs still pass validation and sanitization.

## Mobile

- Auth tokens are stored in `flutter_secure_storage`; SharedPreferences is not used for secrets.
- Android release builds enable R8/ProGuard minification and resource shrinking.
- Biometric lock has a user-facing toggle. Native prompt wiring is kept separate from token storage.
- Production certificate pinning and root/jailbreak detection remain launch-hardening tasks because they require final API host certificates and native-device QA.

## Operational Notes

- Keep provider keys, JWT secrets, SMS keys, and PII encryption keys only in environment variables.
- Rotate any key ever pasted into chat, screenshots, or logs.
- Production should terminate TLS at the load balancer or platform edge and forward `x-forwarded-proto=https`.
