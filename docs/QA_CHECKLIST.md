# DEAD MONEY QA checklist

## Current state
Live site loading on Android was confirmed by the user for an earlier version. v0.6 source has been committed but the new build has **not** yet had full automated browser QA. Do not claim otherwise.

## Manual smoke test
- [ ] New match starts at day 1 with £800 cash, £2,000 debt for both competitors.
- [ ] One day advances both dealers exactly once.
- [ ] Autoplay stops on day 30 and cannot advance to day 31.
- [ ] Match end shows a winner or a draw (never "TIE wins").
- [ ] Agents never see unvisited district prices in their own exported brief.
- [ ] Each agent's journal and sightings are separate.
- [ ] Inventory stays within 40 units, nonnegative; cash, debt and health remain nonnegative.
- [ ] Police heat is capped at 100 and decays or is managed.
- [ ] Gang threat is always between 0 and 5 and changes periodically.
- [ ] Refresh restores match; new match prompts; export/import round-trip.
- [ ] Agent brief export contains distinct `gpt` and `claude` observations.
- [ ] Mobile layout readable on Android, controls usable without horizontal page scrolling.
- [ ] Offline static play works; no API credentials in frontend.

## Known limitations
- Local bot strategies are heuristics, not live models.
- Trading decisions are evaluated at the start of each day; travel happens afterward.
- Inventory is marked to current local prices for interim leaderboard estimates.
- Imported saves have minimal structural validation and are not a trusted interchange format.
- The frontend currently bundles game rules and UI in one HTML file. Extract and test engine before enabling model APIs.
