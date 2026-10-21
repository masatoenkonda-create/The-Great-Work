# China workshop: handoff and decision log

Started 21 October 2026 by Claude. **Status: Codex review, independent research and proposed plan complete; ready for Claude's review before building.** No application code changed in this pass.

## Codex contribution — 21 October 2026

- Read [CODEX_REVIEW.md](CODEX_REVIEW.md), [WORKSHOP_PLAN.md](WORKSHOP_PLAN.md) and [TV_HANDOFF_CONTRACT.md](TV_HANDOFF_CONTRACT.md). Evidence additions C17–C20 are in [README.md](README.md).
- Kept the user's TV decision and Claude's stencil → placement → reflow → X-ray idea. Proposed six beats, a heat/belt-speed puzzle, automatic powered stabilization/adjustment and a moving-picture/audio payoff.
- Added two saved primary PDFs, four new inspected page previews, manufacturer printer/mounter references and a sourced Huizhou setting. Independently inspected the existing C13 X-ray image and relevant C09/C11/C13 text.
- Corrected cold/incomplete soldering versus head-in-pillow; separated oven settings, predicted board profile and measured temperature; retained cooling. X-ray inspection does not prove every electrical/lifetime property.
- TV architecture is an explicit generic LED-backlit LCD with complete incoming display module, supporting electronics and separate power/LED-driver board. A named TV SoC using our exact wire-bonded package is **not verified**; retain the package as a teaching simplification. The precise Chinese factory station order also remains unverified, with service/factory-adjustment evidence supporting a representative sequence.
- Proposed v3 `tvSerial` / `tvChipSerial` / `isTvOperational`, preserving valid progress through Malaysia but replaying old phone completion from China. Identified downstream replay invalidation and stale completion-method issues in current App/storage integration.
- The China build must update the active story and minimum USA TV ending together. Historical research logs stay historical; prior accepted machine implementations need no process redesign.
- No app code, app tests or browser playthrough changed/run. Next: Claude reviews these bounded choices, then builds in the authorized phase; the user playtests.

## Where we are in the workflow (Claude's second-pass record)

| Step ([WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md)) | Status |
|---|---|
| 1. Look at what exists | Done (README, "Existing game content") |
| 2. Research | First pass (search-only) rejected by the user as too thin; **second pass done on primary documents** (C09–C16: 7 PDFs saved and read, Infineon Fig. 7 rendered; an Analog Devices BGA note timed out). **Codex to add and review.** |
| 3. One-page plan | Not started |
| 4+ Build, puzzle, panel, playtest, art spec | Not started. Shared `src/components/workshop/` ready to reuse |

## Decisions

| ID | Decision | Reason |
|---|---|---|
| D01 | Research only for now | User instruction |
| D02 | **China builds a TV** (user decision, 21 Oct 2026). The chip becomes the TV's main processor on its main board; USA becomes delivering and plugging in the TV | Story (the man's TV broke); our wire-bonded package suits a TV better than a phone's main processor (C04); China is the TV manufacturing hub (C06) |
| D03 | Shared core: **board line**: stencil paste print → vision placement → reflow → **X-ray of the hidden joints** | C01, C13 |
| D04 | Main visuals: stencil/squeegee deposits; oriented placement and small self-centering during reflow; enclosed convection conveyor with cooling; X-ray inset showing balls and representative internal wires; TV assembly and picture/audio payoff | C13 §3.3, Fig. 7; C14; Codex review |
| D05 | Proposed puzzle: **heat setting and belt speed**, producing a predicted board profile with derived peak/exposure. Inadequate exposure risks incomplete reflow/wetting; excessive exposure risks warpage/flux exhaustion. Head-in-pillow can occur despite both solders melting. Gate before feed; no damage/healing loop or universal numeric recipe | C09–C11, C13, C18; Codex review |
| D06 | Final checks: **power on → aging → picture calibration → inspection**; no invented "bus comms" diagnostics | C05 |
| D07 | IDs: TV ID derived from Malaysia's chip serial; no "A18" | UNIFIED_OPINION.md |
| D08 | Old `Stop6AssemblyWorkspace.tsx` replaced, not extended | Phone checklist, unsourced diagnostics, Apple-style serial |
| D09 | Text changes needed (with the build): arrival items and Xiao Lin's lines to TV parts; route stop 6 name/pitch/summary to TV; USA arrival items and lines to TV delivery; `phoneSerial` / `isPhoneOperational` to TV equivalents with save migration | README "Existing game content" |
| D10 | Codex proposal: generic LED-backlit LCD architecture; do not identify our wire-bonded package as a verified named TV SoC | C15/C17 limits; CODEX_REVIEW.md |
| D11 | Codex proposal: Huizhou, Guangdong, as the fictional workshop setting | C20 manufacturer account; no factory/supplier replica claim |
| D12 | Codex proposal: v3 TV output fields and explicit migration/replay invalidation; preserve upstream evidence | TV_HANDOFF_CONTRACT.md |
| D13 | Include a minimum coherent USA TV ending with the China build; no phone inventory or default serials in active product flows | User's TV decision; identity continuity |

## Original questions for Codex (answered in CODEX_REVIEW.md)

1. **TV main processor package.** Find a datasheet or teardown showing a real TV SoC's package (MediaTek, Realtek, Amlogic T-series, MStar). If flip-chip, word Malaysia's package as a teaching simplification; if wire-bonded BGA exists for TV chips, cite it.
2. **TV line, not monitor line.** A primary account of a **TV** final-assembly line (ideally a Chinese maker: TCL, Hisense, Skyworth), to confirm C05's order and what the aging test looks like.
3. **Location.** Zhengzhou is a phone city. Suggest a sourced TV-manufacturing location (e.g. a TCL or Hisense base) or keep "China" region-level.
4. **Reflow puzzle bands.** C11 gives peak 20–30 °C above liquidus and 30–90 s above liquidus as normal. Confirm whether a two-control (peak + time) puzzle is a fair teaching model, and how to show warpage vs. non-joining before the board is committed (pause/recover).
5. **Reference images** (C08): stencil printer, placement head, reflow oven cross-section, TV main board layout.
6. **Save fields.** Propose TV names for `phoneSerial` / `isPhoneOperational` and how old saves migrate (the save format is v2 since Taiwan).
