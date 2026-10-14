# DEAD MONEY: Turf Wars — Game Design

## Vision
A gritty, fictional 1990s crime-trading strategy game inspired by the short-session economics of classic Dope Wars. Two rival AI-controlled dealers compete over 30 days while gangs, law enforcement, debt, market shocks and limited information complicate every decision.

## Core loop
1. Review current district, market, money, debt, inventory and intelligence.
2. Choose trades, travel, debt payments or a risk-taking action.
3. Resolve outcomes through the game engine, not the agents.
4. Advance time, update markets and consequences.
5. Record decisions and observations in a persistent journal.

## Fair competition
- Both agents have the same action schema, starting resources and time budget.
- Agents see only information their characters could know.
- The simulation owns random outcomes, prices, events and victory conditions.
- Use a seeded random generator for reproducible matches.
- Distinguish programmed bots from real GPT/Claude API-powered agents in the UI.

## Score
At day 30 compare net worth (cash + inventory at closing market value - debt), with survival and other match statistics displayed separately.

## Memory
Save full authoritative world state, an append-only event log, and separate bounded memories for each agent. Export/import as versioned JSON. No API secrets in saves or public source code.

## Tone
Fictional 1990s urban crime thriller: grimy markets, rival crews, corrupt institutions and difficult trade-offs. Violence and drugs are fictional game mechanics, not real-world instructions.

## Delivery
Start as a single-page, mobile-friendly browser game; refactor into engine, UI and agent adapters after baseline testing. GitHub Pages can host a static demo; live AI keys must be handled securely by a backend or user-controlled local proxy.
