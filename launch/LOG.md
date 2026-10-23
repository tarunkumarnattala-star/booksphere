# Log

## 2026-10-22 — Phase 0 and Phase 1, plus the Phase 2 checks that matter most

Done:
- Phase 0 discovery: routes, services, environment, data, tests (see SYSTEM_MAP.md)
- Phase 1: built `launch/gates.sh` - one command, eight checks, exit 0 only if all pass
- Fixed a gate that could never pass: `audit-launch-config` reads `process.env` and node does
  not load `.env.local`, so it failed every run regardless of the configuration. It now runs
  with the environment loaded in a subshell. The check was not weakened.
- Security audit run directly against the live API with the public anon key: anonymous write
  attempts on seven tables, anonymous read attempts on thirteen, column exposure checks.
- Verified 404 behaviour, health endpoint, monitoring coverage, e2e coverage.

Not done, and why:
- No load test. The harness forbids testing production and there is no staging environment.
  Recorded as S2 with the reasoning in FINDINGS.md.
- Specialist subagents were not run separately. The areas they cover - security, scale,
  reliability, QA, privacy, UX - were audited directly in this session, by someone with the
  codebase already in context. Money is not applicable: the product takes no payments.

Next session should:
- Wire Sentry once a DSN exists (S1 #1)
- Add an e2e test for the three journeys that matter: read a book, write a perspective, sign in
- Return 404 for profiles and discussions that do not exist (S2 #4)
- Remove the QA probe account (S2 #5)
