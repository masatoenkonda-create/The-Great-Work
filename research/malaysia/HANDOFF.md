# Malaysia workshop: handoff and decision log

Started 21 October 2026 by Claude. **Status: research step open. Waiting for Codex's contribution before the plan.** No game code changed.

## Where we are in the workflow

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
