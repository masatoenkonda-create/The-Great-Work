# Norway procurement prototype: review and engine revision

Codex, 22 October 2026. Reviewed commit `3b50255` and the user's playtest criticism. The user authorized changes to the bare engine. This pass implements a revised Norway slice, not all of loop 2. Browser playtesting remains the user's task.

## Findings, in order of impact

1. **The buying gate measured clicks, not secured supply.** `allChosen` in the old `NorwayProcurement.tsx` only required one supplier ID per item. `resolveOrders` had no product specification or accepted-stock state. Every offer was intrinsically sufficient unless a random event shortened it. The user could not learn why a purchase was suitable by observing its use.
2. **The supply chain had no spatial identity.** Supplier names and blurbs existed, but the model had no origin, producer/merchant distinction, source locations or branch back to the smelter. This omitted the user's “where does it come from?” question.
3. **Risk replaced the activity of procurement.** Realistically named disruptions were rolled at authored odds. A supply shortfall generated another buying button. There was no request/amendment of a specification, review of a sample or receipt-to-order comparison. Showing odds made the gamble visible; it did not explain how to source material.
4. **The budget did little educational work.** The old low-risk choice cost 970 against a 1,000 budget; its risky cheap combination cost 490 if nothing happened. Affordability mostly rewarded selecting known-safe cards or accepting luck. Unlimited financial continuation is consistent with the user's direction; the problem was that material readiness did not provide an independent challenge.
5. **Buying and manufacturing contradicted each other.** The wrapper mounted the normal Norway workshop at `mine`, so purchased quartz was mined again. Material identity did not explain the next action.
6. **Leaving the screen erased its consequences.** Purchasing state was local to the component; returning to the world map unmounted it. This discarded orders, spending and supply outcomes. The prototype's lack of reload persistence was separately documented, but in-session map navigation should not erase obligations.

These are code-level findings, not claims from a browser playthrough. The old five tests confirmed its arithmetic/RNG behavior; they did not establish educational value.

## What changed

The sequence is now **need → source visit → sample/specification → negotiate terms → purchase order → receiving/acceptance → furnace → reconcile the batch**. It is still a small interaction engine with simple shapes and text, not final art.

- An inset supply map branches from the Norway workcell to quarries, a merchant depot, a sawmill, a carbon stockist and a power station. A merchant's selling location is distinct from the material's production origin. Selecting a supplier highlights that exact source-to-workcell path. The map is conceptual and all suppliers/locations fictional; it is not a claim about real Thamshavn purchasing geography.
- **Quartz is the substantive decision.** As-crushed supply includes fines: ten purchased portions yield six chunks usable for this charge. A size sample shows the distinction visually. Requesting quarry screening changes preparation and unit price. Requesting a split merchant lot changes minimum pack, unit price and repacking fee. The supplier's response changes executable quote data, not a random discount.
- The player chooses lot count. An undersized order is permitted with a visible shortage warning; paying does not release it as sufficient supply. The model requires supplier information and a check of the selected terms before commitment. Changing preparation/pack terms requires checking that offer, rather than reusing approval of a different quote.
- Every order captures its agreed specification, price, supplier and lot identity. Payment is immediate in this prototype. Receiving releases only the accepted usable quantity; repeated checks do not duplicate stock. Fines in an agreed mixed-rock order are not a supplier delivery breach and are not chemically failed silicon.
- The furnace remains blocked until all required stock and power have been accepted. It then starts with those accepted chunks in the feed bin, skips mining/breaking, displays the supplying lot IDs and omits the pickaxe. Loop 1 retains its normal sequence.
- The bill separates purchased quantity, excluded fines, actual use and usable spare stock. There is no free resale or second electricity charge. Debt is permitted; it cannot turn unsuitable or insufficient material into a released charge. No supply RNG or procurement clock remains in this slice.
- The order/stock state lives in App, survives a trip to the world map and stays isolated from the loop-1 campaign save. The result screen supports a fresh sourcing attempt with a clean prototype ledger.

## Engine examples, calculated and tested

All numbers are authored **credits/feed portions**, not market prices or a mass/energy recipe. The legacy loop-1 output of 12 kg is still a compatibility value; no physical conversion equation from these portions is claimed.

| Plan | Quartz paid | Other accepted inputs | Total | Consequence |
|---|---:|---:|---:|---|
| One mixed-rock lot | 180 | 320 | 500 | Only 6/10 quartz portions usable. Furnace blocked despite remaining funds |
| Quarry-screened lot | 280 | 320 | 600 | Required supply secured within 650 budget |
| Merchant split lot | 270 | 320 | 590 | Higher unit price than bulk; smaller total order plus repacking fee |
| Merchant full lot | 350 | 320 | 670 | Technically sufficient, 20 debt and 15 spare quartz portions |
| Two mixed-rock lots | 360 | 320 | 680 | 12 usable, 8 fines set aside, 2 spare; 30 debt |
| Mixed lot, then screened correction | 460 | 320 | 780 | First purchase is not erased; 6 usable spares remain and 130 debt |

This is deliberately a teachable fixed one-batch problem. It is not yet a recurring supplier-strategy simulation: once understood, its cheapest qualifying solution can be learned. Do not call the revised slice a finished, deep campaign.

## Evidence reopened for this review

Date read: 22 October 2026. All five below are **Read**, meaning the specific named passages; no claim to a full reread of earlier evidence packs.

- **P01 / CIPS**, [procurement cycle](https://1prd-dxp.cips.org/intelligence-hub/procurement/procurement-supply-cycle), stages 5–9: requirements, supplier screening, quotation evaluation, sampling and negotiation. Supports distinct decisions before an order. The game's exact negotiation offers and guaranteed responses are authored simplifications.
- **P03 / APQC**, [purchasing process](https://www.apqc.org/What-are-the-key-steps-involved-in-the-purchasing-process), steps 3–7: quote/order/receipt reconciliation and exception handling. Supports distinct ordered/received/accepted states. Our solo buyer combines real organizational roles and pays immediately; no accounts-payable workflow implemented.
- **P04 / CIPS**, [total cost](https://1prd-dxp.cips.org/intelligence-hub/finance/total-cost-of-ownership), minimum quantity versus unit price/excess-stock paragraph. Supports comparing a whole commitment with the need, not just unit price. Our ledger is selected project spend, not full TCO.
- **P05 / DigiKey**, [quote terminology](https://www.digikey.com/en/help-support/place-an-order/how-to-read-a-digi-key-quote), Minimum Release/Package Quantity and packaging guide. Supports distinguishing a commercial lot from customer need. Does not establish actual quarry pack sizes or prices.
- **P09 / Dal Martello et al.**, [original paper HTML](https://link.springer.com/article/10.1007/s11663-011-9529-y), Introduction paragraphs on quartz size/strength and charge permeability. Supports keeping excessive fines out of this furnace-charge demonstration. A size screen does not assay purity. The 6/10 acceptance fraction, screen geometry and uniform illustrative lots are teaching rules, not measured factory data. Chemistry/strength approval is guide-managed.

No new PDF read/downloaded, no figure reused, and no audited supplier route obtained. Prior sources P17–P26 and earlier country packs were not independently reviewed in this pass. No market concentration/price claims depend on them here.

## Limits and recommended next changes

1. **Playtest this one causal chain first.** Does the map make producer versus seller understandable? Does the sample make “ten bought, six usable” clear without needing a paragraph? Does changing the quote feel like solving a supply problem? The UI may still feel too much like a form; passing engine tests cannot answer that.
2. Carbon, wood and electricity have source identity and receiving records but remain routine guide-approved inputs. They deliberately have no token second supplier or invented chemical test. If their extra clicks add no understanding, combine them into an approved auxiliary-supply order while keeping their origins visible.
3. A next engine scenario could provide a different quantity requirement or a supplier's genuine specification/quantity breach, with a claim tied to the original order and a conforming replacement. That would add comparison and follow-up. It is **not implemented** and should be researched/chosen deliberately; do not randomize hidden material failure.
4. A future whole-route layer should persist loop/ledger/order state and handle retries/identity invalidation together. Reload still returns to the existing loop-1 save; no new save format was added. Returning to the map mid-furnace preserves the purchasing ledger but restarts that demonstration at feed loading when revisited; there is no second charge or extra consumed batch.
5. Whole-loop debt ending, Germany–USA procurement, actual geographic supplier origins, transport lead times and recurring supplier relationships remain outside this Norway revision. Negotiation is limited to two concrete supplier counteroffers, not a full bargaining system.

## Verification

`npm.cmd run lint`: exit 0. `bun test src`: **43 pass, 0 fail; Ran 43 tests across 9 files.** `npm.cmd run build`: **built in 783ms**, with the existing bundle-size warning. `git diff --check`: no whitespace errors. The bare `npm` command hit PowerShell's script-execution policy; the normal `npm.cmd` executable ran successfully.

Ten sourcing tests cover technical release despite money, sample/terms boundaries, smaller-lot arithmetic, order snapshots, receipt idempotence, affordable/debt paths, correction costs, conservation, invalid actions and origin identity. The former random-risk model and its five tests were replaced; country controls/storage tests remain. No browser playthrough, responsive-layout inspection or runtime WebGL regression performed. Work remains uncommitted for Claude.
