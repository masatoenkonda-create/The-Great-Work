# Japan workshop plan — proposal for Claude

21 October 2026. Research/design only, following Claude's first pass and [Codex's review](CODEX_REVIEW.md). Claude reviews/reconciles before implementation.

**Takeaway:** “The pure chunks become one big crystal, and the crystal becomes thin wafers.”

**Four questions**
- Why: chips need a prepared single-crystal surface, not a bag of many small crystals.
- Where from: Germany's purified polysilicon; arrival items are chunks, a quartz crucible and a seed crystal.
- How: melt → seed and pull → cool → slice → finish and inspect.
- What it looks like: angular grey chunks → reflective melt → neck/shoulder/cylinder/tail → dull thin discs → mirror wafers in a slotted shipping box.

## Seven visual beats

| # | Player action | What changes on the objects | Aiko's current line |
|---|---|---|---|
| 1 | Install the crucible, then load chunks. | Quartz bowl seats inside the dark graphite support; the Germany container empties into it. | “Pure silicon, ready! Crucible first, then the chunks.” |
| 2 | Heat the charge; fit and dip the seed once molten. | Chunks settle into a melt. The seed holder lowers to its surface, and a narrow neck/shoulder begins automatically. | “The seed gives the growing crystal its orientation. Small seed, big job.” |
| 3 | Turn on rotation; balance heat and pull. | The chuck/crucible counter-rotate. New solid forms at the melt boundary; the grown body rises, a bright meniscus stays at the interface, and melt level falls. | “Keep the body steady as it grows. (Crystal growing rewards patience.)” |
| 4 | Finish growth and let it cool; transfer the body. | A tail forms, the crystal detaches and cools in the upper chamber. A supported transfer sets it horizontally; the ends are cropped and a short body section is ground to diameter with an orientation notch. | “One crystal! Cool it before we cut it. The narrow ends don't become wafers.” |
| 5 | Run the wire saw. | The supported section feeds into a moving parallel wire web with slurry/coolant. Several cuts advance together; separated discs remain supported for removal. | “One moving wire, wound into many cutting lanes. A whole batch of slices!” |
| 6 | Run finishing. | Carrier-held discs pass through edge/lap/etch preparation, rotating polishing pads and rinse/dry. Surfaces visibly become mirror-like. | “Slicing leaves damage. Finishing makes the wafer flat and smooth.” |
| 7 | Inspect, load the shipping box and dispatch. | One representative wafer moves under inspection light; a handler loads wafers into separate edge-support slots. The door closes and the box leaves for Taiwan. | “Blank wafers, ready for circuits. (The shiny side is not a coaster.)” |

These are beats, not seven new puzzles. Utilities, argon preparation and an installed controlled dopant addition are automatic; neck/shoulder/tail and finishing substeps are short animations. The player must see the tool/material contact and the intermediate states.

## The main puzzle

Body growth uses **HEAT −/+**, **PULL −/+** and a **ROTATE** on/off prerequisite. Keep tuning available during body growth, with obvious changing readings. Do not expose real pull-speed recipes.

| Condition | Visible feedback / Aiko | Game response |
|---|---|---|
| Not molten / heating | Chunks remain, then settle into the melt. “Still melting. The seed needs a liquid surface.” | Seed dipping unavailable until ready. |
| Rotation off | Chuck/support markers stop. “The rotation is stopped.” | Accepted growth pauses. |
| Excess heat | Meniscus/contact cue weakens; heat gauge warns. “The seed is melting back instead of building the crystal.” | Pause before permanent damage; adjust heat. |
| Insufficient heat | Front looks unstable; cool-side warning. “The melt is freezing too readily at the growth front.” | Pause accepted growth. |
| Pull too fast for the current thermal state | Diameter trend points narrower. “The growing section is getting too narrow.” | Pause before adding an unusable section. |
| Pull too slowly for the current thermal state | Diameter trend points wider. “The growing section is getting too wide.” | Pause before adding an unusable section. |
| Both in the teaching band, rotation on | Stable ring/body diameter; body length and growth gauge increase together. | Advance toward target; preserve progress after recovery. |

Implement qualitative coupled tendencies, not a validated heat-transfer solver. Exact detents/windows are game choices. Warning indicators can preview the interface trend; do not grow a bad segment and then magically straighten it. Necking intentionally follows an automatic different regime and is exempt from the body-speed rule.

## Equipment and panel

Fixed isometric workcell, plain background. Puller left/center, supported saw and finishing station to the right, shipping box at the exit. Keep the camera/scene dimensions stable as phases change. Compress the tall receiving chamber enough to retain the crucible/interface as the focal point.

Use J03 Fig.1 for the interior and J08 for the modern steel-shell silhouette. Show quartz bowl, graphite support, electric heater, lower hot zone, upper receiving chamber and seed holder. The body forms at its **lower interface** while existing solid rises; it is not a precast cylinder stretched out of a pot. Saw/finishing geometry follows J09 slide 14; omit its alternative FZ route and optional epitaxy.

Reuse the existing 480 × 400 cockpit and shared workshop components. Proposed contents:

- Lamps: crucible in, charge loaded, melt ready, rotation on, growth steady, finished, packed.
- Readings: heat, pull setting, body progress, diameter trend; during cooling use a clear hot/cool state. A 300 mm target can be a representative diameter label, not a claim about batch mass or machine scale.
- Controls: install/load, main heat, heat −/+, seed dip, rotate, pull −/+, start/finish growth, cut, finish, inspect, pack/ship. Combine automatic substeps rather than adding a control for every industrial unit operation.
- Guide: Aiko, one short current message, shared teal/amber frame and occasional joke. No instruction paragraphs in the panel or top step strip.

Finalize hotspot rectangles and an art spec after the UI layout is settled; do not alter Norway/Germany panel geometry to accommodate Japan.

## Output and results chain

Ship mirror-polished **blank** wafers in a front-opening shipping box (FOSB), edge-supported in separate slots. No bare piled discs or circuit patterns. Preserve `wafersProducedCount` for compatibility; 25 can remain a representative internal batch, not a real calculated yield.

Choose pause-and-recover for this build. All completed batches qualify; failed adjustment attempts do not add red dies later. Do not display a contamination/defect score that is not actually modeled.

If needed for the handoff, proposed process-status fields are `waferGrowthStatus: 'qualified'` and `waferSurfaceStatus: 'finished'`. They require explicit save-schema and downstream-reader work and are not present now. Never treat them as measured particle counts or proof of an atomically perfect crystal. Variable Taiwan defect consequences remain deferred until that model and reader are designed together.

## Shortcuts and source limits

Controlled growth is compressed from an industrial process into seconds. Automatic installed supplies replace argon/dopant handling, not the collected crucible/seed. Tail removal, grinding, edge work, lapping, etching and cleaning are condensed. Show a representative supported set of cuts/slots without presenting a full industrial yield. Wire kerf and process losses exist; don't claim zero waste. Reflection is a finish cue, not a defect assay. Blank-wafer inspection here is not Taiwan's electrical die testing.

Sources: J01–J05 and J08–J10 in [README.md](README.md). J03's diagram is in a CC BY 3.0 chapter; retain attribution if reused and check figure credits. Supplier/Siltronic photos and diagrams are reference material, not cleared game artwork. No exact SUMCO-site reconstruction or real operating recipe is proposed.
