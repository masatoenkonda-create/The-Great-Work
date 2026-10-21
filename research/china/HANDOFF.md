# China workshop: handoff and decision log

Started 21 October 2026 by Claude. **Status: research step open (second, primary-source pass done). Waiting for Codex's contribution before the plan.** No game code changed.

## Where we are in the workflow

| Step ([WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md)) | Status |
|---|---|
| 1. Look at what exists | Done (README, "Existing game content") |
| 2. Research | First pass (search-only) rejected by the user as too thin; **second pass done on primary documents** (C09–C16: 8 PDFs saved and read, Infineon Fig. 7 rendered). **Codex to add and review.** |
| 3. One-page plan | Not started |
| 4+ Build, puzzle, panel, playtest, art spec | Not started. Shared `src/components/workshop/` ready to reuse |

## Decisions

| ID | Decision | Reason |
|---|---|---|
| D01 | Research only for now | User instruction |
| D02 | **China builds a TV** (user decision, 21 Oct 2026). The chip becomes the TV's main processor on its main board; USA becomes delivering and plugging in the TV | Story (the man's TV broke); our wire-bonded package suits a TV better than a phone's main processor (C04); China is the TV manufacturing hub (C06) |
| D03 | Shared core: **board line**: stencil paste print → vision placement → reflow → **X-ray of the hidden joints** | C01, C13 |
| D04 | Main visuals: stencil and squeegee leaving grey dots; the chip set down and **self-aligning** as the solder melts; a glowing tunnel oven; an **X-ray inset where balls show dark and Malaysia's bond wires are visible inside** (after C13 Fig. 7); then final assembly and the screen lighting up | C13 §3.3, Fig. 7; C14 |
| D05 | Puzzle with a sourced basis: **reflow profile: peak temperature and time above melting** (conveyor speed). Too cool or too short = balls and paste don't fully join (head-in-pillow, opens); too hot or too long = package warping/blistering and flux exhausted (head-in-pillow, graping). Pause/recover (adjust before the board enters), like other levels | C09, C10, C11, C13, C14 |
| D06 | Final checks: **power on → aging → picture calibration → inspection**; no invented "bus comms" diagnostics | C05 |
| D07 | IDs: TV ID derived from Malaysia's chip serial; no "A18" | UNIFIED_OPINION.md |
| D08 | Old `Stop6AssemblyWorkspace.tsx` replaced, not extended | Phone checklist, unsourced diagnostics, Apple-style serial |
| D09 | Text changes needed (with the build): arrival items and Xiao Lin's lines to TV parts; route stop 6 name/pitch/summary to TV; USA arrival items and lines to TV delivery; `phoneSerial` / `isPhoneOperational` to TV equivalents with save migration | README "Existing game content" |

## Open questions for Codex

1. **TV main processor package.** Find a datasheet or teardown showing a real TV SoC's package (MediaTek, Realtek, Amlogic T-series, MStar). If flip-chip, word Malaysia's package as a teaching simplification; if wire-bonded BGA exists for TV chips, cite it.
2. **TV line, not monitor line.** A primary account of a **TV** final-assembly line (ideally a Chinese maker: TCL, Hisense, Skyworth), to confirm C05's order and what the aging test looks like.
3. **Location.** Zhengzhou is a phone city. Suggest a sourced TV-manufacturing location (e.g. a TCL or Hisense base) or keep "China" region-level.
4. **Reflow puzzle bands.** C11 gives peak 20–30 °C above liquidus and 30–90 s above liquidus as normal. Confirm whether a two-control (peak + time) puzzle is a fair teaching model, and how to show warpage vs. non-joining before the board is committed (pause/recover).
5. **Reference images** (C08): stencil printer, placement head, reflow oven cross-section, TV main board layout.
6. **Save fields.** Propose TV names for `phoneSerial` / `isPhoneOperational` and how old saves migrate (the save format is v2 since Taiwan).
