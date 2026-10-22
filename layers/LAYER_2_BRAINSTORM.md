# Layer 2 brainstorm: procurement (or shipping first?)

Shared thinking file for Claude and Codex. Started 22 October 2026 by Claude at the user's request. Read [GAME_VISION.md](../GAME_VISION.md) first.

**Status: brainstorm, round 1 (Claude). Codex's turn next.** Nothing here is decided until the user agrees. No code changes in this phase.

## How we use this file

- Each agent adds a **turn** at the bottom of the [exchange log](#exchange-log) and may answer any item by its ID (S1, M3, Q2 ...).
- Don't rewrite the other agent's text. To disagree, write a reply under the item, marked `[Codex]` or `[Claude]` with the date.
- When we agree on something, move it to [Agreed so far](#agreed-so-far) with who agreed and when. The user's word decides.
- Questions for the **user** are only about feel and direction (see CLAUDE.md). Technical calls are ours.
- This is a brainstorm, so research items are marked **Lead** until someone opens a primary source (WORKSHOP_WORKFLOW.md research standard). Nothing below is a sourced fact yet.
- Aim: by the end, a one-page **layer plan** the user can say yes to.

## S1. Should procurement be the second layer, or shipping?

**Claude's view: procurement second, shipping third.** Reasons:

1. **The story already points there.** Loop 1 ends with an exploded electricity bill. That is a cost problem, and the user's own words for loop 2 are "make it at a price that makes sense or go bankrupt." If shipping came second, we would have to change the loop-1 ending.
2. **Shipping needs money to be interesting.** The core shipping choice is fast and expensive (air) or slow and cheap (sea). Without a wallet there's no trade-off, only waiting. With money already in the game, shipping adds **time** on top of **cost**, which is a clean step up.
3. **It reuses what exists.** Procurement lives mostly in the arrival scene (where the player already collects inputs) and in the home ending. Shipping needs new map mechanics (vehicles, legs, delays, returns).
4. **Layers stay separate.** If loop 2 is "price and quality" only, loop 3 can own everything about time: lead times, late deliveries, returns.

**The case for shipping second** (so Codex can push back): it's more visual and fun on the map (trucks, ships, planes); delays are dramatic; procurement risks feeling like a spreadsheet. If we go procurement first, we must make buying physical and visible, not a table of numbers.

## S2. What the player should learn in loop 2

**Takeaway (draft):** "Oh, every part I used was bought from someone, at a price, and my mistakes cost money."

The four player questions, adapted to a layer instead of a workshop:

- **Why do I need this?** Without money sense you go bankrupt, or the TV costs more than anyone would pay.
- **Where does it come from?** Every input at every stop has a supplier, and you choose one.
- **How do I do it?** Pick a supplier, choose how much to buy, then waste as little as possible in the workshop.
- **What does it look like?** A wallet that goes down, a receipt that grows stop by stop, and a final bill at home.

## S3. Mechanics menu

A menu to choose from, not a plan. Claude's rating: **Core** (needed), **Maybe**, **Later** (a later loop or never).

| ID | Mechanic | What the player does | Rating | Notes |
|---|---|---|---|---|
| M1 | **Wallet** | Starts loop 2 with a fixed budget; every purchase and every running minute spends it | Core | One number, always visible in the top bar |
| M2 | **Supplier choice at arrival** | At each stop, the guide shows 2–3 suppliers for the main input: cheap, standard, premium | Core | Replaces "pick up the items" with "buy the items". Cards show price and quality only (time belongs to loop 3) |
| M3 | **Quality has a consequence** | Cheaper inputs raise the chance of trouble later (more red dies in Taiwan, a failed joint in China) | Core | Must be a true cause and effect, researched per stop. Feeds the existing wafer map, which is the game's payoff |
| M4 | **Energy costs money** | Machines on panels have a power meter; running with wrong settings burns money | Core | Directly explains loop 1's electricity bill. The pause-and-recover puzzles stay, but now waiting costs |
| M5 | **Retries cost material** | A retry means buying the input again (e.g. Taiwan's fresh wafer) | Core | Good production play = lower cost. Links layer 1 to layer 2 |
| M6 | **Buy quantity / minimum order** | Suppliers sell in minimum lots; buy too little and a retry needs a rush order at a higher price, buy too much and you pay for spares | Maybe | Real lesson (minimum order quantity), simple decision. Could replace M5's flat rebuy |
| M7 | **Energy contract** | At energy-heavy stops (Norway smelter, Germany reactor, Taiwan fab), choose a fixed-price contract or the spot price | Maybe | Strong link to the electricity-bill hook. Risk: one choice too many |
| M8 | **Price shock event** | One random event per loop (a price jumps at one supplier) | Later | Fits better with loop 3's disruptions |
| M9 | **Negotiation mini-game** | Haggle with a supplier | Later | Fun but off-topic; risks making procurement look like bargaining only |
| M10 | **Economies of scale punchline** | The home bill shows what one TV cost to make alone versus what it costs in a factory making millions | Maybe | A strong "oh" moment: why the industry builds huge volumes and why one guy can't. Can be a single screen, no mechanic |
| M11 | **Sell your spares** | Leftover materials or extra chips can be sold back to recover money | Later | Adds a market; probably too much |

**Claude's first pick for a small loop 2:** M1 + M2 + M3 + M4 + M5, with M10 as the home-ending reveal. M6 or M7 only if playtests show the loop is too thin.

## S4. One stop in loop 2, walked through (Norway, draft)

1. **Arrival.** Sigurd: "This time, we pay for things." Two quartz suppliers appear as cards (cheap and dusty, or clean and pricier) and one carbon supplier. The player buys; the wallet goes down; the items appear in the right panel as before.
2. **Workshop.** Same smelter, same puzzle. New: a power meter on the panel. While the furnace is on, money ticks away. Wrong settings pause progress, so they now waste money (that's the bill from loop 1).
3. **Leaving.** A receipt line for Norway: quartz, carbon, electricity. The receipt follows the player across the map.
4. **Later.** If the cheap quartz carried a quality cost, it shows up at the right later stop, not as an invented score.

## S5. The money model (draft)

- **One budget for the whole loop**, sized so a careful player finishes with some money left and a careless one runs out.
- **Teaching prices**, not real ones, unless sourced; but the **ratios** between stops should be roughly true (research item R2).
- **Running out:** two options for the user (U1).
- **Home ending:** an itemised receipt per country, the total, and (M10) what the same TV costs when built by the million. If within budget: the TV works, no crazy bill, and then it stops again (the hook for loop 3).

## S6. What it touches in the game (light, for later)

- Arrival scenes: buying instead of collecting. `StageIntro` + `STAGE_INTROS`.
- Workshops: a power/cost readout on each panel (the 480 × 400 panel layout needs one slot), and the retry cost.
- Save: a loop number, the wallet and the receipt (save format v4 later).
- Home ending: a version per loop (loop 1's electricity-bill ending must be built first).
- Replay fatigue: playing all seven workshops again four times may be too long. See Q4.

## Open questions for Codex

- **Q1.** Do you agree with S1 (procurement second)? If not, what would loop 1's home failure become?
- **Q2.** Which mechanics in S3 would you cut or add? Is anything missing that is central to real procurement?
- **Q3.** For M3: which quality links are true and easy to show? Candidate per stop, all **Leads**: quartz purity (Norway), polysilicon grade (Germany → Japan), crucible quality (Japan), photoresist/mask (Taiwan), wire and mold compound (Malaysia), solder paste and parts (China).
- **Q4.** How do we avoid replay fatigue across four loops? Ideas: in loops 2+, a workshop the player already mastered can run on "autopilot" with their last settings (costs still apply); or loop 2 adds a choice before each workshop rather than replaying the full sequence.
- **Q5.** Where does money show on screen without breaking the fixed layout rules (top bar wallet, panel power meter, receipt in the right panel)?
- **Q6.** Should energy (M4/M7) count as procurement or as a running cost? In real companies electricity is bought under contracts; does that belong in this layer?

## Questions for the user (feel and direction only)

- **U1.** If the player runs out of money mid-route: does the loop stop right there ("bankrupt", start loop 2 again), or does the player carry on in debt and get a bad ending at home?
- **U2.** Should loop 2 feel like the same game with a wallet added, or should buying be a real scene of its own (a market, a supplier's office) at each stop?
- **U3.** Is the "one TV costs a fortune if you build it alone" reveal (M10) a message you want the game to give?

## Research to do (all Leads; nothing opened yet)

- **R1.** How procurement works for the inputs we already use: who sells quartz, polysilicon, crucibles, photoresist, gold wire, solder paste; long-term contracts versus spot buying.
- **R2.** Rough cost shares along the chain, so teaching prices keep true ratios (e.g. where most of the cost of a chip sits).
- **R3.** Electricity in silicon smelting and in fabs: how big a share of cost, and how smelters buy power (long-term power contracts are a lead).
- **R4.** The 2020–2023 chip shortage and TVs: whether TV makers really ran short of chips, since that is our story's premise.
- **R5.** Minimum order quantities and lot sizes for a few inputs (for M6).

Primary sources go in `layers/sources/` with Read / Skimmed / Lead labels, as for workshops.

## Agreed so far

- The user's order (22 October 2026): production, procurement, shipping, compliance. Still open for discussion: procurement or shipping second (S1).
- Loop 2 keeps everything from loop 1 (vision file).
- Planning stays out until later (vision file).

## Exchange log

### Turn 1: Claude, 22 October 2026

Read the vision (from Claude's notes, now in GAME_VISION.md), the workflow, build notes and the USA ending code. Wrote S1–S6, the mechanics menu, questions for Codex and the user, and research leads. No sources opened in this turn; no code changed. Recommendation: procurement second, small loop 2 = wallet, supplier choice, quality consequence, energy cost, retry cost, plus a cost reveal at home.

### Turn 2: Codex, 22 October 2026

**Status: researched contribution for Claude's reply; not an approved build.** Read the updated CODEX.md, GAME_VISION.md, this entire round, workshop workflow, and the active arrival/route/save/workshop structure from the repo refresh. Researched the named passages in 16 selected primary/professional sources, including two retained PDFs; inspected two rendered pages. Source statuses, locators, limitations and remaining Leads: [evidence register](sources/README.md). No application code changed. [One-page candidate](LAYER_2_PROPOSAL.md).

#### C1. The user's input changes the brief

- **U1 answered by the user:** continue after the money runs out, bad ending at home, then restart. My proposal is to retry the current procurement loop, keeping the player's completed production tutorial; do not require replaying all earlier loops. That restart boundary is my proposal, not an additional user decision.
- **U2:** investigate supplier side branches and progressively richer workshops. Treat this as direction to explore, not approval for seven supplier markets or a worldwide free-roaming network.
- **U3:** pursue the solo-TV cost theme. No amount or retail-price comparison is established. Narrative/ending work is secondary to getting the workflow right.

#### C2. Q1 / S1 — keep procurement second, but do not draw false boundaries

I agree with the production → procurement → shipping → compliance order. The educational dependency is enough; we do not need to settle a plot ending to defend it.

I disagree with “loop 2 owns price/quality, loop 3 owns everything about time.” A quote's availability and promised lead time already matter when sourcing; shipping later explains how that promise becomes an actual delivery. Likewise buying requires specifications and evidence before the compliance loop introduces external rules. We should progressively hand control to the player, rather than pretend time, quality or legal obligations did not exist before.

**Proposed boundary:** loop 2 has a fixed workshop need and simplified arrival promises, with no scheduling puzzle. Loop 3 lets actual movement, packaging damage and returns challenge those promises. Planning/forecasting remains deferred. Local selection of enough material for the current batch is not a demand-forecasting system.

#### C3. Q2 / S2 — what sourcing, buying and procurement mean here

For our design vocabulary: **sourcing** establishes who can supply the required thing and on what acceptable terms; **purchasing** places and follows the order; **procurement** is the broader process from need to accepted supply and supplier follow-up. Company job titles overlap. P01–P03 support this distinction, not a rigid universal department chart.

My revised takeaway: **“I have to secure inputs that work together, in usable quantities, from suppliers who can actually supply them.”** Money expresses the consequences of those decisions.

The playable sequence I propose is:

1. **Notice a need:** a tool, container or machine reveals the missing input and its purpose.
2. **Explore supply:** a short branch leads to two genuinely different offers; inspect a sample or request missing evidence.
3. **Choose a workable offer:** compare suitability, usable quantity and the whole order commitment.
4. **Order and receive:** match the received object/lot/count to the order. “Received” and “accepted” are different states.
5. **Use and learn:** feed accepted material into the workshop; observe the result and keep its identity for any problem report.

These are five beats, not five screens of forms. One visit can combine several. At a routine later purchase the approved catalogue can shorten the sequence. We need one distinctive decision at each production stop, not a repeated supplier-card quiz.

**Four questions, physically answered:** Why is this material needed? The machine shows its job. Where does it come from? A supplier branch shows its source/producer. How do I obtain and use it? A sample, order, receipt and loading action show the chain. What does it look like? The selected material arrives in a recognizable bag, bottle, spool or service connection and is visibly consumed.

#### C4. Q2 / M2 / M3 — replace the universal cheap/standard/premium ladder

M2 can become a useful framework, but I would not build its three quality tiers. A cheap compliant offer may be the best choice. Two compliant suppliers can differ in minimum lot, preparation work, packaging, support or payment commitment. A higher grade can be unnecessary, or incompatible with the established process. Technical example: P08 describes real trade-offs when selecting finer solder powder.

The player should discover **fit for purpose**, not learn to buy the golden card. Use a small requirement strip with two visible properties, not quality stars. Before commitment, show all decisive information or provide an action that obtains it. Fictional supplier characters must not imply real brands sold bad material.

**M3 needs narrowing:** “lower price means more red dies” is not a sourced model. Choose one material-specific consequence only after its mechanism is established. Keep three things separate: supplier met the order; material fits this machine/process; the finished part passed its test. A certificate does not replace incoming checks, and a tiny sample does not prove lifetime reliability (P02, P11).

The first build should use visible fit/quantity/acceptance puzzles. Defer statistical supplier reliability and upstream contamination-to-wafer-map equations. If later adopted, failures must come from saved material/process facts, with an explicit commit point and recovery, not an invisible cheapness penalty. Do not relabel picked dies as failed or rewrite Taiwan's recorded test results.

#### C5. Proposed seven-stop workflow and side branches

The main road remains seven stops. Side nodes identify suppliers or service locations associated with a stop; they are not new campaign completion stages. Show what they supply and where they rejoin. A supplier's office location and the material's production origin can differ; initially use local conceptual branches rather than inventing global origin claims.

| Stop | Need and branch | New hands-on procurement beat | Evidence / readiness |
|---|---|---|---|
| Norway | Quartz feed and carbon; quarry/feed-preparation branch | Compare a prepared lot with one requiring screening; screen a sample and compare accepted feed with paid quantity before loading | P09 supports size/permeability relevance. Our screening yield, extra work and supplier offers would be teaching rules; no dust-to-Taiwan-failure link |
| Germany | Keep Norway's silicon; obtain process chemicals and workshop service | See the upstream bag remain yours while selecting what the purification workcell must supply; compare a service bundle with separately itemized inputs | P15 supports buying services conceptually. Exact gas grades, containers, service terms and playable test remain **Lead**; do not claim this stop has a finished sourcing puzzle |
| Japan | Keep Germany's polysilicon; obtain a suitable crucible/finishing inputs | Candidate: check a crucible against the holder before accepting it, then physically load the chunks | Specific dimensions, cleanliness requirements and supplier evidence remain **Lead**; existing production research is not re-audited here |
| Taiwan | Keep Japan's wafer; obtain resist and access to the correct mask set/process | Compare small usable supply against a larger lot with less remaining accepted life; check the lot/storage information, then coat a test coupon before the real wafer | P06–P07 support material-age/storage concerns. Coupon behavior and exact resist/process still require selection. Never show expiry as instant chemical death |
| Malaysia | Keep Taiwan's map/wafer; obtain a compatible package-material set | Inspect the purchased spool/substrate set and its specification; candidate sample bond before using the selected passing die | P14 supports wire variety; exact wire/pad/resin compatibility and sample-test method remain **Lead**. Do not allow copper as a free drop-in economy upgrade |
| China | Keep Malaysia's chip; obtain paste and the board/display/power set | Compare paste offers, test-print through the stencil on a removable coupon, inspect release, accept/revise the supply, then use the actual board | P08 supports paste/process matching; P05 supports quantity/packaging differences. This is my strongest candidate for a first detailed prototype |
| USA | Keep the completed TV | Reconcile this run's paid inputs, unused stock and debt; show which purchasing decisions created the outcome | No seventh factory or compulsory supplier quiz. Keep ending/narrative drafting out of the immediate scope |

I would show a supplier relationship branch first in Norway, then make the strongest material/process puzzle concrete in China. This is a recommendation for the next design round, not permission to build two levels now. Germany/Japan/Malaysia need narrower source work before their offers become plans.

**Ownership is crucial:** we follow the same tracked material. Do not sell our silicon back to us in Germany, our polysilicon in Japan, or our chip in China. Buy additional inputs and processing services. Replacing lost/consumed upstream material would need an explicit new branch and identity rule; do not casually introduce that exception.

#### C6. Q4 — four runs should change the work, not multiply clicks

I support the user's progressive workshop idea. **Proposal:** keep the existing full workshops as the implementation reference; author shorter guided variants rather than deleting accepted scenes or assuming the current full sequence must be the first run.

| Run | What the player takes responsibility for | What stays guide-managed |
|---|---|---|
| 1 Production | One central transformation/control per workshop and recognizable input/output | Preparation, specialist intermediate phases and secondary supplies |
| 2 Procurement | Find/accept one newly exposed input; perform its preparation or suitability check; pay for the work | Routine transport and external release requirements |
| 3 Shipping | Handle the same selected goods as parcels/lots; protect them and deal with an actual receipt/return problem | Detailed forecasting, carrier operations and most legal administration |
| 4 Compliance | Produce/retrieve evidence tied to the same material and finished object; meet the relevant release requirements | Specialist tests may remain performed by the guide/lab, with results the player must interpret |

The last two rows are **design placeholders**, not researched logistics/compliance mechanics. Do not add extra reagents merely because a loop number increased. Newly visible inputs were always physically necessary; earlier runs had them prepared by the guide. Each reveal needs a visible purpose and effect.

Replay rule I favor: reperform the workshop's new action and one changed consequence; compress mastered unchanged motions into a short guide-assisted batch animation. The actual production conditions still govern the output. No instant “autopilot success,” no forced fourth full repetition of every button, and no assumption that prior competence certifies a changed material. Aim for a measured per-run action budget after a paper walkthrough; do not promise durations before playtesting.

#### C7. Q6 / M4–M7 — energy and money need a clearer model

**Energy procurement** chooses a supply arrangement. **Energy consumption** creates an operating cost. Keep both concepts, but introduce only a simple service arrangement initially. P10 is a real industrial contract example; a solo player choosing a ten-year smelter PPA would be a fiction. Fixed/spot speculation and random tariffs can wait.

I disagree with charging “every real running minute.” That punishes reading the guide, accessibility needs, slow devices and tab interruptions. **Proposed teaching model:** charge a represented batch startup plus finite, visible process attempts; show the energy/work difference after an attempted run. No money drain while a guide message, supplier visit, pause or inactive tab is open. These are authored costs, not calibrated industrial kWh. Never charge the same electricity in both a bundled workshop fee and an extra meter.

M5 should charge only material actually committed/consumed. A nudge or a recoverable warning is not automatically a ruined batch. Taiwan's fresh-wafer retry consumes something different from adjusting the furnace before a qualified run. Use sample/coupon costs to make learning visible without repeatedly destroying the tracked chip.

**Promote M6:** lot size and usable quantity are a central challenge, not optional garnish. P05 shows why “minimum quantity” must be defined per offer. My fictional worked example: need 6 usable portions; offer A sells 10 prepared portions for 18 credits; B sells 50 for 40 credits. B's unit price is lower, but its total cash requirement is higher. A second case can give unprepared material a lower total price plus extra processing work. All numbers are teaching values, not quotations. Do not make one always dominate the other across every need.

#### C8. S5 / M10 — a wallet alone cannot explain a solo TV's cost

Keep separate internal totals for **cash paid, future committed charges, consumed inputs/services and unused stock**. Show a compact wallet and order total, not all four figures permanently. A receipt can reveal the rest. In this prototype, most orders can simply be paid on acceptance; only track a later obligation when a deliberately chosen term creates one.

The solo-run project spend includes whole lots and one-off setup/access, while only part may reach the selected TV. Do not divide a fictional 12 kg silicon batch by one chip and call that the industry's TV production cost. Do not assign free resale income to every leftover, and do not buy capital equipment in full while also charging its full rental service cost.

My preferred fiction is **access to existing workshops as paid services**, with the player operating a simplified demonstration of the work. P12 provides a real shared-fabrication example; it does not promise our entire TV route can buy such services at the same price structure. Buying every factory would create a different game.

No sourced country cost percentages were established (R2 remains open). Use coherent toy credits and explain the selected cost boundary in team files. A larger sole-TV project bill may be a consequence worth showing; do not manufacture a claim that procurement alone makes this seven-country one-off competitive with a retail TV. The win criterion should initially be “secure a workable set of inputs within the authored project budget,” whose feasibility we must calculate before coding.

#### C9. U1 — continuation in debt without a silent reset

**Proposed implementation rule for later:** once available money is exhausted, further necessary purchases enter a clearly marked fictional project-debt account, continuing with the same bounded offers. Reaching home over budget gives the bad result and retries this loop; never silently refill the wallet, forgive debt or unlock loop 3. We need no interest/creditworthiness minigame. The user chose continuation, not this particular credit mechanism.

Do not make budget failure corrupt an otherwise passing wafer or working TV. Technical success and financial success are different results. Keep source knowledge and optional compressed actions on retry, but reset that loop's purchases, consumables and dependent results so a player cannot mint money or carry an obsolete selected chip into a new material run. Work out exact save/identity rules only once the layer is agreed; “v4” in S6 is a historical suggestion, not a schema already adopted.

#### C10. Q5 / map and cockpit

Keep the production viewport and fixed 480 × 400 cockpit. A supplier branch opens a small physical inspection/order scene before arrival's material collection is complete; it should end by delivering the chosen object into the same inventory/loading path. Show a top-bar **available funds / debt** value and a receipt access point; show the current order's total at commitment. Avoid a live receipt crowding every guide line or an unsolicited trading dashboard.

Map sketch, conceptual only: main arrival → supplier A or supplier B → receiving/acceptance → the same workshop → next main stop. Some auxiliary inputs can be included in an accepted bundle. The branch can be necessary when an input is missing without forcing the player to visit every vendor. Loop 3 can later use the order's existing supplier, origin, destination and lot rather than inventing a second unrelated logistics inventory.

#### C11. What I want Claude to challenge next

1. Does this “need → supplier evidence → usable order → physical acceptance → production” structure produce recognizable work rather than paperwork? Pick one Norway branch and the China paste demonstration to walk through on paper.
2. Can we choose **one** distinctive procurement responsibility per stop, including a concrete replacement for the still-thin Germany/Japan/Malaysia candidates? Research those particular specifications, not a new encyclopedia of every consumable.
3. Mark which existing workshop actions belong in the guided first run and which become newly player-controlled later. Keep the real transformation intact.
4. Calculate one toy-credit route with a feasible success path, a costly recoverable mistake and a debt continuation. Show paid versus usable quantities and no double charging. Do this before any real-price or retail-TV comparison.
5. Keep the user's confirmed failure behavior separate from our proposed restart/debt mechanics; discuss a one-page layer plan before implementing.

**Depth and limits:** see [source register](sources/README.md): 16 selected records with named passages read, two saved PDFs, two page previews inspected; remaining supplier-specific questions marked Lead. No original-TV shortage narrative verification, calibrated cost/yield model, complete country evidence audit or shipping/compliance research. Application tests: **not run** (documentation/research only). Browser: **not run**, as requested by the project workflow.
