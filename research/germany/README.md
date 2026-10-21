# Germany workshop: polysilicon purification evidence pack

Research started 21 October 2026 by Claude, following [WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md) steps 1–2. **Research only; no plan or code yet.** Codex is invited to add records (G08 onward) and challenge the ones below. Decisions and open questions are in [HANDOFF.md](HANDOFF.md).

**Codex contribution completed, 21 October:** [CODEX_REVIEW.md](CODEX_REVIEW.md) reviews this first pass and answers the six research questions; [WORKSHOP_PLAN.md](WORKSHOP_PLAN.md) is a proposed compact plan for Claude's review before building. No game code changed. The original research below is retained; apply the corrections in the review, especially liquid compound versus molten silicon, light/heavy distillation fractions, and purity versus rod morphology.

## What the research says, in player terms

| Question | Answer | Records |
|---|---|---|
| **Why do I need this?** | Norway's silicon metal (~99 %) is far too dirty for chips. Chip-grade polysilicon is over 99.9999999999 % pure, with critical impurities in parts per trillion. | G01, G02 |
| **Where does it come from?** | Silicon metal (ground to powder) reacts with hydrogen chloride and becomes a liquid, trichlorosilane. | G01, G04 |
| **How do I do it?** | (1) Turn the silicon into liquid trichlorosilane. (2) Distill it in tall columns so the dirt stays behind. (3) Feed it with hydrogen into a bell-jar reactor where thin silicon rods, heated by electricity to ~1100 °C, slowly grow thick with pure silicon (days). (4) Break the rods, clean the pieces with acid in a cleanroom, rinse, bag. | G01, G02, G03, G04 |
| **What does it look like?** | Inputs: grey powder, a clear liquid. Machine: rows of big metal domes glowing orange through small sight glasses. Output: thick grey rods (smooth, or bumpy "popcorn" when grown too fast) broken into sharp, shiny chunks fist-sized or larger, sealed in double plastic bags of about 5 kg. | G01, G03, G05, G06, G07 |

The core lesson: **you can't scrub silicon clean. You turn it into a liquid, purify the liquid, and grow the silicon back as a solid.**

## Records

### G01 — WACKER process account (Burghausen)

**WACKER, _Purity Is Our Recipe for Success_, Annual Report 2022.** [Page](https://reports.wacker.com/2022/annual-report/sustainable-solutions/purity-is-our-recipe-for-success.html). Same source as SOURCES.md R13.

**Supports:** metallurgical silicon + hydrogen chloride → liquid trichlorosilane; purified in "tall distillation columns" that remove iron, copper, nickel, boron and phosphorus almost completely; fed into reactors at about 1,000 °C where polysilicon deposits on seed rods; deposition runs "several days" until the rods reach the target diameter; reactors are large metal domes glowing orange through small round sight glasses, in long rows in a hall about the size of ten tennis courts; reactors are opened, rods removed and broken, pieces cleaned, packaged and shipped to wafer makers. Critical impurities in parts per trillion.

**Limits:** company narrative, not an operating procedure. Gives ~1,000 °C where G03 gives ~1,100 °C; treat both as "about a thousand degrees". No rod diameter or chunk size.

### G02 — WACKER etching line press release, 2025

**WACKER press release, July 2025, new semiconductor-grade polysilicon line at Burghausen.** [Release](https://www.wacker.com/cms/en-ag/press-and-media/press/press-releases/2025/press-releases-detail-2025-257922.html), [PDF](https://www.wacker.com/cms/media/en/documents/pressrelease-pdf/pm2025/opening_etching_line_next.pdf).

**Supports:** acids remove the uppermost layer of the polysilicon surface; steps largely automated, under cleanroom conditions; chunks then rinsed, packaged and shipped; chunks are the raw material for semiconductor wafers; ready-to-ship purity "over 99.9999999999 percent".

**Limits:** company claims (e.g. share of world chips) are not adopted. The purity figure is the company's own.

### G03 — Siemens reactor: rods, temperature, run time

**Ramos, del Cañizo, Valdehita, Zamorano, Luque. _Radiation heat savings in polysilicon production: validation of results through a CVD laboratory prototype._ Journal of Crystal Growth 374 (2013) 5–10.** [Open-access PDF (UPM)](https://oa.upm.es/26089/1/INVE_MEM_2013_162591.pdf).

**Locator:** Introduction, p. 1.

**Supports:** industrial reactor chamber of 10–16 m³ containing inverted-U ("hairpin") silicon rods, heated by electric current (Joule effect) to around 1100 °C in hydrogen + trichlorosilane; deposition makes the rods thicker; growth is slow, microns per minute; a batch takes 80–100 h (heat-up under 1 h, deposition, cool-down); most energy is lost as radiation to the cooled reactor wall. Final rod diameters of 12–15 cm are discussed for an industrial reactor.

**Limits:** solar-grade focus and a lab prototype for its experiments; the industrial figures are from its introduction and model.

### G04 — Hydrochlorination and distillation (patent literature)

Patents on trichlorosilane production, e.g. [US 10294109 B2, primary distillation boron reduction](https://patents.google.com/patent/US10294109) and [US 8404205](https://patents.google.com/patent/US8404205).

**Supports:** metallurgical silicon *powder* (>98 % Si) and HCl react in a fluidized-bed reactor at roughly 280–320 °C, giving mostly trichlorosilane plus some silicon tetrachloride; boron and phosphorus compounds travel with it and are the hardest impurities to separate, which is why distillation is elaborate.

**Limits:** one company's designs; conditions vary. Enough to say "powder + gas → liquid, then distill", not a recipe.

### G05 — Rod growth control and surface (patent literature)

[US 9446957 B2, polycrystalline silicon rod and method](https://patents.google.com/patent/US9446957); [US 2013/0089488, apparatus and process for deposition of polycrystalline silicon](https://patents.justia.com/patent/20130089488) (Figs. 5A/5B show smooth vs. popcorn rod surfaces).

**Supports:** thin filament rods heated by current in a bell-jar reactor; trichlorosilane is the usual feed with hydrogen; deposition is controlled by **rod temperature** and **gas flow and composition**, with gas flow increased as the rods get thicker; one example grows rods from 5 mm to 160 mm diameter, 2 m long. Rough "popcorn" surface (cracks, pores) is common on thick rods; rough regions are sorted out after crushing and sold for much less.

**Limits:** patents describe preferred embodiments, not industry averages. They support a game rule like "too hot / too fast gives a rough, lower-grade rod" only qualitatively.

### G06 — Breaking and size classes (patent literature)

[US 2017/0057830, process for producing polycrystalline silicon](https://patents.justia.com/patent/20170057830); [US 8398946 B2 (WACKER)](https://patents.google.com/patent/US8398946).

**Supports:** rods are crushed mechanically (hammers, crushers) and classified by size; one scheme runs from class 0 (0.1–5 mm) to class 5 (100–250 mm), e.g. class 4 = 45–120 mm; WACKER fractions cited with maximum lengths 5–45, 20–65 and 20–150 mm.

**Limits:** size schemes differ between makers. For the game: "sharp chunks, from thumb-sized to fist-sized and bigger".

### G07 — Packaging (patent literature)

[US 9550587 B2, packaging of polycrystalline silicon (WACKER)](https://patents.google.com/patent/US9550587); [US 10689135 B2](https://patents.google.com/patent/US10689135).

**Supports:** chunks for electronics packed in about 5 kg bags; chunks are sharp and can puncture bags, so a filled bag goes inside a second plastic bag; packing must add as little contamination as possible.

**Limits:** packaging practice from patents, not a current WACKER product sheet.

## Existing game content checked against this pack

- **Arrival dialogue (`src/content/dialogues.ts`, stop 2).** Mostly consistent: powder, hydrogen chloride → trichlorosilane, distillation, hydrogen and hot rods, ~1,100 °C. One fix: Greta's "We need 99.9999999 %" (nine nines) understates G02's figure (over 99.9999999999 %). See HANDOFF.
- **Old workshop (`src/components/Stop2PurifyWorkspace.tsx`).** Slider screen with unsourced values (reflux ratio, 1080–1120 °C window, multiplied ppm→ppb counter flagged in docs/history/UNIFIED_OPINION.md). The 280–340 °C hydrochlorination window is roughly in line with G04 but should not be carried over as a recipe. To be replaced by the Norway-style workshop, not extended.
- **Route data (`src/types/route.ts`).** `summary` says trichlorosilane "gas"; G01 says liquid (it is distilled as a liquid and fed as vapour). Minor wording fix.

## Codex supplemental records and visual inspection

### G08 — Shin-Etsu reactor geometry and current path

**Shin-Etsu Chemical, US20200239321A1, _Method for Producing Polycrystalline Silicon_, published 30 July 2020.** [Patent text](https://patents.justia.com/patent/20200239321), [original PDF](https://patentimages.storage.googleapis.com/f5/8f/d3/084c78c1283e45/US20200239321A1.pdf), [local copy](sources/G08-shin-etsu-reactor-2020.pdf), [inspected preview](previews/G08-reactor-figure1.png).

**Locator:** Background Art; Figure 1 / drawing Sheet 1 / PDF page 2; Detailed Description of reactor 200.

**Evidence:** Two vertical silicon cores join through a top bridge; base electrodes and current heat this inverted-U assembly. A dome and baseplate enclose the reaction space, with cooling and gas connections. Figure 1 visually distinguishes the slim core from a thicker deposited rod outline.

**Build use:** Primary geometry reference for a representative Siemens cutaway. Show both legs and bridge growing radially.

**Limits:** Japanese producer patent, not a German site drawing. It discusses a special startup-heater improvement; omit that mechanism from gameplay. The conventional Figure 1 is a reference rather than a complete modern plant specification. Patent PDF and selected figure validated with Poppler and visually inspected; reuse rights for game artwork were not assessed.

### G09 — Distillation separates lighter and heavier fractions

**US20120325645A1, _Process and System for the Purification of Trichlorosilane and Silicon Tetrachloride_, publication 27 December 2012.** [Primary patent text](https://patents.justia.com/patent/20120325645).

**Locator:** Detailed Description; Table 1 (low/high boiling compounds); description of sequential separation and complexation.

**Evidence:** The feed contains compounds both more and less volatile than the desired material. Some contaminants are difficult to separate by simple distillation and the disclosed process adds a specific treatment. Condensing/separating fractions is a better general model than filtering dirt or sending every impurity downward.

**Build use:** Represent separation with reject fractions and a product receiver; do not teach “all impurities stay at the bottom.”

**Limits:** One disclosed purification scheme, not proof of WACKER's installed train. Do not import its additive chemistry, temperatures or column count as a general recipe. Text checked online; no apparatus drawing from this record was downloaded or visually verified.

### G10 — Producer account of clean finishing

**WACKER Annual Report 2023, _We Invest in Molecules_, Germany / polysilicon cleaning case study.** [Producer account](https://reports.wacker.com/2023/annual-report/investing-in-the-future/we-invest-in-molecules.html).

**Locator:** Germany polysilicon-cleaning passage (deposition, crushing, checking, etching and cleanroom film packaging).

**Evidence:** The producer separates bulk production from surface finishing and contamination-controlled packaging.

**Limits:** Narrative/photographic reference, no detailed bath mechanics. The web tool returned mostly page navigation; the relevant passage was available in its indexed excerpt. Use G02's inspected PDF as the stronger finishing reference.

### G02 visual supplement — actual enclosed cleaning line

Saved [WACKER's original 17 July 2025 release](sources/G02-wacker-etching-line-2025.pdf). PDF page 3 describes acid surface removal followed by rinsing and packing under largely automated cleanroom conditions. PDF page 6 / [inspected preview](previews/G02-cleaning-line.png) shows an enclosed production line. It does **not** establish a specific open basket/dip sequence. Proposed tray motion, drying and compact module geometry remain teaching abstractions. This source supports surface cleaning; it does not imply that a rinse alone fixes bulk impurities. The original is seven pages; page 6 was rendered with Poppler and visually checked.

### Recheck of G05 — control effects, not a purity formula

The [US9446957B2 description](https://patents.google.com/patent/US9446957B2/en), especially its discussion of deposition parameters and limits, confirms rod current/temperature, gas composition and flow as distinct variables. Excess silicon-containing precursor concentration can cause deposition within the gas; excessive rod temperature can disrupt rod morphology or cause melting in particular conditions. This supports qualitative cues, not a universal “high flow = bad” rule or a chemical-purity penalty for rough rods. No recipe thresholds adopted. G03's original PDF timed out through the web tool and was not independently downloaded in this pass.
