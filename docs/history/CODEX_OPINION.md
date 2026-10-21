# Codex opinion — The Great Work alpha

Reviewed: 20 October 2026  
Revision: `3dfe038becc7214039d03e2c1f24beb62bd40c7f`  
Purpose: independent first opinion for Maxence and Claude. This review does not change the game or expand its scope.

## Overall opinion

**Keep this version as the foundation for the next alpha. The single-road structure works; the main missing piece is learning through manipulating the process in 3D.**

The game now follows the intended seven-stop journey, gives each operation a distinct workspace, and connects raw material to a familiar finished product. That is a substantial improvement over the original Japan exhibit.

However, most “hands-on” work still happens in a narrow 2D controls panel. The 3D area usually displays a machine while buttons advance text, counters and timers. This provides an illustrated explanation, but does not yet deliver the spatial understanding Maxence asked for.

The next iteration should deepen one or two existing workspaces. More countries, routes, systems or decorative detail would not solve that central problem.

## What I checked

- Read the repository's guidelines, build notes, route/state code, source panel and six production workspaces.
- Installed the committed dependencies with `bun install --frozen-lockfile --ignore-scripts`.
- Independently passed `bun run build` and `bun run lint`.
- Ran that exact repository revision locally, separate from the existing AI Studio preview.
- Played stops 1–4 through their earned completion paths; tried an incorrect rock selection and a non-optimal slicing selection.
- Inspected stop 5 and used its clearly labeled demo completion to inspect stop 6.
- Stopped further playtesting at Maxence's request. Stops 5–6 were not fully played, and the ending was not browser-tested. Findings about those code paths below are static findings.

A normal npm install failed on an esbuild/Vite peer-dependency conflict. The committed Bun installation worked, so this is a setup/documentation issue rather than evidence that the game cannot build.

## What is already useful

- **One road, seven places:** the world journey is easy to explain and has not grown into a branching management game.
- **Separate input, tool and output areas:** a useful visual convention to retain.
- **Real progression within several tasks:** incorrect rock selection is rejected; some crystal-growth settings can fail; downstream substeps have prerequisites.
- **Better fabrication order:** coating and bake/develop are included, and the loop is explicitly representative.
- **Stable wafer-test demonstration:** the probe results do not randomly reroll within the task.
- **A familiar endpoint:** following a chip into a phone gives the industrial sequence a purpose.
- **Clear demo buttons:** useful for an alpha and for reviewing the entire route quickly.

Simple geometry, short animations and incomplete simulation are acceptable at this stage. The concern is what the learner can see and understand, not graphical realism.

## 1. Main design change: make the material transformation visible and actionable

**Highest learning priority.**

In `Workspace3D.tsx`, the stage 1, 2 and 6 substep callbacks are empty. The ingot reference is created but is not driven by growth progress. Stage 4 mainly changes the wafer's material color. The microscopic cross-section is a static text overlay rather than a visual model that changes with the operation.

In the browser, growing the crystal changed the sidebar progress gauge while the 3D machine remained essentially a display. The Inspection camera could fill the view with the outside of a large machine, obscuring the operation rather than revealing it.

For the next alpha, improve **one representative workspace**, preferably wafer-making or fabrication:

- Show the actual input object entering the relevant operation.
- Give the player one direct action: position, load, align, slice or inspect that object.
- Drive the 3D object's state from the same progress/result data used by the controls.
- Reveal the useful internal view: a growing crystal, separated wafer slices, or patterned material being removed.
- Show why the result passed or failed on the object itself.
- Frame the camera around the operation, not the machine enclosure.

This does not require visible hands, a complex FPS controller or accurate industrial machine internals. A small constrained interaction and an understandable before/after view would already achieve much more.

## 2. Restore the evidence chain before adding factual detail

**Highest factual priority.**

The in-game `SOURCES_REGISTER` in `src/types/route.ts:137–228` is a second, altered register. It is not an accurate representation of `SOURCES.md`.

| ID | Meaning in SOURCES.md | Meaning shown by the game |
|---|---|---|
| R11 | Apple supply-chain page / iPhone assembly | Generic “Industry manufacturing literature” |
| R13 | WACKER's polysilicon process account | Generic “Chemical engineering references” |
| R14 | DNP photomasks | Wafer probe testing / unnamed standards |
| R15 | ASE package-substrate example | Broad Malaysia back-end claim |
| R18 | ASE/InvestPenang packaging and test in Penang | Final testing and burn-in / unnamed references |

The panel has no source URLs in its data model, so the learner cannot follow these supposed citations. “Checked October 2026” makes this look more verified than it is.

**Recommendation:** maintain one canonical set of claim/source records and render it in the game, including the actual publisher, link and limitation. Do not invent new meanings for reference IDs. A short accurate source panel is enough; no elaborate research interface is needed.

The broad process direction is reasonable. These records do not prove that the exact fictional facilities or companies supply each other or a particular Apple chip.

## 3. Correct the purification results and remove unsupported precision

**Confirmed in the browser and code.**

At stop 2:

- The counter starts at **450 ppm**, multiplies by 0.12 on each pass, then switches its displayed unit to **ppb** after the third pass without a unit conversion.
- It displays **0.78 ppb** while the completion button certifies **less than 0.1 ppb**.
- It displays **“11 Nines (99.9999999%)”**. That percentage is 9N; 11N would be 99.999999999%.

Locations: `Stop2PurifyWorkspace.tsx:60–65, 226–252, 285–287`.

These are worth fixing even in an alpha because they directly teach an incorrect result. The simplest correction is to use a clearly labeled toy contamination scale and a consistent pass condition, rather than adding more chemistry.

The game also introduces precise temperatures, power levels, roughness and overlay values beyond the simplified brief. Keep only numbers that help the interaction, and label invented thresholds as game assumptions.

One wording correction: stop 5 calls a resin-molded package “hermetically sealed.” The checked package example supports a protective epoxy construction, not that sealing claim. “Protected packaged chip” is sufficient.

Primary reference checks: [WACKER process account](https://reports.wacker.com/2022/annual-report/sustainable-solutions/purity-is-our-recipe-for-success.html), [DNP photomasks](https://www.dnp.co.jp/our-business/innovation/case-studies/photo-mask.html), [ASE packaging example](https://ase.aseglobal.com/packaging-substrate/).

## 4. Give controls a consequence, or remove them

**A smaller interaction can teach more than several decorative controls.**

For example, `feedTension` in stop 3 changes the selected button but is never read by the slicing model. I selected “loose”; the same successful 25-wafer output followed.

Other operations are fixed sequences that always succeed: auto-alignment, package testing and phone diagnostics. Fixed demonstrations are acceptable when called demonstrations. They should not imply that a player has exercised a production skill or established a real quality result.

Keep one meaningful choice per task, make its effect visible, and simplify the rest. Do not turn this into an engineering-parameter simulator.

## 5. Protect progress and the lot when replaying stages

**Static code findings; these replay cases were not browser-tested.**

`App.tsx:22–48` always writes the next stop from the currently viewed stage. Re-completing an earlier stage can therefore move the campaign's current stop backward while leaving later completion flags, chip identity and phone output intact.

There is also no final completion callback in the stop-7 app-launch path: it changes local display state but never records stop 7 as completed.

Recommended behavior:

- Reviewing a completed stage does not modify the campaign.
- An explicit replay either stays separate from the main run, or invalidates dependent output consistently.
- Reaching the phone-use ending records completion and saves it.
- A stage retry begins from a defined checkpoint rather than inheriting leftover readiness flags.

The shared workspace retains readiness state across sequential stop changes, while individual stage components have separate local state. That split deserves cleanup before more mechanics are added.

Lot identity also needs stronger linkage: the cargo stores a good-die count, but not the wafer map. Stop 5 reconstructs its own fixed rejected-die positions. The demo wafer produces 42 good dies, whereas that reconstructed map has 44. Preserve one wafer result instead of recreating it downstream.

Hard-coded chip serials and `|| 44` / `|| 25` fallbacks should not replace real identity or a valid zero. This needs a small consistent state model, not full factory accounting.

## 6. Make the world map dependable

**Browser-confirmed usability issue.**

The default Voyager layer displayed repeated **“API KEY REQUIRED”** tiles instead of geography. The markers and road still worked, but the world context was missing.

`WorldMap.tsx:75–90` uses external tile providers without a map-unavailable fallback. Choose a working basemap configuration and retain a simple local outline fallback so the route is understandable without that provider.

I am not recommending a visual redesign here. A real geographic map is a reasonable direction; it simply needs to work reliably.

## Secondary cleanup, after the main changes

- Render arrows as actual characters instead of visible `$\rightarrow$` text.
- Keep placeholder provenance visible when later stages use demo cargo; recording completion method only in state is not enough for the learner.
- The “cross-section” should become a changing visual; remove unsupported “~2000x” precision.
- The old Japan code and generated PNG remain in the repository but appear disconnected from the new entry point. Treat them as historical leftovers rather than new content to restore.
- Update BUILD_NOTES.md to distinguish built features, tested behavior and aspirational descriptions. “Interactive 3D inspection” currently means orbiting a scene, not manipulating production objects.

## Recommended next direction

1. Repair source IDs and the purification contradictions.
2. Fix replay/ending state and the shared wafer-result record.
3. Make one existing 3D task communicate a real transformation through direct interaction.
4. Make the map dependable.
5. Let Maxence try that improved task and judge whether it explains the mechanism.

**Keep the seven-stop road. Deepen the experience inside it.** This alpha is useful enough to iterate on; its next gains should come from comprehension and consistency, not more features.

Only this opinion document is changed by the review. No game code has been modified.
