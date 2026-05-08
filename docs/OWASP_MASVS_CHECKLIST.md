# OWASP MASVS Launch Checklist

This is the Phase 10 audit checklist for Wigope Pay Android.

## MASVS-STORAGE

- Tokens are stored in `flutter_secure_storage`.
- No OTP, refresh token, PAN, Aadhaar, or provider key may be stored in SharedPreferences.
- KYC PII is encrypted server-side using AES-256-GCM.

## MASVS-CRYPTO

- JWT signing secrets are environment variables only.
- PII encryption key is environment variable / KMS-managed.
- Webhook HMAC verification is required when provider secret exists.

## MASVS-AUTH

- Access token TTL: 15 minutes.
- Refresh token TTL: 30 days.
- Refresh token rotation with reuse detection.
- OTP send limits and OTP verify limits enabled.

## MASVS-NETWORK

- Production API must use HTTPS only.
- HSTS is enabled on backend and admin.
- Certificate pinning is required after final `api.wigope.com` TLS certificate is issued.

## MASVS-PLATFORM

- Android release build uses R8/ProGuard minification.
- Root/jailbreak detection requires final native-device QA before public release.
- UPI intent handling must be tested on physical Android devices.

## MASVS-CODE

- Run `flutter analyze`.
- Run backend/admin builds.
- No secrets in git.
- No PII in logs.

## MASVS-RESILIENCE

- Build release with obfuscation and split debug symbols.
- Keep symbol files in private storage for crash debugging.
- Verify APK size target under 25 MB.

## Evidence Commands

```bash
cd backend && npm run build
cd admin && npm run build
cd mobile && flutter analyze
cd mobile && flutter build apk --release --obfuscate --split-debug-info=build/symbols
```
