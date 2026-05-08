# Wigope brand assets

Drop the official artwork here so `WigopeLogo` picks them up. Until the files exist, the widget renders a code-painted fallback that approximates the brand mark.

| File | Used by | Size guidance |
|---|---|---|
| `wigope_logo.png`        | `WigopeLogo.full`  | Cropped horizontal official PNG |
| `wigope_logo_mark.png`   | `WigopeLogo.mark`  | 1024 × 1024 square official PNG |
| `wigope_logo_white.png`  | dark surfaces (future) | same as full, white knockout |
| `app_icon.png`           | adaptive launcher | 1024 × 1024 (Play Store icon) |
| `app_icon_foreground.png`| adaptive launcher foreground | 432 × 432 safe area |
| `splash_logo.png`        | `flutter_native_splash` | 512 × 512 |

After dropping, run:

```bash
flutter pub run flutter_launcher_icons
flutter pub run flutter_native_splash:create
```
