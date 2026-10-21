# Malaysia workshop: handoff and decision log

Started 21 October 2026 by Claude. **Status: independent research and proposed plan complete; ready for Claude's review.** No game code changed.

## Codex second pass — 21 October 2026

**Current status: research and proposed plan complete; ready for Claude's review before implementation.** The first-pass status and open questions below are retained as history, not outstanding research requests.

- Read [CODEX_REVIEW.md](CODEX_REVIEW.md), [WORKSHOP_PLAN.md](WORKSHOP_PLAN.md) and M01 supplement/M09–M13 in [README.md](README.md).
- Added four original PDFs and five inspected page previews: PBGA construction, experimental bond controls, ejector/collet pick and transfer-mold diagram.
- Proposed six visual beats and a two-control force/ultrasonic bonding puzzle. Heat/time are installed; invalid combinations pause before committing damage. No new consumptive-failure model or save schema is proposed.
- Clarified adhesive placement/cure, substrate routing to underside solder balls, transfer versus compression molding, ball attach before final test, and qualification versus production test. Drop hair comparison and invented clock/thermal readouts.
- Preserve the working Taiwan-map pick and serial helper. Keep picked occupancy separate from electrical status. Release the derived serial only after test/dispatch; remove China's fabricated serial fallback during integration.
- Reuse shared workshop components. Next task: Claude reviews these choices, then builds within the authorized phase. Browser playtesting belongs to the user; panel art spec follows settled layout.
- Research/design files only. No app code or application tests changed/run.

## Where we are in the workflow (first-pass record)

| Step ([WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md)) | Status |
|---|---|
| 1. Look at what exists | Done (see "Existing game content" in [README.md](README.md)) |
| 2. Research | Claude's first pass done (M01–M08). **Codex to add and review.** |
| 3. One-page plan | Not started. Codex may propose it, as before |
| 4+ Build, puzzle, panel, playtest, art spec | Not started. Shared `src/components/workshop/` and `src/content/waferMap.ts` are ready to reuse |

## Decisions so far (Claude; Codex may challenge)

| ID | Decision | Reason |
|---|---|---|
| D01 | Research only for now | User instruction |
| D02 | Package basis: **wire-bonded plastic BGA** on a laminate substrate (one die, gold wire, black epoxy mold, solder balls underneath) | SOURCES.md R15, M01; fits China's solder-and-reflow step |
| D03 | Chain to show: tape-mount → blade dicing → **map-driven pick of a good die** → die attach → **wire bonding** → transfer molding → cure, mark, balls → **final test** → pack | M02–M07 |
| D04 | The pick reads **Taiwan's saved `waferMap`** (already wired); only `pass` dies can be picked; coordinates and notch exactly as Taiwan | M03 (SEMI E142 shared coordinates); WAFER_MAP_CONTRACT.md |
| D05 | Main visuals: the blade cutting streets with water spray; the bonder drawing a fan of wire loops from die to substrate; the black mold closing over it | Answers "what does it look like" |
| D06 | Text fixes: no "hermetic seal" (say "protected in molded resin"); no clock-speed or thermal readouts in final test | M05; UNIFIED_OPINION.md |
| D07 | Old `Stop5PackagingWorkspace.tsx` replaced, keeping only its map-driven pick logic | Button-count dicing, wrong seal claim, unsourced test values |
| D08 | Output to China: one packaged chip with its wafer-derived serial (`selectedChipSerial`) | Existing state; China reads it |

## Open questions for Codex

1. **The puzzle.** Candidates with real controls: (a) **wire bonding**: bond force / ultrasonic energy / heat; too little and the ball doesn't stick, too much and it damages the pad. Needs a primary source (a bonder maker such as Kulicke & Soffa, or a reliability text) for both failure modes; (b) **dicing alignment** to the streets, which may feel like a repeat of Taiwan's alignment; (c) **mold** temperature/time. Which is most real and most fun?
2. **Final test as a consequence.** Real: final test can fail a unit because of an assembly fault even when its die passed probe (M06). Option: if the bonding is done badly, the chip fails final test and the player picks *another* good die from the same map. That makes Taiwan's good-die count matter twice. Pause-only instead? Needs a cleaner source for "assembly faults are caught at final test".
3. **Pick mechanics.** A primary source for how a die is lifted off the tape (ejector pins from below, vacuum collet from above) and how the bonder skips bad dies.
4. **How many steps to show.** Suggest player actions for mount+dice, pick, attach+bond, mold, test+pack, with cure/mark/ball attach as one automatic beat. Agree?
5. **Marking and solder balls (M07).** Better sources if we show them.
6. **Verify or drop** "thinner than a hair".

## Update 21 October 2026 (Claude; reviewed and built)

Codex's review and plan accepted; build decisions at the end of [WORKSHOP_PLAN.md](WORKSHOP_PLAN.md). Code: `MalaysiaManufacturing.tsx`, `MalaysiaPackageScene.tsx`, `src/content/malaysiaControls.ts` (+ test), `malaysiaPanel.ts`; stop 5 routed in `Workspace3D.tsx`; China's fallback serial removed. Next: the user plays Taiwan → Malaysia.
