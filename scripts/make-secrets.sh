#!/usr/bin/env bash
# Generates 32-byte random secrets for JWT + PII encryption and prints a
# .env-ready snippet. Pipe into the backend .env or copy manually.
#
# Usage:
#   bash scripts/make-secrets.sh                  # print to stdout
#   bash scripts/make-secrets.sh >> backend/.env  # append (be careful, dedupe)

set -euo pipefail

gen() { openssl rand -base64 32 | tr -d '\n='; }

cat <<EOF
# --- generated $(date -u +%Y-%m-%dT%H:%M:%SZ) ---
JWT_ACCESS_SECRET=$(gen)
JWT_REFRESH_SECRET=$(gen)
PII_ENCRYPTION_KEY=$(gen)
EOF
