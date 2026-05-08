# Wigope Pay — Mobile (Flutter)

## First-time setup

```bash
# Generate native folders (one-time)
flutter create --org com.wigope --project-name wigope_pay --platforms=android .

flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter run
```

## Folder layout

```
lib/
  app/         # MaterialApp, theme tokens, router
  core/        # API client, storage, analytics
  data/        # Models, repositories, retrofit clients
  features/   # Feature-first: auth, home, recharge, wallet, ...
  shared/     # WigopeButton, WigopeCard, WigopeInput, ...
```

## Design tokens

Never hardcode colors, font sizes, or radii in feature code. Always reference:
- `app/theme/colors.dart` → `WigopeColors.*`
- `app/theme/typography.dart` → `WigopeText.*`
- `app/theme/radii.dart` → `WigopeRadii.*` / `WigopeSpacing.*`

## Assets that need to be added

These directories exist but are empty — drop assets in:
- `assets/icons/` — app_icon.png, app_icon_foreground.png, splash_logo.png, wigope_wordmark.svg
- `assets/operators/` — jio.svg, airtel.svg, vi.svg, bsnl.svg, tata_play.svg, dish.svg, ...
- `assets/services/` — mobile.svg, dth.svg, electricity.svg, fastag.svg, ... (orange line icons on grad-orange-soft bg)
- `assets/lottie/` — success.json, failure.json, empty_transactions.json
- `assets/illustrations/` — onboarding_1/2/3.svg, no_internet.svg, kyc_pending.svg
- `assets/fonts/` — Inter-{Regular,Medium,SemiBold,Bold}.ttf (or remove from pubspec to use Google Fonts CDN only)
