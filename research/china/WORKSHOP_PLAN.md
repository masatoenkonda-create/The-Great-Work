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

## Claude's review and build decisions — implemented 21 October 2026

**Review depth (research standard):** Read: C17 Haier service manual cover and PDF pp. 31 (wiring photo: speaker, keyboard/remote, LVDS, backlight) and 35 (factory menu: 2-hour aging, white balance, colour temperature); the chassis is named after its MStar MSD3393 TV chip. Skimmed: C18 (2 pp.; profiling, predictive profiles, validation runs; "in control" wording). Not opened by Claude: C19 Yamaha pages, C20 TCL page, C11 profile preview (relied on Codex's records; Huizhou label rests on C20 as a lead for Claude). Codex's corrections accepted: head-in-pillow is non-coalescence of melted ball and paste, distinct from incomplete reflow; peak and time-above-melting are predicted results of heat and belt speed, not knobs.

| Topic | Built as |
|---|---|
| Beats | PRINT PASTE → PLACE (chip from Malaysia's tray, camera, then small parts) → set HEAT/BELT + FEED BOARD → X-RAY → ASSEMBLE TV → POWER & CHECK → PACK & SHIP. Clicking the station or Space does the same. |
| Puzzle | HEAT 1–5, BELT 1–5 (start 1/5). Predicted peak = 190 + 16·heat − 8·(belt − 3) °C; predicted time molten = 30 + 12·(heat − 1) + 18·(3 − belt) s. OK when peak 232–250 °C and time 30–90 s: 2/1, 3/2, 3/3, 4/4, 4/5 (hotter needs a faster belt). Feedback: not hot enough / too hot (warping, flux burns out) / too long / too quick. Feed is blocked until OK; settings frozen for the run. Teaching values (`src/content/chinaControls.ts`, 3 tests). |
| Scene | `ChinaTvScene.tsx`: board loader → stencil printer (stencil lowers, squeegee with paste roll, pads turn grey) → placement gantry (head picks the chip from the tray, camera flash, places it; 6 small parts follow) → reflow tunnel with three zones and side window (board glows mid-oven; the chip slides a hair straight as it melts: self-alignment, C13 §3.3) → X-ray cabinet with scan line → padded fixture: display module face-down, power board, our main board, 4 cables, cover; TV turns upright onto its stand; screen shows nothing → colour bars → moving picture; carton drops over it and ships. |
| Insets | Feed/oven: predicted temperature curve with the 217 °C melting line and target band; while running, a marker moves along it and a side view shows ball + paste becoming one joint. X-ray: dark solder balls, vias and fine bond-wire lines after C13 Fig. 7, swept by a scan line. |
| Panel | 480 × 400 (`src/content/chinaPanel.ts`). Lamps: PASTE, CHIP PLACED, SOLDERED, X-RAYED, ASSEMBLED, PICTURE OK, PACKED. Gauges: PEAK °C and TIME MOLTEN s (with bands), BOARD, TV, HEAT and BELT bars. |
| Input/output | Needs Malaysia's chip serial matching a passing die on the saved map, else blocked with a message. On shipping saves `tvChipSerial`, `tvSerial = TV-<chip>`, `isTvOperational: true`. |
| Save v3 | Per Codex's contract: phone fields removed; TV fields added; validation chain map → chip → TV; a v1/v2 save past China resumes at China with the chip kept (an old phone is never a TV); a chip not on the map resumes Malaysia; one backup per old version (`chip_journey_state_backup_v<n>`); one-time notice on the map. Replaying Taiwan, Malaysia or China clears everything after it, including completion methods (`resetFrom`). 7 migration tests. |
| USA | Minimum TV ending (`UsaHomeEnding.tsx`): unbox → fit stand → plug in → power on (picture plays) → recap of route and this run's lot, wafer, chip and TV IDs → finish. Needs a valid TV. Sam is now the repairman from the story. A full USA workshop pass can follow. |
| Text | Norway's first line, Malaysia's "fragile" line, China and USA arrivals, route stops 6–7 (China · TV, Huizhou, Guangdong; USA · Home) and page descriptions now say TV. Map marker position unchanged (map paths untouched; the tag shows only the country). Unused legacy files `src/content/stops.ts` and `src/types/game.ts` still mention a phone. |

Not done yet: user playtest; China panel art spec; Xiao Lin and Sam portraits (placeholders "X", "S"); removing the dead old stop-5/6/7 code in `Workspace3D.tsx`.
