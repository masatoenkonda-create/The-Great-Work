# Japan workshop: crystal growth and wafer making evidence pack

Research started 21 October 2026 by Claude, following [WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md) steps 1–2. **Research only; no plan or code yet.** Codex is invited to add records (J08 onward) and challenge the ones below. Decisions and open questions are in [HANDOFF.md](HANDOFF.md).

**Codex second pass complete:** [CODEX_REVIEW.md](CODEX_REVIEW.md) answers the six handoff questions and audits the existing code; [WORKSHOP_PLAN.md](WORKSHOP_PLAN.md) proposes seven compact beats for Claude to review. No application code changed. Original notes below are preserved; apply the review's distinctions between single-crystal structure, surface finish, contamination and visible diameter. J06/J07 are intentionally unassigned; new records start at J08 as Claude requested.

## What the research says, in player terms

| Question | Answer | Records |
|---|---|---|
| **Why do I need this?** | Chips are built on thin, mirror-flat discs cut from **one single crystal**, where every atom lines up. Germany's chunks are pure but made of many small crystals. | J01, J02, J03 |
| **Where does it come from?** | Germany's polysilicon chunks, melted in a quartz crucible (held by a graphite crucible) at about 1,420 °C, with a tiny dose of boron or phosphorus. A pencil-thin seed crystal starts the growth. | J01, J02 |
| **How do I do it?** | Dip the seed into the melt, pull it up **very slowly while it spins** (the crucible spins the other way). First a thin neck, then the crystal widens to 300 mm and grows as a long cylinder for days. Then grind it round, slice it with a wire saw into ~1 mm discs, lap, etch, polish to a mirror, clean and inspect. | J01, J02, J03, J04, J05 |
| **What does it look like?** | The puller is a tall steel machine (about 15 m with its pulling mechanism) with viewing windows. The finished crystal is a shiny grey cylinder up to 2 m long and 300 mm wide, weighing up to ~265 kg, with a cone at each end. A bright ring glows where the crystal meets the melt. Wafers are thin mirror discs. | J02, J03 |

The core lesson: **a chip starts as one giant perfect crystal, grown slowly out of the melt and sliced like bread.**

## Records

### J01 — SUMCO production process (Japan)

**SUMCO, _Production Processes_, undated.** [Page](https://www.sumcosi.com/english/products/process/). Same source as SOURCES.md R05; Imari/Saga sites are R06.

**Supports:** polysilicon goes into a quartz crucible with boron and phosphorus, melted at around 1,420 °C; a seed crystal is placed on the melt surface and pulled up while rotating; magnetic-field (MCZ) variant; the ingot circumference is ground to a uniform diameter; sliced into slices of around 1 mm with an inner-diameter saw or wire saw; lapped with alumina abrasive (thickness, parallelism); chemical etching removes mechanical damage; mechano-chemical polishing with colloidal silica gives a flat mirror finish; cleaning, then visual, particle and flatness inspection.

**Limits:** company overview; no ingot size, pull rate or rotation numbers.

### J02 — Evers, Klüfers, Staudigl, Stallhofer: CZ growth of 300 mm crystals

**J. Evers, P. Klüfers, R. Staudigl, P. Stallhofer, _Czochralski's Creative Mistake: A Milestone on the Way to the Gigabit Era_, Angew. Chem. Int. Ed. 2003, 42, 5684–5698.** DOI 10.1002/anie.200300587. [PDF (LMU)](https://www.cup.lmu.de/ac/kluefers/homepage/publ_pdf/czochralski_engl.pdf). Two authors were with Wacker / Siltronic.

**Locator:** Section 4, Figures 5–7 (pp. 5689–5690).

**Supports:** crystals up to 2 m long, 300 mm diameter, ~265 kg; puller about 15 m tall; silica crucible inside a graphite crucible (silica softens at these temperatures), both crystal and crucible rotate and move up/down; optional magnetic coils; chamber filled with argon during growth; optical sensor monitors growth. Six steps with photos: pumping, melting just above 1,414 °C, dipping the 3–5 mm seed, necking (fast pull, dislocations grow out), shoulder (widening to the target diameter, four bright points mark the crystal axis), body at constant diameter. A 2 m, 300 mm crystal takes **3–4.5 days**; body pull rate **0.4–1.2 mm/min**; the melt drops from ~300 kg to ~35 kg so settings are adjusted continuously.

**Limits:** 2003; numbers are for that generation of 300 mm pullers. Use as order-of-magnitude, not a recipe.

### J03 — Válek & Šik: CZ process control and wafer flow

**L. Válek, J. Šik, _Defect Engineering During Czochralski Crystal Growth and Silicon Wafer Manufacturing_, in _Modern Aspects of Bulk Crystal and Thin Film Preparation_, InTech, 2012 (CC BY 3.0).** [PDF](https://cdn.intechopen.com/pdfs/26201/InTech-Defect_engineering_during_czochralski_crystal_growth_and_silicon_wafer_manufacturing.pdf).

**Locator:** Section 2.1 (pp. 44–45, Fig. 1 puller cross-section); Section 2.2 (Fig. 2 wafer flow); Voronkov / v/G section.

**Supports:**
- Puller parts (Fig. 1): upper and lower chamber, isolation valve, crystal, silica crucible, graphite susceptor, heater, insulation, vacuum pipe, windows.
- Necking: pull at ~3–6 mm/min with a 2–5 mm neck so dislocations leave; then slow down and widen (crown), then shoulder, then body.
- A **shiny ring** on the melt around the crystal (the meniscus) is watched by camera to control diameter. **Diameter is controlled by the pull rate, and the pull rate by heater power**, inside a window for dislocation-free growth, "typically at or below 1 mm per minute".
- The crystal rotates to even out impurities and temperature; the crucible rotates the opposite way to steady the melt flow and control oxygen.
- Tail: diameter slowly reduced to a cone; crystal lifted into the upper chamber to cool.
- Wafer flow: crop crown and tail, test, grind to diameter, grind an orientation flat (notch on 300 mm), wire-saw or ID-saw slicing, edge grinding, lapping, etching, polishing, final cleaning and inspection.
- **v/G rule (Voronkov):** the ratio of pull speed to temperature gradient decides which point defects freeze in: above a critical value, vacancy-type defects (voids, seen on wafers as COPs); below it, interstitial-type defects; near it, an essentially defect-free crystal.

**Limits:** review chapter; the v/G relationship is real physics but its thresholds depend on the hot zone. Supports qualitative cues only.

### J04 — Multi-wire saw (patent literature)

[US 7306508 B2, multi-wire saw](https://patents.google.com/patent/US7306508); [US 8256407 B2, multi-wire saw and method for cutting ingot](https://patents.google.com/patent/US8256407).

**Supports:** one wire is wound many times around guide rollers (pitch around 0.3–0.4 mm in one example), so a single pass cuts a large number of wafers at once; abrasive slurry or diamond-coated wire does the cutting; larger ingots make the wire drag harder and break more easily.

**Limits:** equipment patents; wire pitch and speed are examples, not a standard.

### J05 — Wafer shipping box (industry standard)

[SEMI M31, mechanical specification for front-opening shipping box (FOSB) for 300 mm wafers](https://store-us.semi.org/products/m03100-semi-m31-specification-for-mechanical-features-of-front-opening-shipping-box-used-to-transport-and-ship-300-mm-wafers); example product: [Miraial 300 mm FOSB](https://www.miraial.co.jp/en/product/300mm-fosb/).

**Supports:** 300 mm wafers ship from the wafer maker in a front-opening plastic box that holds each wafer by its edges.

**Limits:** standard listing and one product page; the standard is listed as inactive. Enough for "wafers go into a slotted box", not more.

## Existing game content checked against this pack

- **Arrival dialogue (`dialogues.ts`, stop 3).** Mostly consistent: chunks melted above 1,400 °C, quartz crucible, seed dipped and pulled slowly while spinning, wire slicing and mirror polish. **One fix:** "A day or more for one ingot" → several days (J02: 3–4.5 days for a 2 m crystal).
- **Old workshop (`Stop3WaferWorkspace.tsx`).** Slider screen. Melt 1,420 °C is sourced (J01, J02). Pull-rate window "1.0–1.4 mm/min" is not: J02 gives 0.4–1.2 and J03 "at or below 1 mm/min". "Roughness below 0.2 nm / atomic flatness" is unsourced (docs/history/UNIFIED_OPINION.md asked for "mirror-polished"). The wire feed-tension control has no effect (docs/history/UNIFIED_OPINION.md). To be replaced by the Norway/Germany-style workshop, not extended.
- **Route data (`route.ts`, stop 3).** Consistent. "Chemical-mechanically polish" is fine (J01: mechano-chemical polishing).

## Codex supplemental evidence

### J08 — Current industrial puller exterior and control variables

**PVA TePla, _Czochralski Process_ and _CGS1218_ manufacturer brochure.** [Process page](https://www.pvatepla.com/products-technologies/crystal-growth/czochralski-process/), [original brochure](https://www.pvatepla.com/fileadmin/sitepackage/pdf/brochures/PVA_CGS1218.pdf), [local PDF](sources/J08-pva-cgs1218.pdf), [inspected cover](previews/J08-industrial-puller.png).

**Locator:** Process section (melt/seed/pulling sequence); brochure PDF p.1 exterior photograph and subsequent equipment description/data sheet. Downloaded brochure metadata records a March 2026 modification, not a claimed publication date.

**Supports:** Current semiconductor-oriented steel chamber/pulling tower appearance; seed pulling, rotation and thermal control are distinct coupled functions. The vendor distinguishes semiconductor pullers from its solar-specific model.

**Use/limits:** Exterior/silhouette reference alongside J03's internal diagram. Not proof that this model is installed at SUMCO Imari. No hardware speed limit or capacity imported as a recipe. The webpage's approximate melt-temperature wording is not a reason to replace established silicon melting-point facts. Manufacturer photos are reference only; game-art reuse permission was not checked. Original eight-page PDF validated with Poppler; cover visually inspected.

### J09 — Producer diagrams for wafer handling, sawing and finishing

**Siltronic, Investor Presentation, April 2026, slide 14, _Wafer Production Process_.** [Original PDF](https://www.siltronic.com/fileadmin/investorrelations/2026/Q1/20260429_Siltronic_InvestorPresentation__.pdf), [local copy](sources/J09-siltronic-process-2026.pdf), [inspected slide](previews/J09-wafer-process.png); [producer process text](https://www.siltronic.com/en/products.html).

**Locator:** PDF p.14 / printed slide 14, individual schematic panels; webpage sections Cylindrical Grinding, Wire Slicing, Edge Rounding, Lapping and Polishing.

**Supports:** Wire web over guide rollers, slurry supply and a supported crystal fed through multiple cuts; edge grinding, carrier-held lapping, cleaning/etching and pad polishing. The diagram supplies concrete machinery geometry.

**Limits:** Representative wafer-producer flow, not a Japan-site drawing. FZ and CZ are alternatives, not sequential steps; optional epitaxy is omitted from our polished-blank-wafer lesson. Slurry wire sawing is the coherent selected depiction, not proof every modern line uses it. Copyright Siltronic AG; use as reference rather than copying into game assets. Original 32-page PDF validated; p.14 rendered and visually inspected.

### J10 — Structure loss has observable signs, not a universal speed score

**Original studies:** [_Analyzing structure loss in Czochralski silicon growth: Root causes investigation through surface examination_](https://www.sciencedirect.com/science/article/pii/S0022024823004906), Journal of Crystal Growth; [_Machine Learning Methods for Structure Loss Classification in Czochralski Silicon Ingots_](https://pubs.acs.org/cgdefu/article/24/17/7132/152844/Machine-Learning-Methods-for-Structure-Loss), Crystal Growth & Design 24 (2024), 7132 onward.

**Evidence available:** Primary-publisher indexed excerpts discuss growth-ridge disappearance as a sign of structure loss in examined ingots. The ACS excerpt identifies its examined crystals as 9-inch phosphorus- or gallium-doped material.

**Limits:** Full publisher pages returned 403. Figures, complete methods and image licenses were not inspected. This is a bounded answer to Claude's research question, not evidence for an instant universal detector, a direct pull-speed threshold or a wafer-contamination formula. Do not build a ridge-disappearance failure mechanic from the excerpt. Use the better-established diameter/meniscus feedback in this sample.

### J03 supplement — inspected puller diagram and license

Saved the [original chapter](sources/J03-cz-growth-wafer-manufacturing-2012.pdf). PDF p.2 / printed p.44 contains Figure 1, the chosen interior reference; [preview](previews/J03-cz-puller-figure1.png) visually checked. The last page (PDF p.30) explicitly states Creative Commons Attribution 3.0. Preserve author/work attribution for any reuse and check separately credited elements; open availability is not a blanket license for every external photograph. J02 shows Wiley/photograph credits, so its freely accessible PDF is not assumed to permit image reuse.

The chapter's steady-body control discussion and phase-specific necking regime were independently rechecked. Its defect physics is more detailed than our intended simulation and does not validate a game control-to-failed-die equation. The selected design uses qualified pause/recovery, rather than conflating intrinsic point defects with surface contamination.

### J01/J05 continuity checks

SUMCO's primary page confirms grinding, sawing, lapping, etching, polishing, cleaning and inspection as distinct operations. Compress their presentation without teaching that polishing alone performs all of them. Miraial's current FOSB page confirms a front-opening shipping box distinct from its FOUP product category. Do not substitute a bare wafer stack or treat FOUP and FOSB as identical names. No standard was purchased; current SEMI standard status or full compliance is not claimed.
