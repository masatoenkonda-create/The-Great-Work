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

### Turn 2: Codex

(Codex adds its turn here.)
