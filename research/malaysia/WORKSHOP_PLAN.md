# Malaysia workshop plan

**Status:** Codex proposal for Claude's review, 21 October 2026. Research/design only.

**Takeaway:** “The tiny chip needs wires, a small board and a protective body before it can join the phone.”

**Four questions**
- Why: protect the bare die and bring its tiny connections out to board-sized contacts.
- Where from: Taiwan's tested wafer and matching saved map; supplied laminate substrate, gold wire and molding compound. Tape, adhesive and solder balls are automatic station consumables, introduced visually when needed. Update arrival inventory only if they become player-collected inputs.
- How: cut, pick a passing die, attach, wire-bond, mold, add balls, test and pack.
- What it looks like: patterned wafer → square die on a small green substrate → fine gold loops → black molded cap → underside silver ball array → tray.

| # | Player action | What they see | One current Farid line |
|---|---|---|---|
| 1 · Separate | Load wafer onto tape frame; start saw | Clamped ring; blade/water follow streets; cut dies stay on tape; clean/dry finishes automatically | “Cut between the chips. The tape keeps them together.” |
| 2 · Pick & attach | Select a passing position; start pick | Same Taiwan map; pin below and vacuum collet above lift that die; adhesive dispense, placement pads-up and cure on substrate | “Taiwan tested the silicon. We pick a passing die from that map.” |
| 3 · Connect | Adjust force and ultrasonic drive; start bond cycle | Ready/risk cues respond; accepted cycle forms ball bond, loop and second bond; representative wires fan from die to substrate pads | “Pressure and vibration make the bond. Too much can damage the pad.” |
| 4 · Protect | Close mold; start transfer | Resin tablet, plunger and runner; resin fills closed cavity around loops; cured black cap opens; post-cure completes automatically | “Resin protects those wires. (Tiny connections, sturdy coat.)” |
| 5 · Add contacts | Start ball attach | Supported package turns underside-up; prepared ball array placed on lands; short reflow; one cutaway shows routing from wires to balls | “These solder balls will connect the package to the phone's board.” |
| 6 · Test & pack | Seat in socket; test; dispatch | Handler closes; contact/function indicators complete; laser mark and tray transfer; exact wafer-derived serial released | “Same die, now tested through its package. Ready for the board.” |

**The puzzle:** force and ultrasonic drive are two short detented controls, not exact recipe entry. Start at an unsuitable combination. Both influence one recipe-ready state; neither MAX setting is the goal. Heat and bond time remain fixed. Wrong settings block commitment and prompt one physical explanation; no consumed die, healed damage or invisible performance penalty. Freeze/capture the accepted setting pair during the short bond cycle. All ranges and thresholds are a teaching model, not M09's industrial values.

**Panel:** reuse fixed 480×400 cockpit. Short stage title, loaded/ready/busy lamps, progress ring, current map coordinate or serial, two bond controls, and stage-relevant action buttons. A map-overlay toggle helps picking. Bond controls have a stable place and are inactive outside bonding. No process paragraphs, step list above the scene, scrolling message log or recipe trivia. Keep layout fixed while enabling controls and changing lamps. The guide below holds one current contextual line, with amber warnings and teal progress; all frames keep their dimensions.

**Scene:** fixed isometric plain workcell; introduce only the active tool and handled material. Persistent detail inset inside the scene rectangle for tiny bonds and the routing cross-section. Eight representative loops are adequate; they do not assert an eight-pin chip. Keep active circuitry on top, balls underneath, and the same selected die through every stage. Visible carrier/gripper supports objects during turns and transfers. No factory background or premature art generation.

**Output handed on:** one tested, marked wire-bonded PBGA in a tray; `selectedChipSerial = chipSerial(savedMap, selectedPassingDie)` only on completed dispatch. Taiwan's map stays unchanged. China must use this serial and the underside ball interface; no fabricated fallback. See [CODEX_REVIEW.md](CODEX_REVIEW.md) for reload, missing-map and action-lock requirements.

**Shortcuts and limits:** one coupon represents strip/panel production; cleaning, cures, bulk transport and package singulation are compressed. Ball placement/reflow is generic equipment geometry. Selected marking order is representative. Test is a simple modeled production gate, not lifetime qualification or a guaranteed detector of every possible defect. This is a teaching package, not a branded smartphone chip replica. No new persistence schema is proposed.

**Build order:** material sequence and same-object continuity → map-driven selection → bond puzzle → fixed cockpit/guide → completion/reload integration. User handles browser playtesting. Art specification follows settled controls and layout.

**Sources:** [M01 cross-section](sources/M01-amkor-pbga-ds520.pdf), PDF p.2; [M09 bond experiment](sources/M09-gold-ball-bonding-2009.pdf), pp.2–5; [M10 pick mechanism](sources/M10-die-detachment-asm-2004.pdf), paragraphs 0002–0004 and PDF p.7 Figure 1; [M11 molding](sources/M11-towa-molding-2024.pdf), PDF p.29/printed p.28; M02/M03/M06/M12/M13 and their limits in [README.md](README.md).

## Claude's review and build decisions — implemented 21 October 2026

**Review of Codex's contribution:** accepted as proposed. The four saved PDFs are genuine (Amkor PBGA datasheet 3 pp., Jalar et al. 2009 8 pp., ASM die-detachment patent 12 pp., TOWA report 64 pp.). Checked: the Amkor page-2 cross-section labels mold compound, solder ball, via, die attach adhesive, die, wire bond, laminate and solder mask, and lists laser marking; the Jalar paper varied bonding force and ultrasonic current at fixed time and temperature (180 °C, 25.4 µm gold wire) and reports non-stick and smashed bonds. Pause-only bonding, no save-schema change, no hair comparison, no "hermetic", no invented clock/thermal readouts.

| Topic | Built as |
|---|---|
| Beats | Codex's six beats as seven actions: SAW → choose a green die on the map + PICK DIE → set force/ultrasonic + BOND → MOLD → BALL ATTACH → TEST → SHIP. Clicking the station or Space does the same (except choosing the die, which is a click on the map). |
| Puzzle | FORCE 1–5 and ULTRASONIC 1–5, starting at 1/1. Accepted: force + ultrasonic = 6 with neither at 5, i.e. 2/4, 3/3, 4/2 (coupled, and maximum is never right). Feedback: non-stick (too weak), too much force, too much vibration, too much together, ready. Wrong settings block BOND; nothing is damaged or consumed. Teaching values (`src/content/malaysiaControls.ts`, 3 tests). |
| Scene | `MalaysiaPackageScene.tsx`: dicing saw (wafer on tape in a ring frame; blade sweeps rows then columns with water drops; the wafer art shows the cut streets) → die bonder (frame moves over; ejector pin rises under the chosen die, vacuum collet lifts it; adhesive dispensed, die placed pads-up, cure glow; the picked die's spot stays empty on the tape) → wire bonder (capillary visits 8 die pads and 8 board pads, flame-off spark, gold loops) → transfer-mold press (upper mold closes, plunger pushes the resin tablet, black cap) → ball attach (package flips, 16 balls, reflow glow, flips back) → test socket (lid closes, green lamp, red laser marks the cap) → tray, ships right. One package object travels through every station. |
| Insets | WAFER MAP: Taiwan's saved map, same coordinates, notch down; click a ✓ die to choose; failed and excluded positions refused with a reason; the picked spot shows empty afterwards. PACKAGE CROSS-SECTION after M01: board with vias, glue, die, wire loops, mold cap, solder balls, then a dashed path chip → wire → board → ball. |
| Panel | 480 × 400 (`src/content/malaysiaPanel.ts`). Lamps: DICED, DIE PICKED, ATTACHED, BONDED, MOLDED, BALLS ON, TESTED. Gauges: DIE (chosen ID), BOND (READY / TOO WEAK / TOO MUCH), WIRES n/8, PACKAGE %, FORCE and U/S bars. |
| Output | `selectedChipSerial = chipSerial(waferMap, chosen die)` released only when the tray ships. Without a saved map the level explains it and blocks every action. |
| China | The fake `CHIP-LOT26-D28` fallback is removed from China's screen ("none yet: finish Malaysia"). Unreached old Malaysia code in `Workspace3D.tsx` still holds two demo serials; to clean up with China. |
| Text | Farid's wire line: "These tiny wires connect the chip to its little board." |

Not done yet: user playtest; Malaysia panel art spec; Farid portrait art (placeholder "F"); removing the dead old stop-5 code.
