# Decisions

## ADR-008: Recharge Provider Abstraction

Recharge logic is routed through a `RechargeProvider` interface. KwikAPI is the first concrete adapter, but wallet orchestration, mobile API routes, and UI are provider-agnostic so A1Topup or another provider can be added later without rewriting business flows.

## ADR-009: UAT-First Recharge Build

Phase 5 uses KwikAPI UAT as the only live provider target. Production credentials and transaction caps will be switched in Phase 10 after provider verification and IP/webhook setup.

## ADR-010: Status Polling as Source of Truth

KwikAPI webhook signing details are not yet confirmed. Webhooks are accepted as an optimization, while `/poll-status` and the future reconciliation worker remain the authoritative settlement path for pending transactions.
