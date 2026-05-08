# Wigope Definition Of Done

This is the release gate for every phase. A phase is not complete until every applicable item below has proof attached in the PR, release note, or `PROGRESS.md`.

## Product Gate

- Screens match the approved design brief across mobile web, Android emulator, and at least one physical Android device.
- No Flutter overflow warnings, browser console errors, or visible layout clipping.
- Every loading state uses a skeleton.
- Every empty state has an illustration or purposeful visual state.
- Every error state has a retry CTA and a user-friendly message.
- All user-facing strings live in `mobile/lib/l10n/app_en.arb` and `mobile/lib/l10n/app_hi.arb`.
- Every form has client-side validation that matches the backend Zod schema.
- Every list uses cursor pagination where backed by API data and supports pull-to-refresh on mobile.
- Offline-friendly screens must read cached data first and replay queued actions when connectivity returns.

## API Gate

- Every listed endpoint exists in `docs/OPENAPI.yaml`.
- Every endpoint validates input at the boundary.
- Every error uses the shared envelope:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "English message",
    "messageHi": "Hindi message",
    "details": null
  }
}
```

- All sensitive routes require JWT middleware.
- Backend critical paths have 80%+ coverage: auth, wallet, recharge, webhooks, KYC, DMT, referrals.
- No PII or secrets appear in logs.

## Security Gate

- Production serves HTTPS only with HSTS.
- JWT access tokens expire in 15 minutes; refresh tokens expire in 30 days and rotate.
- Refresh token reuse invalidates the whole session family.
- OTP rate limits: 3/hour/mobile and 10/hour/IP.
- Login attempts: 5 per 15 minutes.
- Webhooks verify HMAC signatures where the provider supports signatures.
- CORS is allow-listed for the production app/admin origins only.
- Helmet and request sanitization are enabled.
- PAN/Aadhaar values are encrypted with AES-256-GCM at rest.
- Mobile stores secrets only in `flutter_secure_storage`.
- Production Android uses obfuscation, R8/ProGuard, certificate pinning, and optional biometric lock.

## Performance Gate

- App opens in under 2 seconds on a Snapdragon 6-series Android device.
- Release APK is built with `--split-per-abi`.
- Each split APK is under 25 MB.
- Images are compressed and lazy-loaded where possible.
- Icons and packages are tree-shaken in release builds.

## Automated Checks

Run the local acceptance gate before marking a phase complete:

```bash
./scripts/phase_acceptance_check.sh
```

Run the Android release size gate on a machine with Android SDK configured:

```bash
RUN_RELEASE_APK=1 ./scripts/phase_acceptance_check.sh
```

## Current Known Gaps

- Backend test coverage is not yet at the 80% gate because backend test files are missing.
- Flutter static analysis is not yet clean; the current backlog includes lint warnings and formatting/info cleanup.
- Full l10n migration is still in progress; some demo/mock UI copy may remain in Dart files.
- Android release APK size cannot be proven on this machine until `ANDROID_HOME` is configured.
- Pixel-perfect proof requires final screenshots from physical Android plus browser screenshots.
- KwikAPI and Hubble intentionally remain UAT/staging until production approval.
