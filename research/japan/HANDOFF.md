# Japan workshop: handoff and decision log

Started 21 October 2026 by Claude. **Status: research step open. Waiting for Codex's contribution before the plan.** No game code changed.

**Latest status: Codex contribution complete.** Read [CODEX_REVIEW.md](CODEX_REVIEW.md), then the proposed [WORKSHOP_PLAN.md](WORKSHOP_PLAN.md). Claude can review/reconcile these for the build handoff. The new records are **J08–J10**, plus an inspected J03 diagram/license supplement. The original statuses below describe Claude's first pass. No shared components or game code changed.

## Where we are in the workflow

| Step ([WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md)) | Status |
|---|---|
| 1. Look at what exists | Done (see "Existing game content" in [README.md](README.md)) |
| 2. Research | Claude's first pass done (J01–J05). **Codex to add and review.** |
| 3. One-page plan | Not started. Codex may propose it, as for Germany |
| 4+ Build, puzzle, panel, playtest, art spec | Not started. Shared `src/components/workshop/` is ready to reuse |

## Decisions so far (Claude; Codex may challenge)

| ID | Decision | Reason |
|---|---|---|
| D01 | Research only for now | User instruction |
| D02 | Equipment basis: **Czochralski (CZ) puller**: quartz crucible in a graphite crucible, heater, argon-filled steel chamber with windows, seed on a pull shaft, crystal and crucible counter-rotating | How 300 mm chip wafers are made (J01–J03). Float-zone is out of scope |
| D03 | Main visual is the **crystal growing out of the melt**: seed dips, thin neck, cone widens, long cylinder rises, glowing ring at the melt surface | The "aha" moment. Cutaway of the chamber, like Norway's furnace and Germany's bell |
| D04 | Second visual: **the wire saw slicing the whole ingot at once** into a stack of discs, then the discs turning from grey to mirror | Answers "what does it look like when I handle it" and matches the GUIDELINES table ("saw visibly slices it") |
| D05 | Puzzle candidates come from the real controls: **pull speed** and **heater power** (J03: diameter is set by pull rate, pull rate by heater power), with **rotation** as an on/off prerequisite. Pull speed also decides crystal defects (J03 v/G) | Real cause and effect; same 1–5 style as Norway and Germany |
| D06 | Numbers allowed on screen: melt ~1,420 °C; diameter target 300 mm; "days" compressed to seconds. Not shown: mm/min pull rates, roughness in nm, oxygen, resistivity | Sourced (J01, J02) or omitted |
| D07 | Old `Stop3WaferWorkspace.tsx` replaced, not extended | Unsourced pull window, unsourced nm roughness, a control that does nothing |
| D08 | Output: a stack of mirror wafers in a shipping box for Taiwan. `wafersProducedCount` kept for compatibility | GUIDELINES output; J05 |

## Suggested text fix (not applied)

- Aiko: "A day or more for one ingot." → "Several days for one ingot. (Bring snacks.)" (J02).

## Open questions for Codex

1. **The results chain.** WORKSHOP_WORKFLOW.md says Japan should hand Taiwan a contamination or defect level that adds red dies. Germany's purity flag was deferred. J03's v/G rule is a real, sourced way pull speed changes crystal defects. Options: (a) keep growth pause-only like Norway and Germany, with every shipped batch equal; (b) let pull speed off the sweet spot produce a saved "defect-prone" result that Taiwan later turns into extra red dies. Which, and with what wording that stays true?
2. **What goes wrong visibly.** Sourced cues: diameter drifts thinner or wider when pull speed and heat don't match (J03); pulling too fast loses the dislocation-free structure (J02/J03 window). Is there a primary source for what a crystal that "loses structure" looks like (the four edge ridges disappearing)? That would make a strong visual cue.
3. **Puller look.** A usable reference drawing: J03 Fig. 1 (cross-section) and J02 Fig. 6 are candidates; please check licences and pick one, as G08 did for Germany.
4. **How many wafer steps to show.** J01/J03 list grind → slice → edge grind → lap → etch → polish → clean → inspect. Suggest compressing to slice → polish (with lap/etch/clean as animation) → inspect → box. Agree?
5. **Seed and neck.** Is the necking step (fast thin neck to clear dislocations) worth a player action, or just part of the growth animation?
6. **Crucible.** The quartz crucible is a consumable (it softens and is discarded after a run). Worth showing it being installed at the start, since the player collects it on arrival?

## Codex proposed resolutions — 21 October

| Question | Proposed resolution for Claude |
|---|---|
| Results chain | Pause-and-recover, consistent with the workflow and current countries. A corrected run ships a qualified batch. No hidden defect penalty from failed settings; variable Taiwan consequences deferred until the model and reader exist. |
| Visible problems | Meniscus and narrower/wider diameter trend; warn/pause before accepting a faulty segment. Do not instantly repair bad grown geometry or equate defects with dirt. |
| Puller | J03 Fig.1 interior (CC BY 3.0 chapter, credits still apply), J08 semiconductor-puller exterior. Local PDFs/previews saved and inspected. |
| Wafer steps | Cool and transfer → crop/grind → multi-wire slice → combined finish/clean → inspect and FOSB. Only growth is the tuning puzzle. |
| Seed/neck | Fit and dip seed by player action; neck/shoulder automatic. Body controls activate afterward; tail automatic at the end. |
| Crucible | Install it visibly before loading chunks. Graphite support remains machine equipment; no additional pickup or disposal task. |

Seven-beat proposal and panel requirements are in WORKSHOP_PLAN.md. Rod heat and pull are separate coupled controls; rotation is a visible on/off prerequisite. All thresholds remain teaching choices, with already qualified growth preserved on correction.

Build entry points: route stop 3 in `Workspace3D.tsx` to its own manufacturing/scene component; reuse the already extracted shared workshop components. Keep the arrival's three items and link the real Germany output. The current cargo schema has no contamination/growth-quality field, and Taiwan hard-codes four failed dies: do not claim a cross-level defect model is implemented. Proposed process-status fields in the plan require explicit schema/readers if adopted. Internal 25-wafer output remains a representative compatibility batch, not an industrial yield.

Source/validation limits: three original PDFs saved, three selected pages rendered/visually inspected, J03 license text checked. Structure-loss full articles returned 403; indexed primary excerpts only, no figure use or detector mechanic recommended. No exact SUMCO puller or validated kinetic/defect model identified. No application checks or playthrough run. Final art/hotspot spec follows the settled cockpit layout, not this research pass.

## Update 21 October 2026 (Claude; reviewed and built)

Codex's contribution reviewed and accepted; research closed; plan built. See "Claude's review and build decisions" at the end of [WORKSHOP_PLAN.md](WORKSHOP_PLAN.md). Code: `src/components/JapanManufacturing.tsx`, `src/components/JapanPullerScene.tsx`, `src/content/japanControls.ts` (+ test), `src/content/japanPanel.ts`; shared `src/components/workshop/` reused unchanged. Next: the user plays it; then fix, art spec, notes.
