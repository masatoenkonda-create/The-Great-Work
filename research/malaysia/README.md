# Malaysia workshop: assembly, packaging and final test evidence pack

Research started 21 October 2026 by Claude, following [WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md) steps 1–2. **Research only; no plan or code yet.** Codex is invited to add records (M09 onward) and challenge the ones below. Decisions and open questions are in [HANDOFF.md](HANDOFF.md).

## What the research says, in player terms

| Question | Answer | Records |
|---|---|---|
| **Why do I need this?** | A bare chip ("die") is a fragile sliver of silicon with microscopic pads. It must be cut free, connected to something a circuit board can solder to, and sealed against damage. | M01, M04 |
| **Where does it come from?** | Taiwan's tested wafer and its map; a small laminate board (the substrate) for each chip; fine gold or copper wire; black epoxy mold compound; solder balls. Malaysia does about 13 % of the world's chip assembly, packaging and test, much of it around Penang. | M01, M04, M08 |
| **How do I do it?** | Stick the wafer onto tape in a ring frame → a diamond blade saws along the streets between chips, washed with water → the bonder reads the wafer map and picks **only good dies** off the tape → glue the die onto the substrate → wire-bond each pad (melt a ball onto the die pad, loop the wire, press a stitch onto the substrate) → mold it in hot black compound → cure, laser-mark, attach solder balls → **final test** in a socket; good units go into trays or tape reels. | M02–M07 |
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

## Existing game content checked against this pack

- **Arrival dialogue (`dialogues.ts`, stop 5).** Consistent: tested wafer and its map, substrate as the little board, gold wire, mold resin into the black package. "Thinner than a hair" is plausible (M04: ~50 µm or thinner vs. a human hair) but **to verify** with a primary source if kept.
- **Old workshop (`Stop5PackagingWorkspace.tsx`).** Five steps (dice, pick, wire, mold, test) match M02–M06. Problems: "THERMOSET CURED (HERMETIC SEAL)" is wrong for plastic packages (M05); the final test's "clock frequency / thermal stability" checks are unsourced theatre; dicing is a count of button presses. Since the Taiwan build, its die pick already reads the saved map (the one part to keep).
- **Route data (`route.ts`, stop 5).** Consistent ("saw wafer into dies, wire-bond verified chip, seal in molded resin").
- **Carried result.** `selectedChipSerial` is now derived from wafer + die (`LOT-…-W01-R2C5`). China reads it.
