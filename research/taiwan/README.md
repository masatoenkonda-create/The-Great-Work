# Taiwan workshop: circuit patterning and wafer test evidence pack

Research started 21 October 2026 by Claude, following [WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md) steps 1–2. **Research only; no plan or code yet.** Codex is invited to add records (T08 onward) and challenge the ones below. Decisions and open questions are in [HANDOFF.md](HANDOFF.md).

**Codex contribution complete:** [CODEX_REVIEW.md](CODEX_REVIEW.md) answers the six handoff questions; [WORKSHOP_PLAN.md](WORKSHOP_PLAN.md) proposes the layer/overlay/test experience; [WAFER_MAP_CONTRACT.md](WAFER_MAP_CONTRACT.md) defines the Taiwan-to-Malaysia result. Claude reviews these before coding. Original notes below are preserved; apply the review's corrections on optics, resist states, edge exclusions and outcome provenance. No application code changed.

## What the research says, in player terms

| Question | Answer | Records |
|---|---|---|
| **Why do I need this?** | A blank wafer does nothing. The circuits (transistors and wiring) are printed onto it, layer by layer, for hundreds of chips at once. | T01 |
| **Where does it come from?** | Japan's blank wafers, a light-sensitive coating (photoresist) and a photomask: the master pattern of one layer. The fab is a foundry, like TSMC in Taiwan. | T01, T02 |
| **How do I do it?** | One layer = deposit a film → coat with photoresist → **expose**: the machine shines light through the mask, shrinks the pattern onto one chip area, then steps to the next → bake and develop → etch away what's unprotected → (implant) → strip the resist. Repeat for every layer, each one **aligned** to the last. Finally a prober touches every chip with needles and records which work: the **wafer map**. | T01, T03, T04 |
| **What does it look like?** | Yellow-lit cleanroom (the resist reacts to blue and UV light). The wafer goes from mirror-blank to a grid of rectangular chips with a rainbow sheen. The probe test produces a map: green good chips, red bad ones. | T01, T03, T05 |

The core lesson: **chips are printed with light, like photographs, layer on layer, and every layer must line up with the one below or the chip fails.**

## Records

### T01 — ASML: the layer loop, the scanner, and why alignment matters

**ASML Annual Report 2025, strategic report section.** [PDF](https://ourbrand.asml.com/m/8ab959d4926657b/original/asml-2025-annual-report-strategic-report-section.pdf). Same document as SOURCES.md R08. Also ASML, [How microchips are made](https://www.asml.com/en/technology/all-about-microchips/how-microchips-are-made).

**Locator:** printed pp. 14–15, "Steps in the chip manufacturing process", "The role of our lithography systems", box "What is edge placement error (EPE)?".

**Supports:**
- One layer = 1 deposition, 2 photoresist coating, 3 lithography (project the pattern with light), 4 baking and developing, 5 etching with reactive gases, 6 ion implantation (may be), 7 photoresist removal; "these steps are repeated for each additional layer".
- The lithography system projects light through a mask or reticle, "shrinking and focusing it" onto the wafer; after printing one field it "moves the wafer slightly and prints another".
- Edge placement error combines **overlay errors (misalignment between layers)** and feature-width deviations; any deviation "can compromise functionality and cause the entire chip to fail".
- Web page: hundreds of steps, up to four months from design to mass production; up to 100 layers aligned with nanometre precision; ISO class 1 cleanrooms, robots move wafers, workers in special clothing; EUV for the most critical layers, DUV for the rest.

**Limits:** equipment-maker account. No overlay tolerances, doses or yields for our generic chip.

### T02 — TSMC as the foundry setting

Same as SOURCES.md R07 ([TSMC dedicated IC foundry](https://www.tsmc.com/english/dedicatedFoundry)): TSMC manufactures customers' designs and has fabs in Taiwan. **Limits:** no particular fab, node or customer is assigned to our chip.

### T03 — Wafer test (probe / sort) and the wafer map

- Tokyo Electron, [US 5,091,692 _Probing test device_](https://patents.justia.com/patent/5091692): a prober compares camera images to confirm the probes contact the chip's electrode pads correctly.
- [halbleiter.org, _Wafer test_](https://www.halbleiter.org/en/wafertest/wafer-test/) (educational reference site, P. Laube): every die is electrically tested on the wafer before dicing; the prober moves the wafer die by die under the probe-card needles, which press through the pad's oxide; results go into a **digital map** of pass and fail for every die; only good dies are processed further.
- [AnySilicon, _Wafer sort guide_](https://anysilicon.com/ultimate-guide-wafer-sort/) (industry site): the map can be exported to the dicing step so bad dies are not packaged; dies can also be sorted into performance bins.

**Supports:** the probe step and the **wafer map** as the real object Malaysia uses to refuse bad dies.

**Limits:** two secondary sites plus a patent. Physical ink dots are older practice; the digital map is the one to show.

### T04 — Overlay errors cost yield

- J. Allgair et al., [ISSM 2003 paper on overlay metrology (Motorola/NXP)](https://www.nxp.com/docs/en/white-paper/ISSM_2003_JOHN_ALLGAIR.pdf): overlay is the misalignment of features printed by two mask levels; hidden overlay error from reticle, process and lens; overlay-related yield losses worth millions of dollars per year per fab.
- [CS ManTech 2021 extended abstract](https://csmantech.org/wp-content/uploads/Digest/Digests-2021/6.4.2021-Extended-Abstract_2021-CSManTech_Cwang_2nd-Draft.pdf): a misaligned wafer lost close to 30 % of its yield in that case.

**Supports:** "misaligned layer → failed chips" as a real cause and effect. Overlay is measured on targets in the scribe lines between chips.

**Limits:** the 30 % figure is one compound-semiconductor case, not a rule. No numeric overlay-to-yield formula is adopted.

### T05 — Why the lithography area is yellow

[Banner Engineering, amber illumination for photosensitive materials](https://www.bannerengineering.com/us/en/solutions/illumination/amber-illumination-suitable-for-photosensitive-materials.html); [JBNU study on residual UV under yellow lighting](https://pure.jbnu.ac.kr/en/publications/photoresist-based-evaluation-of-ultraviolet-exposure-under-yellow/).

**Supports:** undeveloped photoresist reacts to blue and UV light, so lithography rooms use filtered yellow light. **Limits:** a lighting vendor and one study. Enough for set dressing.

### T06 — Yield models (for a later upstream link)

[MIT OCW 2.830, lecture 10](https://www.ocw.mit.edu/courses/2-830j-control-of-manufacturing-processes-sma-6303-spring-2008/4aff1e21de13870355ef44dbe71f45c6_lecture10.pdf); [yield models reference](https://fog.misty.com/perry/cod/references/yield_models.pdf).

**Supports:** the classic Poisson model, yield = e^(−defect density × die area), and the negative-binomial version for clustered defects. Defect contributions from different layers and steps multiply. This is the textbook basis if Germany's or Japan's results ever add bad dies here.

**Limits:** models, not data for our chip. Not needed for this build unless the plan adopts an upstream link.

### T07 — Coater/developer track (weak)

Used-equipment listings for Tokyo Electron's CLEAN TRACK LITHIUS (e.g. [Moov](https://www.moov.co/listing/coaters-and-developers/tel-tokyo-electron-lithius-i)): a coat/bake/develop machine for 300 mm wafers, paired with a lithography scanner, around 150 wafers per hour. **Limits:** secondhand listings, not TEL's own pages. Use only for "coating and developing happen in a machine connected to the scanner".

## Existing game content checked against this pack

- **Arrival dialogue (`dialogues.ts`, stop 4).** Consistent: blank wafers held by the edge, photoresist spun on, photomask projected, "etch, and repeat, layer after layer" (T01). "Billions of transistors" and "machines the size of a bus" are common descriptions; **to verify** with a source if kept.
- **Old workshop (`Stop4CircuitWorkspace.tsx`).** Its mask-alignment task is the right idea (T01, T04), but the "Δ < 0.5 nm" readout and nm offsets are unsourced, and it produces a fixed count of 4 bad dies. To be replaced by the Norway-style workshop.
- **Cargo state.** `diesOnWaferCount` and `goodDiesCount` exist, but no die-by-die map. UNIFIED_OPINION.md asks for one saved wafer map that Malaysia reuses; today Malaysia invents its own.
- **Route data.** Consistent ("coat resist, expose, plasma etch, probe-test dies").

## Codex supplemental records

### T08 — Coherent optics and alignment metrology

**ASML primary equipment explanations:** [Lenses & Mirrors](https://www.asml.com/en/technology/lithography-principles/lenses-and-mirrors), [Measuring Accuracy](https://www.asml.com/technology/lithography-principles/measuring-accuracy), [EUV systems](https://www.asml.com/en/products/euv-lithography-systems).

**Locator/evidence:** DUV/EUV optical-components and EUV-reticle sections distinguish DUV lens projection from EUV mirror/reflective-mask paths. Metrology sections describe measured positional corrections; optical pattern inspection is distinct from electrical probe testing.

**Build use:** Select DUV for the through-mask/lens cutaway, enlarged alignment marks and per-field positional records. Manual X/Y buttons abstract automated equipment control.

**Limits:** No exact TSMC layout, actual field dimensions or calibrated game yield model. No image-reuse license assessed. EUV source/pellicle complexity is outside this sample.

### T09 — Primary track reference replaces T07

**Tokyo Electron, [Coater/Developer LITHIUS Series](https://www.tel.com/product/lithius.html).** Product overview and Pro DICE / Pro Z descriptions establish purpose-built coating/developing platforms supporting lithography, including DUV.

**Build use:** Compact track modules for wafer handling, coating, bake and development. Avoid portraying a single scanner as performing every chemical operation.

**Limits:** Replaces T07's weak secondhand-listing evidence; not proof of a model installed at the fictional fab. Product images identified but not downloaded/visually verified here. No specific throughput or recipe adopted.

### T10 — Primary wafer-test map handoff and prober

**Masahide Ozawa, _Wafer Test: Value & Future_, SWTest Asia, October 2019.** [Original PDF](https://www.swtestasia.org/2019proc/SWTestAsia_2019_Masahide-Ozawa_Keynote.pdf), [local copy](sources/T10-wafer-test-2019.pdf), [inspected p.2](previews/T10-wafer-map-handoff.png).

**Locator:** Slides/PDF pp.2–3. The presentation connects pass/fail, wafer-map generation and the packaging handoff; testing determines which dies are usable. This strengthens T03 beyond secondary summaries.

**Equipment supplement:** [ACCRETECH AP3000/AP3000e](https://www.accretech.com/en/product/semicon/semi/probe_semi/probingmachine_ap3000ap3000e.html), a producer's intact 300 mm wafer-prober reference, preferable to a framed/diced-wafer model for our stage.

**Limits:** No selected game failure count or electrical recipe is established. Sequential single-site animation is a simplification; multi-site probing exists. Original 31-page PDF validated and slide 2 visually inspected. Prober product page checked; no exact interior drawing or art license established.

### T11 — Positive resist: exposure is not etching

**MicroChemicals, _Development of Photoresists_.** [Original note](https://www.microchemicals.com/dokumente/application_notes/development_photoresist.pdf), [local PDF](sources/T11-resist-development.pdf), [inspected p.1](previews/T11-development.png); [supplier explanation](https://www.microchemicals.com/PRODUCTS/Photochemicals/Developer/).

**Locator/evidence:** Introduction distinguishes latent chemical image from development: exposed areas dissolve for positive-tone resist, unexposed areas for negative-tone resist.

**Build use:** Choose positive tone consistently. Light changes chemistry; development opens resist; later etching transfers openings into target material.

**Limits:** The molecular example is not a modern DUV process recipe. No chemistry, dose or bake values transferred. Original nine-page PDF validated; p.1 rendered/visually inspected. No artwork-reuse permission claimed.

### T12 — Map statuses and baseline failures: design limits

T08/T10 distinguish optical process inspection and electrical pass/fail. The proposed game additionally distinguishes **untested**, **excluded**, **pass** and **fail**. Its 6×8 circular geometry and binary per-field failure rule are design assumptions, not an exchange standard or measured yield dataset. Incomplete boundary positions are excluded rather than electrically failed. No source justifies the old forced four-corner result or a mandatory baseline fail count. No Poisson parameters adopted.

### T01 / T04 inspection and access notes

Saved [ASML's original strategic report](sources/T01-asml-process-2025.pdf), a 72-page extract. PDF p.13 / printed p.14 contains the [inspected layer-loop diagram](previews/T01-layer-loop.png); PDF p.14 / printed p.15 describes projection, stepping and edge-placement error. It is a broad illustration, not a complete recipe for our generic chip.

NXP's T04 was readable through the web tool, but direct downloading returned an access-denial page; no local T04 PDF was retained. It supports qualitative alignment importance, not our detents or field-failure equation. Sources and illustrations remain research references, not cleared game artwork.
