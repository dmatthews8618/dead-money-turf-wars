# Dead Money — play through the AI chats

1. Ask Codex and Claude to check Dead Money and take their current turn.
2. Each AI submits its own move. Valid, owner-authored pull requests containing only the current move file are validated and merged automatically.
3. Once both valid moves arrive, the game processes one day. The website refreshes itself and shows the completed moves.

There is no routine manual merge, approval number, or workflow button. The website's prompt button provides text for the relevant AI session; it does not itself start an AI. The separate practice demo is tucked below the live match.

## Competitor rules

Codex reads `AGENTS.md` and only `competition/inbox/codex.json`. Claude reads `CLAUDE.md` and only `competition/inbox/claude.json`. Derive the current day from your own observation. Never inspect the other player's observation or moves, `competition/match.json`, hidden prices, or future randomness. Do not use the spectator page's opponent information to choose moves.

Write `competition/moves/<agent>/day-XX.json`, with a two-digit current day. Use this envelope:

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

Choose at most eight actions; the reason must be a string of at most 1,000 characters. Allowed actions are buy, sell, repay, travel, lay_low and hold. Quantities must be positive integers, affordable at the observed prices, within owned inventory for sales, and within the 40-unit capacity for purchases. Repayments cannot exceed cash or debt. Laying low costs £100.

Travel is permitted at most once per move, costs £25 after preceding purchases or repayments, and must go to a district different from your current location. Legal districts are The Docks, East End, Old Town, The Estate, Market Row and Southside. Prefer placing travel last. Check these constraints before submitting.

Commit directly to main when permitted, otherwise open a ready pull request containing **only your current move file**. Do not leave a move on a branch without a pull request. Watch the validation result and correct your own invalid submissions rather than asking the player to debug, merge, or run workflows. Never change the game engine or another player's files as part of a turn.

## Automatic submission and processing

The workflow handles move pushes and move pull requests, plus an hourly fallback at minute 17 UTC. Owner-authored, non-draft move-only PRs targeting main are eligible. Other PRs retain normal review. The validator reads the candidate JSON and runs the trusted main-branch runner in a temporary directory; it never executes PR code. Merging is pinned to the validated head SHA.

The workflow scans eligible existing PRs, merges valid moves, then processes the current day using `scripts/dead-money-auto.mjs`. It publishes game results only if both moves validate. Missing moves leave the day unchanged. Invalid moves produce a public error status without publishing partial game results. Runs are serialized, start from current main, and process at most one day; completed matches never advance. Conflicting repository pushes fail instead of overwriting newer changes and retry on a later run.

The public spectator feed is `competition/public.json`. It contains standings, submission flags, processing errors, and completed decisions, not unexecuted move contents. The website polls it every 30 seconds. GitHub Pages deployment and GitHub workflows may take a minute or two.

The game uses the real AI chat sessions for decisions. GitHub does not generate their moves. ChatGPT reminders are configured separately. A failed validation means the responsible AI must fix its move; the owner does not need to merge the correction.

This remains a small prototype rather than an audited competition engine.
