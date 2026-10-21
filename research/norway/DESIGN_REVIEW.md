# Norway: final design proposal before coding

21 October 2026. Prepared for user review. **Design only; no game code or assets changed.**

This reviews Claude's [seven-step plan](WORKSHOP_PLAN.md) against the current Norway components and the [research pack](README.md). The user's latest instruction takes precedence over earlier requests to implement immediately: review this proposal first; coding comes later.

## What stays, what improves

Keep all seven steps. Their strength is the physical chain: take something out of rock, make it fit the machine, add another material, supply electricity, collect a liquid, let it become solid, send it onward. That is enough for the first sample.

Keep manual carbon loading, cheap retries, direct object interaction and one short instruction at a time. Remove the current pale-versus-dark sorting task: appearance is not a purity assay. Pale quartz and dark carbon can still be visually distinct because they are two identified ingredients, not good and bad rocks.

Improve four things:

- Make every action visibly act on its target: pickaxe hits rock, chunks fall into the furnace, the tap releases liquid, the cooled casting breaks into pieces.
- Replace the generic open box with a recognizable industrial submerged-arc furnace cutaway.
- Show heat **and carbon reaction**, so the lesson is not merely “melt quartz to get silicon.”
- End with metallic silicon lumps. A long single-crystal cylinder belongs to Japan, later in the journey.

## Visual direction

The playable scene is a **fixed orthographic isometric 3D workcell on a plain background**. No new illustrated backdrop, landscape, factory room, decorative pipes, NPC sequence or walkable environment is needed for this sample. Existing title/map artwork is outside this review.

Arrange the actual objects in a readable left-to-right chain: quartz outcrop and breaking pad → quartz/carbon loading containers → furnace → casting mould and breaking area → shipping bag. A small grounding surface and contact shadows are sufficient. Enlarge the furnace relative to the hand tools so it reads as heavy equipment, not a tabletop cooking pot; exact physical scale is not the lesson.

Show only the current interaction cue. Tools must exist visibly: pickaxe, hammer, loading scoop/container, power switch, remote tapping control and bag. They may animate directly without a walking character. A click acts on the object; a keyboard equivalent performs that same action. Do not make the player operate a separate dashboard while the scene plays an unrelated animation.

Material identity must survive each transition. Pale rough chunks, matte dark carbon, glowing liquid and angular silver-grey silicon need different shapes and finishes, not just different labels. Keep effects small enough that the material remains visible.

## The seven beats

| # | Player action | Required visual proof | One current instruction |
|---|---|---|---|
| 1. Mine | Use the pickaxe on a small exposed quartz outcrop. | Tool makes contact; a crack opens; one large rough pale piece separates and lands. The outcrop is an interactive resource, not scenery. | “Break a piece of quartz free.” |
| 2. Break | Use the hammer on that piece on the breaking pad. | The same large piece becomes several smaller angular chunks. Keep chunks, not powder. | “Break the quartz into smaller chunks.” |
| 3. Load | Tip the quartz container into the furnace feed opening, then tip the carbon container. | Both materials physically leave their containers and form a mixed charge inside. Give each an obvious destination. No automatic carbon. | “Load quartz, then carbon.” |
| 4. Power | Press the physical power switch after loading both ingredients. | Three electrodes are visibly embedded in the charge; localized heat appears lower down, the charge settles, a little off-gas rises toward the hood, and liquid silicon collects below. | “Switch on the electric furnace.” |
| 5. Pour | Activate the tapping control. | Liquid emerges from the low side taphole, follows a short sloping runner and fills the mould. The furnace stays upright. | “Release the liquid silicon into the mould.” |
| 6. Cool and break | Watch cooling, then use the hammer on the solid casting. | Orange fades to reflective silver-grey; only then does the hammer become available. The casting fractures into irregular metallic lumps with fresh angular faces. | “Let it cool, then break the solid silicon.” |
| 7. Ship | Put those lumps in the bag and send it. | Lumps leave the breaking area and enter the bag; the filled bag closes and leaves. Only this action completes Norway. | “Bag the silicon for Germany.” |

No seven-line explanation panel. A brief result line can replace the instruction at a useful reveal: **“Carbon helps remove oxygen from quartz.”** during reaction, **“This is silicon metal.”** after breaking, and **“Next: purify the silicon in Germany.”** at dispatch. The animation carries the rest.

## Furnace: enough realism to make the action believable

Choose a simplified **industrial three-electrode submerged-arc furnace**, not the single-electrode pilot apparatus. Use the supplier's silicon illustration, N04 Figure 10, as the silhouette reference; N02 explains the interior. This is representative equipment, not a reconstruction of one Norwegian site.

Required form:

- A broad round or faceted steel shell with a thick refractory lining. Remove a clearly bounded front wedge for the teaching cutaway; show the thickness of the cut edges so it reads as a section through a closed vessel, not an open fireplace.
- Three substantial cylindrical dark electrodes arranged in a triangle, with simple clamps and overhead support. Their lower ends enter the packed charge. Do not place three thin square rods in a straight row above an exposed pool.
- A visible top feed opening and one restrained hood/exhaust connection. These belong to the working machine, not background decoration. Keep their geometry clear of the active loading view.
- Mixed solid charge above, reaction glow below, and liquid collecting near the base. Preserve some solid charge while tapping; avoid turning the entire vessel into an empty bowl of orange liquid.
- A small low side taphole leading into the runner and mould. The player activates a remote control; do not depict a household faucet handle as the industrial tapping mechanism.

Electricity is the heat source. Carbon is a reactant. No wood fire underneath, spectacular exposed lightning between rods, boiling lava bubbles or whole-furnace uniform orange glow. Electrode movement can be slight; the important visual is contact with the charge, not a dramatic synchronized plunge.

The real route includes tapping into a ladle, metallurgical refining and casting. For this seven-beat sample, **retain direct runner-to-mould casting as an intentional compression**. Do not add another player task or imply that this output is semiconductor-ready. A ladle/refining system would be a later realism expansion if needed. This omission must remain recorded here, rather than being mistaken for a full industrial layout.

## Interaction and scope decisions

Use prepared feed portions for this sample. No ratio puzzle, numeric recipe, purity percentage, temperature entry or power tuning is required to understand the transformation. The power switch is the meaningful control. Later parameters should earn their place by changing a visible result; do not add sliders just to make the machine feel technical.

The next valid object gets a small highlight. Missing carbon leaves power unavailable with “Add carbon first.” Hot material cannot be hammered or bagged. A mistimed click leaves the objects intact and gives a short cue; no arbitrary failed batch or restart. Loading cannot duplicate materials, and repeated clicks cannot skip a transformation.

Keep both meaning and feedback in the objects: an empty feed container, embedded electrodes, a filling mould, a cold fractured casting, a filled bag. Avoid mass counters, purity badges, score systems and simulated yield calculations for this sample. Internal compatibility fields must not become fabricated player-facing measurements.

## Review gates for the later implementation

1. With explanatory text hidden, can a viewer follow rock → chunks → loaded ingredients → liquid → solid → lumps → shipment?
2. Do the tool strikes, transfers and pours visibly connect the actual source and destination, without material appearing from nowhere?
3. Does the furnace remain recognizable as a lined industrial vessel with three submerged electrodes and a low outlet?
4. Does the reaction show that carbon participates, rather than teaching that quartz simply melts into silicon?
5. Are the pale input rock and silver-grey output unmistakably different, including when neither is glowing?
6. Can the player finish through object actions with one instruction at a time, without a decorative backdrop or dashboard?
7. Does the Germany handoff clearly promise further purification, leaving the crystal ingot for Japan?

These are acceptance criteria, not passed tests. This review inspected code and the existing N04 preview; it did not run or playtest the game.

## Evidence and deliberate shortcuts

Primary references checked for this review: [Elkem's process account](https://magazine.elkem.com/is/material-science-insights/from-quartz-to-silicon-to-silicones/) supports carbon reduction, tapping, refining and later chemical purification; [N02's process study](https://link.springer.com/article/10.1007/s11837-022-05431-9) supports a descending solid charge, reaction zones, off-gas and low tapping. N04 Figure 10 in the local research pack supplies the industrial appearance reference. The apparatus drawing is a reference, not artwork to copy into the game.

Pickaxe mining, hand breaking, prepared portions, shortened time, compressed scale, the cutaway and direct casting are teaching choices. The switch starts a compressed production sequence, not a literal industrial cold start. The bag and Germany destination are scenario choices. No purity, production rate or operating recipe is validated by these animations.
