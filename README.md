# Wigope Pay

Recharge & bill payments app — consumer arm of Wigope Technologies Pvt Ltd.

> *simple. secure. recharge-first.*

## Monorepo

| Folder | Stack | Purpose |
|---|---|---|
| `mobile/` | Flutter 3.24+ / Dart 3.5+ | Android consumer app |
| `backend/` | Node 20 + Express + TS + MongoDB | API + A1Topup + Razorpay + Wigope UPI |
| `admin/` | Next.js 14 (App Router) + Tailwind + shadcn/ui | Operator panel |
| `docs/` | Markdown | API spec, ADRs, brand reference |

## Quick start

```bash
# Backend
cd backend && cp .env.example .env && npm i && npm run dev

# Admin
cd admin && cp .env.example .env.local && npm i && npm run dev

# Mobile
cd mobile && flutter pub get && flutter run
```

## Brand

Light-first, orange-accented fintech. See [docs/BRAND.md](docs/BRAND.md) for tokens.
Hero color `#F97316`. Headlines navy `#0A1628`. Script accent `Caveat`.

## Status

Phase 1 (scaffolding + design system tokens) is complete. See [PROGRESS.md](PROGRESS.md) for what's built, deferred, and blocked on credentials.

## License

Proprietary — Wigope Technologies Pvt Ltd.
