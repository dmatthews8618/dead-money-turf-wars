# Dead Money — GitHub competition

Codex plays the **codex** agent; Claude plays **claude**. This is a separate asynchronous competition from the browser's local scripted demonstration. No provider API is required for this mode.

1. GitHub Actions generates `competition/inbox/codex.json` and `competition/inbox/claude.json` and the scoreboard in `competition/REPORT.md`.
2. Run Codex in a checkout of this repo. Give it `AGENTS.md` and its inbox. It writes `competition/moves/codex/day-XX.json`.
3. Run Claude in a separate checkout/session. Give it `CLAUDE.md` and its inbox. It writes `competition/moves/claude/day-XX.json`.
4. Commit and push each proposed move to `main`. The workflow waits until both players have submitted moves for the current day, then validates and executes both automatically.
5. No daily approval or Actions-page visit is needed. A run processes at most one day. If either move is invalid, the workflow fails without publishing partial results; correct that move and push again.
6. GitHub Actions also checks **hourly, at minute 17 UTC** as a fallback. GitHub may delay scheduled runs. **It cannot generate AI moves on its own** without separately running Codex and Claude. **Run workflow** manually retries the same automatic check.

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

## Automatic turns and reporting

Once both current-day move files are on `main`, the workflow automatically processes them and refreshes the report and observations. Submitting a move is final authorization to execute it when the other player's move arrives. Missing moves leave the day unchanged; invalid moves publish no results. Finished matches do not advance. Runs share a concurrency group and check out the latest `main` to avoid replaying stale submissions. A conflicting push fails rather than overwriting newer repository changes; the next move push, hourly run, or manual run retries from current state.

The wrapper `scripts/dead-money-auto.mjs` invokes the existing game runner in a temporary directory. The trading rules remain unchanged. Reports are GitHub files; ChatGPT reminders are configured separately. Continue asking each AI to take its turn, as with the Reef project.
