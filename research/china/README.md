# China workshop: board assembly and final product evidence pack

Research started 21 October 2026 by Claude, following [WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md) steps 1–2. **Research only; no plan or code yet.** Codex is invited to add records (C09 onward). Decisions and open questions are in [HANDOFF.md](HANDOFF.md). **One decision belongs to the user: does China build a TV or a phone?** (HANDOFF D02.)

## What the research says, in player terms

| Question | Answer | Records |
|---|---|---|
| **Why do I need this?** | A packaged chip on its own does nothing. It has to be soldered onto a circuit board with the other parts it works with, and the board built into a product with a screen and power. | C01, C05 |
| **Where does it come from?** | Malaysia's packaged chip (solder balls underneath) plus a bare circuit board, solder paste and the product's other parts. China is the world's main assembly hub for electronics. | C01, C06, C07 |
| **How do I do it?** | Board line ("SMT"): print solder paste through a stencil → check the paste → a pick-and-place machine sets the chip on its pads → a reflow oven melts paste and balls together (peak around 240–250 °C for lead-free solder) → camera inspection, and **X-ray for the joints hidden under the chip** → final product assembly → power on and test. | C01–C05 |
| **What does it look like?** | A green board with grey paste dots; the chip dropped on top; a long tunnel oven; an X-ray picture showing the round solder joints under the chip; then the board disappearing into the product, and the screen lighting up. | C01, C04, C05 |

The core lesson: **you can't see the most important connections. They're under the chip, so the factory checks them with X-rays.**

## Records

### C01 — The board line (SMT) sequence

[Auburn University EMRL, SMT assembly](https://emrl.auburn.edu/?p=789) (university lab: stencil printer, 8-zone nitrogen reflow oven, optical inspection before reflow, X-ray after); contract-manufacturer overviews, e.g. [Sierra Circuits, PCB assembly process](https://www.protoexpress.com/kb/pcb-assembly-process-overview/) and [PCBOnline, SMT process](https://www.pcbonline.com/blog/smt-manufacturing-process.html).

**Supports:** stencil + squeegee print paste onto the pads → solder paste inspection (volume, height, position) → pick-and-place from reels/trays → reflow (preheat, soak, peak, cool) → automated optical inspection (bridges, misplacement, insufficient solder) → X-ray for BGA and other hidden joints.

**Limits:** one university page and industry blogs; step order varies a little between lines. Good for the sequence, not for numbers.

### C02 — Reflow temperatures

Vendor and industry notes, e.g. [Advanced Energy reflow profile](https://WWW.advancedenergy.COM/getmedia/c4265281-0e67-4bc7-85eb-2f9a61cf8c6a/lga50d_reflow_soldering_profil1538746335_techref.pdf), [Atlas PCB on BGA profiling](https://atlaspcb.com/blog/pcb-reflow-oven-profiling-peak-temperature-soak-bga-assembly).

**Supports:** common lead-free solder (SAC305) peaks around 240–250 °C, roughly 40–90 s above its 217 °C melting point; oven setpoints differ from the real board temperature, so lines profile with thermocouples; the goal is that every ball under the BGA melts and collapses into a joint. JEDEC J-STD-020 profiles are for classifying packages, **not** a board recipe.

**Limits:** vendor notes, not the standard. Use "about 240 °C" at most.

### C03 — BGA inspection and defects (IPC-7095)

[IPC-7095 (BGA design and assembly)](https://shop.ipc.org/general-electronics/standards/7095-0-c-english); [I-Connect007, roadmap to BGA standards](https://iconnect007.com/index.php/article/51622/roadmap-to-bga-standards/51625); [IPC/Agilent paper on 7095A voids](https://www.ipc.org/system/files/technical_resource/E16%26S16-02.pdf).

**Supports:** IPC-7095 is the industry standard for BGA assembly, inspection and repair; X-ray is used to see joints under the package; named defects include voids inside balls and **head-in-pillow** (ball and paste touch but don't fuse); revision C adds pad cratering and laminate defects.

**Limits:** the standard itself is paywalled; these are summaries. No pass/fail numbers adopted.

### C04 — Wire-bonded BGA vs. a phone's main processor

[AnandTech on SoC packaging](https://at-web1.www.anandtech.com/show/5688/apple-ipad-2012-review/13); [Semiconductor Engineering, mobile packaging](https://semiengineering.com/mobile-packaging-market-heats-up); [Exynos 990 teardown study (arXiv)](https://web3.arxiv.org/pdf/2502.16166).

**Supports:** smartphone application processors are typically **flip-chip**, usually with memory stacked on top (package-on-package), to save space and get more connections and better cooling. Wire bonding routes wires from the die edge, limits pin count and is the cheaper, conventional option.

**Use:** our Malaysia package (wire-bonded plastic BGA) is **not** what a modern phone's main processor looks like. It is believable for a cost-sensitive chip such as a TV's main processor. **Limits:** no source yet confirms TV main processors' package type (Codex question).

### C05 — Final product assembly and test

TV: [Patent CN112492304B background](https://patents.google.com/patent/CN112492304B/en) (an LCD TV = main board + T-con board + panel; some main boards integrate the T-con); [EIZO, how monitors are made](https://eizo.com/library/basics/making/index3.html) (power and main boards fitted after the panel is in its bezel, flat cables connected; screen check, then aging to stabilise and catch faults, then colour adjustment); [LG OLED factory tour](https://www.koreajoongangdaily.com/business/inside-lg-electronics-oled-operations/11734020) (accelerated aging checks colour and power of each TV).

Phone: SOURCES.md R11 ([Apple Supply Chain Innovation](https://www.apple.com/supply-chain/)): "iPhone assembly, China mainland".

**Limits:** monitor and OLED-TV factory accounts, a patent background; no specific Chinese TV line documented yet.

### C06 — China as the assembly hub

[Yicai Global (May 2023), China's status as the world's TV manufacturing hub](https://yicaiglobal.com/news/20230505-07-chinas-status-as-worlds-tv-manufacturing-hub-is-not-affected-by-china-us-trade-frictions); [Yicai Global, Hisense and TCL top Samsung and LG in Q4 shipments](https://www.yicaiglobal.com/news/chinas-hisense-tcl-top-samsung-lg-by-global-tv-shipments-for-first-time-in-fourth-quarter) (Omdia: Chinese brands about 43 % of global TV shipments in Q4 2024).

**Supports:** China is described as the world's TV manufacturing hub, and Chinese brands lead global TV shipments. Some production is moving to Vietnam, India and Mexico.

**Limits:** brand shipment share is not the same as where sets are assembled. Use "China builds a huge share of the world's TVs", not a percentage.

### C07 — Phone assembly in China

SOURCES.md R11 (Apple). The route's current location is Zhengzhou. **Limits:** no specific factory or brand should be named for our fictional product (UNIFIED_OPINION.md asks for neutral IDs, not "A18").

### C08 — Visual references (to collect)

For the scene: a stencil printer, a pick-and-place head, a reflow tunnel oven, an X-ray image of BGA joints, a TV main board. Codex to find usable reference images (as G08/J03 did).

## Existing game content checked against this pack

- **Arrival dialogue (`dialogues.ts`, stop 6).** Built around a **phone**: logic board, display, battery, "flies to America". The SMT line ("solder paste, then the chip, then through the reflow oven") is correct (C01). If China builds a TV, items and lines change (HANDOFF D02).
- **Old workshop (`Stop6AssemblyWorkspace.tsx`).** SMT tick-box, chassis checklist and "diagnostics" (power rail, bus comms, display sync) with timers. Phone serial `PHONE-A18-8842` is the Apple-style ID UNIFIED_OPINION.md asked to make neutral. To be replaced.
- **Route data (`route.ts`, stop 6).** "China · Phone", "Build a phone around the chip", Zhengzhou: phone-specific.
- **Next stop (USA).** Its arrival items are a phone box, charging cable and SIM card, so the product decision changes stop 7 too.
- **Carried input.** `selectedChipSerial` from Malaysia (wafer + die). China should carry it into the product's ID.
