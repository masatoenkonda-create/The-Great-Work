# TV output and save migration: proposed contract

21 October 2026. Implementation guidance for Claude; no application code changed. Current code saves version 2 under `chip_journey_state_v1`; phone fields and completion still exist. This proposal introduces version 3 because the output product and proof of completion change.

## Identity and release

Add `tvSerial: string | null`, `tvChipSerial: string | null`, `isTvOperational: boolean`; remove phone fields from the new active type and persisted payload. Set defaults to null/null/false. `tvChipSerial` is the installed chip identity, not a second generated chip ID. Proposed deterministic TV ID is `TV-${tvChipSerial}`.

China's required input is a completed interactive Malaysia result, with `selectedChipSerial` matching `chipSerial(map, die)` for an existing passing die in the validated Taiwan map. Do not accept a serial just because it has a plausible prefix. Preserve Taiwan's statuses/counts; no new die is selected in China. Missing input returns a clear Malaysia recovery path; invalid/missing upstream map retains Taiwan recovery priority.

Local board/TV progress does not overwrite the shipped cargo. Only dispatch, after cooled reflow, inspection, assembly, powered checks and packing, saves all three output fields and stop 6 completion atomically. Disable duplicate dispatch and conflicting animations. Leaving mid-level restarts from the input checkpoint unless partial-state persistence is deliberately implemented. An X-ray lamp alone cannot set `isTvOperational`.

USA reads and validates this same identity chain; no hard-coded serial, phone conversion or independently regenerated TV. Store final checks as gameplay gates, not unsupported real measurement records. Placeholder completion remains explicitly placeholder and must not earn an interactive TV.

## Migration order

1. Back up original raw legacy data before rewriting; retain the existing untouched backup and avoid overwriting an earlier backup. If that slot already holds another version, preserve this raw v2 in a separate version-specific backup before migration. Keep the existing storage key so Continue finds the save.
2. Validate the envelope/version. Support the actual existing unversioned legacy format and version 2 explicitly; reject unknown future versions without destructively replacing their raw data. Do not merely change `SAVE_VERSION` to 3: today's normalizer rejects a nonmatching explicit version.
3. Apply upstream validation first. A save past Taiwan without a valid matching wafer map returns to Taiwan and clears stops 4–7 plus all chip/TV fields, preserving earlier work. A purported Malaysia result whose serial cannot be matched to a passing die returns to Malaysia, preserving Taiwan and clearing stops 5–7/results.
4. For otherwise valid v2 saves, preserve valid progress/results through stop 5. Clear legacy phone outputs and stop 6/7 completion/methods. If the save had reached China or later, resume at China; if earlier, keep that earlier position. **Never map `isPhoneOperational: true` to a tested TV.** Brief Continue feedback: “The final product is now a TV. Your chip is saved; assembly starts in China.” Show this only when that replay actually applies.
5. For v3, retain a completed TV only if it has valid upstream cargo, matching `tvChipSerial`, the derived `tvSerial`, operational true and completed stop 6. Broken or inconsistent output clears stops 6–7 and returns to China. Earlier valid saves stay earlier. Migration is idempotent.

Use a whitelist for current fields so spread-merging legacy objects does not silently retain removed phone flags. Validation is data consistency, not an anti-cheat system.

## Replay invalidation

Current `App.tsx` invalidates downstream results on Taiwan replay, but not on Malaysia replay. Fix this with the TV integration:

- Taiwan produces a new map: clear Malaysia, China and USA, chip serial and all TV fields. Retain only pre-Taiwan completion methods before applying the new stop-4 completion. Current use of `prev.completionMethod` after resetting would restore stale downstream methods; merge from the reset base instead.
- Malaysia dispatches a package again: invalidate China/USA completion/methods and all TV fields, then store its chip serial. Conservative replay invalidation is acceptable even if the same die is picked. Resume China so a previous end-of-route position cannot bypass rebuilding.
- China dispatches a TV again: invalidate USA completion/method, then release the checked TV. Resume USA.

Centralize these bounded resets rather than scattering field deletion in scene components. Extend `resetFromTaiwan` for the new TV fields. Update initial state, normalizer, completion updates, ending reader and any active demo paths together.

## Focused implementation checks

Meaningful cases for the later coding pass: valid v2 pre-Taiwan save preserved; completed v2 phone resumes China with the real chip retained; missing map resumes Taiwan; invalid chip resumes Malaysia; valid v3 TV survives reload; mismatched installed chip invalidates TV; Malaysia/Taiwan replay clears dependent product and completion methods; double dispatch does not create a second result. The user handles browser playthroughs. No tests were added or run in this research pass.
