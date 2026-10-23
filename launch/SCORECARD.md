# Scorecard

Green means a check ran and passed, and the command is in FINDINGS.md. "Not checked" is red.

| Area | Verdict | Why |
|---|---|---|
| Security — can a stranger write to your data | **GREEN** | Every table refuses anonymous writes (401) |
| Security — can a stranger read private data | **GREEN** | Saved items and reports refuse anonymous reads |
| Security — secrets in the deployment | **GREEN** | No server-side secret exists to leak |
| Personal data exposure | **GREEN** | No email column readable; profiles answer name/username only |
| Build, types, lint | **GREEN** | `bash launch/gates.sh`, 8 checks |
| Content integrity | **GREEN** | 26 books, 179 cards, no card written in a reader's voice |
| Database reachable | **GREEN** | `/api/health` |
| Does the product have anything to read | **GREEN** | Was 89% empty this morning; 26 books now furnished |
| Monitoring and alerting | **RED** | Nothing exists. A break is invisible |
| Automated journey tests | **RED** | None. No gate would notice sign-in breaking |
| Sign-up from a phone, from Reddit or LinkedIn | **RED** | Blocked: no sending domain |
| Correct 404s | **AMBER** | Books and genres right; profiles and discussions answer 200 |
| Backup and restore | **AMBER** | Backups exist, a restore has never been attempted |
| Capacity under launch load | **AMBER** | Reasoned, not measured; no staging to test against |
| Money | **n/a** | The product takes no payments |
