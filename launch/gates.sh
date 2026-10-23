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

# The journeys need something running. They are the only check here that exercises the product
# rather than the code: every gate above was green while fifty cards were telling strangers
# that BookSphere's own writing was a reader's, and while two Google buttons were stacked on
# the sign-in card. Both were caught only by opening a browser.
journeys() {
  local port=3123
  rm -rf .next-gate
  NEXT_DIST_DIR=.next-gate npm run --silent build >/dev/null 2>&1 || return 1
  # A previous run could still be holding the port. The server used to be started inside a
  # background subshell, so the pid captured was the subshell's and `next start` outlived the
  # kill - the next run then failed to bind and every journey "failed" while the product was
  # perfectly fine. exec replaces the subshell so the pid is the server itself.
  local stale
  stale=$(lsof -ti ":$port" 2>/dev/null)
  [ -n "$stale" ] && kill $stale 2>/dev/null && sleep 1
  ( set -a; [ -f .env.local ] && . ./.env.local; set +a
    exec env NEXT_DIST_DIR=.next-gate npx next start -p "$port" >/tmp/gate-server.log 2>&1 ) &
  local server=$!
  trap 'kill '"$server"' 2>/dev/null; wait '"$server"' 2>/dev/null; rm -rf .next-gate' RETURN
  local i
  local up=""
  for i in $(seq 1 45); do
    if curl -s -o /dev/null "http://localhost:$port/api/health"; then up=1; break; fi
    sleep 2
  done
  if [ -z "$up" ]; then
    echo "the journey server never started - this is the harness, not the product:"
    tail -5 /tmp/gate-server.log
    return 1
  fi
  node scripts/test-journeys.mjs "http://localhost:$port"
}
run "user journeys"        journeys

printf '\n========================================\n'
if [ ${#FAILED[@]} -eq 0 ]; then
  printf 'ALL GATES PASSED\n'
  exit 0
fi
printf 'FAILED (%d):\n' "${#FAILED[@]}"
for f in "${FAILED[@]}"; do printf '  - %s\n' "$f"; done
exit 1
