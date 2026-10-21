# China workshop: TV main board and TV assembly evidence pack

Research by Claude, 21 October 2026, following [WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md) steps 1–2. **Research only; no plan or code yet.** The user decided China builds a **TV** (HANDOFF D02). Codex is invited to add records from C17 onward and challenge these. Decisions and open questions: [HANDOFF.md](HANDOFF.md).

**Revision note.** A first pass earlier the same day relied on web searches and industry blogs only. The user rejected it as too thin. This second pass is built on primary documents. Seven PDFs are saved in `sources/` and were read with pdftotext; one key figure is rendered in `previews/`. Blog-only claims are now marked as leads, not evidence.

## What the research says, in player terms

| Question | Answer | Records |
|---|---|---|
| **Why do I need this?** | A packaged chip on its own does nothing. It has to be soldered onto the TV's main circuit board, and that board built into a TV with a screen and power. | C01, C05 |
| **Where does it come from?** | Malaysia's packaged chip (solder balls underneath), a bare main board, solder paste, and the TV's panel, power board and back cover. China produced about 207 million colour TVs in 2024. | C01, C06 |
| **How do I do it?** | Print solder paste through a stencil → place the chip by camera → reflow oven: paste and balls melt together, and surface tension even pulls the chip straight → X-ray check of the joints hidden under the chip → build the board into the TV → power on → **aging** (run it to catch faults and settle the brightness) → calibrate the picture. | C01–C05, C09–C14 |
| **What does it look like?** | Grey paste dots on a green board; the black chip set on top; a long glowing tunnel oven; an **X-ray picture** where the solder balls show as dark circles and the chip's thin bond wires (from Malaysia) are visible inside; then the board vanishing into the TV, and the screen lighting up. | C13 (Fig. 7), C05 |

The core lesson: **the most important connections are hidden under the chip, so the factory looks at them with X-rays. And you can still see the gold wires you bonded in Malaysia.**

## Primary records (second pass)

### C09 — Head-in-pillow: when ball and paste melt but don't join

M. Scalzo, _Addressing the Challenge of Head-In-Pillow Defects in Electronics Assembly_, IPC APEX technical paper (Indium Corporation support referenced). [Original PDF](https://www.ipc.org/system/files/technical_resource/E7%26S15_02.pdf), [saved](sources/C09-ipc-hip-paper.pdf) (22 pp.).

**Locator:** abstract (p. 1); "Process issues" (p. 2); reflow section (pp. 3–4).

**Supports:** head-in-pillow = the paste and the BGA ball **both melt but do not join**; in cross-section "a head pressed into a soft pillow". Two main causes: **poor wetting** and **board or package warpage**. Poor wetting can come from oxidised balls, an inappropriate reflow profile or weak flux. Printing matters: poor registration or too little paste (insufficient deposits) can keep the ball from touching enough paste. Four reflow levers: ramp rate, time above liquidus, peak temperature, cool-down. Running **too hot** increases warpage: one OEM cut head-in-pillow by lowering the peak, finding they "had been running too hot for many years". Long reflow can exhaust the flux, giving head-in-pillow and "graping".

**Limits:** one support engineer's paper, cases not quantified for our board. Qualitative cues only.

### C10 — Head-on-pillow case study (phone maker)

C. Oliphant et al. (Research In Motion), _Head-On-Pillow Defect – A Pain in the Neck_. [Original PDF](https://www.electronics.org/system/files/technical_resource/E7&S30_01.pdf), [saved](sources/C10-ipc-head-on-pillow.pdf) (23 pp.).

**Supports:** an OEM's real investigation; plastic packages warp because a silicon die is embedded in plastic; smaller paste deposits and smaller balls plus warpage let the two solders melt apart. **Limits:** one company's case.

### C11 — Indium: reflow profile basics

E. Briggs and R. C. Lasky, _Best Practices Reflow Profiling for Lead-Free SMT Assembly_, Indium Corporation tech paper. [Copy](https://kicthermal.com/wp-content/uploads/2012/11/Best-Practices-Reflow-Profiling-98675.pdf.pdf), [saved](sources/C11-indium-reflow-profiling.pdf) (8 pp.).

**Locator:** "Reflow" section.

**Supports:** profiles are ramp-to-peak or ramp/soak/spike; in the reflow phase the two critical parameters are **peak temperature** (generally **20–30 °C above the alloy's liquidus**) and **time above liquidus** (typically **30–90 s**), which form the tin-copper intermetallic bond; cooling sets the grain structure; voiding, graping and head-in-pillow are profile-related defects.

**Limits:** paste maker's general guidance, not our paste. Lead-free SAC solder's liquidus is about 217 °C, so a peak in the high 230s to mid 240s °C (C02).

### C13 — Infineon: board assembly of BGA packages (main source)

Infineon, _Recommendations for Board Assembly of Infineon Ball Grid Array Packages_, rev. 4.0, 2020-11-09. [Original PDF](https://www.infineon.com/dgdl/Infineon-Board_Assembly_Recommendations-BGA-Package-v04_00-EN.pdf?fileId=5546d462580663ef015806ac2d7405f8), [saved](sources/C13-infineon-bga-board-assembly.pdf) (18 pp.); [Figure 7 preview](previews/C13-xray-14.png).

**Locator:** §3.1 stencil (p. 9), §3.3 placement (pp. 9–10), §3.4 reflow (p. 10), §6.2 X-ray (pp. 13–14, Fig. 7).

**Supports:**
- **Stencil:** paste is printed through a laser-cut stainless (or electroformed nickel) stencil; BGA apertures are circular; stencil 100–150 µm thick; Type 3/4 paste.
- **Placement:** automatic pick-and-place with vision, accuracy ±50 µm or better; fiducials on the board; centre BGAs by **recognising the balls**; placement force high enough but not so high it squeezes paste out and causes shorts. **The self-alignment effect from the surface tension of liquid solder helps form good joints.**
- **Reflow:** forced-convection oven; nitrogen helps but isn't required; follow the paste maker's profile; minimum conditions must reach solderability-test levels, maximum must not exceed the package's J-STD-020 rating.
- **X-ray:** automated X-ray inspection is for BGAs "whose terminations cannot be inspected properly by optical systems"; it finds poor soldering, bridging, voiding, missing parts, but not all broken joints. **Figure 7: an X-ray of a properly soldered BGA where "balls and bond wires as well as vias are visible".**

**Limits:** one package maker's recommendations; values are guidance, not our board's recipe. Figure 7 is a reference for our art style, not a licensed asset.

### C14 — NASA: BGA selection, assembly and X-ray

R. Ghaffarian (JPL), _NASA Guidelines for Ball Grid Array (BGA) and Die-Size BGA (DSBGA) Selection and Application_, 2022. [Original PDF](https://nepp.nasa.gov/docs/tasks/076-Packaging-Assurance/Guidelines-BGA-DSBGA-Ghaffarian-2022July20-CL22-3574.pdf), [saved](sources/C14-nasa-bga-guidelines-2022.pdf) (58 pp.).

**Locator:** §1 introduction (self-alignment benefit); §2.7 X-ray characterisation after assembly; assembly-defect passages (package blistering from overheating).

**Supports:** BGAs self-align during reflow; X-ray is needed to find shorts and sometimes opens; overheating can blister a package. **Limits:** high-reliability (space) context; stricter than consumer TVs.

### C15 — MediaTek TV processors (product brief)

MediaTek, _MT9980 / MT9686 / MT9685 / MT9675_ product briefs (hosted by ATSC). [Original PDF](https://www.atsc.org/wp-content/uploads/2021/01/MT9980-MT9686-MT9685-MT9675.pdf), [saved](sources/C15-mediatek-tv-soc.pdf) (4 pp.).

**Supports:** TVs have a dedicated **main processor (SoC)** that decodes video, runs the smart-TV software, drives the panel and handles HDR. That is "our chip's job" in the TV. **Limits:** marketing briefs; **no package type stated**. A reseller listing describes an MStar 4K TV SoC as a BGA but gives no detail (lead only). Whether real TV SoCs are wire-bonded or flip-chip is not established; see C04.

### C16 — IPC/Agilent: X-ray inspection of BGA voids

_X-ray Inspection of Voids in BGA Joints with Respect to IPC-7095A_, IPC APEX 2006. [Original PDF](https://www.ipc.org/system/files/technical_resource/E16%26S16-02.pdf), [saved](sources/C16-ipc-bga-voids-7095a.pdf) (4 pp.).

**Supports:** IPC-7095 is the BGA assembly and inspection standard; voids show in X-ray and are measured at the ball's package and board interfaces. **Limits:** 2006, measurement-method focus.

### C05 — TV/display final assembly, aging and calibration

- EIZO, [How monitors are made](https://eizo.com/library/basics/making/index3.html) (manufacturer factory account), and FlatpanelsHD's [factory visit, 30 June 2010](https://flatpanelshd.com/focus.php?amp=&id=1277885543&subaction=showfull): panel face-down → frame → into the bezel → **power board and main board** added → flat cables connect the power board and main controller → shield fixed → back cover and stand → powered on → camera checks the image → **aging** "for a short period" to check image retention, confirm the circuit boards work and stabilise brightness → automatic colour temperature, gamma, white balance and brightness adjustment → visual and audio inspection → packing.
- [LG OLED factory (Korea JoongAng Daily)](https://www.koreajoongangdaily.com/business/inside-lg-electronics-oled-operations/11734020): accelerated aging tests check colour accuracy and power supply of **each TV**.
- [Patent CN112492304B background](https://patents.google.com/patent/CN112492304B/en): an LCD TV = main board + T-con board + panel; some main boards integrate the T-con.

**Limits:** EIZO builds monitors, not TVs; the order is representative of display assembly, confirmed for TVs only by LG's aging test. No Chinese TV maker's line document found yet (Codex question).

### C06 — China's TV production

- National Bureau of Statistics of China, [Statistical Communiqué on the 2024 National Economic and Social Development](https://www.stats.gov.cn/english/PressRelease/202502/t20250228_1958822.html), 28 Feb 2025, Table 3: **colour TV sets 207.454 million units (+4.6 %)**; also mobile phones 1,669.5 million and integrated circuits 451.4 billion pieces.
- [TrendForce, 19 Nov 2024](https://www.trendforce.com/presscenter/news/20241119-12368.html): 2024 global TV shipments projected at **196.7 million**.
- [Yicai Global, May 2023](https://yicaiglobal.com/news/20230505-07-chinas-status-as-worlds-tv-manufacturing-hub-is-not-affected-by-china-us-trade-frictions): China described as the world's TV manufacturing hub; some production moving to Vietnam, India and Mexico.

**Limits:** production (NBS) and shipments (TrendForce) are different measures; don't compute a share. Say "China builds a huge share of the world's TVs".

## First-pass records (kept as leads)

- **C01 SMT sequence:** [Auburn University EMRL](https://emrl.auburn.edu/?p=789) (university lab: stencil printer, 8-zone nitrogen reflow oven, optical inspection before and X-ray after reflow) plus industry blogs. Now backed by C13.
- **C02 Reflow temperatures:** vendor/blog notes (peak about 240–250 °C, 40–90 s above 217 °C; J-STD-020 is a package classification, not a board recipe). Now backed by C11 and C13.
- **C03 IPC-7095:** standard summaries. Now backed by C16.
- **C04 Phone vs. TV packaging:** [AnandTech](https://at-web1.www.anandtech.com/show/5688/apple-ipad-2012-review/13), [Semiconductor Engineering](https://semiengineering.com/mobile-packaging-market-heats-up), [Exynos 990 teardown (arXiv)](https://web3.arxiv.org/pdf/2502.16166): phone application processors are flip-chip, usually package-on-package; wire bonding is the cheaper, conventional option with fewer pins. Supports the decision that our wire-bonded chip suits a TV better than a phone. TV SoC packaging itself remains unconfirmed (C15).
- **C07 Phone assembly:** SOURCES.md R11 (Apple). No longer used: the product is a TV.
- **C08 Reference images:** C13 Fig. 7 rendered; stencil printer, placement head, reflow oven and TV main board images still wanted.

## Existing game content checked against this pack

- **Arrival dialogue (`dialogues.ts`, stop 6)** is about a **phone** (logic board, display, battery, "flies to America"). Must change to TV parts: packaged chip, main board, panel, power board (or back cover). The SMT line ("paste, then the chip, then the reflow oven") is correct.
- **Old workshop (`Stop6AssemblyWorkspace.tsx`).** Phone chassis checklist, unsourced "power rail / bus comms / display sync" diagnostics, serial `PHONE-A18-8842` (Apple-style, flagged in UNIFIED_OPINION.md). To be replaced.
- **Route (`route.ts`, stop 6).** "China · Phone", "Build a phone around the chip", Zhengzhou, phone outputs. Change to TV; Zhengzhou is phone-specific (Codex: pick a TV-manufacturing location or keep it region-level).
- **USA stop.** Arrival items are a phone box, charging cable and SIM card: must become TV delivery and set-up, matching the story ending (plug in, the TV works).
- **Carried input.** `selectedChipSerial` from Malaysia. The TV's ID should be derived from it. `phoneSerial` and `isPhoneOperational` in the save are phone-named and need a TV equivalent or rename (with migration).
