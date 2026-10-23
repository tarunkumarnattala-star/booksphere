#!/usr/bin/env bash
# Runs the launch loop unattended: one fresh Claude Code session at a time,
# until the scorecard says STATUS: GREEN or a safety limit is hit.
# Run from the top folder of your project:  bash launch/run-loop.sh
set -uo pipefail

MAX_SESSIONS="${MAX_SESSIONS:-30}"     # hard cap so it never runs forever
MAX_STALLED="${MAX_STALLED:-3}"        # stop if 3 sessions in a row change nothing
BRANCH="launch/readiness"
mkdir -p launch/logs

if [ -n "$(git status --porcelain -- . ':!launch' ':!.claude')" ]; then
  echo "You have unsaved changes in the app. Commit them first so the loop's work is easy to review."; exit 1
fi
git switch "$BRANCH" 2>/dev/null || git switch -c "$BRANCH"
git add launch .claude/agents && git commit -qm "launch: add launch loop" 2>/dev/null

stalled=0
for i in $(seq 1 "$MAX_SESSIONS"); do
  echo "=== Session $i  $(date '+%a %H:%M') ==="
  before=$(git rev-parse HEAD)

  claude -p "$(cat launch/LAUNCH_LOOP.md)

This is session $i of at most $MAX_SESSIONS. Read launch/LOG.md and continue where it stopped." \
    --permission-mode acceptEdits \
    --allowedTools "Read,Edit,Write,Glob,Grep,Agent,Bash(npm *),Bash(npx *),Bash(pnpm *),Bash(yarn *),Bash(node *),Bash(bash launch/*),Bash(git status*),Bash(git diff*),Bash(git log*),Bash(git show*),Bash(git add *),Bash(git commit *)" \
    > "launch/logs/session-$i.log" 2>&1

  git add launch && git commit -qm "launch: session $i notes" 2>/dev/null

  if head -n 3 launch/SCORECARD.md 2>/dev/null | grep -q "STATUS: GREEN"; then
    # Don't take its word for it: rerun the full gate ourselves.
    if bash launch/gates.sh > launch/logs/final-gate.log 2>&1; then
      echo "GREEN after $i sessions. Read launch/LAUNCH_REPORT.md and launch/MANUAL_TASKS.md."; exit 0
    fi
    echo "Claimed GREEN but the gate fails. Continuing."
    sed -i.bak '/STATUS: GREEN/d' launch/SCORECARD.md && rm -f launch/SCORECARD.md.bak
  fi

  if [ "$(git rev-parse HEAD)" = "$before" ]; then stalled=$((stalled+1)); else stalled=0; fi
  if [ "$stalled" -ge "$MAX_STALLED" ]; then
    echo "No progress in $MAX_STALLED sessions. It probably needs you: read launch/MANUAL_TASKS.md."; exit 2
  fi
done
echo "Reached $MAX_SESSIONS sessions without going green. Read launch/SCORECARD.md and launch/MANUAL_TASKS.md."; exit 3
