# Handoff: Norway workshop research

Updated 21 October 2026 by Codex. For Claude or the next project session.

## User direction

- Rework all seven workshops for greater realism, starting with Norway.
- Gather Norway sources first, then review them together before improving the workshop.
- Explicitly keep decisions so Claude can continue.

## Decisions recorded

| ID | Decision | Reason |
|---|---|---|
| D01 | Research only; no gameplay changes | User requested source review first |
| D02 | Store detailed evidence in `research/norway/README.md`, link from SOURCES.md | Discoverable without renumbering existing records |
| D03 | Prefer original researchers, producer and equipment-supplier documentation | Need real apparatus and process evidence |
| D04 | Keep pilot and industrial references separate | Avoid silently mixing equipment scales |
| D05 | Retain mixed-alloy studies with explicit exclusions | Useful drawings do not validate FeSi properties for silicon metal |
| D06 | Record source context, corrections and gaps | Experiment-specific values are not universal industrial settings |
| D07 | Defer apparatus choice, recipe, controls, time and yield model | Requires the user's joint review |

## Completed

Eight annotated records N01-N08 with locators and limits. Three original PDFs N03-N05 and N01 schematic saved locally. Three PDF pages rendered and visually checked; copies in `previews/`. Pilot article correction checked. Current Norway code read to document game assumptions. No application source/assets changed.

N01 full PDF and N02 standalone image downloads returned HTML, despite successful HTTP responses. Invalid responses were excluded and temporary files removed. Use the verified online articles instead. N01 schematic download is valid.

## Continue from here

1. Read README.md and review its six-item source table with the user.
2. Resolve experimental apparatus versus industrial workcell. Neither has been selected.
3. Agree which omissions matter and how much detail remains playable.
4. Research exact site dimensions, recipe or control ranges if required; no full factory plans or OEM manuals were obtained.
5. Then implement approved changes, tracing claims to Nxx records. Label compressed time/scale and unvalidated simulation behavior.

## Code entry points

- `src/components/NorwayManufacturing.tsx`: process, controls, timings and output.
- `src/components/NorwaySmelterScene.tsx`: Three.js scene and animation.
- `src/components/StageIntro.tsx`, `src/content/dialogues.ts`: arrival and gathering.
- `src/components/Workspace3D.tsx`: workshop routing.
- Older `Stop1SmelterWorkspace.tsx` is not the active Norway implementation.

## Validation / repository state

Documentation/source collection only: application tests/build not required. PDFs validated with pypdf; selected drawings visually inspected after Poppler rendering. Poppler reported font/optional-content warnings, but inspected figures rendered legibly. Research does not validate the game's existing simulation. Changes left uncommitted for review.

Previous task started Vite on port 3000 and opened Chrome. This pass did not change the game server.

## Update 21 October 2026 (Claude)

The user chose to keep it simple. Claude recorded [WORKSHOP_PLAN.md](WORKSHOP_PLAN.md), a 7-step plan (mine, break, load, switch on, pour, cool and break, ship).

## Update 21 October 2026 (Codex review; latest instruction)

The user explicitly deferred coding and requested a final review of Claude's plan. [DESIGN_REVIEW.md](DESIGN_REVIEW.md) is the resulting proposal, awaiting user review. It retains all seven steps, specifies an industrial three-electrode furnace cutaway, corrects the melting-only implication and prioritizes minimal isometric 3D tools/materials over scenery. Its workshop direction supersedes older backdrop-first guidance for this proposed sample; no title/map changes are proposed. No game code or assets changed. Do not treat the earlier implementation instruction as authorization to start coding now.

## Update 21 October 2026 (Claude; implemented)

The user approved coding. DESIGN_REVIEW.md is now implemented in `NorwayManufacturing.tsx` and `NorwaySmelterScene.tsx`; see BUILD_NOTES.md. The user played it through and reported it works.

## Completion for now — user decision, 21 October 2026

Norway is complete for now. The final direction includes Claude's fixed cockpit/live furnace controls and Codex's single-current-message Sigurd box with warmer styling and light jokes. Those later approved changes supersede older exclusions of panels/parameters and accumulating message histories. Preserve the current implementation unless asked to change it.

The full reusable process is recorded in [WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md), linked from the main guidelines. Follow it for the other levels: primary-source research, minimal physical process, review before coding, visible 3D transformations, meaningful controls with recoverable failure, stable panel layout, concise current-step guide feedback and an asset specification. The user handles testing; record untested revisions accurately. No other level has been redesigned by this documentation task.

## Procurement prototype revision - Codex, 22 October 2026

User authorized engine improvements after playing Claude's loop-2 prototype. See ../../layers/NORWAY_PROCUREMENT_REVIEW.md and brainstorm turn 5. New source map/order/accepted-stock engine: src/content/norwaySourcing.ts; UI: NorwayProcurement.tsx. Supplied-feed mode skips mining/breaking and shows accepted quartz lot IDs; default loop-1 sequence retained. Ledger survives world-map navigation; reload persistence remains deferred. TypeScript and build pass; 43 tests pass. Browser/playtest not run; user tests. Leave uncommitted for Claude. Keep the next pass small: act on the user's playtest before extending the layer.

## Buying visuals and restored production - Codex, 22 October 2026

User likes Claude's selling/profit stage; preserve it. Restored a clickable supply map and simplified buying to one input/company at a time, with visible materials and a delivery illustration. Full mining/breaking/manufacturing restored at the user's explicit request, despite the sourcing abstraction. Review: ../../layers/NORWAY_BUYING_UI_REVIEW.md. Engine unchanged; 38 tests pass, typecheck/build pass. No browser/playtest; user tests. Uncommitted.

## Loop 2 supplier map - Claude, 22 October 2026

Loop 2 Norway is now a supplier map with a store panel (`NorwayProcurement.tsx`, engine `src/content/tradeEngine.ts`, market `src/content/norwayMarket.ts`); `norwaySourcing.ts` and `NorwaySupplyMap.tsx` were replaced. The loop-1 workshop is unchanged and must stay so (user). Loop 2 state and decisions: [layers/HANDOFF.md](../../layers/HANDOFF.md).
