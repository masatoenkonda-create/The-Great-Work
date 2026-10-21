# Workshop workflow: repeat Norway for every level

21 October 2026, **Supply Chain Gang**. Written by Codex, revised by Claude. Norway is done for now and is the reference. Use this file to build the other six workshops one at a time. For workshop work it overrides older milestones in `GUIDELINES.md` and the opinion files; the user's newest instruction overrides everything.

## The goal in one line

The player should think **"Oh, that's how it's done."** They get there by handling the material, working the machine and seeing the result, not by reading.

Every workshop answers four questions, and nothing more:

1. **Why do I need this?** (What this step adds to the phone.)
2. **Where does it come from?** (The input, and the stop before.)
3. **How do I do it?** (The machine and the one or two controls that matter.)
4. **What does it look like when I handle it?** (Shape, size and finish of input and output.)

If a detail doesn't help answer one of these, leave it out: purity percentages, recipes, process trivia and technical paragraphs stay in the team files.

## How a level is put together

Every stop has the same three parts, and they must agree with each other:

1. **Map**: a one-line pitch on the map card (`pitch` in `src/types/route.ts`).
2. **Arrival**: the guide talks and the player collects the inputs (`STAGE_INTROS` in `src/content/dialogues.ts`). The items collected here are exactly the inputs the workshop uses.
3. **Workshop** (built with this file):
   - left: a fixed isometric 3D workcell where the transformation happens
   - right, top: a fixed cockpit control panel
   - right, below: the guide box with one current message

## The workflow

1. **Look first.** Read the current code, research folder and build notes for the level. Keep anything the user already likes, and find the components that actually run (old unused ones still exist).
2. **Research briefly.** Use primary sources (producers, equipment makers, papers) to learn the real machine shape, inputs and output. Save links, page locators and limits in `research/<country>/README.md`. Reference images guide our geometry; they are not game art.
3. **Write a one-page plan** in `research/<country>/WORKSHOP_PLAN.md` using the template below. Plain words, short. Make the technical calls yourself and **don't ask the user technical questions**. Ask only about feel or direction. The user says go, then build without further permission requests.
4. **Build the physical sequence.** Simple 3D geometry, real contact: tools touch objects, materials travel from container to machine, the same material becomes the output. Nothing appears from nowhere. Get this working before polishing anything.
5. **Add one small cause-and-effect puzzle.** One to three controls that really drive the process (Norway: power level and electrode position). Wrong settings pause progress and never ruin the batch. The guide describes what is happening ("too cold", "the heat is escaping") but not which button to press.
6. **Fit the cockpit and guide.** Fixed panel layout: only lamps, gauge fills, readouts and button lights change. Feedback never resizes the 3D view. The guide box shows one current message, replaced when the step or machine condition changes.
7. **Hand over to the user to play.** Fix what they report in the same round.
8. **Write the art spec** once the layout is settled: panel canvas, every hotspot rectangle, portrait slot, and which overlays stay in code (`research/norway/CONTROL_PANEL_SPEC.md` is the model).
9. **Log it.** Add a short entry to `BUILD_NOTES.md` (what changed, what was checked, what's a placeholder) and update the level's handoff.

Work one level at a time and stop at the phase the user asked for.

### Review checks before the build handoff

Germany's second research pass added these reusable checks:

- **Trace material states.** Check every handoff from arriving object through intermediate solid/liquid/vapor to shipped output. A liquid chemical compound is not a melt, a vapor flow is not poured liquid, and a change of size needs a visible handling step. Align map, arrival and workshop wording.
- **Name what each control changes.** Temperature, total flow and mixture concentration are different variables. For every failure cue, record whether the relationship is sourced or a chosen teaching rule; do not turn one patent example into a universal recipe.
- **Separate purity, appearance and success.** Roughness, color or time spent trying controls is not a chemical assay. A pause-and-retry puzzle can legitimately produce the same qualified output after recovery. If downstream quality must vary, define an explicit choice and carry its real saved result; do not attach an arbitrary purity score to failed attempts.
- **Make the review usable by the builder.** Resolve technical choices in a short proposed plan, provide figure/page locators and source limits, and label generic geometry or omitted utilities as intentional abstractions. Do not leave a research questionnaire when the next task is coding. A reviewer can refine the proposal without restarting the research.
- **Bound shared-component work.** Reuse layout/panel/guide rendering while keeping each process model separate. Preserve the accepted reference level; generalization must support the new scene rather than become a whole-game rewrite.
- **Respect phase-specific control regimes.** A setting appropriate for startup, necking or finishing may be wrong during steady production. Apply a toy working band only to the phase it represents; automate brief specialist phases when they add no useful player decision.
- **Design recovery before drawing failure.** A pause-only model should warn before producing permanent faulty material. Do not show cracks, lost crystal structure or a misshapen finished segment, then visually erase them when a knob is corrected. Use observable interface/trend cues and retain already qualified progress.
- **Review committed errors explicitly.** Pause/recover remains the default. A per-level proposal such as Taiwan's committed overlay error must identify the commit point, visible warning, saved consequence and fresh-material retry before adoption. Do not silently add permanent penalties or pretend a processed object heals after a knob adjustment.
- **Carry positional results as data.** Define object IDs, coordinate/orientation conventions, untested/excluded/failed states and one saved result. Derive counts from it and implement the next level's reader with the producer. Old saves without that result need explicit migration/replay, not fabricated data.

## Rules that apply to every level

**Scene**
- Fixed orthographic isometric camera, plain background, readable lighting. Inputs, then tools, then machine, then output, arranged so the eye follows the process.
- Cutaways show hidden transformations, but the machine still looks like the real one from outside.
- Change materials through shape, motion and finish, not labels. Each level keeps its own process: not every machine is a furnace and not every output is an ingot.

**Control panel**
- Same 480 × 400 canvas for every level, so art and code stay consistent. Each level gets its own controls in its own `src/content/<country>Panel.ts`.
- Every control has a visible effect. Don't add pressure, temperature or sliders to fill space.
- Show the basics: inputs loaded, machine on, current setting, progress, output ready. The next useful button's light blinks.
- Short labels and units only. Explanations go in the guide box.

**Guide box**
- The level's guide (Greta, Aiko, Mei, Farid, Xiao Lin, Sam), with a stable frame and portrait under the panel.
- One current message, short and friendly, with an occasional joke in brackets after the real information. Same teal/amber visual family as Sigurd, with a different personality.

**Accuracy**
- The cause and effect must be true. Time, scale and handling can be simplified; note the shortcuts in the level's plan.
- Numbers on gauges are teaching values unless sourced, and must not be presented as real recipes.

## Reuse the Norway code, don't copy it

Before building Germany, pull the generic parts out of `NorwayManufacturing.tsx` into shared components:

- `WorkshopLayout`: scene on the left; panel and guide on the right.
- `ControlPanel`: draws lamps, gauges and buttons from a layout file.
- `GuideBox`: portrait, name and the current message.

Each level then supplies only its scene, panel layout, controls model and lines. Norway must look and play exactly the same after the move.

## Results carried between levels

The stops are linked by what the player produces (from `GUIDELINES.md`). Keep this chain intact:

| Stop | Output carried forward | Affects |
|---|---|---|
| 1 Norway | Silicon metal lumps | Germany's input |
| 2 Germany | Polysilicon chunks with a purity label | Defects in Japan, red dies in Taiwan |
| 3 Japan | Wafer stack with a contamination level | Red dies in Taiwan |
| 4 Taiwan | **The wafer map** (which dies are good or bad) | Malaysia refuses bad dies |
| 5 Malaysia | One packaged chip with a serial number | Goes into the phone |
| 6 China | A working phone | Delivered in the USA |
| 7 USA | A route recap of this run's real results | End |

Good play upstream should visibly mean fewer bad dies later. That is the game's payoff.

## Per-level plan template

Copy into `research/<country>/WORKSHOP_PLAN.md`:

```markdown
# <Country> workshop plan

**Takeaway:** "Oh, so that's how ..." (one sentence)

**Four questions**
- Why: ...
- Where from: ... (arrival items: ...)
- How: ...
- What it looks like: input ... → output ...

**Steps** (as few as the process allows)
| # | Player action | What they see | One line from the guide |

**The puzzle:** controls, the working condition, what goes wrong, how to recover.

**Panel:** lamps, gauges, buttons.

**Output handed on:** ... (and the state field it sets)

**Shortcuts and limits:** ...

**Sources:** ...
```

## Starting sketches for the remaining levels

Rough drafts to research and refine. Arrival items are the ones already in `dialogues.ts`.

- **Germany (Greta).** Silicon metal, hydrogen chloride, hydrogen. Turn the lumps into a liquid (trichlorosilane), boil off the dirt, then grow ultra-pure silicon back onto glowing rods in a bell-jar reactor, then break the rods into chunks. *Takeaway: you can't scrub silicon clean, so you turn it into a liquid, clean that, and grow it back.* Puzzle: rod temperature and gas mix. Output: polysilicon with a purity label.
- **Japan (Aiko).** Polysilicon, quartz crucible, seed crystal. Melt in the crucible, dip the seed, pull slowly while spinning, and a cylinder grows; saw it into thin wafers and polish them. *Takeaway: a chip starts as one giant perfect crystal, sliced like bread.* Puzzle: pull speed and spin. Output: wafer stack with a contamination level.
- **Taiwan (Mei).** Blank wafers, photoresist, photomask. Coat, align the mask, expose with light, develop, etch, then probe-test: each die turns green or red. *Takeaway: circuits are printed with light, like a photo.* Puzzle: alignment and exposure. Output: the wafer map.
- **Malaysia (Farid).** Tested wafer, substrate, gold wire, mold resin. Saw the wafer into dies, pick a good one (bad ones are refused), attach it, bond the gold wires, cover it in resin. *Takeaway: the chip is a tiny square, wired out and sealed in black plastic.* Puzzle: pick only good dies. Output: one packaged chip.
- **China (Xiao Lin).** Packaged chip, logic board, display, battery. Place the chip on the board, solder it in the oven, then snap the parts together in the right order, and the phone powers on. *Takeaway: the chip is one small part inside a phone.* Puzzle: order of assembly, oven heat. Output: a working phone.
- **USA (Sam).** Phone box, charging cable, SIM card. Unbox, power on, take a photo, and see the recap of the whole route. Probably no panel puzzle.

## Testing

- The user plays and tests in the browser; agents don't run playthroughs.
- Agents may run `npm run lint` (type check) so the user never gets a broken build, and must say what was not checked.
- Never claim something works because the code was written.

## Norway reference files

- Plan and design: [WORKSHOP_PLAN.md](research/norway/WORKSHOP_PLAN.md), [DESIGN_REVIEW.md](research/norway/DESIGN_REVIEW.md) (historical; the later cockpit and live controls replace its "no panel" rule)
- Sources: [research/norway/README.md](research/norway/README.md)
- Art spec: [CONTROL_PANEL_SPEC.md](research/norway/CONTROL_PANEL_SPEC.md)
- Code: `src/components/NorwayManufacturing.tsx` (workshop, panel, guide), `src/components/NorwaySmelterScene.tsx` (3D), `src/content/norwayControls.ts` (furnace model and Sigurd's feedback), `src/content/norwayPanel.ts` (panel coordinates)
- History: [BUILD_NOTES.md](BUILD_NOTES.md), [HANDOFF.md](research/norway/HANDOFF.md)

Next in the route: **Germany**. Start with the shared-component step, then Germany's plan.
