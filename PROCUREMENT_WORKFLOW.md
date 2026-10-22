# Procurement workflow: build loop 2 for every stop

22 October 2026, **Supply Chain Gang**. Written by Claude, reviewed and expanded by Codex from the session that built loop 2 Norway. Use it to build loop 2 (procurement) for Germany, Japan, Taiwan, Malaysia and China, one stop at a time, under the user's supervision. Norway is the reference. For loop 2 work this file sits beside [WORKSHOP_WORKFLOW.md](WORKSHOP_WORKFLOW.md) (whose research standard and hand-over checklist still apply); the user's newest instruction overrides both.

Current state, decisions L01–L20 and file map: [layers/HANDOFF.md](layers/HANDOFF.md). Read it first.

## The goal in one line

The player should think **"Oh, so that's how buying for a factory works."** They learn by doing the real steps of procurement (and selling), not by reading.

## What a loop 2 stop is

The chosen chain model (L17): **the player runs this stop's factory**. Its main input is the previous stop's output, entering the store at the price agreed there. The player buys the other inputs, makes the product in the **unchanged loop 1 workshop**, and sells it to the next stop. China sells the TV to the man at home; that price is his bill. Treating it as the overall score is still **to confirm** (L18).

**The goal at each stop** (user, L05): spend no more than you earn. Success is a $0 bill or a profit; careful play must be able to reach it, careless play should fall short.

**Design versus code:** only Norway is implemented. The cross-stop inventory/payment handoff, later markets and loop-2 save format are not built. Norway's result text describes the chosen chain; it does not implement Germany's opening inventory. This chosen model supersedes earlier proposals in the brainstorm to retain ownership and buy processing services. Preserve the material's identity across the sale, but change which factory owns it.

Every stop has the same parts:

| Part | What it is | Norway reference |
|---|---|---|
| **Supplier map** (main screen) | The region around the factory, seen from above. The factory in the centre; supplier pins; customer pins; faint roads; material origins as small dots | `src/components/NorwayProcurement.tsx` |
| **Supplier panel** | Product view (picture of what you buy), who sells it, the offer, Sample, negotiation asks, lots, Order | `SupplierPanel` |
| **Store panel** (right) | Cash, stock as icons (grey = still needed), "At the gate" (check delivery, compare order vs invoice, Pay/Dispute), the guide's line, "Go to the factory" | aside in the same file |
| **Workshop** | The loop 1 workshop, **untouched** (L12) | e.g. `NorwayManufacturing.tsx` |
| **Customer panels** | The next stop's buyer (negotiate, then check their payment) and other buyers (quotes for leverage) | `CustomerPanel`, `CompetitorPanel` |
| **Result** | Spent, earned, profit or "your bill", one lesson per thing done or missed, and the chain note | `CustomerPanel`, phase `done` |

The engine is shared and must stay shared: `src/content/tradeEngine.ts` (state, actions, profit, lessons). Each stop supplies a **market file** (`src/content/<country>Market.ts`, like `norwayMarket.ts`): needs, suppliers, levers, buyer, competitors, cash.

## The core loop the player goes through

Buying, as represented in Norway using P01/P03: **understand the need and origin → inspect an offer/sample → negotiate if useful → order → check the delivery → compare invoice with order → pay**. This is our playable simplification, not a claim that every real purchase requires every action in that exact order. Routine approved inputs can use shorter checks; a material sample and an electricity agreement need different representations.
Making: the loop 1 workshop.
Selling: **get quotes from other buyers → negotiate with the next stop (patience and a cap) → accept → check their payment against your invoice**.
The alternative buyers provide negotiating leverage; they do not receive the tracked material. A sale price, money invoiced and money actually received are separate. Norway's short-payment scenario makes the player see that distinction.
No clock, no dice (L02, L07): every result follows from choices.

## The session we are repeating

This records the whole development path, not a requirement to rebuild every rejected version.

| What we tried | What the player taught us | What to carry forward |
|---|---|---|
| Discussed procurement, researched its workflow and trade-offs | A wallet and a list of prices would not teach sourcing | Begin with the input's purpose, origin, requirement and buying decision; keep evidence in team files |
| Built a Norway desk with supplier cards and random disruptions | It felt like clicking buttons; having money made buying seem sufficient | Make choices change actual supply/terms; money alone cannot make an input usable |
| Added sources, samples, usable quantities and receiving | Correct ideas were buried in text; the goods needed a visible presence | Show the material and its consequence; use short current feedback rather than more paragraphs |
| Built buy → make → sell, negotiation and invoice checks | Selling made the economics meaningful; buying still needed clarity | Keep costs connected to eventual revenue; show the opening customer offer before buying |
| Made the supplier map the main screen, with product and store panels | Companies, goods and movement made the process easier to follow | Source → seller → factory; representative/product view; visible stock and deliveries; customer as a map destination |
| Added competing quotes, sales negotiation and payment reconciliation | Selling needed decisions and follow-through too | Separate quote, agreed price, invoice, received payment and result |
| Integrated the user's art and revised layout/status | Coloured discs, badges and animation became noisy; the user wanted calm visuals | Current L20 styling wins: modest buildings/markers, quiet labels, faint roads and one plain next-action line |
| Chose the chain model and preserved the full workshop | The user wants the fun manufacturing actions, including mining and breaking | Wrap the existing workshop; don't remove accepted actions to make the procurement abstraction more literal |

We alternated short agent reviews, small code passes and **the user's browser playtests**. That feedback, rather than another large design exercise, decided the next change. Art was requested and installed incrementally while placeholders kept the level playable.

## The workflow, step by step

Work one stop at a time. Stop at the step the user asked for. Once the user authorizes a prototype/build, implement that scoped pass without repeatedly requesting permission. Do not start the next country or broaden the task unasked. The user tests in the browser; agents run appropriate automated checks.

1. **Look first.** Read layers/HANDOFF.md, this file, recent BUILD_NOTES entries and the active code for the stop. Consult the relevant country handoff/research passages. List its carried main input separately from the additional goods/services it buys; reconcile arrival, workshop and market needs. Read targeted sections, not the whole repository again.
2. **Understand the real activity before designing** (user, 22 Oct). Research, to WORKSHOP_WORKFLOW.md's standard, how this stop's factory actually buys its inputs: who sells them, how many suppliers there are, typical terms, what can go wrong. Primary sources saved in `layers/sources/` (or `research/<country>/sources/`), each marked Read / Skimmed / Lead. Guessing is not enough.
3. **Write a one-page plan** in `layers/<COUNTRY>_PLAN.md`, adapting Norway's established flow to this stop. Name the main input, bought inputs/services and their purpose, map origins/sellers, meaningful offers/requests, customer, numbers and one consequence to observe. A key input may warrant two suppliers; routine ones need no token alternative. Give the stop its **one new procurement lesson** from the table below (user-approved direction); research may confirm or replace the specific lesson, but keep one new lesson per stop so stops don't repeat. Make technical calls yourself; ask the user only about feel and direction.
4. **Walk one batch through the numbers.** Use declared teaching values (L13), not invented market data. Calculate a workable path, a costly mistake and its recovery, leftovers, sale, payment and final result. Norway's approximately +$44/−$157 are examples of current tuning, not targets for every country. Include the inherited input's cost; do not buy it twice or count revenue twice. A fixed prototype can have a learnable best solution; do not add complexity merely to prevent one. The important choices must have understandable consequences.
5. **Reuse the shared engine.** Start with a market file. Add engine behavior only if this stop's chosen, researched interaction cannot use what already exists; don't add a feature just because it is a new country. Keep process-specific data outside the engine. Test meaningful new economic/state rules and keep Norway passing. Before connecting a second stop, implement its producer/consumer handoff together (see below).
6. **Build a small playable screen with placeholders.** Reuse Norway's map/product/store/customer structure and behavior. Extract shared UI only as needed; don't copy the whole country component into five diverging engines or begin an unrelated refactor. Preserve Norway. Placeholder failures must never show broken images (`useLoaded`, `Art` fallbacks). Check the process with temporary art before requesting a whole asset pack.
7. **Write the art list and Gemini prompts** (`layers/LOOP2_<COUNTRY>_ASSETS.md` and `_ASSET_PROMPTS.md`, Norway's are the model). The user generates the art.
8. **Install the art incrementally** (see "Art pipeline"). Keep approved files and correct extensions. Inspect cut-outs, contrast and pin placement on the actual image; an offline overlay is useful, not a browser playtest. Layout and image must use one coordinate system, preserve aspect ratio and keep important landmarks/pins visible.
9. **Hand over to the user to play.** State the entry point and the few changes to notice. Fix their reported obstacle in the same scoped round; don't pile on guessed mechanics. Several short rounds are normal; there is no required number. Keep accepted selling/manufacturing behavior while improving buying clarity.
10. **Log and hand over.** Append BUILD_NOTES.md (changes, checks, untested/placeholder), layers/HANDOFF.md (decisions and current limitations) and the country's handoff. Mark user decisions separately from agent recommendations. **Codex leaves changes uncommitted unless the user requests a commit.** Claude can commit the passes separately after reviewing the diff; don't bundle or delete the other agent's work without inspection.

## The lesson for each later stop (approved direction, details to research)

The user approved this lesson-per-stop plan on 22 October 2026 ("This is excellent!"). The **direction** is decided: each stop adds one new real procurement lesson on top of Norway's basics. The **specifics** are not verified facts: research each row when its country is requested, and replace a lesson if the research shows a better real one. Build one country at a time; do not implement this table in advance.

| Stop | Main input (carried) | Buys | New lesson | Sells to |
|---|---|---|---|---|
| Germany (Greta) | Norway's silicon | hydrogen chloride, hydrogen, electricity | Contract vs pay-as-you-go (minimum commitment) | Japan |
| Japan (Aiko) | polysilicon | quartz crucible, seed crystal, saw wire | Approved suppliers (pay to test a new one) | Taiwan |
| Taiwan (Mei) | wafers | photoresist, photomask set | Shelf life; made-to-order item with no second source | Malaysia |
| Malaysia (Farid) | tested wafer | substrates, gold wire, mold resin | Prices tied to a market (gold) | China |
| China (Xiao Lin) | packaged chip | main board, display module, power board, solder paste | The big-ticket item from few makers; partial delivery in a shortage (always the same, never random) | the man at home (USA) |

USA has no additional factory procurement desk: the man pays the TV price under the chosen chain model. Its implementation and any overall scoring rule remain to be specified.

## Connecting a new factory to the chain

Before a second stop can honestly be called connected, its handoff must define:

- **The object:** product/batch identity, quantity/unit, and relevant existing evidence (especially Taiwan's map, Malaysia's selected chip and China's installed chip/TV).
- **The transaction:** seller, next factory buyer, agreed price, invoice, actual receipt and any unresolved deduction. The next factory's input cost uses the agreed transfer price; a short payment is a separately recorded receivable/settlement outcome, not a silent price change.
- **The opening store and ledger:** previous output becomes this factory's input once, with its transfer cost once. Local profit is not the same as starting cash or the final TV bill. Never seed a guessed paid batch just to let the next screen run.
- **Replay/save behavior:** replaying a producer invalidates dependent results and transactions coherently. Existing loop-1 saves must not be silently certified as loop-2 procurement. Persistence/migration is part of the implementation when the chain is connected, not something the result text supplies.

This is an implementation checklist for the chosen model, not a claim these contracts already exist. Keep the first connection small and reviewable.

## Rules learned in Norway (don't repeat these mistakes)

- **Don't rush past understanding.** The first prototype (two supplier cards and a dice roll) taught nothing: "click, click, click". Codex's second version was right but buried in text. What worked: real steps, short lines, pictures of the goods.
- **No clock, ever** (L02). Nothing ticks while the player thinks; don't charge money for time spent.
- **No dice** (L07). A risk is shown before the choice, and its consequence is fixed.
- **Show the physical goods** (L11). Product view while buying; icons in the store; the sieve at the delivery check.
- **Answer the four questions through action.** Why do I need it? Where is it made? How do I obtain/use it? What does it look like? Show producer and seller separately when they differ. Don't invent a country of origin to fill a map.
- **Bought is not usable** (L08). Separate ordered, delivered, checked, usable and paid. A sample predicts suitability; the receipt checks the actual order. One size check is not a chemical assay or lifetime guarantee. A changed material/preparation needs renewed evidence; a lower price alone does not create defective dies.
- **The store is physical stock, not a purchase-history display.** Inputs leave when used, output appears when made, goods leave when sold. Preserve the receipt/test record; don't rewrite it to represent consumption. Keep fines and non-resellable service commitments distinct from saleable spare material.
- **Make money legible.** Show the customer's opening offer before buying, the total order commitment and likely shortage/spare quantity, and before/after negotiation terms. Reset lot selection between companies. Do not bill the same energy/service twice or credit a sale twice.
- **Financial failure is not technical failure** (L03). Allow debt and a bad financial result; don't turn a working chip into a failed chip because its factory lost money. Corrective supply should retain the original purchase's cost/evidence.
- **Selling needs steps too** (L14). Quotes from other buyers as leverage, a buyer with limited patience and a cap, and a payment to check.
- **Modest visuals** (L20). No colour-coded discs, pulsing badges, looping animations or bright borders. Pixel art carries the look; status is written in plain words in one quiet label. One "Next:" line in a plain style.
- **Don't touch the workshop** (L12). Loop 2 adds buying and selling around it.
- **The engine is a skeleton.** Keep it small, general and tested; add only the behavior needed for the requested pass.
- **Story, openings and endings come later** (L04).
- **Record every decision** in layers/HANDOFF.md the moment the user makes it, so Codex can pick up without conflict.

## Art pipeline

- The user generates art with Gemini from our prompts. Gemini usually returns a 2K **JPG**, not a transparent PNG, and sometimes adds a floor or a blurry scene; add *"Plain pure white background, no floor, no ground, no scenery."* to every object prompt.
- Preserve the original. Choose any image-editing tool according to the active session/tool instructions; this repository does not override them. `tools/cut_art.py` (Pillow) records Claude's cut-out method from this session, not a requirement to process every new asset. Its documented command is `python -P tools/cut_art.py <src> <dst.png> <mode> <w> <h>`; modes include `white`, `white:246`, `dark:12`, `outline:75` and `outline:160`. A clean original JPEG on an appropriate backing can be enough for a prototype.
- Check the actual silhouette before using another image's mask: this session reused one for a matching quartz composition, but mismatched shapes can remove real material. Don't silently cut off a pylon, spilled chips or fines to hit a requested size. No unnecessary regeneration or image-processing pass.
- Sizes used: products 512 × 384, icons 64 × 64, pins 128 × 128 (factory 192 × 192), maps 2752 × 1536 installed unchanged. File names from the asset list, in `public/assets/supply/` (one folder per stop when there is more than one map, e.g. `public/assets/supply/germany/`).
- **Check every cut-out by eye** on a dark preview sheet before committing. If an image is simply wrong (the "harbour" that came out as a world map), don't install it; tell the user.
- Overlay the pin positions on a new map image before keeping them.
- Keep the latest approved style, not the first iteration. Norway went through summer, snowy-autumn and winter variants; L20 later calmed its UI. Another country's climate/terrain should suit that location. The reusable rule is coherent art plus readable geography, not snow everywhere.
- Keep product pictures, stock icons, building pins and portraits as separate assets. Labels/prices/status and interaction coordinates stay in code. Use one manifest; retry a different asset after a missing-image fallback. Decorative delivery motion runs once and never drives time or money.

## Testing and hand-over

- Agents: `npm run lint` (`npm.cmd` on this Windows setup), `bun test src` for changed engine behavior/regressions, and `npm run build` for application/asset integration. Don't repeat a passing suite without a new change or unresolved issue; no application tests needed for documentation-only work. Paste the result line or say **not run**. The user does browser testing (`?loop=2` currently opens the replay entry screen, then Norway).
- Test the economic consequences, not button labels: feasible and costly paths, release conditions, fixed order terms, receipt/payment idempotence, inventory consumption and sale, financial versus technical success, and the new connection's input cost/identity when implemented. Add only tests warranted by the change.
- Before committing the other agent's work: `git diff --stat`, question large deletions.
- Every report says what was read (sources), what was tested (result line) and what is still placeholder.
- Research reports name the passages read, source statuses and remaining leads. A UI/code review does not need to reopen the entire evidence archive unless it makes or changes a factual build decision. Don't claim a source was read because its filename exists.
- Keep reports and context small: inspect the current diff and relevant sections, batch independent checks, make one bounded improvement and hand over for the user's playtest. No agent browser playthroughs.

## What should be ready at the end of each country pass

A short country plan with evidence links; market data and the requested working flow; reused map/product/store/customer presentation; an art list/prompts only for needed assets; appropriate test results; and appended build/handoff notes stating exactly what is implemented, untested and still a placeholder. No next-country implementation or speculative mechanic is part of that handover.

Codex's review contribution is integrated above so there is one workflow to follow, not a second competing version. Review depth: compared this draft with today's BUILD_NOTES, layers/HANDOFF decisions L01–L20, GAME_VISION and the active engine/App entry points. No new external research or gameplay code changes in this documentation pass.
