# Unified opinion — The Great Work alpha

Updated: 20 October 2026  
Basis: [Codex review](CODEX_OPINION.md) and [Claude review](CLAUDE_OPINION.md).

This document merges the two independent reviews into one implementation direction. It replaces the previous unified opinion about the old Japan prototype. The independent reviews remain unchanged. Recommendations below are a synthesis, not a claim that both reviewers independently verified every finding.

## 1. Verdict and scope

**Keep this alpha as the foundation. Deepen the learning inside the existing route before adding features.**

The seven-stop journey, separate workspaces, input/equipment/output structure, save mechanism and familiar phone endpoint are useful foundations. Several tasks already provide failure explanations and retries. Simple shapes and limited simulation are appropriate for this prototype.

The central gap is that the player mostly operates a sidebar while a 3D machine illustrates the scene. The intended experience is to understand a process by acting on its material and seeing the transformation. More art, countries or industrial parameters would not close that gap.

Keep **one generic chip and one road**:

**Norway → Germany → Japan → Taiwan → Malaysia → China → user.**

This is a representative teaching journey, not a verified commercial itinerary for an Apple product. Keep node sizes, alternative routes, extra countries, management systems and additional chip families outside the next iteration.

## 2. What was actually verified

| Review | Basis | Verification |
|---|---|---|
| Codex | Game revision `3dfe038` | Bun installation, build and lint passed. Local browser: earned completion of stops 1–4, including some incorrect choices; inspected stop 5 and used demo completion to inspect stop 6. |
| Claude | Revision `bbfe372`, which added the Codex review | Source review; Bun installation, TypeScript check and production build passed. Build reported a large-chunk warning. No playtest. |
| This synthesis | Both opinion files | Documentation merge only. No additional playtesting or game-code changes. |

Codex stopped testing at Maxence's request. Stops 5–6 were not fully played, and the ending was not browser-tested. Replay, ending and timer defects below are code findings, not reproduced browser failures. Claude's comments about how interactions feel are inferred from code.

Codex also encountered an npm dependency conflict; the Bun workflow worked. Document the working setup rather than describing the project as unbuildable.

## 3. First priority: make the evidence honest

Both reviews identify the same serious problem: the in-game source register reuses reference IDs while changing what they mean.

| ID | Repository source register | In-game replacement |
|---|---|---|
| R11 | Apple supply-chain page / iPhone assembly | Generic industry manufacturing literature |
| R13 | WACKER polysilicon process account | Generic chemical engineering references |
| R14 | DNP photomasks | Wafer probe testing / unnamed standards |
| R15 | ASE package-substrate example | Broad Malaysia back-end claim |
| R18 | ASE/InvestPenang packaging and test in Penang | Final testing and burn-in / unnamed references |

The in-game records also lack source URLs. A “checked” date must not imply that these substituted claims were verified.

**Use one canonical claim/source dataset**, with the actual publisher, URL, supported claim and limitation. Render the panel from it and keep `SOURCES.md` consistent; do not maintain two independently edited registers. A short accurate panel is sufficient.

Separate:

- **Sourced facts:** what a reference actually establishes.
- **Representative scenario choices:** the selected country sequence and fictional lot.
- **Game assumptions:** controls, thresholds, durations, quantities and outcomes invented for learning.

A source establishing regional capability does not establish a particular supplier/customer relationship, factory itinerary or Apple chip. Use a neutral chip/phone identity instead of the `A18` serial. Source an exact facility pin or use a broader location; a fictional user location can remain explicitly a scenario choice.

### Correct the misleading numbers and wording

Codex confirmed the purification contradiction in both browser and code:

- The counter starts at 450 ppm, decreases by multiplication, then changes its displayed unit to ppb without conversion.
- It shows 0.78 ppb while certifying less than 0.1 ppb.
- “11 Nines (99.9999999%)” is incorrect: that percentage is 9N; 11N is 99.999999999%.

For this prototype, replace the recipe-like precision with a clearly labeled toy contamination scale and a consistent pass condition. Do not expand the chemistry simulation.

Likewise, remove unsupported operating windows, overlay tolerances, roughness, magnification and power settings. Keep a number only when it is useful and properly sourced, or explicitly a game assumption. Replace “atomic flatness” with “mirror-polished” and the unsupported “hermetically sealed” resin-package claim with “protected in molded resin.”

The broad process sequence is a useful foundation; that does not validate every number or technical explanation currently attached to it.

## 4. Fix the lot and progression before adding consequences

Both reviews find inconsistent campaign data. Repair these together:

| Problem | Required behavior |
|---|---|
| Completing an earlier stop can move progress backward while downstream results remain | Reviewing completed work is read-only. An explicit replay is isolated or consistently invalidates dependent output. Merely taking the maximum stop number does not protect cargo from being overwritten. |
| Stop 7 launches the app locally without recording campaign completion | Persist the completed ending. |
| Stage readiness is split between the shared shell and local components | Start each stage/retry from a defined checkpoint; do not inherit stale readiness. |
| Stop 4 stores a count, while stop 5 invents its own die map | Save one actual wafer-test result, including the die map, and reuse it downstream. |
| Demo output says 42 good dies; the reconstructed map shows 44 | Keep count, map and completion method consistent. |
| `|| 12`, `|| 25`, `|| 44` and fixed serials invent missing input or replace valid zero | Distinguish missing data from zero; show missing input explicitly. Derive identity from the lot. |
| Timers can outlive navigation or retry | Cancel pending callbacks and prevent stale work from updating another stage or a reset run. |
| Saved data has minimal validation and no version | Add a small versioned save format; handle incompatible saves explicitly. |

This needs one modest authoritative run state, not factory accounting software. Keep lot identity, stage results, completion method and wafer map together. Saving and resuming must preserve the same result rather than recreate it.

## 5. Main learning change: one visible action with one consequence

The reviews emphasize complementary weaknesses:

- **Codex:** the 3D material rarely changes with the task; most work remains in the panel.
- **Claude:** choices usually lead to fixed outputs and do not affect later results.

Address both in **one existing workspace first**, preferably Taiwan fabrication with its handoff to Malaysia.

A suitable next slice:

1. Show the wafer and a simple changing process view.
2. Let the player directly align or position something relevant.
3. Show the result of that action on the material.
4. Have one understandable mistake produce a visible defect in the simplified model.
5. Save that result in the wafer map.
6. In Malaysia, display that same map and reject selection of its defective dies.

This is an illustrative learning model, not a semiconductor recipe. State the simplification. Do not add arbitrary numerical precision to make it appear realistic.

A changing cross-section or clearly framed close-up can explain more than a detailed machine exterior. Drive the scene from the same state as the task. No visible hands, complex FPS controls or accurate machine internals are necessary.

Japan wafer-making is also a good candidate: show the ingot growing or slices separating. Choose one task to deepen first rather than partly rebuilding every stop.

### Keep the consequence model small

Claude proposes a shared quality value; Codex calls for meaningful controls. The synthesis is to start with **one specific carried result**, such as a simplified alignment defect and its die map.

Do not introduce an unexplained universal “quality” score that every stage raises or lowers. Distinguish the cause, the defect and the later test that detects it; downstream steps should not magically repair rejected material.

For each visible control, either make its effect understandable or remove it. For example, Japan's feed-tension selection currently does not affect slicing output; Codex confirmed this in the browser. Fixed auto-alignment and diagnostics may remain demonstrations when labeled accordingly.

## 6. Map, demo mode and ending

### Dependable geography

Codex observed repeated “API KEY REQUIRED” tiles on the default map. Claude independently identified the external tile dependency.

Preserve the geographic journey and seven markers. Provide a simple local world-outline fallback; a correctly configured live basemap can remain optional. Do not make another map redesign a prerequisite for improving the task.

### Explicit demo mode

The reviews differ in emphasis: Codex finds the labeled shortcuts useful for alpha review; Claude notes that permanent shortcuts bypass implemented tasks.

Keep them available through an explicit demo/development mode. Record and display when cargo came from a shortcut, including at later stops. Do not present demo output as earned production. Normal learning progression should use task completion.

### An ending connected to the actual run

First fix saved completion. Then, if time permits, show a short route recap using this lot's real history and results. Avoid a fixed success table that ignores what happened.

## 7. Cleanup and documentation

After the core repairs:

- Remove unused Japan-prototype runtime files and the retired generated infographic from shipped assets, after checking references.
- Preserve source notes and historical research; do not delete an entire asset folder simply because its PNG is retired. Git history retains the old prototype.
- Update `BUILD_NOTES.md`: the current map uses Leaflet tiles, not the claimed pixel-art terrain; orbiting a scene is not direct object manipulation; the source panel is not currently generated from `SOURCES.md`.
- Distinguish implemented features, checks actually run and behavior still unverified.
- Fix visible raw LaTeX arrows; clean up unused dependencies/template naming and dispose unused 3D resources as needed.

Audio, visual polish, additional cycles and performance tuning are secondary unless they prevent the chosen task from working.

## 8. Recommended next Gemini brief

Keep the next implementation request bounded:

1. Repair source records, purification contradictions and misleading technical wording.
2. Repair progression, ending persistence, timers and the shared wafer result.
3. Implement one spatial action with a visible consequence in an existing task; carry that exact result into the next relevant stop.
4. Provide reliable map geography and explicit demo provenance.
5. Update build notes to describe what was actually implemented and checked.

For the next review, verify that one lot retains its identity and die map across navigation and save/resume; completed-stage review cannot corrupt it; reset/retry cannot receive stale callbacks; the ending saves completion; missing input is not invented; and source links support their associated claims.

Then let Maxence assess the improved task: **can he explain what changed, why it changed, and what the next stage receives?**

That learning outcome is the measure of the next alpha. No additional playtesting was performed for this document.
