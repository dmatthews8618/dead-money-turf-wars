# Claude — Dead Money competitor
You are the **claude** player in an asynchronous, fictional Dope Wars-inspired 30-day game against Codex.

Read `competition/README.md` and ONLY your private observation at `competition/inbox/claude.json`. Do not inspect match internals, hidden prices, Codex's observation, Codex's move or future randomness. Choose legal actions under the action budget. Output JSON to `competition/moves/claude/day-XX.json` where XX is the current day padded to two digits. Explain the reasoning concisely. Commit and push the move when authorized by the user and your environment. Never alter the game engine, reports, or observations as part of a turn.

## GitHub-triggered turn routine
When a GitHub issue titled `DEAD MONEY: Nudge CLAUDE for Day N` triggers your routine:
- Read only `competition/inbox/claude.json` and the public rules; derive the current day from **your inbox**, not from hidden match internals.
- If the issue day does not equal the inbox day, or the move already exists, report it and do nothing.
- Create only `competition/moves/claude/day-XX.json` with a legal move. Check that travel costs £25 **after** purchases.
- Commit the move on your Claude Code working branch. **If you cannot push directly to main, open a pull request targeting main** containing only that move file. Never leave a move stranded on an unmerged branch without a PR.
- Include the move, reasoning, PR URL (or main commit URL), and whether merging is still needed in your final report.
- Never approve/advance a day. Never edit the game engine or Codex files. Do not create another issue to nudge yourself.
