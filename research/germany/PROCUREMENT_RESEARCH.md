# Germany procurement research - for Claude

22 October 2026, Codex. **Workflow steps 1-2 only.** Read GAME_VISION.md, PROCUREMENT_WORKFLOW.md, the loop-2 handoff, Germany's workshop research/plan and active arrival/workshop code. No procurement plan, tuned economy, art request or implementation in this pass. The existing workshop stays intact.

## Findings to carry into the next discussion

**The approved lesson remains credible: compare the total commitment, not just the unit price.** The strongest minimum-purchase evidence is industrial gas supplied by an on-site plant (GP01). An actual German chemical-site electricity PPA supports long-term purchasing (GP05), but its announcement does not disclose minimum billing or prices. Do not claim all contracts have minimums, all contracts fix prices, or all delivered gas is bought without a contract.

### Reconcile the stop before adding purchasing

| Item | Existing game and procurement boundary |
|---|---|
| Silicon metal | Carried main input, bought from Norway at its agreed transfer price once. Arrives as lumps; Germany mills them. It is not a second local purchase. |
| Hydrogen chloride (HCl) | Additional input to conversion. Buy anhydrous hydrogen chloride, not an interchangeable bottle of aqueous hydrochloric acid (GP09). The green bottle in the workshop is illustrative. |
| Hydrogen (H2) | Additional gas for the existing deposition stage. Sold in several grades and supply forms (GP07); supplier choice must fit the plant, not just say “contains hydrogen.” |
| Electricity | Purchased service for the line; the rods are electrically heated. It is absent from arrival collectibles but already implicit in MAIN POWER. Procurement can account for it without changing that workshop action. |
| Existing installed services | Cleaning chemistry, water, cooling, gas handling and packing remain the workshop plan's abstractions. This research does not authorize adding a shopping list for them. |
| Output/customer | Sealed polysilicon chunks for Japan's crystal puller. Current code emits `polysiliconBatchKg: 10`; that compatibility value is not a researched yield or a new procurement quantity. |

Code inspected: `src/content/dialogues.ts` stop 2; `GermanyManufacturing.tsx` action/phase sequence and completion; `germanyControls.ts`; cargo fields in `src/types/route.ts`; Norway's market and shared trade state. No Germany market or cross-stop purchase ledger exists yet.

### What buying for this factory actually involves

1. Establish the plant's gas requirements, delivery interface and required quantity before requesting offers (GP10). Gas identity, specified grade and package are separate requirements.
2. Compare a purchase order/cylinder arrangement with a supply arrangement suited to larger, steadier demand. Compare the whole obligation, including container use where applicable (GP01), rather than assuming the lowest displayed rate wins.
3. Agree scope: required quantity versus minimum commitment, supply mode, term, price basis, and what is included. These are procurement questions supported by GP01; no private German plant agreement was obtained.
4. At receipt, compare the delivered identity/grade/package and quantity with the order; at settlement, compare charges with the agreed terms. This is a proposed application of Norway's established checks. The inspected product sheet is not a batch certificate or a promise that every shipment meets an invented plant specification.
5. Keep bought supply separate from circulating plant flow. GP02 describes substantial HCl recovery across integrated sites. A small purchased top-up must not be presented as the entire reactor flow; that site-wide figure cannot determine our batch recipe.

### Suppliers, origins and availability

| Input | Evidence located | What the map must not imply |
|---|---|---|
| HCl | Air Liquide Germany offers technical/high-purity gas and nationwide supply (GP06). GHC also lists HCl 5.0 (GP11). Linde's Austrian sheet supplies a concrete package reference (GP03). | This is evidence of alternatives, not a census, market share, or proof that every seller serves a particular factory. Seller address does not establish the gas's manufacturing origin. |
| H2 | Air Liquide Germany lists pure hydrogen, mixtures and delivery forms (GP07). Linde describes supply modes and gas contracts (GP01/GP10). | A mixture is not automatically a substitute for pure gas. No exact number of qualified local suppliers or actual supplier to WACKER was established. |
| H2 production | A producer describes electrolysis and natural/biogas reforming routes (GP08). | Do not mark every cylinder “made from water locally.” No selected lot's origin was traced. |
| Electricity | VERBUND names Bavarian hydropower plants and a Burghausen customer contract (GP05). | The announced deliveries begin in 2028, not 2026. This supplies part of a multi-product site's power, not a dedicated cable or the entire polysilicon requirement. |

There is enough evidence to use fictional gas sellers and a regional electricity seller later. There is no basis for declaring a local monopoly, choosing real supplier prices, or placing a real hydrogen/HCl production plant on the game map.

### Implications for Claude - recommendations, not accepted mechanics

- Keep **one new lesson**: a low rate can hide a larger obligation. Hydrogen supply offers provide the clearest evidenced setting. Electricity remains a valid supporting contract example; its real announcement alone cannot justify a take-or-pay puzzle.
- A contract should be an agreement with a stated commitment, not simply Norway's larger physical lot renamed. If the future design uses a billing minimum, distinguish gas delivered/usable from payment owed for unused commitment. The unused obligation is not spare stock to resell.
- The current engine has lot size, unit price and an order fee; it has no separate contract obligation. Do not implement a “minimum bill” by silently adding usable stock. Whether a small extension is needed belongs to the plan/build phase.
- Preserve no clock/no dice: any eventual terms apply to a declared batch or purchase, never to minutes spent thinking. No surprise live prices, demand forecasting system, or multi-year simulation is needed to teach this distinction.
- Use supplied specification/identity information for gas inspection rather than opening a bottle or judging purity by its color. Invoices should expose the agreed obligation rather than inventing random faults.
- Before connection, define Norway's batch identity/quantity, agreed transfer price versus actual payment, Germany's opening input cost, and replay/save invalidation together. Existing loop-1 cargo is not proof of a paid loop-2 purchase.

No numerical market prices, real procurement quantities, break-even target, supplier promises, payment days or fixed batch chemistry were established. Those would be explicit teaching choices in the later one-page plan. No alternative-buyer prices for polysilicon were researched.

## Source register

All access/read dates: **22 October 2026**. **Read** means the named passages, not the whole publication. GP01-GP04 are saved original PDFs; the web records retain URLs and section locators. Source images are research references, not licensed game art.

### GP01 - Gas contracts and container charges - Read

Linde, *Annual Report 2025*, Note 19, printed p. 88 / PDF p. 94. [Original](https://assets.linde.com/-/media/global/corporate/corporate/documents/investors/full-year-financial-reports/2025-annual-report-to-shareholders.pdf); [saved PDF](sources/procurement/GP01-linde-annual-report-2025.pdf).

Read the three distribution-method paragraphs. Large, steady on-site demand normally has 10-20-year agreements with minimum purchases and escalation. Merchant supply generally uses 3-7-year agreements without volume minimums; packaged gas uses 1-3-year contracts or purchase orders without minimum volume commitments. Cylinder use can be invoiced separately. **Limit:** Linde's general business disclosure, not WACKER's contract, a universal rule, or a quoted hydrogen price advantage.

### GP02 - Producer procurement and material recovery - Read

WACKER, *Annual Report 2025, Combined management report*. [Original](https://reports.wacker.com/2025/annual-report/_assets/downloads/mgr-mgmt-report-wacker-ar25.pdf); [saved PDF](sources/procurement/GP02-wacker-management-report-2025.pdf).

Read printed pp. 39, 88 and 173 / PDF pp. 14, 63 and 148: raw-material/energy costs; procurement-market risks; renewable raw materials from recycling. Describes multiple suppliers, volume flexibility, differing contract lengths and energy hedging. Reports 93-96% HCl recirculation in integrated chlorine systems at Burghausen/Nuenchritz. **Limit:** group/site-wide information; neither a polysilicon-only recovery rate nor a purchase quantity for one run. This pass does not use its policy discussion as a statement of current electricity law.

### GP03 - HCl package and specification reference - Read

Linde Gas Austria, *Chlorwasserstoff 5.0*, dated 23 September 2024. [Original](https://produkte.linde-gas.at/datenblatt/chlorwasserstoff_5.0.pdf); [saved PDF](sources/procurement/GP03-linde-hcl-2024.pdf); [inspected page 1](previews/procurement/GP03-hcl-product.png).

Read both pages; visually inspected p. 1's impurity/package tables. Lists specified impurities, steel cylinders and a steel drum, with nominal volume distinct from fill mass. Page 2 identifies pressure-liquefied HCl and valve/label information. **Limit:** Austrian offer, not confirmed German availability or this plant's qualification specification. Do not copy package masses into a recipe or treat cylinder paint as gas identity.

### GP04 - Input/output transformation - Read

WACKER, *Polysilicon - Before There Is Solar Energy There Is WACKER*, archived in its 2018 sustainability report. [Original](https://reports.wacker.com/2018/sustainability-report/servicepages/downloads/files/Polysilicon_7416_EN.pdf); [saved PDF](sources/procurement/GP04-wacker-polysilicon.pdf); [inspected process figure](previews/procurement/GP04-process.png).

Read printed/PDF pp. 8-9; visually inspected the seven-step illustration on p. 8. Connects metallurgical silicon, HCl conversion, liquid trichlorosilane, distillation, rod deposition and chunks for wafers. **Limit:** older solar-oriented overview, not an electronic-grade purchasing specification. Existing Germany workshop research remains the process-detail reference; this brochure does not set our operating recipe.

### GP05 - Actual electricity purchasing for the German site - Read

VERBUND, 25 June 2024, [*Green electricity for WACKER Chemie using Bavarian hydropower*](https://www.verbund.com/en/group/news-press/press-releases/2024/6/25/wacker-chemie-ppa).

Read the release body through the plant-origin and historical context paragraphs. Announces 10 MW for 2028-2032 from existing Bavarian Inn hydropower, including Nussdorf and Passau. Burghausen also has its own Alzwerke generation. **Limit:** future supply, part of a chemical site's energy portfolio; no public price, minimum-bill clause or batch energy cost. The site's total consumption is not polysilicon-only consumption.

### GP06 - HCl sold in Germany - Read

Air Liquide Deutschland, [*Chlorwasserstoff kaufen*](https://de.airliquide.com/chlorwasserstoff-kaufen), undated.

Read purchase listings, cylinder supply and direct-contact sections. Lists N28 and N50 grades, different sizes and nationwide delivery. **Limit:** catalog availability, not live stock, a factory qualification, source-plant origin or a negotiated quote. Supports a German supply channel; it does not select the grade the game must require.

### GP07 - Hydrogen sold in Germany - Read

Air Liquide Deutschland, [*Wasserstoff H2*](https://de.airliquide.com/unsere-gase/wasserstoff), undated.

Read product list and “Wasserstoff kaufen & Belieferungsformen” sections: pure grades and mixtures; cylinders, bundles and customer tanks. **Limit:** only these purchasing passages support this pack, not the page's broad promotional claims. No site-specific availability, price, gas-origin trace or electronic-grade acceptance test obtained.

### GP08 - Hydrogen origin versus seller - Read

Air Liquide Deutschland, [*Wasserstoff von der Produktion bis zur Distribution*](https://de.airliquide.com/ihre-anwendung/wasserstoff-von-der-produktion-bis-zur-distribution), undated.

Read production sections on electrolysis and natural/biogas reforming. Establishes that hydrogen has different manufacturing routes before purification/distribution. **Limit:** technology portfolio, not provenance for the German catalog products. Do not transplant the page's French or US project examples onto the Germany map.

### GP09 - Anhydrous HCl versus acid and European caveat - Read

Niacet, [*Anhydrous Hydrogen Chloride*](https://www.niacet.com/products/anhydrous-hydrogen-chloride/), undated.

Read introduction, applications, grades and package-size section including its European footnotes. Separates anhydrous HCl from its aqueous acid solution and identifies silicon purification via trichlorosilane as an application. **Limit:** European package options require inquiry; do not assume the displayed US sizes/valves are German offers. No claim that the highest listed grade is required by our plant.

### GP10 - Requirements determine supply mode - Read

Linde, [*Supply Modes*](https://www.linde-gas.com/products-and-services/supply-modes), undated.

Read “Security of Supply” and “From Cylinders to On-site Builds”: volume, pressure, purity, flow and availability determine appropriate supply, from cylinders to pipelines/on-site production. **Limit:** global overview; regional availability must be established separately. Not every gas supports every listed mode.

### GP11 - Additional German HCl seller - Read

GHC, [*Chlorwasserstoff 5.0*](https://www.ghc.de/de/product/chlorwasserstoff-5-0/), undated.

Read product description and formula/connection information. A second German supplier's HCl listing corroborates that GP06 is not the only documented sales channel. **Limit:** no quote, stock, package commitment, manufacturing origin or qualification for this plant established; linked SDS not read in this pass.

### GPL01 - Nippon Sanso electronics brochure - Lead

[Indexed brochure URL](https://eu.nipponsanso.com/de-de/-/media/ng-germany/electronics/electronics-brochure-digital_eng.pdf). Search excerpt listed hydrogen and HCl; opening redirected to a country selector. Brochure not read or saved. **Not used** to establish grades, supplier count or availability.

## Review depth and next handoff

Read selected passages in **4 saved PDFs and 7 primary web pages**; inspected **2 rendered PDF pages**. One additional record is **Lead**. The older Germany G01-G10 archive was consulted as context, not independently re-reviewed in full. Real contracts, private quotations, supplier qualification files, lot certificates, exact plant origins and national supplier counts were not obtained.

Claude: review GP01's contract distinctions and GP02's recovery scope first, then the short findings above. The next workflow phase is the one-page `layers/GERMANY_PLAN.md` when requested. Do not infer authorization to build from this research handoff.

Application tests/build/browser: **not run** (research/documentation only). Original PDFs saved; page counts and document identity checked with Poppler; two relevant tables/figures rendered and inspected. No game code, economics or art changed; leave uncommitted.

## Claude's review and additions - 22 October 2026

Workflow steps 1-2 again, on top of Codex's pass. Read GAME_VISION.md, PROCUREMENT_WORKFLOW.md, the loop-2 handoff, this file and Codex's uncommitted diff.

### Check of Codex's sources

| Record | What I did | Result |
|---|---|---|
| GP01 | Reread Note 19, PDF p. 94 (printed p. 88), all three distribution paragraphs | **Confirmed** word for word. Also note: on-site pricing "fluctuates with various price indices"; packaged-gas invoices include cylinder use. |
| GP02 | Reread printed pp. 39, 88, 173 (PDF 14, 63, 148) and searched the whole report | **Confirmed**, page mapping correct (PDF = printed − 25). Three passages Codex didn't use, below. |
| GP05 | Reopened the VERBUND release | **Confirmed**: 10 MW, 2028-2032, Nußdorf am Inn and Passau, Burghausen. The annual 87,600 MWh equals 10 MW × 8,760 hours. **Codex review correction:** this arithmetic does not establish the contractual hourly delivery profile, balancing terms or plant demand. Those are not disclosed. |
| GP06 | Tried to reopen | **Not re-verified**: the page returned HTTP 503. Codex's record stands as Codex's reading. |
| GP03, GP04, GP07-GP11 | Not reopened | Codex's readings, not re-verified by Claude. |

No corrections needed. Codex's limits (no private prices, no supplier census, no plant specification) hold.

### More passages in GP02 (Read)

- **Selling polysilicon, printed p. 34 / PDF p. 9 (Orders):** reports both short- and long-term agreements, with some short-term prices tied to market benchmarks. This supports two commercial forms as future candidates, not proof that every short-term order is an immediate spot purchase.
- **Customers pay in advance, printed p. 77 / PDF p. 52:** advance-payment liabilities on supply contracts, particularly polysilicon, fell from €268.8 million to €242.4 million. **Codex review correction:** that is the remaining advance-payment balance, not the total of other liabilities (€395.1 million), nor annual new cash receipts. The passage does not specify every contract's duration or require all long-term buyers to prepay. GP14 supplies one concrete example.
- **WACKER's own commitments, printed pp. 88-89 / PDF pp. 63-64:** describes multiple suppliers, differing contract terms, stocks and hedging; the following page adds flexible volumes, price mechanisms and supply guarantees. **Limit:** group-wide policy, not a contract for one plant; a supply guarantee is not automatically a buyer's minimum-payment obligation.
- Side note, printed p. 69 / PDF p. 44 (Claude's reading; not independently reopened by Codex in this review): the Holla, Norway silicon facility is further context for vertical integration. Not needed for the game; suppliers remain fictional (L13).

### New sources

All opened and read on 22 October 2026; originals saved in `sources/procurement/`.

#### GP12 - A real 2026 grid-fee price sheet in Bavaria - Read

Stadtwerke Bayreuth, *Preisblätter Netznutzung Strom 2026*, valid from 1 January 2026, includes the upstream Bayernwerk Netz charges. [Original](https://www.stadtwerke-bayreuth.de/fileadmin/user_upload/netz/Netzentgelte___Preise/strom-preisblaetter-netznutzung-2026.pdf); [saved PDF](sources/procurement/GP12-stwbt-netzentgelte-2026.pdf). Claude read Preisblatt 1 (p. 1) and p. 9. **Codex review:** reread pp. 1, 9-10; p. 9 is street lighting, while the levy/concession/VAT section is on p. 10, despite p. 1's internal reference to p. 9. [Inspected p. 1 table](previews/procurement/GP12-grid-fees-2026.png).

For sites with quarter-hour power metering, the grid fee has **two parts: a yearly price per kW of peak and a price per kWh**. Medium voltage: Regelung I 14.81 €/kW·a + 5.01 ct/kWh; Regelung II 122.10 €/kW·a + 0.72 ct/kWh; crossover at 2,500 hours a year. "Es kommt die jeweils günstigere Preisregelung zur Abrechnung": the network operator bills whichever is cheaper, so **the customer does not choose**. Sites with a short, high peak can register in advance for a monthly system (20.35 €/kW per month). Levies, concession fee and VAT come on top. **Limit:** one Bavarian network's prices, not Burghausen's own connection. WACKER also generates some of its own power (GP05: Alzwerke). Grid fees are only part of the bill; the energy itself is bought separately from a supplier.

#### GP13 - The rule behind the price sheet - Read

*Stromnetzentgeltverordnung* (StromNEV), gesetze-im-internet.de, as last amended 22 December 2023. [Original](https://www.gesetze-im-internet.de/stromnev/StromNEV.pdf); [saved PDF](sources/procurement/GP13-stromnev.pdf). Read § 17 (1)-(2a), PDF pp. 14-15, and § 19 (1)-(2), PDF pp. 16-17.

§ 17 (2) calculates the annual demand component from annual maximum demand, separately from the energy component. For the quarter-hour-metered connection in GP12, this means the highest metered interval average, not an instantaneous knob setting. § 19 (1) provides a monthly alternative for temporarily high demand. § 19 (2) describes individual-fee conditions and percentage floors; the text allows notification in specified circumstances rather than requiring a new individual approval in every case. **Limits:** ordinary tariff structure, not a determination of WACKER's actual connection or concessions. Claude did not check the 2026 reform status; Codex's bounded update is GP15 below. A complete plant-specific legal applicability review was not performed.

#### GP14 - A German buyer bound by a polysilicon take-or-pay contract - Read

*Hemlock Semiconductor Operations, LLC v. SolarWorld Industries Sachsen GmbH*, No. 16-2181 (6th Cir. 16 August 2017). [Original](https://www.opn.ca6.uscourts.gov/opinions.pdf/17a0184p-06.pdf); [saved PDF](sources/procurement/GP14-hemlock-solarworld-6cir-2017.pdf). Read the introduction and Factual background, opinion pp. 1-4, and the damages passages.

Four agreements fixed annual quantities/prices; advance payments were credited against purchases. The market later fell below the agreed price. **Codex review correction:** p. 3 separates annual take-or-pay from a termination/liquidated-damages clause covering future years. The roughly $793 million judgment (p. 17) includes remaining-term obligations and prejudgment interest, not simply a bill for one unused year. The earlier $509.1 million benefit is an expert estimate discussed on p. 19. [Inspected p. 3](previews/procurement/GP14-contract-clauses.png). **Limits:** a solar-polysilicon case applying Michigan law, not German contract law or a rule for all gas purchases. Do not import its litigation or accelerated damages into the game. Related Kyocera proceedings remain Lead GPL02, not read or used.

### What this adds to Codex's findings

1. **The minimum-commitment lesson is real.** GP01 supports industrial-gas minimum purchases; GP14 separately illustrates fixed-price exposure and future-year damages. A lower contract unit rate would be an explicit teaching choice, not a universal fact. Compare complete offer totals for the known need before signing.
2. **Electricity has a distinct demand charge.** GP12-GP13 document metered maximum demand as one part of an applicable network tariff. Claude suggested linking it to workshop heat settings. **Codex recommends deferring that suggestion:** it would add a new economic consequence to experimentation, requires an unsourced heat-to-grid-load model and introduces another lesson. A demand charge is not a minimum-purchase clause.
3. **The selling side, Germany → Japan:** short-/long-term supply and prepayment are supported as possible terms, not a proven menu tied together in every offer. If a later design adds an advance, it reduces the remaining amount due; it is not extra sale revenue. Norway's existing sale/payment flow remains the starting point.
4. **Keep it simple:** “Compare what you must pay in total with what you actually need.” Levies, voltage levels, peak management, individual grid discounts, hedging and litigation stay in research unless separately chosen later. This is Codex's scope recommendation, not a new user decision.

Read depth: 3 of Codex's records re-verified (GP01, GP02, GP05), 1 unreachable (GP06), the rest not reopened. 3 new primary documents saved and read (GP12-GP14), 1 new Lead (GPL02). Not obtained: a real hydrogen or HCl quote, Burghausen's actual grid connection and fees, current 2026 grid-fee reform status. Application tests/build/browser: not run (research only).

## Codex review and contribution - 22 October 2026

Reviewed Claude's commit `dfb4591`, including its source passages rather than just the register. Corrections are integrated above; earlier BUILD_NOTES and handoff entries are preserved as history. This remains research, not `layers/GERMANY_PLAN.md` or authorization to build.

### GP15 - Grid reform timetable, bounded update - Read

Bundesnetzagentur, 6 August 2026, [*Bundesnetzagentur startet Konsultation zur Reform der Netzentgeltsystematik Strom*](https://bundesnetzagentur.de/SharedDocs/Pressemitteilungen/DE/2026/20260806_Agnes.html). Read on 22 October 2026: release body, timetable and background sections. Describes an AgNes draft under consultation, intended final determination at the end of 2026 and replacement of StromNEV rules from 2029. The saved GP13's first page also states expiry at the end of 2028.

**Limit:** a regulator's dated announcement, not a final determination or a complete review of every 2026 implementing decision. The available live § 19 text was reopened and compared for its fee/notification structure; live § 17 and whole-PDF requests timed out. GP13's saved text and GP12's explicit 2026 schedule support the structural discussion. No particular plant's discount, supplier quote or future tariff is certified.

### Contribution for the future planner

Keep three different exposures separate:

| Exposure | What the evidence supports | Boundary for the next phase |
|---|---|---|
| Minimum purchase/payment | Payment can remain due when the buyer takes less gas (GP01). | Show the commitment before agreement. Payment owed for undelivered supply creates no physical inventory. |
| Fixed price versus future market | The polysilicon case's agreed price became unfavorable after a market change (GP14). | This is distinct from buying too much. Do not add a future price shock to the fixed, known-batch scenario just to reproduce the case. |
| Metered peak demand | The applicable tariff can include a demand component as well as energy use (GP12-GP13). | It is neither take-or-pay nor a one-off control click. An annual grid charge cannot be assigned anew to every batch without an explicit allocation rule. Defer as a mechanic. |

For the chosen commitment lesson, a future offer comparison should distinguish **required usable supply, amount delivered, minimum billable amount, rate, separate charges and total obligation**. That is a planner's comparison checklist, not a prescribed contract formula. A prepaid supply entitlement, a nonrefundable service fee and a take-or-pay shortfall may have different rights; do not treat them as interchangeable or silently assume unused rights can be resold.

For selling, keep **agreed price, advance received, remaining invoice and actual settlement** separate. A credited advance plus the settled balance pays the agreed sale once. More opening cash from an advance does not make the batch more profitable. The WACKER liability balance alone does not establish payment timing, refundability or terms for Japan's fictional buyer. I recommend retaining the existing sale flow for the first Germany prototype.

Recommendations: retain the researched gas-contract lesson; compare complete quotes; preserve the existing workshop and its recovery behavior; defer peak-demand tracking and advance-payment mechanics. Supplier count, local gas origins, actual quotes and plant specifications remain unresolved evidence limits, not questions the user needs to answer. Prices and batch terms in a later plan must be declared teaching assumptions.

**Review depth:** reread GP02 printed pp. 34, 77, 88-89; GP12 pp. 1, 9-10; GP13 cover and cited § 17/§ 19 passages on pp. 14-17; GP14 pp. 1-4 and 17-21. Opened GP05's release, live § 19 and GP15's release. Rendered and visually inspected GP12 p. 1 and GP14 p. 3; no legal apparatus figure was assumed from text extraction. GP01's previously read record remains the gas-contract basis; it was not reread in this review. Other prior sources and GPL01/GPL02 leads were not reopened. No new PDF downloaded.

Checks: document local links and whitespace. Application tests/build/browser: **not run** (no game-code changes). All review work remains uncommitted for Claude.
