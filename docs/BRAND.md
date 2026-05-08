# Wigope Brand Reference (engineering)

This document is the source of truth for design tokens. If a value here disagrees with a Figma file or a screenshot, **this document wins**. Update tokens in code (`mobile/lib/app/theme/`, `admin/app/globals.css`, `admin/tailwind.config.ts`) when this changes.

## Color tokens

| Token | Hex | Usage |
|---|---|---|
| `wigope-orange-600` | `#F97316` | Primary CTA, brand accent |
| `wigope-orange-500` | `#FF8A3D` | Hover / lighter |
| `wigope-orange-400` | `#FFA968` | Tints |
| `wigope-orange-50`  | `#FFF4ED` | Background tint, badge bg |
| `wigope-navy-900`   | `#0A1628` | Primary text, headlines |
| `wigope-navy-800`   | `#142238` | Secondary headlines |
| `wigope-navy-700`   | `#1F3050` | Tertiary |
| `surface-base`      | `#FFFFFF` | Page background |
| `surface-soft`      | `#FAFBFC` | Section bg (with grid pattern) |
| `surface-muted`     | `#F4F5F8` | Input bg, chips |
| `border-soft`       | `#E8EAF0` | Hairline borders |
| `border-default`    | `#D5D9E2` | Standard borders |
| `text-secondary`    | `#4A5670` | |
| `text-tertiary`     | `#8089A0` | |
| `success`           | `#10B981` | Cashback / success |
| `warning`           | `#F59E0B` | |
| `error`             | `#EF4444` | |
| `info`              | `#3B82F6` | |

### Gradients (signature, use sparingly)
- `--grad-orange`: `linear-gradient(135deg, #F97316 0%, #FF6A00 100%)` — primary CTAs, scan & pay button
- `--grad-orange-soft`: `linear-gradient(135deg, #FFF4ED 0%, #FFE4D1 100%)` — quick-action tile bgs, banners
- `--grad-navy`: `linear-gradient(135deg, #0A1628 0%, #1F3050 100%)` — wallet hero card

## Typography

| Role | Font | Weights |
|---|---|---|
| UI primary | Inter | 400 / 500 / 600 / 700 |
| Display | Plus Jakarta Sans | 700 / 800 |
| Script accent | Caveat | 400 |
| Hindi fallback | Noto Sans Devanagari | 400 / 600 |
| Numerics | Inter w/ `tabular-figures` | — |

### Scale
```
Display XL  44/52  800  -0.03em   splash hero
Display L   32/40  700  -0.02em   screen titles
H1          24/32  700
H2          20/28  600
H3          17/24  600
Body        15/22  400
Body S      13/20  400
Caption     11/16  600  uppercase 0.06em
Script      24/28  400  Caveat
```

## Spacing & radius

- Unit: `4px`. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 56, 80
- Radius: card 16, hero/wallet 24, chip 12, button 12, sheet top 24, input 12
- Heights: button primary 52, secondary 44, tertiary 36, input 52

## Elevation

```
card           1px solid border-soft + 0 2px 8px rgba(10,22,40,0.04)
hero/wallet    + 0 8px 24px rgba(249,115,22,0.12)
sheet          0 -8px 32px rgba(10,22,40,0.08)
```

## Motion

- Page transition: 280ms `easeOutCubic`
- Tap scale: 0.97 / 100ms + `HapticFeedback.lightImpact`
- Skeleton shimmer for all loading
- `animated_flip_counter` for ₹ balance changes
- `confetti` on first successful transaction
- Lottie success animation post-recharge

## Logo

- App icon: orange `W` mark on white, navy outline, rounded square 18% radius (Android adaptive ready)
- Header: orange W + `WIGOPE PAY` wordmark in navy 600
- Splash: large centered logo + script tagline
