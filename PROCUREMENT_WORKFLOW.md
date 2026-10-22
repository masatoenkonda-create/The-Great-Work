# Procurement workflow: build loop 2 for every stop

22 October 2026, **Supply Chain Gang**. Written by Claude from the session that built loop 2 Norway; Codex adds its own section below. Use it to build loop 2 (procurement) for Germany, Japan, Taiwan, Malaysia and China, one stop at a time, under the user's supervision. Norway is the reference. For loop 2 work this file sits beside [WORKSHOP_WORKFLOW.md](WORKSHOP_WORKFLOW.md) (whose research standard and hand-over checklist still apply); the user's newest instruction overrides both.

Current state, decisions L01–L20 and file map: [layers/HANDOFF.md](layers/HANDOFF.md). Read it first.

## The goal in one line

The player should think **"Oh, so that's how buying for a factory works."** They learn by doing the real steps of procurement (and selling), not by reading.

## What a loop 2 stop is

The chain model (L17): **the player runs this stop's factory**. Its main input is the previous stop's output, already in the store at the price agreed there. The player buys the other inputs, makes the product in the **unchanged loop 1 workshop**, and sells it to the next stop. The TV's price at home is the loop's score (L18, to confirm).

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

Buying (real purchase-to-pay steps, P01/P03): **quote → sample → negotiate → order → check the delivery → check the invoice → pay**.
Making: the loop 1 workshop.
Selling: **get quotes from other buyers → negotiate with the next stop (patience and a cap) → accept → check their payment against your invoice**.
No clock, no dice (L02, L07): every result follows from choices.

## The workflow, step by step

Work one stop at a time. Stop at the step the user asked for. The user tests in the browser; agents run `npm run lint` and `bun test src` only.

1. **Look first.** Read layers/HANDOFF.md, this file, the stop's research folder and its loop 1 workshop. List what the stop buys today (its arrival items).
2. **Understand the real activity before designing** (user, 22 Oct). Research, to WORKSHOP_WORKFLOW.md's standard, how this stop's factory actually buys its inputs: who sells them, how many suppliers there are, typical terms, what can go wrong. Primary sources saved in `layers/sources/` (or `research/<country>/sources/`), each marked Read / Skimmed / Lead. Guessing is not enough.
3. **Pick the stop's one new lesson**, on top of Norway's basics, from the plan table below. One lesson per stop, so stops don't repeat. Write a one-page plan in `layers/<COUNTRY>_PLAN.md`: needs, suppliers (2 per key input, 1 for routine ones), each supplier's levers and replies, the buyer and competitors, the numbers, and the lesson. Make the technical calls yourself; ask the user only about feel and direction.
4. **Tune the numbers on paper first.** Teaching values (L13), not market data. Target: careful play ends a little above zero (Norway: +$44); careless play clearly loses (Norway: −$157). Each choice must be a real trade-off: no option that is always best.
5. **Build the market file and engine additions.** Add the new lesson to `tradeEngine.ts` only as a general feature any stop could use (e.g. a contract with a minimum commitment), with tests. Never fork the engine per stop. Keep Norway passing.
6. **Build the screen with placeholders.** Copy Norway's structure; placeholders must never show broken images (`useLoaded`, `Art` fallbacks).
7. **Write the art list and Gemini prompts** (`layers/LOOP2_<COUNTRY>_ASSETS.md` and `_ASSET_PROMPTS.md`, Norway's are the model). The user generates the art.
8. **Install the art** as it arrives (see "Art pipeline"). Check pin positions against the map by overlaying them on the image.
9. **Hand over to the user to play.** Fix what they report in the same round. Expect several rounds: Norway took five.
10. **Log and commit.** BUILD_NOTES.md entry, new decisions in layers/HANDOFF.md (next free L-number), commit. Commit Codex's work separately from Claude's.

## Plan for the remaining stops (draft; each row needs step 2 before building)

| Stop | Main input (carried) | Buys | New lesson | Sells to |
|---|---|---|---|---|
| Germany (Greta) | Norway's silicon | hydrogen chloride, hydrogen, electricity | Contract vs pay-as-you-go (minimum commitment) | Japan |
| Japan (Aiko) | polysilicon | quartz crucible, seed crystal, saw wire | Approved suppliers (pay to test a new one) | Taiwan |
| Taiwan (Mei) | wafers | photoresist, photomask set | Shelf life; made-to-order item with no second source | Malaysia |
| Malaysia (Farid) | tested wafer | substrates, gold wire, mold resin | Prices tied to a market (gold) | China |
| China (Xiao Lin) | packaged chip | main board, display module, power board, solder paste | The big-ticket item from few makers; partial delivery in a shortage (always the same, never random) | the man at home (USA) |

USA has no procurement: the man pays the TV price, which is the loop's bill.

## Rules learned in Norway (don't repeat these mistakes)

- **Don't rush past understanding.** The first prototype (two supplier cards and a dice roll) taught nothing: "click, click, click". Codex's second version was right but buried in text. What worked: real steps, short lines, pictures of the goods.
- **No clock, ever** (L02). Nothing ticks while the player thinks; don't charge money for time spent.
- **No dice** (L07). A risk is shown before the choice, and its consequence is fixed.
- **Show the physical goods** (L11). Product view while buying; icons in the store; the sieve at the delivery check.
- **Bought is not usable** (L08). The delivery check reveals waste; the store counts only what passed.
- **Selling needs steps too** (L14). Quotes from other buyers as leverage, a buyer with limited patience and a cap, and a payment to check.
- **Modest visuals** (L20). No colour-coded discs, pulsing badges, looping animations or bright borders. Pixel art carries the look; status is written in plain words in one quiet label. One "Next:" line in a plain style.
- **Don't touch the workshop** (L12). Loop 2 adds buying and selling around it.
- **The engine is a skeleton.** Keep it small, general and tested; add one feature per stop.
- **Story, openings and endings come later** (L04).
- **Record every decision** in layers/HANDOFF.md the moment the user makes it, so Codex can pick up without conflict.

## Art pipeline

- The user generates art with Gemini from our prompts. Gemini usually returns a 2K **JPG**, not a transparent PNG, and sometimes adds a floor or a blurry scene; add *"Plain pure white background, no floor, no ground, no scenery."* to every object prompt.
- Cut it out with `python -P tools/cut_art.py <src> <dst.png> <mode> <w> <h>` (needs Pillow). Modes: `white` (default), `white:246` for white objects, `dark:12` for a flat dark background, `outline:75`/`outline:160` for objects on a floor. If the object is surrounded by a scene, crop it first. If two images share a composition (crushed and screened quartz), reuse the clean one's shape.
- Sizes used: products 512 × 384, icons 64 × 64, pins 128 × 128 (factory 192 × 192), maps 2752 × 1536 installed unchanged. File names from the asset list, in `public/assets/supply/` (one folder per stop when there is more than one map, e.g. `public/assets/supply/germany/`).
- **Check every cut-out by eye** on a dark preview sheet before committing. If an image is simply wrong (the "harbour" that came out as a world map), don't install it; tell the user.
- Overlay the pin positions on a new map image before keeping them.

## Testing and hand-over

- Agents: `npm run lint`, `bun test src`, and say what was not checked. The user does all browser testing (`?loop=2` opens loop 2 directly).
- Before committing the other agent's work: `git diff --stat`, question large deletions.
- Every report says what was read (sources), what was tested (result line) and what is still placeholder.

## Codex's section

(Codex adds its version of the workflow here.)
