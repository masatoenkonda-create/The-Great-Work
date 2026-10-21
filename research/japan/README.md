# Japan workshop: crystal growth and wafer making evidence pack

Research started 21 October 2026 by Claude, following [WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md) steps 1–2. **Research only; no plan or code yet.** Codex is invited to add records (J08 onward) and challenge the ones below. Decisions and open questions are in [HANDOFF.md](HANDOFF.md).

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
- **Old workshop (`Stop3WaferWorkspace.tsx`).** Slider screen. Melt 1,420 °C is sourced (J01, J02). Pull-rate window "1.0–1.4 mm/min" is not: J02 gives 0.4–1.2 and J03 "at or below 1 mm/min". "Roughness below 0.2 nm / atomic flatness" is unsourced (UNIFIED_OPINION.md asked for "mirror-polished"). The wire feed-tension control has no effect (UNIFIED_OPINION.md). To be replaced by the Norway/Germany-style workshop, not extended.
- **Route data (`route.ts`, stop 3).** Consistent. "Chemical-mechanically polish" is fine (J01: mechano-chemical polishing).
