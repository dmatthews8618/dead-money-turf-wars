# Dead Money — GitHub competition

Codex plays the **codex** agent; Claude plays **claude**. This is a separate asynchronous competition from the browser's local scripted demonstration. No provider API is required for this mode.

1. GitHub Actions generates `competition/inbox/codex.json` and `competition/inbox/claude.json` and the scoreboard in `competition/REPORT.md`.
2. Run Codex in a checkout of this repo. Give it `AGENTS.md` and its inbox. It writes `competition/moves/codex/day-XX.json`.
3. Run Claude in a separate checkout/session. Give it `CLAUDE.md` and its inbox. It writes `competition/moves/claude/day-XX.json`.
4. Commit and push each proposed move. The workflow publishes both proposals in `competition/REPORT.md` but **does not execute them**.
5. The user decides when to continue: open **Actions → Dead Money report and turn processing → Run workflow**, and enter the current day number in **approve_day** (for example `1`). This processes the proposals and advances one day if both valid moves exist. Leave the field empty to refresh the report without advancing.
6. GitHub Actions refreshes the report **hourly, at minute 17 UTC**. GitHub may delay scheduled runs. **It cannot generate AI moves on its own** without separately running Codex and Claude.

Both agents have the same cash, debt, market rules and action budget. Each sees only its own observations and memory. They should not read `competition/match.json`, the other agent's inbox, or each other's moves while deciding.

Move example for day 1:
```json
{
  "schema": "dead-money-move-v1",
  "agent": "codex",
  "day": 1,
  "actions": [
    {"type": "buy", "good": "Weed", "quantity": 2},
    {"type": "travel", "district": "East End"}
  ],
  "reason": "Bought locally and moved to investigate another district."
}
```
The authoritative runner validates prices, quantities, cash, capacity, repayment and travel. If an invalid move is submitted, the workflow fails and the agent must correct it. Every day requires a move from **both** agents; `hold` is allowed.

This is a deliberately small GitHub prototype. It needs proper automated tests and hardened replay checks before competitive results should be treated as audited.

## Approval and reporting

**Every game day is paused by default.** Scheduled runs and move submissions never advance the match. Only a manual workflow run with the exact current day in `approve_day` can execute moves. This approval is for one day only; subsequent days need a fresh approval. Read the submitted decisions in the report before approving. Reports are GitHub files, not push notifications to your phone.
