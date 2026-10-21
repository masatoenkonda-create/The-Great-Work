# Malaysia workshop: assembly, packaging and final test evidence pack

Research started 21 October 2026 by Claude, following [WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md) steps 1–2. **Codex's independent review and proposed plan are complete; no game code changed.** See [CODEX_REVIEW.md](CODEX_REVIEW.md), [WORKSHOP_PLAN.md](WORKSHOP_PLAN.md) and the current status in [HANDOFF.md](HANDOFF.md). First-pass findings below are supplemented by M09–M13.

## What the research says, in player terms

| Question | Answer | Records |
|---|---|---|
| **Why do I need this?** | A bare chip ("die") is a fragile sliver of silicon with microscopic pads. It must be cut free, connected to something a circuit board can solder to, and sealed against damage. | M01, M04 |
| **Where does it come from?** | Taiwan's tested wafer and its map; a small laminate board (the substrate) for each chip; fine gold or copper wire; black epoxy mold compound; solder balls. Malaysia does about 13 % of the world's chip assembly, packaging and test, much of it around Penang. | M01, M04, M08 |
| **How do I do it?** | Tape-mount in a ring → blade-dice the streets with cutting water → clean/dry → map-driven pick of a passing die → adhesive attach/cure on substrate → thermosonic ball-and-stitch wire bonding → transfer mold/cure → underside ball attach/reflow → socket test, mark and tray. A discharge forms the wire-end ball before contact; heat, force and ultrasound bond it to the pad without melting the die pad. | M01–M07, M09–M13 |
| **What does it look like?** | A diced wafer: a grid of separate squares still sitting on stretched tape. A die smaller than a fingernail on a green board, with a fan of glinting wire loops. Then a flat black square with printed markings and tiny solder balls underneath: the chip as everyone knows it. | M02, M04, M05 |

The core lesson: **the chip you know (the black square) is mostly protection and wiring; the real chip is the tiny silicon die inside, picked because the wafer map says it works.**

## Records

### M01 — Package type: wire-bonded plastic BGA

- Same as SOURCES.md R15 ([ASE, Packaging Substrate](https://ase.aseglobal.com/packaging-substrate/), page now returns 403 to automated fetches): plastic BGA with a wire-bonded die, substrate and epoxy molding compound.
- [Amkor, PBGA](https://amkor.com/packaging/laminate/pbga/): Amkor's plastic BGA package family on laminate substrates; datasheet lists moisture-sensitivity and temperature-cycle qualifications.
- PBGA patents (e.g. [US 6,064,117](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/6064117)): a PBGA is a substrate plus an overmold; the die is attached to the substrate top, the overmold protects it, solder balls underneath connect to the circuit board; substrate about 0.36–0.65 mm thick.

**Use:** one consistent construction for the game, and it fits China's next step (solder paste and reflow onto the logic board). **Limits:** not a claim about any real phone's package; many phone chips use flip-chip instead.

### M02 — Wafer mounting and blade dicing

[USC Nanofab, Dicing Saw](https://wiki.nanofab.usc.edu/index.php/Dicing_Saw); [Columbia CNI, DISCO DAD3220](https://cni.columbia.edu/dicing-saw-disco-dad3220); dicing patents (e.g. [US 6,498,075](https://patents.justia.com/patent/6498075)).

**Supports:** the wafer is stuck on dicing tape stretched over a metal ring frame; vision alignment to the **streets** (non-functional lanes between dies); a high-speed diamond blade cuts each street with deionised water for cooling and washing; diced dies stay on the tape until picked; kerf width depends on the blade.

**Limits:** university equipment pages and patents. Thinning (back-grinding) before dicing exists but its order varies; can be left out.

### M03 — The wafer map drives the die pick (SEMI E142)

[PDF Solutions, Introduction to SEMI E142](https://www.pdf.com/standards/semi-e142-specification-for-substrate-mapping/); [SEMI Standards Watch on E142 revision](https://www.semi.org/en/standards-watch-2026-apr/major-revision-underway-for-semi-e142); [Besi, strip mapping E142 on Esec die bonder](https://besi.com/products-technology/product-details/product/strip-mapping-e142-on-esec-die-bonder).

**Supports:** SEMI E142 is the industry format for substrate maps (wafers, frames, strips, trays); a wafer map can hold per-die results as a **bin code map**; assembly tools use those coordinates, so test and assembly must share one coordinate system; Besi's die bonder downloads maps and links wafer positions to strip positions for traceability.

**Use:** the real-world version of our Taiwan → Malaysia `waferMap` hand-off, including "one coordinate system, notch down". **Limits:** standard summaries, not the standard itself. Ejector-needle and vacuum-collet pick mechanics not yet sourced (see HANDOFF question).

### M04 — Wire bonding (ball and stitch)

[Ball bonding overview](https://en.wikipedia.org/wiki/Ball_bonding) (secondary); wire-bonding patents, e.g. [US 7,067,413](https://patents.google.com/patent/US7067413) and [US 5,960,262 stitch bond](https://patents.google.com/patent/US5960262).

**Supports:** an electric flame-off melts the wire tip into a ball; heat, pressure and ultrasonic energy weld the ball onto the die pad (ball bond); the capillary loops the wire to the substrate and presses a stitch (wedge) bond; the tail is cut and a new ball formed; gold or copper wire, copper typically about 50 µm or thinner.

**Limits:** patents plus an encyclopedia overview. Need a primary maker source (e.g. Kulicke & Soffa) if bonding becomes the puzzle.

### M05 — Transfer molding and cure

[SEMITRACKS newsletter, Sept 2025](https://www.semitracks.com/newsletters/september/2025-september-newsletter.pdf) (industry training); molding patents (e.g. [US 7,453,140](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/7453140)).

**Supports:** epoxy molding compound is pushed by a plunger into a heated mold around the dies and wires (typically about 170–190 °C, 15–20 s transfer, partial cure in the mold); post-mold cure around 175 °C for 4–6 hours in an oven.

**Limits:** typical values from training material and patents; vary by compound. **Plastic molding is not a hermetic seal** (UNIFIED_OPINION.md: say "protected in molded resin").

### M06 — Final test, binning and packing

[Semiconductor Digest, package test](https://sst.semiconductor-digest.com/?p=34364); handler patents, e.g. [US 7,772,834](https://patents.google.com/patent/US7772834) and [US 10,118,200 binning at final test](https://patents.google.com/patent/US10118200).

**Supports:** testing happens twice: wafer probe (Taiwan) and **final test** after packaging; a handler presses each packaged unit into a socket on the tester; pass/fail sorts units into bins; good units go into trays, tubes or tape-and-reel.

**Limits:** trade article and patents. Final test can catch faults made during assembly (e.g. a bad bond) even when the die passed probe; that point needs a cleaner source if used.

### M07 — Marking and solder balls

Covered only weakly so far (training decks; PBGA patents in M01 for the solder balls underneath). Laser marking of the package top and ball attach are standard steps. **To strengthen** if shown.

### M08 — Malaysia's role

[MIDA, Malaysia's semiconductor position (Feb 2024)](https://www.mida.gov.my/mida-news/as-malaysia-stakes-claim-in-semiconductor-industry-putrajaya-says-not-worried-over-competition-with-us-china/); [CEPA, Southeast Asia's semiconductor strengths](https://cepa.org/article/southeast-asia-shows-surprising-semiconductor-strengths/).

**Supports:** Malaysia holds about 13 % of the global market for chip assembly, packaging and test (MIDA, February 2024); Penang focuses on high-volume back-end work: wire bonding, flip-chip packaging and final test (CEPA).

**Limits:** a 2024 government-agency figure, repeated by think-tank coverage. Setting only; no specific company or plant assigned to our chip.

## Codex contribution: primary evidence and proposed plan

21 October 2026. Read the [independent review](CODEX_REVIEW.md) and [proposed workshop plan](WORKSHOP_PLAN.md) before building. These supplement the first pass; no game code changed. Claude's six questions are answered in the review.

### M01 supplement — Inspect the actual PBGA cross-section

[Original Amkor datasheet](https://amkormarcomexternal.blob.core.windows.net/amkordotcom/wp-content/uploads/2018/02/PBGA_DS520.pdf), [saved PDF](sources/M01-amkor-pbga-ds520.pdf). Visually inspected PDF pages 1–2: [package reference](previews/M01-package.png), [construction diagram](previews/M01-cross-section.png).

**Supports:** page 2 labels die, die-attach adhesive, wire bond, laminate, via and underside solder ball; also lists laser marking and tray/dry-pack options. It separates reliability qualification from test services. This closes M07's marking gap and gives the artist the selected package anatomy.

**Limits:** product-family data, not our actual chip's recipe or performance. Do not copy listed thermal tests into a per-unit instant final-test animation. The cross-section does not specify the mechanism of a ball-placement machine. Reference images are research, not game assets.

### M09 — Original Malaysian thermosonic gold-bond experiment

A. Jalar et al., “Surface Topographical Characterization of Gold Aluminide Compound for Thermosonic Ball Bonding,” International Journal of Engineering and Technology 6(1), 2009, pp.1–8. [Original paper](https://ijet.feiic.org/journals/J-2009-V1001.pdf), [saved PDF](sources/M09-gold-ball-bonding-2009.pdf), [inspected experimental page 2](previews/M09-bond-controls.png). Read pp.2–5 for setup/results.

**Supports:** researchers varied force and ultrasonic current while fixing bonding time and temperature. Non-stick and smashed bonds were reported. Force and ultrasonic excitation are therefore a defensible control pair; maximum settings need not produce the best bond. Shear force alone can mislead because bond size also changes.

**Limits:** one experimental Au/Al system and bonder; no universal safe window, force-to-yield formula or proof of our exact package. Proposed normalized control bands are teaching choices. Keep temperature/time installed rather than adding four competing knobs.

### M10 — Ejector below, vacuum collet above

ASM Assembly Automation, EP1429372A1, “Apparatus and method for thin die detachment,” published 16 June 2004. [Original patent](https://patentimages.storage.googleapis.com/ea/db/55/439c8b600daa7f/EP1429372A1.pdf), [saved PDF](sources/M10-die-detachment-asm-2004.pdf), [inspected PDF page 7](previews/M10-die-pick.png).

**Supports:** paragraphs 0002–0004 explain tape support, ejector pins and vacuum pickup; Figure 1 on page 7 illustrates the conventional prior-art arrangement. Animate the coordinated support/pick motion at the chosen die.

**Limits:** the later figures describe a particular detachment invention; no need to reproduce that mechanism. This document does not establish how our saved map is interpreted or require a particular map orientation.

### M11 — Manufacturer diagrams distinguish transfer and compression molding

TOWA, Integrated Report 2024, printed p.28 / PDF p.29. [Original report](https://www.towajapan.co.jp/en/wp-content/uploads/sites/3/2024/11/tr2024A4e.pdf), [saved PDF](sources/M11-towa-molding-2024.pdf), [inspected process diagrams](previews/M11-transfer-molding.png). Also [manufacturer molding explanation](https://www.towajapan.co.jp/en/technology/molding/).

**Supports:** the transfer sequence places a resin tablet in a pot, closes the mold and uses a plunger to drive heated resin into the cavities; cure precedes removal. The lower compression diagram uses a different resin/substrate arrangement. Choose the upper transfer sequence for this level.

**Limits:** illustrated products include other package families. Use the mechanism with our chosen PBGA cross-section, not an exact machine/product claim. No numeric mold recipe is inferred from the illustration. Post-mold cure remains an automated, resin-dependent step from M05.

### M12 — Structural inspection is distinct from functional final test

[Keysight electrical structural tester](https://www.keysight.com/us/en/products/semiconductors/electrical-structural-test.html) and [manufacturer methodology](https://www.keysight.com/il/en/assets/3124-1416/white-papers/Wire-Bond-Electrical-Structural-Test-Methodologies.pdf), consulted 21 October 2026. Canadian page fetch failed; US manufacturer content and indexed methodology were accessible. No local PDF inspection claimed.

**Supports:** capacitive, unpowered post-mold inspection screens internal wire-bond structure before final test; some subtle defects may escape ordinary functional checks.

**Limits:** distinct equipment/method, including leadframe-package examples, not evidence that our generic PBGA socket performs that inspection or finds every weak bond. Keep only representative package electrical checks in the game. No clock-speed, thermal-cycle or bond-strength number has been established for our fictional device.

### M13 — Manufacturer support for tape frame and cutting water

[DISCO accessory equipment](https://www.disco.co.jp/eg/products/other.html), consulted 21 October 2026: tape frames hold workpieces during dicing; cutting-water filtration, DI-water and cleaning accessories accompany the equipment. Supports M02's visible frame/tape/water handling. It does not establish a blade speed, street width or coolant recipe for our wafer.

### Evidence and geometry limits

Four original PDFs are saved under `sources/`; five rendered pages under `previews/` were visually inspected for legibility and machine/package geometry. M09 rendering emitted font warnings, but its inspected setup page is legible. References guide original simple geometry; no source diagram is cleared for use as shipped game art. Ball-placement motion, accelerated cures and simplified socket checks are stated abstractions, not verified proprietary factory sequences.

## Existing game content checked against this pack

- **Arrival dialogue (`dialogues.ts`, stop 5).** Consistent: tested wafer and its map, substrate as the little board, gold wire, mold resin into the black package. "Thinner than a hair" is plausible (M04: ~50 µm or thinner vs. a human hair) but **to verify** with a primary source if kept.
- **Old workshop (`Stop5PackagingWorkspace.tsx`).** Five steps (dice, pick, wire, mold, test) match M02–M06. Problems: "THERMOSET CURED (HERMETIC SEAL)" is wrong for plastic packages (M05); the final test's "clock frequency / thermal stability" checks are unsourced theatre; dicing is a count of button presses. Since the Taiwan build, its die pick already reads the saved map (the one part to keep).
- **Route data (`route.ts`, stop 5).** Consistent ("saw wafer into dies, wire-bond verified chip, seal in molded resin").
- **Carried result.** `selectedChipSerial` is now derived from wafer + die (`LOT-…-W01-R2C5`). China reads it.
