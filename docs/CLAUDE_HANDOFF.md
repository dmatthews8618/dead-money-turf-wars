# Claude joining DEAD MONEY — integration handoff

## Current status
DEAD MONEY is a public, static GitHub Pages browser game. Both named competitors currently use local scripted strategies; neither calls GPT or Claude models. The user wants real, independently deciding GPT and Claude opponents. The game should remain a Dope Wars-style 30-day strategy simulator with gritty 1990s crime aesthetics, not an open-world GTA clone.

Live game: https://dmatthews8618.github.io/dead-money-turf-wars/
Repository: https://github.com/dmatthews8618/dead-money-turf-wars

## What we need from Claude
Ask Claude to act as the **Claude rival agent**. It should receive only its own observation and personal memory, then return a strictly validated JSON action plan. No privileged access to unseen prices, future RNG or GPT's private memory. The human user should not need to manually relay each turn.

## Current export
The browser game includes **EXPORT AGENT BRIEF**, producing a JSON file with a `claude` observation and a `gpt` observation. This is a handoff aid, not live API integration. Do not publish private API keys in GitHub or browser code.

## Proposed decision contract
Input: `dead-money-agent-observation-v1` with agent, day, location, cash, debt, health, heat, capacity, inventory, localPrices, knownDistricts, personalJournal and availableActions.

Output: one JSON object:
```json
{
  "schema": "dead-money-agent-action-v1",
  "agent": "CLAUDE",
  "actions": [
    {"type": "sell", "good": "Weed", "quantity": 3},
    {"type": "buy", "good": "Pills", "quantity": 2},
    {"type": "repay", "amount": 100},
    {"type": "travel", "district": "The Docks"}
  ],
  "reason": "Short in-character explanation grounded in known observations.",
  "memoryUpdate": "A short note to carry forward."
}
```

Actions are illustrative. The game engine must validate allowed goods, available cargo, cash, travel, capacity, and action count; reject illegal or unaffordable actions. Never execute code supplied by an agent.

## Architecture before connecting
1. Extract deterministic match engine from `index.html`; expose `observe(agentId)`, `validate(action)`, `apply(action)`, `advanceDay()` and `serialize()`.
2. Make one shared engine authoritative for both agents, including random events. Agents never choose RNG outcomes.
3. Build a **server-side** coordinator (or trusted serverless function) holding the OpenAI and Anthropic API keys. GitHub Pages alone must not hold secrets. User approval and provider credentials will be required.
4. Send the same observation schema and same action budget to both models; store separate memory.
5. Add request timeout, schema validation, retry, safe fallback action and per-turn cost limit.
6. Persist a replayable match record: seed, turn observations, accepted actions, events and outcome.

## Questions for the user when ready
- Which provider access/credentials are available for Claude and OpenAI? Chat subscriptions alone do not necessarily include API access.
- Is the user happy with a small backend service (potential hosting and API charges)?
- Which Claude model and GPT model to use, balancing cost, speed and quality?

No credentials should be shared in chat, source code or public issues. Configure them only as protected backend environment secrets.
