# Taiwan workshop plan — proposal for Claude

21 October 2026. Read [CODEX_REVIEW.md](CODEX_REVIEW.md) and [WAFER_MAP_CONTRACT.md](WAFER_MAP_CONTRACT.md). Research/design only; Claude reviews this proposal before building.

**Takeaway:** “Light defines a pattern, chemistry transfers it into layers, and testing tells us which chips to keep.”

**Four questions**
- Why: Japan's blank crystal surfaces need devices and connections before they become chips.
- Where from: Japan's boxed blank wafers; arrival supplies are wafers, photoresist and a photomask set.
- How: deposit/coat → project/develop → etch/strip → repeat with alignment → electrical probe.
- What it looks like: blank disc → coated surface → patterned resist → patterned material layers → chip grid plus a digital pass/fail map.

## Seven visual beats

| # | Player action | Visible material/machine action | Mei's current message |
|---|---|---|---|
| 1 | Load a wafer and connect the resist supply. | Handler takes an edge-supported wafer from Japan's carrier; a nozzle supply connects. Reticles enter their holder as a supplied set. | “A blank wafer, ready for its first patterns. Edges only, please.” |
| 2 | Start the first reference pass. | Film is deposited, wafer spins under a resist nozzle, and a brief bake follows. First reticle projects across four fields; development opens the resist, etch transfers openings, strip removes resist. | “Light changes the coating. Developer reveals the pattern; etching transfers it.” |
| 3 | Prepare the next patterned layer. | New film/resist appear through the same modules; reticle B replaces A. Inset shows new openings that must meet features below. | “New layer, new pattern. This one must meet the layer underneath.” |
| 4 | Nudge X/Y, expose each field, then develop/etch/strip. | Alignment marks shift in the inset; projection shrinks the pattern. Stage steps field by field. Each exposure freezes its local offset. The transferred contact meets or misses the lower feature. | “Line up the marks before each exposure. (Close enough is having a difficult day.)” |
| 5 | Run the remaining production sequence. | Compressed automated passes show additional device formation, contacts, wiring and finishing. The chip grid becomes more detailed while the layer inset grows. | “We repeat patterns and process steps to build the devices and their wiring.” |
| 6 | Start probe test. | Tester contacts pads while the wafer stage moves between active dies. Map changes from untested to pass/fail as each result arrives. | “Now we test. Looking shiny is not a qualification.” |
| 7 | Release the tested wafer, or try a new wafer. | Tested wafer goes into its carrier; matching digital map travels with its identity to Malaysia. Retry replaces the wafer visibly and resets the attempt. | “Malaysia gets this exact map. Green chips are the ones to pick.” |

Do not claim these two displayed passes alone fabricate the complete chip. The remaining process is a compressed montage, not a universal “same etch loop builds everything” recipe. The second pass's missed-contact inset is illustrative enlarged geometry, not a complete transistor design.

## Alignment puzzle and recovery

Keep only **X −/+**, **Y −/+** and **EXPOSE** as the tuning task. Focus/dose use installed recipes. Use visible enlarged marks and detents with no nm labels. Field A–D is the current exposure region, not a country or new mini-level.

- Aligned: marks centered, preview contact overlaps. Exposure enabled.
- Small offset: marks visibly displaced, amber warning: “The new contact will miss the layer below.” Exposure remains available; pressing it commits the shown error for that field.
- Large offset: severe mismatch; exposure blocked until the marks are closer. This avoids a meaningless off-wafer exposure.
- Moving controls after exposure cannot repair that exposed field. Keep the recorded offset and physical pattern. No pass/fail colors until electrical testing; warnings are process predictions.
- A committed small miss becomes failed active dies in that exposure field after the automated remaining process and probing. This is a deliberately exaggerated deterministic game rule, not a sourced yield equation.
- At test completion, allow release if at least one die passed, or **NEW WAFER** to improve results. If none passed, offer the same free retry and block release. Fresh-wafer retry consumes no campaign resources in this sample, but replaces the physical wafer rather than “healing” it.

This is a proposed Taiwan-specific exception to earlier pause-only puzzles, for Claude to review. The default workflow stays pause/recover elsewhere. No arbitrary penalty for failed clicks or time spent aligning. No automatic replay of probe test to reroll results.

## Shape, light and UI

Plain-background fixed isometric workcell. Compact track modules, a **DUV projection** cutaway (reticle, lenses, moving wafer stage), a restrained plasma-process cue, probe card/chuck and wafer carrier. Amber task lighting is sufficient; no room illustration. Do not put EUV mirrors/tin source into a light-through-mask lens diagram.

Keep one fixed detail inset in the scene: the same magnified wafer section persists through exposure, development and etching. Use separate colors for film, resist and lower features; expose changes the resist's schematic latent image, develop opens it, etch removes target film, strip removes the remaining mask. Visible rays and exaggerated layer thickness are explanatory overlays.

Reuse the **480 × 400** cockpit and Mei's single-message teal/amber guide box:

- Lamps: wafer in, resist ready, reference complete, overlay aligned, patterns complete, test complete, map saved.
- Readouts: current layer/field, X/Y target, wafer processing progress, good/tested count. Untested is not fail.
- Buttons: load/supply, start layer, four nudges, expose, process, run remaining layers, probe, new wafer, ship. Combine sequential automatic actions; do not add a button for every research term.
- A live wafer-map inset in the probe station is the output visualization, not another explanatory sidebar. Green/check = pass, red/cross = fail, neutral = untested, grey dash/absent = excluded. Never rely on color alone.

Finalize exact hotspots after the panel is settled. Preserve the working layout and shared component APIs where possible.

## Result and integration

One representative processed/tested wafer plus its saved map. The wafer batch from Japan remains inventory context; this level does not test every wafer in the batch off-screen and multiply the selected wafer's good count by that batch size.

Proposed game layout: 6 rows × 8 columns in a circular wafer outline; include only complete game dies. A deterministic geometric rule excludes eight corner positions and leaves **40 active dies** in this teaching layout. Split into four local exposure fields; each has ten active positions. Store every grid position's identity and status, including excluded entries. Exact definition is in WAFER_MAP_CONTRACT.md.

Baseline random failures: **none by default**. A correctly aligned run may pass all active dies. Partial edge positions are excluded, not broken chips. A later incidental-fault scenario requires its own persisted inputs; no Poisson density needs to be invented now.

`diesOnWaferCount` and `goodDiesCount` are derived from the final map; Malaysia must use the same saved map, coordinates and orientation. This handoff requires a narrow update to Malaysia's map reader/pick validation plus versioned save handling during the Taiwan build. Full Malaysia-machine redesign remains separate.

## Shortcuts and limits

Two passes and a short montage compress a much longer process. Utilities, deposition supplies, developer, etch gases and cleaning are installed, not new arrival collectibles. Positive-tone resist and a subtractive transfer loop are chosen examples; not every chip layer follows them. Global machine replicas, real node names, numeric doses/overlay tolerances, a generic transistor count and a production yield model are excluded. Sources T01–T12 in README.md support the qualitative process; teaching geometry and failure thresholds are design choices.
