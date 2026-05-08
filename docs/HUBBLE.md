# Hubble SDK integration

The Gift & Voucher Deals grid and the bottom-nav voucher tab both open the Hubble Rewards SDK.

- Flutter web preview: opens the staging SDK in the same browser tab.
- Android/iOS app: pushes an inline WebView at `/rewards/hubble`.

## Where it lives

```
mobile/lib/features/rewards/
  hubble_sdk.dart            ← config (clientId, appSecret/clientSecret, mock token, theme)
  hubble_webview_screen.dart ← inline WKWebView/WebView with JS bridge
  hubble_rewards_screen.dart ← native shell of the rewards tab
```

## Staging credentials (default)

These live in `HubbleSdkConfig` and are baked into the bundle. Override via `--dart-define` for prod.

| Key | Default |
|---|---|
| `HUBBLE_SDK_BASE_URL`   | `https://sdk.dev.myhubble.money/` |
| `HUBBLE_CLIENT_ID`      | `wigope-dev-sdk-mwcofdsa` |
| `HUBBLE_CLIENT_SECRET`  | `a0qmb…Td28` (staging — public per Hubble docs) |
| `HUBBLE_MOCK_TOKEN`     | `mock-token` (works while Mock SSO is on) |
| `HUBBLE_THEME`          | `light` |
| `HUBBLE_APP_VERSION`    | `0.1.0` |

The config sends both `appSecret` and `clientSecret` query params. Hubble’s current partner guide uses `appSecret`; older portal/testing examples used `clientSecret`.

## Backend integration base URL

Register this base URL with Hubble staging once the backend is deployed:

`https://YOUR-STAGING-API/api/v1/hubble`

Hubble will call:

| API | URL |
|---|---|
| SSO | `POST /api/v1/hubble/sso` |
| Coins balance | `GET /api/v1/hubble/balance?userId=...` |
| Coins debit | `POST /api/v1/hubble/debit` |
| Coins reverse | `POST /api/v1/hubble/reverse` |

Set `HUBBLE_X_SECRET` in backend env to the staging `X-Hubble-Secret` from the Hubble portal. In local non-production runs, the endpoints allow empty secret only for development convenience.

## Switching to real SSO

Backend already issues per-user JWTs. Wire it in three steps:

1. **Mint a short-lived Hubble token** on the backend at `POST /api/v1/rewards/sso-token`, returning `{ token }`. The token is a short-lived JWT scoped to `hubble_sso`.
2. **SSO endpoint** is implemented at `POST /api/v1/hubble/sso`. It validates the token and returns `{ userId, firstName, lastName, phoneNumber, email, cohorts }` or `{ userId: null }`.
3. **Mobile**: currently uses Hubble staging `mock-token` while Mock SSO is enabled. Switch to `sdkUri(token: backendIssuedToken)` after the deployed SSO URL is registered in the portal.

## SDK events bridged to native

The WebView injects a `window.addEventListener('message', …)` that forwards every postMessage payload to the `HubbleBridge` JS channel. Native code routes by `payload.type`:

| `type` | `event` | Action |
|---|---|---|
| `action` | `app_ready` | Hide loading veil |
| `action` | `close` | `Navigator.pop` |
| `action` | `error` | Show error overlay with retry |
| `analytics` | (any) | `debugPrint` for now — wire to PostHog/Mixpanel in Phase 6 |

Critical events to track for ops: `payment_initiated`, `payment_success`, `payment_fail`, `voucher_generation_success`, `voucher_generation_fail`. Health metric = `payment_success / payment_initiated` ratio.

## Deep links

`HubbleSdkLauncher.openBrand(context, brandId)` pushes the WebView with `/buy/{brandId}` prepended to the SDK URL. Brand IDs come from the Hubble catalog (e.g., `01GMAVS2CHXR0XP1BZSTA9A44K` for Amazon) — request the live list from the Hubble team and store as a constant table.

## Webhooks (server-side, todo)

Register webhook URLs in the partner portal:
- `POST {API_BASE}/webhooks/hubble/transaction`  — order COMPLETED / FAILED / REVERSED
- `POST {API_BASE}/webhooks/hubble/brand-update` — catalog deltas

Verification: HMAC-SHA256 of the **raw** request body using the `Signature Secret` from the portal, compared against the `X-Verify` header (Base64). Implementation lives next to A1Topup webhook handlers in Phase 6.

## Going to production

1. Complete 3 staging transactions (portal gates this).
2. Request prod credentials via portal.
3. Override `HUBBLE_SDK_BASE_URL=https://sdk.myhubble.money/` and the new clientId/secret via `--dart-define`.
4. Register the prod SSO base URL with Hubble.
5. Smoke-test a real purchase on a real device.

## iOS UPI requirement (for later, when iOS lands)

Add to `ios/Runner/Info.plist`:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>phonepe</string>
  <string>tez</string>
  <string>paytmmp</string>
  <string>cred</string>
  <string>bhim</string>
</array>
```

Without these, iOS hides the per-UPI-app picker and Hubble falls back to a generic UPI button.

## Android UPI

`mobile/android/app/src/main/AndroidManifest.xml` needs:

```xml
<queries>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="upi" />
  </intent>
</queries>
```

This is added once `flutter create` materializes the native folders.
