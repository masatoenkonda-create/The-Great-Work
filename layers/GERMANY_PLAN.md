# Loop 2 Germany: plan

22 October 2026, Claude. Workflow steps 3-4 ([PROCUREMENT_WORKFLOW.md](../PROCUREMENT_WORKFLOW.md)). Evidence: [Germany procurement research](../research/germany/PROCUREMENT_RESEARCH.md), "Research closed". The user said go ("keep going with the process"), so the build follows this plan. All prices, quantities and minimums are **teaching values** (L13); all companies are fictional.

## The stop in one line

Greta's plant receives Norway's silicon, buys hydrogen chloride, hydrogen and electricity, makes polysilicon in the **unchanged** loop-1 workshop and sells it to Aiko's plant in Japan.

## The one new lesson

**A contract with a minimum is cheaper only if you need what you commit to.** Two inputs come with two kinds of offer: pay as you go, or sign an agreement with a lower rate and a minimum you pay for even if you take less (GP01, GP14, GP16). The right answer differs:

| Input | Pay as you go | Contract | Better for one batch |
|---|---|---|---|
| Hydrogen, need 9 units | Town Gas Depot: bundles of 3 at $16 + $10 bundle rent per order (GP01: cylinder use is invoiced) → 3 bundles = **$154** | Chemical Park pipeline: $12, minimum 10 → takes 9, billed 10 = **$120** | **Contract** (you use almost all of it) |
| Electricity, need 1 batch | Regional grid tariff: **$220** | Alpine Hydro block: $150 a batch, blocks of 2 → billed **$300** for 1 used | **Pay as you go** (half the block is wasted) |

What the minimum is: **money owed, not stock**. The unused part is never delivered and can't be sold back (Codex's research table). The invoice shows "taken 9 · minimum 10 · billed 10"; disputing it gets "It's in the agreement you signed."

## Norway's basics, kept

- **Check what you buy:** Discount Chemicals sells cheap "HCl" that is hydrochloric acid (HCl in water), not the dry gas the reactor needs (GP09). Reading the **spec sheet** shows it; buying blind wastes the money. This replaces Norway's sample with the gas-world equivalent: identity on paper, not opening a bottle.
- **Invoice check:** Rhine Gases' first invoice bills one cylinder too many; Dispute fixes it.
- **Negotiation:** Rhine Gases drops $25 → $23; others politely refuse.
- **Selling (unchanged flow):** two other polysilicon buyers give quotes; Japan matches the best one, has patience 2 and a cap; the payment arrives $30 short ("bank charges").

## The chain (first connection)

- **Object:** one batch of Norway's silicon metal. **Price:** the price agreed in Norway (`sale.price`), not the money received. Norway's short payment stays Norway's business.
- **Opening store:** the batch is in Germany's store, its cost counted once in Germany's result. Germany starts with $1,200 cash (teaching value).
- **Germany opens only after Norway's loop-2 sale is done** (no guessed paid batch). Replaying Norway or restarting loop 2 clears Germany. Loop 2 is still not saved on reload (known gap, unchanged).

## Map (placeholder until art)

Factory in the middle of a chemical park by a river. Pins: Rhine Gases, Discount Chemicals (HCl); Chemical Park pipeline, Town Gas Depot (hydrogen); Regional Grid, Alpine Hydro (electricity); Japan customer; Solar Wafer Co. and Chip Wafer Works (other buyers). Origins: the park's hydrogen plant (feeds the pipeline); hydro dams up the river (Alpine Hydro). No real plant locations. The pipeline and power lines deliver without a truck.

## Numbers for one batch (silicon at Norway's best price, $620)

| Path | Inputs | Silicon | Sale | Result |
|---|---|---|---|---|
| Careful: spec sheet, Rhine $23 + dispute ($92), pipeline ($120), grid tariff ($220), match quote, ask more, chase payment | $432 | $620 | $1,120 | **+$68** |
| Signs both contracts, otherwise careful | $512 | $620 | $1,120 | **−$12** |
| Pays as it goes for both | $466 | $620 | $1,120 | +$34 |
| Careless: acid bought blind ($40), Rhine unchecked ($125), bundles ($154), block ($300), first offer, short payment accepted; silicon $560 | $619 | $560 | $970 | **−$209** |

Careful play is positive for any Norway price ($560-620). The contract choice alone decides profit or loss for an otherwise careful player.

## Engine additions (small, tested)

`Terms.minimum` (billed units = max(delivered, minimum)); `Supplier.spec` (spec-sheet text for the check); a carried input cost in the trade state; stop name and workshop lines in the market file instead of Norway's text in the engine. Norway's numbers and tests stay as they are.
