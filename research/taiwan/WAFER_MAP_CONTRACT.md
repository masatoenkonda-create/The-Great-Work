# Taiwan → Malaysia: proposed wafer-map contract

21 October 2026. Design handoff, not implemented code. Review alongside WORKSHOP_PLAN.md. This defines one canonical result so both stages stop inventing their own die maps.

## Geometry and identity

- One represented wafer per attempt, identified by parent `lotId` plus a persisted attempt number, for example `LOT-…-W01`. A retry creates a different wafer identity. Re-probing the same wafer does not.
- Layout version 1: 6 rows × 8 columns; zero-based row increases downward and column rightward in the UI, with wafer notch down. This is our game coordinate convention, not a claimed industry exchange standard.
- Die pitch is 1 game unit, centers `x = col - 3.5`, `y = row - 2.5`, circular wafer radius 4.3. A full die is active only if `(abs(x) + 0.5)^2 + (abs(y) + 0.5)^2 <= 4.3^2`. Thus 40 positions are active and eight are excluded. This is teaching geometry, not a real die-size/yield model.
- Field identity is the combination of top/bottom half (`row < 3`) and left/right half (`col < 4`). Each of four fields contains ten active dies. One field may contain multiple dies; it is not the same concept as a die.
- Die ID is stable, e.g. `r2c5`, within its wafer. Preserve the same notch and axes in Taiwan, saved data, dicing display and selection. Do not rotate/mirror the map independently of the wafer.

## Proposed result fields

`waferMap` is null before earned test completion. The final object contains:

| Field | Meaning |
|---|---|
| `layoutVersion` | 1 for the geometry above |
| `waferId`, `lotId`, `attempt` | Identity and parent lot |
| `rows`, `columns`, `notch` | 6, 8, 'down' |
| `exposures` | One frozen X/Y game-offset record per overlay field, plus layer/field IDs |
| `dies` | 48 entries: stable ID, row, column, field ID and final status |
| `testComplete` | True only after all active positions were tested |

Statuses during the attempt: `untested`, `pass`, `fail`, `excluded`. The saved released map has only pass/fail/excluded. A failure may retain internal cause `overlay` for the toy rule; cause is not an electrical tester's universal diagnostic capability. No invented measured voltages, transistor counts or chemical contamination values.

For this scenario, active dies in an overlay field with an accepted nonzero offset fail; active dies in a zero-offset field pass. Excluded positions stay excluded. These outcomes are finalized from committed exposure records and revealed by the probe animation. Do not paint anticipated probe pass/fail colors on the wafer before testing.

## Invariants and completion

- Exactly one entry per coordinate; IDs unique and inside bounds. Layout/active mask must match the version. Excluded cells cannot be selected or counted.
- Active total = count(pass + fail); good total = count(pass). `diesOnWaferCount` and `goodDiesCount` are derived from this map and saved in the same update, never maintained separately.
- Final `testComplete` requires no untested active positions and every field exposure record present. Partial test progress does not release output.
- No good dies means zero, not a fallback to 44. No input/map means missing, not a demo wafer.
- Ship requires completed processing, completed test and at least one pass. The map belongs to this represented wafer, not every wafer in the Japanese batch.

## Malaysia reader

Render from `waferMap.dies` and its coordinate convention, not `Array.from(48)` plus hard-coded bad corners. Once diced, the identities/statuses remain attached to the same positions. Permit pick only when the stored status is `pass`; refuse fail, excluded and missing. Derive the serial from lot/wafer/die identity rather than `CHIP-LOT26`.

Implement this small reader/pick fix together with Taiwan's producer so the handoff is actually usable before Malaysia's full redesign. If the reader is deferred, build notes must explicitly call the cross-level feature incomplete.

## Save version and old saves

Add a validated schema version 2 with an explicit nullable map and persisted attempt number. Validate object structure, supported layout, lot consistency, finite/in-bounds coordinates, allowed statuses, unique IDs, exposure records and derived counts. Do not trust a storage-key suffix alone.

Preserve the old saved JSON under its old key or a backup key before migration. For a valid legacy save that has not completed Taiwan, preserve earned earlier progress and initialize the map to null. For a legacy save claiming Taiwan or later completion without a map, preserve earlier results but resume at Taiwan and clear stage 4–7 completions/output/selected die/phone fields. Give one short resume notice that Taiwan must be replayed for its saved test map. Never infer die identities from the old counts or manufacture a map to preserve apparent progress.

Reject unsupported/corrupt future data with a clear restart/recovery path while preserving the backup. Exact migration code and UI copy belong to the build; this is a recommendation, not an applied migration.

## Navigation and retries

Completed-stage inspection is read-only. It must not re-release output, regress progress or replace downstream history. Explicit replay of Taiwan invalidates its map and all later packaging/phone outputs before starting a fresh attempt. A local fresh-wafer retry before dispatch clears only the current attempt's geometry/results and increments its identity. Clear active animation/test timers on retry, stage exit and unmount.

Retries are free teaching attempts, not counted industrial yield; a new physical wafer replaces the previous one visibly. Once a result is shipped, reopening the game preserves the exact map. No rerandomization on render, probe, reload or entering Malaysia.
