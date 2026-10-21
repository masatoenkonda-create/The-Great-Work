# China workshop plan

**Status:** Codex proposal for Claude's review, 21 October 2026. Research/design only. Product: TV, as recorded in the user's decision.

**Takeaway:** “The chip's hidden solder joints connect it to a board, and that board makes the TV work.”

**Four questions**
- Why: connect the packaged chip to supporting electronics, display and power.
- Where from: Malaysia's real serialized package; supplied main PCB/paste, complete LCD display module, power board and enclosure parts. Suppliers provide other components, speakers and software; this route follows one chip.
- How: print paste, place parts, reflow, inspect hidden joints, assemble and check the TV.
- What it looks like: grey deposits → package on a populated green board → solid hidden joints → X-ray reveals balls and wires → board inside a thin TV → moving picture and sound.

| # | Player action | What they see | One current Xiao Lin line |
|---|---|---|---|
| 1 · Print | Load PCB; start printer | Clamped board, registered stencil, squeegee stroke; stencil lifts to leave separate paste deposits | “Paste puts solder exactly where the connections belong.” |
| 2 · Place | Load Malaysia's tray; start placement | Vacuum head checks orientation and places the same marked package balls-down; supporting parts placed in a brief automatic beat | “Same chip. The balls underneath meet those paste dots.” |
| 3 · Join | Adjust heat and belt speed; feed when profile is ready | Fixed predicted board-profile inset; accepted conveyor run through preheat/reflow/cooling; joint detail shows wetting and solidification | “It needs enough heat, for enough time. Too much can damage the assembly.” |
| 4 · Look inside | Start X-ray inspection | Board enters enclosed station; monochrome inset reveals hidden solder array and Malaysia's fine wire loops | “Those are your wires inside. The bigger circles are the board connections.” |
| 5 · Assemble | Seat board/power module; connect harnesses; close | Face-down supported display module; boards secured, data/power/backlight/speakers connected; thermal parts, cover and stand fitted | “The board handles the picture. The power board feeds it and the backlight.” |
| 6 · Check & pack | Power/check; pack; dispatch | Fixture turns TV upright; brief warm-up, patterns and sensor adjustment, sound and moving image; same TV goes into carton | “Picture and sound. (A bit more useful than a loose chip.)” |

**The puzzle:** two detented controls, HEAT and BELT. Both change one simplified predicted board-temperature curve. Show a hot-enough band and sufficient/excessive exposure cue. A cold/too-fast or excessive-exposure combination blocks feed before the board enters. The guide names the physical risk. Capture the accepted settings for the whole run; changing controls cannot rewrite completed joints. Warm-up and cool-down are automatic. No actual recipe is claimed and no permanent failure model is added. See [review](CODEX_REVIEW.md) for cold-joint versus head-in-pillow semantics.

**Panel:** shared fixed 480×400 canvas; short current title, load/ready/busy/inspected/output lamps, heat and speed controls, compact profile readout and relevant action buttons. Stable control positions; inactive controls dim. Text explanation stays in the one-current-message guide box. No top step list or accumulating log. Scene, panel and message frames never resize with state.

**Scene:** fixed orthographic isometric view on a plain background. Printer → placement → short enclosed convection tunnel → enclosed X-ray; TV fixture replaces the active work area for final assembly. One fixed detail inset reveals joints/profile/X-ray in turn, without creating multiple dashboards. Warm color cues are schematic, not glowing-red molten silicon. Package orientation, wire/ball geometry and actual selected serial remain consistent.

**Output handed on:** `tvSerial`, `tvChipSerial`, `isTvOperational` only on checked and packed dispatch. Proposed ID `TV-${selectedChipSerial}`; derived traceability convention, not a real manufacturer's serial format. Save version 3 and old-phone replay rules are in [TV_HANDOFF_CONTRACT.md](TV_HANDOFF_CONTRACT.md).

**Shortcuts and limits:** generic LED-backlit LCD TV, complete incoming display module, separate power board/LED driver, compressed board population/programming/cures/transport. Representative assembly and accelerated checks; no life-test certification, factory replica or verified named wire-bonded TV SoC. Huizhou setting is supported by TCL's own manufacturing-base account. Update active route/arrival story and the minimum USA TV ending together; preserve historical logs.

**Sources:** C13 PDF pp.9–10, 13–14; C09–C11 thermal/wetting limits; [C17 TV wiring and factory settings](sources/C17-haier-lcd-tv-service.pdf), PDF pp.31, 35; [C18 profiling](sources/C18-heller-kic-profiling.pdf), PDF p.2; C19–C20 manufacturer references in [README.md](README.md). User tests the browser; panel art spec follows settled layout.
