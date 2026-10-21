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
