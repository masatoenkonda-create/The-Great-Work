# Germany review and build contribution

21 October 2026. Independent review of Claude's G01–G07 research, current Germany code and the revised [workshop workflow](../../WORKSHOP_WORKFLOW.md). Research and design only. Claude reviews this contribution before coding; no shared components or game files changed here.

## Verdict

Keep Claude's Siemens-process direction and the focus on rods growing thicker. The process is sufficiently grounded to plan a compact workshop. Avoid expanding every industrial operation into another puzzle. The proposed [WORKSHOP_PLAN.md](WORKSHOP_PLAN.md) answers the four player questions and resolves the build choices below for Claude to review.

The most useful contrast with Norway is: **Norway makes silicon metal with heat and carbon; Germany chemically converts it, separates impurities, then deposits silicon back onto rods.** Both levels end with grey pieces, so the intermediate transformation must carry the explanation.

## Corrections to carry into the build

| Baseline wording or assumption | Contribution |
|---|---|
| “Turn the silicon into a liquid” | Say “React silicon into a liquid compound we can purify.” This is not molten silicon. Show conversion → cooling/collection → liquid; later show vapor feed to deposition. |
| “Dirt stays at the bottom, pure liquid goes up” / “boil off the dirt” | Distillation separates by volatility; impurities can leave in lighter or heavier fractions (G09). Show separate reject outlets and a condensed product receiver, not a dirt filter or one universal dirty bottom. |
| All purification is achieved by one simple column | Use one compact two-column separation module as a teaching compression; do not claim that it reproduces the full industrial separation train. |
| “You can't scrub silicon clean” | Too absolute: surface cleaning is real and belongs at the end (G02). Say “Surface cleaning alone cannot remove the impurities inside.” |
| Replace nine nines with twelve nines in Greta's dialogue | Remove the numeric competition entirely. “Good for the smelter. Still too impure for a chip.” Keep WACKER's product claim in research, not the task instructions. |
| Rod temperature plus total gas flow as a universal good/bad combination | Separate total flow from composition. G05 supports excess precursor concentration causing gas-phase deposition; it does not establish that high total flow always fails. Use rod heat plus precursor proportion at a fixed simplified carrier flow. |
| Rough/popcorn rods mean low chemical purity | Surface morphology and chemical contamination are different. Do not calculate purity from roughness, heat errors or time spent adjusting settings. |
| Semiconductor polysilicon is visibly whiter/clearer than Norway silicon | Both can look grey and reflective. Show purification through the process, rod growth and clean handling, not a fictitious purity color test. |

G05 was rechecked directly: its description of current-heated rods and control variables is useful, but its examples are patent-specific. The “too hot/too fast → popcorn → lower grade” summary should not become a universal numeric simulation. Prefer a reversible teaching pause before accumulating any defective material.

## Answers to Claude's six research questions

1. **Reactor appearance.** G08 now supplies a local original patent and a visually inspected Figure 1. Use the dome, baseplate, rod supports, paired legs/top bridge, gas path and outlet. Omit the central startup heater and its patent-specific mechanism. One or two rod pairs are sufficient. Keep a metal exterior with an explicit front cutaway: a transparent domestic glass bell jar is not our industrial default.
2. **Failures and controls.** Rod heat and precursor proportion are a defensible two-control puzzle. Low heat: little growth; no precursor: no added silicon; excessive precursor: a schematic gas-phase powder cue; excessive heat: warning/paused growth. The thresholds and complete pausing are game rules. Do not claim that unsuitable settings literally make all chemistry stop. Recovery adjusts the controls, clears the schematic cue and resumes without erasing deposited silicon.
3. **Distillation appearance.** G09 supports the separation logic, but no site-specific column photograph was added. Use restrained generic vertical columns with an overhead condenser/receiver, base heating indication and distinct reject connections. It is a representative module, not a traced Burghausen layout. The receiver contains condensed liquid; the vapor is not “clean liquid rising.”
4. **Conversion.** Keep it as one load-and-run beat: Norway's actual lumps enter an enclosed mill, powder moves to a small conversion vessel, HCl is connected, and a condenser/receiver collects the compound. No additional temperature puzzle. “Convert” is a clearer label than a specialist reaction name. Do not substitute a SiCl4/H2 recycling reactor for direct silicon + HCl synthesis.
5. **Cleaning.** G02 PDF page 6 is now saved and visually inspected: an enclosed automated line, not evidence for a particular basket-dipping mechanism. Use a small enclosed tray-through cleaning/rinse/dry module as an explicit animation abstraction. No manual acid mixing or added collectible acid recipe. G02 establishes etch and rinse; the exact drying animation is a design convention.
6. **Purity scale.** Prefer a factual process label, “Purified,” after the separation gate, and “Clean-packed” after finishing. No ppb counter, five-star purity assay or heat-to-chemical-purity formula. If a future campaign needs variable contamination, base it on an explicit handling/separation choice and document that model separately.

## Existing code and continuity audit

- `Workspace3D.tsx` still imports and renders `Stop2PurifyWorkspace.tsx` around the Germany workspace branch. Its `buildWorkspaceStage` branch builds static equipment separately; replacing only the form leaves the old scene. Route Germany into the new manufacturing component as Norway is routed.
- The old form's rod temperature state is not an actual deposition control: the run advances by timer regardless. Its HCl-flow and reflux states also do not substantiate the advertised chemistry. Replace the old task rather than layering controls over it.
- The impurity counter multiplies a value, switches its display unit without conversion and later certifies a contradictory threshold. Remove the entire old counter and certification text.
- Arrival currently calls the Norway input “ground to powder,” although Norway ships lumps. Keep the three collected inputs, but show lumps first and mill them in Germany. HCl and hydrogen are separate gas supplies; the clear liquid is an intermediate created here, not a fourth arriving item.
- Map pitch, route summary, arrival, workshop and Japanese input must use the same material chain. Neither “gas” nor “liquid” alone describes every stage of trichlorosilane handling; use “convert to a silicon compound, distill, then deposit silicon from vapor.”
- `CargoState` has `polysiliconBatchKg` but no purity/contamination field. Adding a displayed purity label alone will not make it travel to Japan. The build must either add and save a small process-status field, or explicitly document it as pending; do not claim the downstream consequence exists already.
- Keep compatibility quantities internal. No fixed 12 kg → 10 kg readout presented as a sourced yield. Zero/missing input must not be replaced with a fabricated batch through `||`.
- Shared layout/panel/guide extraction is Claude's requested first coding step. Keep it limited to reusable rendering and preserve Norway's appearance and control behavior; do not generalize both countries' chemistry into one model.

## Workflow contribution

The reusable additions are **material-state continuity**, **control semantics**, and **evidence versus teaching rule**. These checks are added to the main workflow: trace solid/liquid/vapor at handoffs; state exactly what a control regulates; and keep material purity separate from appearance or score. This closes gaps discovered in Germany without making the other plans longer.

## Validation and limits

Inspected local code, Claude's notes, primary web records G05/G08/G09 and the producer's G02 PDF. Saved and rendered two original PDFs; visually checked the reactor drawing and cleaning-line photograph. No OEM construction drawings, validated dynamic kinetics or exact German facility layout obtained. G01's full narrative did not appear in the web extraction, so its detailed observations remain Claude's reported findings rather than independently reverified here. G03 PDF retrieval through the web tool timed out. The new evidence is enough for the simplified design, not a plant simulation. No build, typecheck or playtest was run; no game code changed.
