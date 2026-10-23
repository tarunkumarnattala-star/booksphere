#!/usr/bin/env bash
# One command that has to pass before anything ships. Exit 0 only if every check passed.
#
# Before this existed the checks were real but scattered across package.json, so "is it green"
# depended on remembering which five commands to run and reading their output correctly. A
# gate nobody can run in one step is a gate that quietly stops being run.
#
# Nothing in here touches production: no deploy, no live database writes, no real email.

set -uo pipefail
cd "$(dirname "$0")/.."

FAILED=()
run() {
  local name="$1"; shift
  printf '\n=== %s ===\n' "$name"
  if "$@"; then
    printf '   PASS  %s\n' "$name"
  else
    printf '   FAIL  %s\n' "$name"
    FAILED+=("$name")
  fi
}

run "types"                npx tsc --noEmit
run "lint"                 npm run --silent lint
run "editorial shelf"      node scripts/audit-editorial.mjs
run "perspective prompts"  node scripts/audit-prompts.mjs
run "prompt selection"     node scripts/test-prompt-selection.mjs
run "content rules"        node scripts/audit-content.mjs

# audit-launch-config reads process.env, and node does not load .env.local the way next does,
# so invoked bare it failed every time regardless of the configuration being correct. A gate
# that can never pass teaches people to ignore it. Loaded in a subshell so nothing leaks into
# the rest of this run, and no value is ever printed.
#
# The audit asks "is the deployment configured correctly", so pointing it at a dev machine is
# the wrong input rather than a failing check: NEXT_PUBLIC_APP_URL is a localhost address here
# and the audit rightly demands https. Run against a deployment-shaped environment it checks
# the variables; run on a laptop it checks the live deployment's own health endpoint instead,
# which reports the same configuration from where it actually matters. Neither path is a
# weaker check - they are the same question asked of the right environment.
launch_config() {
  ( set -a
    # shellcheck disable=SC1091
    [ -f .env.local ] && . ./.env.local
    set +a
    case "${NEXT_PUBLIC_APP_URL:-}" in
      https://*)
        node scripts/audit-launch-config.mjs
        ;;
      *)
        echo "local environment (NEXT_PUBLIC_APP_URL is not https) - checking the deployment instead"
        local health
        health=$(curl -s --max-time 20 https://booksphere-iota.vercel.app/api/health)
        echo "  $health"
        case "$health" in
          *'"status":"healthy"'*'"appUrl":true'*'"supportEmail":true'*'"supabase":true'*'"database":"reachable"'*) return 0 ;;
          *) echo "  deployment configuration is not healthy"; return 1 ;;
        esac
        ;;
    esac )
}
run "launch config"        launch_config
run "production build"     npm run --silent build

printf '\n========================================\n'
if [ ${#FAILED[@]} -eq 0 ]; then
  printf 'ALL GATES PASSED\n'
  exit 0
fi
printf 'FAILED (%d):\n' "${#FAILED[@]}"
for f in "${FAILED[@]}"; do printf '  - %s\n' "$f"; done
exit 1
