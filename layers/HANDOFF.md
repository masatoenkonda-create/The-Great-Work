# Loop 2 (procurement): handoff and decision log

Started 22 October 2026 by Claude. **Read this first** before working on loop 2. History and reasoning: [LAYER_2_BRAINSTORM.md](LAYER_2_BRAINSTORM.md) (turns 1–7). Logs only grow: add entries, don't rewrite.

## Where it stands (22 October 2026, commit `84bd0a9`)

- Playable prototype, **Norway only**. Enter with `?loop=2` (replay screen) or by finishing loop 1's USA stop.
- Loop 2 Norway = **supplier map** (main screen) + **store panel** + supplier/customer panels with a **product view**; the smelter pin opens the **unchanged** loop-1 Norway workshop; the Germany pin sells the silicon. Result: profit or "your bill", plus lessons.
- All art is placeholder. The user is making the art with Gemini: [LOOP2_NORWAY_ASSETS.md](LOOP2_NORWAY_ASSETS.md) (list) and [LOOP2_NORWAY_ASSET_PROMPTS.md](LOOP2_NORWAY_ASSET_PROMPTS.md) (prompts). Files dropped into `public/assets/supply/` with those names replace placeholders with no code change.
- Next: wait for the user's playtest and art. Germany and the other stops for loop 2 are **not started**; do not start them unasked.

## Decisions

| ID | Decision | Who, when |
|---|---|---|
| L01 | Loops: production → procurement → shipping → compliance; procurement second | User; Claude and Codex agreed, 22 Oct |
| L02 | **No clock**, no real-time pressure; nothing changes until the player clicks | User, 22 Oct |
| L03 | Running out of money doesn't stop play; debt carries to a bad result | User, 22 Oct |
| L04 | Engine first: design the economic skeleton, not story or endings | User, 22 Oct |
| L05 | **Buy, make, sell**: each stop buys its inputs, makes the product and sells it to the next stop. Success = $0 bill or a profit | User idea, 22 Oct |
| L06 | Buying follows the real purchase-to-pay steps: quote → sample → negotiate → order → delivery check → invoice check (Pay/Dispute) → paid | User asked for "a real process"; Claude built, 22 Oct |
| L07 | No dice: outcomes come from choices only (Codex removed random risks; Claude kept it that way) | Codex, then Claude, 22 Oct |
| L08 | Bought ≠ usable (crushed quartz has fines); the delivery check reveals it | Codex, 22 Oct |
| L09 | A separate **supplier map** per stop is loop 2's main screen; the **customer is a pin** on it | User, 22 Oct |
| L10 | A **store panel** shows owned goods, open deliveries/invoices and cash | User, 22 Oct |
| L11 | A **product view** shows the physical item while buying/negotiating | User, 22 Oct |
| L12 | **Don't touch the workshop**: Norway's furnace stays as in loop 1, mining and breaking included ("it's cute") | User, 22 Oct |
| L13 | Prices, lots, odds and the $1B loop-1 bill are teaching values; suppliers are fictional | Claude and Codex |

## Files

| What | File |
|---|---|
| Shared engine (any stop): state, actions, profit, lessons | `src/content/tradeEngine.ts` (+ `tradeEngine.test.ts`) |
| Norway's market: needs, suppliers, levers, buyer, cash | `src/content/norwayMarket.ts` |
| Supplier map, store panel, supplier/smelter/customer panels, placeholders | `src/components/NorwayProcurement.tsx` |
| Replay screen between loops | `src/components/LoopReplay.tsx` |
| Loop state and wiring (`loop`, `procurement`, `?loop=2`) | `src/App.tsx` |
| Art paths with fallbacks | `ASSETS.supply` in `src/content/assets.ts` |
| Sources (P01–P26) | [sources/README.md](sources/README.md) |
| Reviews by Codex | [NORWAY_PROCUREMENT_REVIEW.md](NORWAY_PROCUREMENT_REVIEW.md), [NORWAY_BUYING_UI_REVIEW.md](NORWAY_BUYING_UI_REVIEW.md) |

Superseded and removed (history in git): `norwayProcurement.ts` (Claude's first dice prototype), `norwaySourcing.ts` (Codex's sourcing engine), `NorwaySupplyMap.tsx` (Codex's inset map). Their ideas live on in L06–L08.

## Known gaps

- Loop 2 isn't saved: reloading the page returns to loop 1.
- One fixed scenario: once learned, the best plan is known. No repeat buying or supplier relationships yet.
- Selling: one counter-offer only. Map pin positions are guesses until `norway_map.jpg` arrives.
- Not browser-tested by agents (the user tests).
