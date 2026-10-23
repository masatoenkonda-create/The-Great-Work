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

## Map asset and review fixes - Codex, 22 October 2026

User approved the review recommendations and supplied the coastal map. Copied it unchanged to public/assets/supply/norway_map.jpg (2752 x 1536); SHA-256 comparison confirms the installed asset is byte-for-byte identical. The SVG now uses the matching 1376 x 768 coordinate system, displays the full image and anchors pins to the pictured clearings/harbour/river. Routes are illustrative; source pins distinguish Plateau quarry from Nordic's depot and an overseas connection from the local coal sellers. No real mine location or international shipping lane is claimed. Small layouts stack the store below the map, and pins support keyboard activation.

Implemented the review recommendations: store quantities now subtract inputs used in manufacturing, show the silicon batch until sold, and remove resold material spares without changing purchase/test evidence or double-crediting revenue. Non-resellable unused electricity and excluded fines remain separately represented. Supplier panels reset lot count on switching companies. Germany's opening offer can be inspected before buying; negotiation shows the last offer versus current lot size, unit price, fee and total. Changing material preparation clears stale sample knowledge. Asset fallbacks retry when the requested image changes. The completed furnace cannot be restarted through its panel. Full mining/breaking workshop and selling mechanics retained.

Checks: npm.cmd run lint exit 0; bun test src: 41 pass, 0 fail across 9 files; npm.cmd run build: built in 707ms (existing bundle-size warning); git diff --check clean. Three new economic tests cover inventory/sale lifecycle, non-resellable surplus and renewed samples. No browser/playtest; user checks pin placement and feel. No new external research; fictional suppliers/quantities/terms remain teaching assumptions. Reload persistence remains deferred. Changes left uncommitted for Claude.

## Art received, 22 October 2026 (Claude)

First user art batch installed in `public/assets/supply/`: `product_quartz_crushed`, `product_quartz_screened`, `product_quartz_sieve`, `product_coal_bags`, `product_coal_bulk` (512 × 384 PNG, 2× the spec size, transparent). Gemini delivered white-background JPGs; Claude removed the background (flood fill from the edges). Crushed quartz and the coal heap came with a floor: the coal heap was cut along its outline; crushed quartz reused the screened image's shape (same composition) widened to keep the sand. Originals stay in the user's Downloads folder. Still placeholders: wood chips, power, silicon, all icons, pins, truck, portraits.

## Wood/power art and buying clarity - Codex, 22 October 2026

Reviewed Claude's latest commit 483bd05: five product assets and documentation, no engine changes. Inspected the crushed-quartz and bulk-coal PNGs; kept both. Coal is dark, so its product-view backing is now lighter for contrast. Some fine outline/floor remnants in the cut-outs can wait; no image reprocessing in this pass.

Installed the user's wood-chip sacks and electricity-pylon/switch-box JPEGs unchanged as product_woodchips.jpg and product_power.jpg; manifest selects those exact formats. Both hashes match the supplied originals. White backgrounds intentionally retained for this prototype, matching a white product-view backing. Other product files stay PNGs.

Small UI changes: sampled quartz now shows chunks versus fines in a visual strip; the order preview states whether the selected quantity leaves a shortage or creates spare stock. Engine, prices, map, full manufacturing and selling untouched. Checks: TypeScript passes; 41 pass, 0 fail across 9 files; build passes (existing bundle warning); whitespace clean. No browser/playtest or external source research. User tests. Uncommitted for Claude.

## Selling, map clarity and second art batch, 22 October 2026 (Claude)

User playtest: "the level works"; selling is the weakest part; the map is hard to read (screenshot showed broken-image icons on pins, tiny store icons).

| ID | Decision | Who |
|---|---|---|
| L14 | **Selling has its own procurement-style steps**: two other customers (Alloy Foundry, Silicone Works) give quotes; the player can show the best quote to Germany ("Show a competing quote" matches it), ask for more (buyer has patience 2 and a $620 cap); after the sale, Germany's **payment arrives $25 short** and the player compares it with their invoice (Accept or Chase). The chip still goes to Germany: other customers are leverage only. | Claude, from user feedback |
| L15 | Map pins are **coloured by what they sell** (quartz, carbon, chips, power; blue = buys your silicon), show the product icon inside, a sub-label ("sells quartz"), and a **badge**: red ! still needed, ✓ covered, 🚚 at the gate, GO (smelter ready), $ (customer to visit). A legend and a **"Next:" bar** sit on the map. | Claude |
| L16 | Store icons are bigger (36 px). Missing art never shows a broken image (SVG images only drawn after they load). | Claude |

Engine: `Buyer` gained `cap`, `patience`, `competitors`, `shortPay`; new phase `payment`; actions `getQuote`, `takePayment`, `chasePayment`; `bestQuote()`. Careful play now ends about +$44 (was +$24); careless about −$157 (no spares sold, short payment accepted). Tests 42 pass.

Art installed (cut from the user's Gemini JPGs, transparent PNG): products `woodchips`, `power`, `silicon` (512 × 384); icons `quartz` and `woodchips` (made from the product pictures), `carbon`, `power`, `silicon`, `fines`, `invoice` (64 × 64). Codex's `product_woodchips.jpg`/`product_power.jpg` replaced by the PNG cut-outs; `ASSETS.supply.product` back to `.png`. Still placeholders: pins, truck, portraits. Silicon-metal end uses (alloys, silicones) are a **Lead**, not yet in the source register.

## Pin art, 22 October 2026 (Claude)

Installed `pin_smelter` (192 × 192), `pin_quarry`, `pin_trader` (128 × 128), cut from the user's Gemini JPGs (flat dark background removed). They replace the coloured-disc icons automatically; no code change. The harbour image came out as a blurry world map, so it was **not** installed: `pin_harbour` still needs a redo (and `pin_bulk`, `pin_sawmill`, `pin_power`, `pin_customer`, truck, portraits remain placeholders).

**Open design question (user, 22 Oct), not decided, no code yet:** procurement must happen at every stop from Norway to China. If Norway sells its silicon to Germany, what does the player do on arriving in Germany? To discuss before any loop 2 work on Germany.

## Chain model chosen; Norway only for now, 22 October 2026 (Claude)

| ID | Decision | Who |
|---|---|---|
| L17 | **Option A, the chain**: the player runs each stop's factory in turn. What a stop sells becomes the next stop's main input, already in its store at the agreed price. China sells the TV to the man at home: **that price is the loop's bill**. Option B (own the material, pay processing fees) and C (trader in the middle) were rejected. | User, 22 Oct |
| L18 | Scoring: each stop shows its own result, and the **TV price at home is the loop's score**. | Claude's recommendation; the user didn't object; **to confirm** |
| L19 | **Build Norway only now.** Do not start other stops' loop 2 desks until the user asks. | User, 22 Oct |

Norway change for L17: the result panel now says what Germany paid and that it becomes Germany's starting cost. No engine change.

**Plan for later stops (draft, every row needs primary-source research before building):** one new real procurement lesson per stop on top of Norway's basics.

| Stop | Main input (carried) | Buys | New lesson | Sells to |
|---|---|---|---|---|
| Germany | Norway's silicon | hydrogen chloride, hydrogen, electricity | Contract vs pay-as-you-go (minimum commitment) | Japan |
| Japan | polysilicon | quartz crucible, seed crystal, saw wire | Approved suppliers (pay to test a new one) | Taiwan |
| Taiwan | wafers | photoresist, photomask set | Shelf life; made-to-order item with no second source | Malaysia |
| Malaysia | tested wafer | substrates, gold wire, mold resin | Prices tied to a market (gold) | China |
| China | packaged chip | main board, display module, power board, solder paste | The big-ticket item from few makers; partial delivery in a shortage (deterministic) | the man (USA) |

Art: new snowy autumn `norway_map.jpg` (same 2752 × 1536 size, slightly different layout; Nordic Minerals and River Power pins moved onto clearings); `pin_bulk` (cargo ship) installed. Still placeholders: `pin_harbour`, `pin_sawmill`, `pin_power`, `pin_customer`, truck, portraits.

## Calmer map, winter art, 22 October 2026 (Claude)

| ID | Decision | Who |
|---|---|---|
| L20 | **Modest, simple visuals.** The supplier map must not look like a cheap mobile game: no colour-coded discs, no pulsing badges or looping animation, no bright borders. Buildings (or a small neutral marker) with one quiet label; status in plain words in the label ("quartz · needed", "· at the gate", "· done", "quoted $610"). Thin faint roads; only the selected one is highlighted. The delivery marker still travels once along its road (slower, plain). | User, 22 Oct |

Replaced L15's coloured pins, badges, legend and pulsing; kept the "Next:" line in a plain style. Map art: the user's **winter** map (`Winter_coastal_pixel_art_map…123250.jpg`) replaces the autumn one (same size and layout; pins unchanged).

## Workflow file, 22 October 2026 (Claude)

The user asked for the session's workflow as an instruction file for building every other loop 2 stop: [PROCUREMENT_WORKFLOW.md](../PROCUREMENT_WORKFLOW.md). Codex will add its own section. Art cut-out script saved as `tools/cut_art.py`.

## Workflow review contribution - Codex, 22 October 2026

PROCUREMENT_WORKFLOW.md now contains one integrated Claude/Codex workflow: session history, practical country steps, visuals/art pipeline, economic invariants and a future chain-connection checklist. Candidate country lessons remain leads; no new mechanic per country is compulsory. Cross-country transfer/save contracts are explicitly not built. L18 scoring still needs confirmation. Codex's commit rule corrected to leave changes uncommitted unless requested. Local links/whitespace pass; no application tests, browser testing, external research or game-code changes. Follow this file for each requested country, without repeating Norway's rejected prototype detours.

## Neater map, 22 October 2026 (Claude)

User: buildings looked "copy-pasted, dropped crudely"; UI boxes didn't blend. Buildings now stand on their point with a soft ground shadow (no disc); places without building art show their product standing on the ground (same scale rule for all); labels are map lettering (light text, dark outline, no boxes; status line in small italics); material origins match. All boxes share one quiet translucent slate style (no thick black borders or hard shadows). Silicone Works moved from the sea onto the coast. Extends L20.

## Badge-style places, 22 October 2026 (Claude)

User: elements need a clean circle around them and the text felt disconnected. Each place is now one badge: a neutral translucent round plate (thin light rim, gold rim when selected) holding the building or product, with its name/status tab attached directly underneath in the same style. Material origins use a small version. Neutral only: no colour coding, no motion (L20 still applies). Harbour Coal moved slightly down to clear Bulk Importer.

## Last Norway art batch, 22 October 2026 (Claude)

Installed: `truck` (one frame of two, 160 × 80), `pin_sawmill`, `pin_power`, `pin_customer` (chemical plant with a German flag, used **only** for the Germany customer), and all seven portraits `rep_fjord`, `rep_nordic`, `rep_harbour`, `rep_bulk`, `rep_sawmill`, `rep_hydro`, `rep_buyer` (128 × 144, cropped at the waist: the grey gradient background could not be separated from dark trousers; the first of each duplicate pair used). Alloy Foundry and Silicone Works no longer borrow the German-flag factory; they show the silicon-bag marker.

**Checked against LOOP2_NORWAY_ASSETS.md (26 items): 25 installed. Missing: `pin_harbour`** (Harbour Coal still shows its coal-sack marker). Not in the original list but would help: buildings for Alloy Foundry and Silicone Works.

## Germany procurement research - Codex, 22 October 2026

User authorized Germany's research phase for Claude's later review. See [Germany procurement research](../research/germany/PROCUREMENT_RESEARCH.md) and the appended [country handoff](../research/germany/HANDOFF.md). Steps 1-2 only: input/workshop reconciliation, supply channels, contract terms, source limits and implications. No Germany plan, market, UI, art or chain connection built.

Selected passages read in 4 saved primary PDFs and 7 primary web pages; 2 PDF pages rendered and visually inspected; 1 brochure remains Lead. The approved contract/minimum-commitment lesson is supported most directly by on-site industrial gas evidence, not by assuming every electricity contract has a billing minimum. These are researched findings and agent recommendations, not additional user decisions. Application tests/build/browser: not run; documentation/source checks only. Changes uncommitted.

## Germany research review - Claude, 22 October 2026

Reviewed and extended Codex's Germany research: see "Claude's review and additions" in [PROCUREMENT_RESEARCH.md](../research/germany/PROCUREMENT_RESEARCH.md). GP01, GP02, GP05 confirmed; new GP12-GP14. Supports keeping Germany's lesson (contract vs pay-as-you-go); adds the electricity peak charge as a candidate for showing power. No new user decisions; next is the one-page `layers/GERMANY_PLAN.md` when the user asks.

## Germany research reviewed and improved - Codex, 22 October 2026

Reviewed Claude's source additions and corrected the purchasing/measurement implications in [Germany research](../research/germany/PROCUREMENT_RESEARCH.md), final Codex section. Added GP15 (read regulator reform announcement) and two inspected page renders. Recommend retaining minimum commitment as the sole new lesson and deferring peak-based workshop penalties and advance-payment mechanics. Contract quantities, fixed-price exposure and metered demand are distinct; the court award included future-term damages. No new user decision, plan, implementation or application tests. Source/local-link/whitespace checks recorded in the country handoff; changes uncommitted.

## Germany research closed - Claude, 22 October 2026

Final review done; Claude and Codex agree (recommendations, not user decisions): one lesson, a supply contract with a minimum is cheaper only if you need what you commit to; shortfall is money owed, not stock; selling keeps Norway's flow; peak charges and advance payments deferred. Summary: "Research closed" in [PROCUREMENT_RESEARCH.md](../research/germany/PROCUREMENT_RESEARCH.md). Next: `layers/GERMANY_PLAN.md`, only when the user asks.

## Germany prototype built, 22 October 2026 (Claude)

User said "keep going with the process" after the research closed: plan and build done (workflow steps 3-7). Plan: [GERMANY_PLAN.md](GERMANY_PLAN.md).

| ID | Decision | Who |
|---|---|---|
| L21 | Germany's one new lesson: **contract minimum vs pay as you go**. Hydrogen pipeline (min 10, need 9) pays off; power block (min 2, need 1) doesn't. The unused minimum is money owed, not stock. | Claude, from the joint research recommendation; user approved the lesson direction earlier |
| L22 | **First chain connection**: Germany opens after Norway's sale, its silicon costed at Norway's agreed price (not the money received). Replaying Norway clears Germany. Session-only, like Norway. | Claude, per the workflow's connection checklist |
| L23 | Gas is checked by its **spec sheet** (Supplier.spec), not a sample: one seller's cheap "HCl" is hydrochloric acid, not the dry gas (GP09). | Claude |
| L24 | Peak charges and advance payments **deferred** (Codex and Claude agreed). | Claude and Codex |

Files: `src/content/germanyMarket.ts` (+ test), `src/components/GermanyProcurement.tsx`, shared `src/components/procurement/ProcurementDesk.tsx` (Norway's screen now runs on it), App wiring. Art: [LOOP2_GERMANY_ASSETS.md](LOOP2_GERMANY_ASSETS.md), prompts alongside; all placeholders for now. Known gaps: loop 2 still not saved; Japan and later stops not started (don't start unasked); not browser-tested.

## Parked for the night, 22 October 2026 (Claude)

All of today's Claude and Codex work is committed; the working tree is clean. **Resume here tomorrow:**

1. The user plays loop 2: `?loop=2` → Norway (now on the shared desk; should play as before) → Germany. Fix what they report first.
2. Open question for the user: does the contract minimum read clearly on the order and the invoice?
3. Germany art: the user makes it from [LOOP2_GERMANY_ASSET_PROMPTS.md](LOOP2_GERMANY_ASSET_PROMPTS.md); install into `public/assets/supply/germany/` (workflow step 8). Norway still misses `pin_harbour`.
4. Still open: L18 (TV price as the loop score), loop 2 not saved on reload. Japan is **not** started; wait for the user.

## Pre-playtest check, 22 October 2026 (Claude)

Germany build re-checked before the user's playtest (numbers, chain wiring). Contract invoice line now says "Taken · minimum · billed", as the plan specified. No new decisions. Still waiting on: the user's playtest of `?loop=2` (Norway → Germany) and Germany art.

## Germany build reviewed - Codex, 22 October 2026

Bounded review of Germany's market, shared desk/engine, chain wiring and developer shortcut. Fixed contract offer arithmetic to use billed units (10 x $12 = $120); made the existing per-order minimum explicit instead of calling it monthly. Rate negotiation now retains the minimum and earlier orders retain their original terms; one regression test added. No new mechanics, prices, workshop changes or user decisions.

53 pass, 0 fail; TypeScript and production build pass (existing bundle-size warning). Read GP01 PDF p. 94, GP14 PDF p. 3, GP09 and GP16 web passages; other research not reopened. Browser not run. Germany art and session-only loop-2 state remain known gaps. Use the dev panel to open Germany directly for playtesting contract offers/invoices. Changes uncommitted; full record in BUILD_NOTES.md.

## Loop 2 depth: Claude's preliminary contribution, 23 October 2026

User: the buying experience is close (some UI fixes, one or two things), but loop 2 still misses features for a **deep understanding of supply chains**. The user is replaying Norway's loop 2 end to end and will report. Claude's pre-playtest ideas are in [brainstorm turn 9](LAYER_2_BRAINSTORM.md) (K13–K17): a chain receipt that grows stop by stop (recommended first), "squeezing your own customer moves cost, it doesn't remove it", a supplier's supplier, a second batch, cost per usable unit, and UI fixes. Questions Q11–Q15 are for Codex. Recommendations only, all Leads; no code changed. Next: Codex's turn 10, then the user's playtest report.

## Norway map legibility pass, 23 October 2026 (Codex)

- User reported that locations and items on the Norway loop-2 map were hard to read (image showed supplier map + store sidebar). Updated shared `src/components/procurement/ProcurementDesk.tsx`, which renders Norway and Germany procurement maps.
- Supplier/building markers grew from 36/46 to 43/52 SVG units, with a stronger double dark outline and larger product art. Name/status plates now have a more opaque backing, thicker outline, larger type (18/14 from 14/11), and the status is bright gold when a supplier is still needed.
- Added map zoom controls from 100% to 160%, including reset; map labels, pins and connecting roads scale together around the center, keeping geography attached. Enlarged/high-contrast Next instruction.
- No market, locations, routes, pricing or interactions changed. Germany shares the rendering and gets the same legibility/zoom treatment.

Checks: `npm.cmd run lint` passes; `npm.cmd run build` passes (existing >500 kB chunk warning). Browser visual check/playtest not run; user tests. No new tests (presentation-only). Remaining art placeholders unchanged. Changes uncommitted for Claude.
