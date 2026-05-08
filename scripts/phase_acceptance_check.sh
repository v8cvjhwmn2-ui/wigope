#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAILURES=0

ok() {
  printf "[OK] %s\n" "$1"
}

fail() {
  printf "[FAIL] %s\n" "$1"
  FAILURES=$((FAILURES + 1))
}

run_check() {
  local label="$1"
  shift
  printf "\n▶ %s\n" "$label"
  if "$@"; then
    ok "$label"
  else
    fail "$label"
  fi
}

run_in_dir() {
  local dir="$1"
  shift
  (cd "$ROOT_DIR/$dir" && "$@")
}

has_backend_tests() {
  rg --files "$ROOT_DIR/backend" | rg -q '(test|spec)\.(ts|tsx|js)$|/tests/'
}

backend_coverage_gate() {
  if ! has_backend_tests; then
    printf "Backend test files were not found. Add auth/wallet/recharge/webhook tests before closing the phase.\n"
    return 1
  fi
  run_in_dir backend npm test -- --coverage
}

mobile_release_size_gate() {
  if [[ "${RUN_RELEASE_APK:-0}" != "1" ]]; then
    printf "Skipping release APK size check. Set RUN_RELEASE_APK=1 on a machine with Android SDK.\n"
    return 0
  fi

  run_in_dir mobile flutter build apk --release --split-per-abi --obfuscate --split-debug-info=build/symbols || return 1

  local max_bytes=$((25 * 1024 * 1024))
  local oversized=0
  while IFS= read -r -d '' apk; do
    local size
    size=$(wc -c < "$apk" | tr -d ' ')
    printf "%s: %s bytes\n" "$apk" "$size"
    if (( size > max_bytes )); then
      oversized=1
    fi
  done < <(find "$ROOT_DIR/mobile/build/app/outputs/flutter-apk" -name "*.apk" -print0)

  [[ "$oversized" -eq 0 ]]
}

printf "Wigope phase acceptance gate\n"
printf "Root: %s\n" "$ROOT_DIR"

run_check "Backend TypeScript build" run_in_dir backend npm run build
run_check "Backend 80% critical-path coverage gate" backend_coverage_gate
run_check "Admin production build" run_in_dir admin npm run build
run_check "Flutter dependency resolution" run_in_dir mobile flutter pub get
run_check "Flutter static analysis" run_in_dir mobile flutter analyze --no-fatal-infos
run_check "Flutter tests" run_in_dir mobile flutter test
run_check "Android split APK size gate" mobile_release_size_gate

printf "\n"
if [[ "$FAILURES" -eq 0 ]]; then
  ok "All automated acceptance checks passed"
else
  fail "$FAILURES acceptance check(s) failed"
  exit 1
fi
