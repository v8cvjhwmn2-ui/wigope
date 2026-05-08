#!/usr/bin/env bash
# One-shot helper: copy the Wigope logo PNGs from your Downloads (or any
# folder) into mobile/assets/icons/.
#
# Usage:
#   bash scripts/install-logo.sh                  # auto-detect from ~/Downloads
#   bash scripts/install-logo.sh /path/to/folder  # specify source folder
#
# Expected source filenames (rename them in your Downloads first):
#   wigope_logo.png        — full mark + WIGOPE wordmark (the wide image)
#   wigope_logo_mark.png   — square crop, just the W on orange background

set -euo pipefail

SRC="${1:-$HOME/Downloads}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/mobile/assets/icons"
mkdir -p "$DEST"

copied=0
for f in wigope_logo.png wigope_logo_mark.png; do
  if [[ -f "$SRC/$f" ]]; then
    cp "$SRC/$f" "$DEST/$f"
    echo "✓ $f → mobile/assets/icons/"
    copied=$((copied + 1))
  else
    echo "⚠ $SRC/$f not found — skipping"
  fi
done

if [[ $copied -eq 0 ]]; then
  echo
  echo "No logos copied. Drop your two PNGs into $SRC named:"
  echo "  wigope_logo.png        (full landscape mark + wordmark)"
  echo "  wigope_logo_mark.png   (square just-the-W version)"
  exit 1
fi

echo
echo "Done. Now hot-restart the Flutter app:"
echo "  cd mobile && flutter pub get && flutter run"
