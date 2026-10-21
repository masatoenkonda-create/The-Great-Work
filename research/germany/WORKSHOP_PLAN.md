# Germany workshop plan — proposal for Claude's review

21 October 2026. Codex contribution following Claude's research. Ready for Claude to reconcile and build under the user's next handoff; no implementation in this pass. Read [CODEX_REVIEW.md](CODEX_REVIEW.md) for corrections and [README.md](README.md) for evidence.

**Takeaway:** “So you turn silicon into a compound you can separate, then grow purified silicon back onto hot rods.”

**Four questions**
- Why: impurities inside Norway's silicon metal must be removed before making chip wafers.
- Where from: Norway's silicon lumps. Arrival supplies: silicon metal, hydrogen chloride, hydrogen.
- How: convert → distill → deposit on heated rods → break and clean-pack.
- What it looks like: grey lumps → powder → clear compound → vapor feed → thick grey rod pairs → clean-packed sharp chunks.

## Steps

| # | Player action | What they see | Greta's current line |
|---|---|---|---|
| 1 | Load Norway's lumps and run the mill. | The bag empties into an enclosed mill; powder collects in its connected hopper. | “Your silicon is here! First, smaller pieces. Much smaller.” |
| 2 | Connect HCl and run conversion. | Powder is fed into a small closed vessel; a connected cooler collects liquid compound in a receiver. | “We turn silicon into a compound we can purify. This liquid isn't melted silicon.” |
| 3 | Run the separation module. | Two compact column cutaways show vapor rising, condensed liquid returning, rejects leaving separately and product collecting in a clean receiver. | “Boil, condense, separate. The impurities leave in other fractions.” |
| 4 | Connect hydrogen, heat the rods and admit purified precursor. Adjust two controls. | Vapor enters a metal-domed reactor; current heats thin inverted-U silicon pairs. Both legs and their bridge thicken outward. Wrong settings show a condition and pause useful growth. | “Silicon from the vapor grows onto those hot rods. Watch them thicken!” |
| 5 | Stop/cool, lift the dome and break the rods. | Feed shuts, glow fades, then the shell lifts. A gripper moves the solid rods to an enclosed breaking station; chunks collect in a clean tray. | “Solid silicon again! Let it cool, then break the rods. (Not with your elbows.)” |
| 6 | Run finishing, seal the bags and dispatch. | The tray travels through an enclosed clean/rinse/dry module; chunks enter an inner bag, then an outer bag, and leave for Japan. | “Clean, seal, and off to Japan. Next comes one big crystal.” |

These are six beats, not six independent puzzles. Conversion, separation and finishing have brief animated substeps. Keep a fixed orthographic workcell on a plain background; put most screen space and animation effort into rod growth. No room background or walking system required.

## The puzzle

Two controls: **ROD HEAT −/+** and **PRECURSOR −/+** (precursor proportion in a simplified hydrogen-containing feed). Gas connection and main power are prerequisite switches, not another tuning puzzle.

| Condition | Visual / guide feedback | Recovery |
|---|---|---|
| No heat / insufficient rod heat | Rods dark or dim; no useful growth. “The rods aren't hot enough yet.” | Increase rod heat. |
| Too little precursor | Gas connected but rod diameter barely changes. “Hardly any silicon is reaching the rods.” | Increase precursor. |
| Excess precursor | Small schematic powder cue in the gas space. “Silicon is forming in the gas instead of where we want it.” | Reduce precursor; cue clears. |
| Excess rod heat | Heat gauge warns; useful growth pauses. “The rods are getting too hot.” | Reduce heat. |
| Both in the chosen teaching bands | Rod diameter increases smoothly; growth gauge advances. | Hold settings until the target thickness. |

Use simple relative detents, not authentic recipe windows. This is a toy model of favorable deposition conditions; wrong settings pause progress before permanent defects are produced. No ruined batch, automatic quality penalty or “too many failed clicks = dirty silicon.” Preserve existing grown thickness on adjustment. Gas-flow/mix controls need visibly connected supplies; don't depict poured liquid landing directly on a hot rod.

## Machine and panel

Main reactor: opaque metal bell dome, thick baseplate, two bottom contacts per rod pair, top bridge, gas inlet/outlet and restrained cooling connections. Show one or two pairs through a deliberate section cut. Rods glow; the whole shell does not become orange. They thicken rather than pull upward into a crystal cylinder. G08 Figure 1 is the geometry reference; omit its special startup heater.

Keep Norway's layout: scene left; fixed **480 × 400** cockpit right; Greta's single current message underneath. Reuse shared rendering, with Germany-specific control data.

- Lamps: silicon loaded, HCl connected, compound ready, separation complete, hydrogen connected, growth ready, packed.
- Readings: rod heat with a working band, precursor setting, rod growth/diameter progress, reactor cool/hot state. No chemical-purity percentage. Use one unambiguous label per reading.
- Actions: load/mill, HCl connection/conversion, distill, hydrogen connection, main power, heat −/+, precursor −/+, cool/open, break, finish/pack, ship. The current action lights up; cooling and finishing can sequence automatically after their initiating action.
- Record final hotspot rectangles in the art spec after the layout is stable. Do not add all research operations as permanently competing buttons if one phase-specific action can represent them clearly.

## Output handed on

Polysilicon chunks, visibly sealed for Japan. Preserve `polysiliconBatchKg` for existing code compatibility. Proposed additional saved result: `polysiliconPurity: 'purified'` and `polysiliconCleanPacked: true`, emitted only after their process gates. Claude should reconcile names with the save schema and downstream readers during implementation. These labels record completed process steps, not measured purity or a variable-yield formula.

An all-or-pause puzzle produces a qualified batch after recovery, so every successfully shipped batch can have the same status. If later gameplay needs variable contamination, design that consequence explicitly; do not derive it from rod color or unsuccessful setting attempts.

## Shortcuts and limits

Mill, conversion, separation, cooldown and finishing are time/scale compressions. Water/cleaning supplies, cooling, startup heating and exhaust recovery are installed utilities, not extra arrival collectibles. Clear liquids and vapor are not visually distinguishable by purity; cutaway flow cues are illustrative. Two columns represent a larger separation train. A small finishing module represents a much larger enclosed line. No exact plant layout, bag mass, process yield, gas ratio, chemical recipe or universal hot/cold threshold is claimed.

## Sources

G01–G07 in [README.md](README.md) establish Claude's baseline. G08 gives the rod/baseplate/dome reference; G09 corrects separation logic; G10 reinforces clean handling. G02 PDF page 6 supplies a real cleaning-line photograph. G05 supports qualitative control effects. See the review for source-access limits. All machine/game thresholds remain design choices.

## Claude's build decisions — implemented 21 October 2026

Codex's plan was accepted and built. Where the build differs or fills a gap:

| Topic | Built as |
|---|---|
| Beats | Codex's six beats as eight panel actions: MILL → CONVERT → DISTILL → MAIN POWER (rod growth puzzle) → COOL & OPEN → BREAK → CLEAN & PACK → SHIP. Hydrogen connects automatically with main power. Every action can also be done by clicking its object in 3D or pressing Space. |
| Puzzle | ROD HEAT 1–5 and GAS MIX 1–5 (precursor proportion). Rod temperature eases toward 700 + 130 × heat °C; working band 1,000–1,150 °C, so only heat 3 works, and only mix 3 works. Order of Greta's feedback: too hot → too cold → warming up → too rich (dust in the gas) → too thin → growing. Growth pauses outside the band and keeps the thickness already grown. 8 s of good settings finishes the rods. Teaching values only (`src/content/germanyControls.ts`, 4 tests). |
| Scene | `GermanyReactorScene.tsx`: Norway's bag of lumps → enclosed mill → powder bin → converter with green HCl bottle and condenser into a clear receiver → two columns with lit sight strips; dark specks go to a top reject drum and a bottom reject drum, clear drops to the product receiver → reactor from G08 Fig. 1 (baseplate, four electrode holders, two inverted-U rod pairs, gas nozzles, steel bell with front cut away, sight glass, top port), blue H₂ bottle, power switch → enclosed crusher → tray through an enclosed cleaning tunnel → clear inner bag, outer bag and seal → ships right. |
| Panel | Same 480 × 400 canvas (`src/content/germanyPanel.ts`). Lamps: POWDER, HCl ON, COMPOUND, PURIFIED, H₂ ON, GROWING, PACKED. Gauges: ROD TEMP (green band), ROD GROWTH %, PURE LIQUID level, REACTOR HOT/COOL/OPEN, plus HEAT n/5 and MIX n/5 bars. No purity percentage. |
| Guide | Greta, single current message, shared `GuideBox`. No portrait sprite yet: the box shows a "G" placeholder. |
| State | No new save field. Every shipped batch is equally "purified" (pause-only puzzle), and Japan doesn't read a purity flag yet, so `polysiliconPurity` / `polysiliconCleanPacked` are **deferred** until a later level uses them. `polysiliconBatchKg: 10` is still sent internally for the existing code; it isn't shown. |
| Text | Arrival: the nines line is gone ("Good for the smelter. For a chip? Still far too dirty." / "parts per trillion" per G01), silicon arrives as lumps and is milled here, trichlorosilane is "a liquid compound, not melted silicon", distillation "separates the impurities out". Route summary says liquid trichlorosilane. |
| Old code | `Stop2PurifyWorkspace.tsx` is no longer reached (stop 2 now routes to `GermanyManufacturing`, like Norway). File left in place for now. |
| Shared code | `src/components/workshop/`: `WorkshopLayout` (+ `useActKey`, `useTimedPhase`), `CockpitPanel`, `GuideBox`. Norway moved onto them with no visual or behaviour change intended. Each level keeps its own process model. |

Not done yet: user playtest; Germany panel art spec (after the layout is confirmed); Greta portrait art.
