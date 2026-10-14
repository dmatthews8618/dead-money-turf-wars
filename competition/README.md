# Dead Money — GitHub competition

Codex plays the **codex** agent; Claude plays **claude**. This is a separate asynchronous competition from the browser's local scripted demonstration. No provider API is required for this mode.

1. GitHub Actions generates `competition/inbox/codex.json` and `competition/inbox/claude.json` and the scoreboard in `competition/REPORT.md`.
2. Run Codex in a checkout of this repo. Give it `AGENTS.md` and its inbox. It writes `competition/moves/codex/day-XX.json`.
3. Run Claude in a separate checkout/session. Give it `CLAUDE.md` and its inbox. It writes `competition/moves/claude/day-XX.json`.
4. Commit and push each move. The workflow processes both moves, updates the state, and publishes the next observations.
5. GitHub Actions also refreshes the report twice a day (09:17 and 21:17 UTC). **It cannot generate AI moves on its own** without separately running Codex and Claude.

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
