# Taiwan: independent review and contribution

21 October 2026. Research/design contribution following Claude's T01–T07. Read with the proposed [workshop plan](WORKSHOP_PLAN.md) and [wafer-map contract](WAFER_MAP_CONTRACT.md). Claude reviews these before building; this pass changes no application code.

## Verdict

Keep the layer-by-layer reveal, visual alignment and electrical probe map. This is where the journey gains its first genuinely positional output: **the tested wafer and its matching digital map**. Make that handoff work before adding exposure recipes, cleanroom scenery or more knobs.

The main improvements are a coherent DUV optical model, two visible patterning passes instead of a single “etch makes a chip” shortcut, and one saved result that Malaysia actually consumes.

## Corrections to the first pass

| Finding | Recommended treatment |
|---|---|
| Light through a mask, lenses, and a machine described as EUV | Choose representative **DUV projection lithography**. EUV uses a reflective reticle and mirrors. Do not mix their interiors. No branded/node-specific replica required. |
| “Print onto one chip area” | An exposure field can contain multiple dies. Show four representative fields, each containing several game dies. The wafer stage moves between fields. |
| One mask plus many layers | The arrival mask item represents a supplied reticle set. Each distinct patterned layer uses its corresponding pattern; show a reticle change before the overlay pass. Do not reuse the identical stencil forever. |
| Pattern appears as light cuts the wafer | Exposure changes resist chemistry. Development opens the resist; etching transfers those openings into the underlying film. Show those three distinct states. |
| Exposure burns away resist | Select positive-tone resist: exposed portions become developer-soluble. Light is not a drill or cutting laser. A temporary highlight is a schematic latent-image cue, not real resist fluorescence. |
| A single etched dielectric is a working transistor/circuit | Play a representative pattern-transfer pass, then a different overlay pass; compress the remaining device formation, contacts, wiring and finishing into an explicitly presented production montage. Neither one nor two etches alone make the complete chip. |
| Rainbow sheen identifies good chips | Thin-film/surface appearance is not an electrical assay. Keep patterned material visually separate from the digital pass/fail overlay, which appears only as testing supplies results. |
| Partial edge rectangles count as failed chips | Excluded/incomplete positions are grey/absent and are not tested or counted as failed dies. Genuine failures occupy active full die positions. |
| Yellow room as required scenery | Keep the approved plain workcell. Amber task lighting is sufficient; no new cleanroom backdrop. |
| A global alignment error gives a random corner pattern | Capture alignment per exposed field. A uniform offset within one field should cause a field-related teaching outcome, not four unrelated corners. No universal physical yield equation is claimed. |

## Answers to Claude's six questions

1. **Consequence: propose a bounded exception to pause-only.** Keep the earlier levels as accepted. For Taiwan, expose can commit a small visible field offset; severe offsets are blocked. Mei warns that the new features may miss the layer below. If the player continues, the measured map later reflects the affected field. Failed attempts are not scored: only the captured exposure settings matter. Allow a fresh-wafer retry before dispatch, preserving the input batch checkpoint. This is a proposal for Claude's review, not a silent rewrite of the workflow's default. If the reviewer retains pause-only, the map handoff is still mandatory but alignment will not create yield variation.
2. **Baseline failures: none required.** A clean teaching run may have every active die pass. Do not force four failed corners or claim every wafer necessarily contains failures. Default incidental-defect mask is empty. A later scenario may add reproducible incidental faults, but must identify them as game assumptions and keep them unchanged across re-probing. No Poisson model or arbitrary defect density needed for this sample.
3. **Upstream: defer.** Germany/Japan ship recovered qualified batches and currently save no quality fields. Do not penalize their controls retrospectively. Fabrication outcomes here may vary from this level's recorded field exposures; that is already a meaningful carried result.
4. **Second control: omit initially.** X/Y alignment is one understandable control family with enough interaction. Keep dose and focus as installed recipes. Adding both now would compete with the material-state lesson; they can be researched and added later if playtesting finds the task too thin.
5. **Saved map: version and validate it.** Store final statuses with stable row/column IDs, wafer/lot identity, notch orientation, field IDs and the exposure record. Derive both counts from the map. Malaysia must display that same geometry and refuse anything that is not a recorded pass. See WAFER_MAP_CONTRACT.md for the migration and integration requirements.
6. **Dialogue claims: drop the comparisons.** This generic chip has no sourced transistor count or feature dimensions. A large machine image is enough; the bus/virus comparison adds little. Suggested Mei: “Now we build the circuits, one patterned layer at a time.” / “Like photography—then chemistry. And a lot of repetition.” No need to research a precise count merely to retain a joke.

## Chosen physical model

Fixed isometric workcell: wafer carrier → small deposition/coat/develop modules → enclosed projection tool cutaway → etch/strip → probe station → output carrier. Simplify enclosure bodies but preserve the wafer path. Show a spin chuck and dispense nozzle, a reticle above projection optics with wafer on an XY stage, and probe contacts above a chuck connected to a tester.

Use one persistent **detail inset** within the fixed scene rectangle. It magnifies the current die cross-section and two-color alignment target; it does not change canvas size or create another full interface. Before the overlay task, expose/transfer a first reference pattern so there is a lower-layer feature to align against. A ghost reference on an untouched blank wafer would otherwise teach alignment to nothing.

The same cross-section must retain its film, resist and openings across actions. Deposition adds a film; coating adds resist; positive-tone development opens exposed resist; etch removes accessible target film; stripping removes remaining resist. The underlying layer remains. Not every industrial layer uses this exact subtractive sequence; the loop is a representative example.

A probe test applies electrical tests via contacts on pads. It neither looks for optical colors nor creates the defect. A moving highlight and colored map squares communicate recorded results; green/red are UI conventions, not paint applied to the wafer. Modern multi-site testing exists, but sequential single-site animation is adequate here.

## Outcome model for the proposal

The plan uses four representative exposure fields. Capture the offset **when each overlay exposure fires**. Zero teaching offset passes its representative contact geometry; a small committed offset makes a clearly shown contact miss and fails the active dies in that field. Large offsets cannot be exposed. All limits are enlarged game-space detents, not nm tolerances.

This deliberately exaggerated binary field rule is deterministic and easy to relate to the missed-contact inset. It is not an industrial overlay-to-yield model, and it does not assert every real overlay error fails all dies in a field. Do not use radial error rings, arbitrary random die failures or a percentage per button press. A global offset applied to every field should have a global consequence, not masquerade as local randomness.

Before exposing, alignment may be corrected freely. After exposing, do not silently change the recorded pattern when controls move. After etching, retry uses **another wafer**, with an explicit replacement animation; it does not heal the etched material. If the tested attempt has no good dies, shipping stays unavailable and the fresh-wafer retry is offered. Any positive pass count permits release or retry for a better outcome. No permanent campaign dead end or paid retry.

## Code audit and build scope

- `Workspace3D.tsx` still renders `Stop4CircuitWorkspace.tsx` and the old generic scene for stop 4. Route it to a dedicated manufacturing/scene pair, reusing the existing shared workshop layout/panel/guide and phase hooks. Preserve stops 1–3.
- The existing align button sets offsets directly to zero. Replace auto-align with directional nudges and a readable target. Unsourced nm labels and recipe-like precision should disappear.
- The old probe loop always fails indices 0, 7, 40, 47. Its callback passes only two counts. Store actual per-position results and use a map-bearing completion payload.
- `Stop5PackagingWorkspace.tsx` independently generates 48 positions and independently rejects the same four indices. Change only its wafer-map consumption, selection validation and lot-derived serial as part of this handoff; do not rebuild the whole Malaysia workshop yet.
- `CargoState` has counts but no wafer map. `storage.ts` uses a `_v1` key but validates only current stop and lot ID; a key suffix is not a validated schema version. Implement the contract's versioned load/migration and preserve missing/zero semantics.
- `App.tsx` currently advances from the active stop and can regress/overwrite results on replay. Finished-stage review must not re-release or replace a map. A deliberate Taiwan retry invalidates downstream packaging/phone results. Completion of Taiwan must save the map and derived counts atomically.
- Old exposure/probe timers are not consistently canceled and can be double-started. Give each attempt one animation/probe owner; clear it on return/retry. No shipping while any die remains untested.

## Validation and evidence limits

Reviewed existing code, primary ASML/TEL/ACCRETECH/resist-supplier material, and original wafer-test proceedings. Saved three valid original PDFs; rendered and inspected ASML PDF p.13 (printed 14), wafer-test PDF p.2 and resist-development PDF p.1. Poppler emitted annotation/font-substitution warnings; selected pages remained readable. NXP's overlay PDF was readable through the web tool, but direct download returned an access-denial page; no local NXP PDF is claimed. T07's secondhand equipment evidence is superseded by T09's producer page.

No exact TSMC line layout, generic chip electrical design, process recipe or calibrated overlay-to-yield data obtained. No application code, game assets, schema, tests or playthrough changed/run. Final instrument/hotspot art specification follows the approved and implemented layout, not this research pass.
