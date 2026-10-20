# Build guidelines — one chip, one road

Updated: 20 October 2026  
Status: final brief for the first Gemini prototype. This file defines the active scope.

## 1. The game in one paragraph

Make a simple browser learning game that follows **one generic silicon chip** around the world, from raw material to a chip inside an iPhone someone uses. The player advances along one route on a 2D world map and enters small 3D workspaces to perform simplified production tasks. The goal is to understand through action, spatial visualization and visible consequences. Call the product **“chip”**; no chip-type selection, technology nodes or nanometer specifications.

## 2. Scope and reading order

1. **GUIDELINES.md:** what to build.
2. **SOURCES.md:** evidence and limits for factual content.
3. The three opinion files: historical background only, not additional requirements.

Preserve `GUIDELINES.md`, `SOURCES.md`, `CLAUDE_OPINION.md`, `CODEX_OPINION.md` and `UNIFIED_OPINION.md`. The original prototype code can be replaced; it remains in Git history.

**Build one road.** No branches, side quests, alternative routes, context markers, regional submaps or minimum country count. Do not recreate the earlier camera-sensor campaign, second chip type, wafer-stacking levels or Japan-only setting. Research entries about other countries do not authorize adding map points.

## 3. Two visual layers

**World map:** a simple 2D world outline with seven numbered points connected in order. A marker moves to the next point after completion. The final artistic direction is original SNES-style pixel art, inspired by stage maps in Super Mario World or Donkey Kong Country. For the first run, labels, dots, lines and a plain map are enough. No driving, ship or flight controls.

**Production workspace:** simple 3D shapes with clear labels and visible input/tool/output areas. Use a fixed isometric overview plus a first-person inspection/manipulation view; no hands or body. Provide clear buttons to switch views and reset the camera. No large explorable factory.

Use a magnified view or cross-section when the actual change would be invisible. A machine performs microscopic work; the player operates a simplified model of it.

## 4. The only route

**Norway → Germany → Japan → Taiwan → Malaysia → China mainland → User**

This is a representative teaching scenario grounded in real regional activities. It is **not** a documented supplier itinerary for an actual iPhone chip. State that once in the map legend and keep sources available in an optional panel.

| Stop | Place and purpose | Input → output | Task when implemented | Sources |
|---|---|---|---|---|
| **1. Make silicon** | Norway; combine quarry and smelter in one stage | Quartz-bearing feed + carbon → silicon metal | Collect/sort feed, load a simplified furnace, adjust feed balance and observe the output check | R03 |
| **2. Purify it** | Germany | Silicon metal → electronic-grade polysilicon | Operate an enclosed model of chemical conversion, purification and deposition; separate acceptable output from contamination | R04, R13 |
| **3. Make wafers** | Japan | Polysilicon → crystal ingot → polished wafers | Grow a crystal, slice it, polish/clean and inspect. These are substeps in one workspace | R05–R06 |
| **4. Build and test the circuits** | Taiwan | Blank wafers + prepared design/masks/supplies → processed wafers with a good/bad die map | Perform one representative fabrication cycle, inspect its cross-section, then test the wafer | R01–R02, R07–R08, R14 |
| **5. Separate and package** | Malaysia | Tested wafer + package materials → released packaged chips | Cut along die boundaries, pick a good die, attach/connect/protect it, then run final test | R02, R15, R18 |
| **6. Assemble the phone** | China mainland | Released chip + board and other ready-made components → working phone | Place/connect the chip on a simplified board, assemble the phone and check that it works | R02, R11 |
| **7. Deliver and use** | An illustrative user destination | Finished phone → someone using it | A short delivery/unboxing sequence, power on, open an app, then replay the journey | Game scenario |

Stops 1–6 are workspaces. Stop 7 is the ending, not another production mini-game. Use the User point as the route's terminal destination; no shipping-hub stop or destination-selection mechanic is needed.

Keep the labels above and use the same seven stage IDs everywhere. Substeps never create additional map points. Every transition goes directly to the next numbered stop.

For stop 4, show a representative **deposit → coat → expose → bake/develop → etch → strip/clean** cycle. Explain briefly that a real fab repeats many operations to form devices and wiring. One toy loop is not the whole manufacturing process. No need to name EUV or DUV in the basic interaction.

For stop 5, use one illustrative construction: die, carrier, wire connections and protective resin. Do not combine incompatible package families or imply this is an exact iPhone package. The board connection in stop 6 is also a teaching simplification.

## 5. Inputs that do not become extra levels

The fab already has an approved design, masks, installed tools, chemicals, power and water when the player arrives. Show them as labeled objects or one brief arrival explanation. Design precedes production; do not suggest it was created only after wafer-making.

Likewise, packaging materials and the phone's other components arrive ready-made. Their origins can appear in an optional source card, **without map arrows or playable supplier stages**.

The learner should distinguish:
- material transformed into the product;
- supplies consumed by the process;
- equipment that stays in the factory;
- design information that tells the process what to make.

This provides supply-chain context without building a second network.

## 6. The common interaction loop

**Inspect input → see the objective → act → observe change → check result → retry or release → return to map.**

Each implemented workspace needs one or two meaningful interactions and a small number of relevant controls. Show cause and effect through the object, a cross-section or a compact result display. A button that always produces success is a placeholder, not a finished task.

Controls can use labeled toy ranges such as “slow / balanced / fast.” Do not invent realistic-looking industrial recipes or precise technical tolerances. If a mechanism is not adequately supported, keep it abstract and identify it as a game model.

Failure is cheap, explained and retryable. Testing reveals existing defects; it does not repair them or randomly reroll results. Do not add rework options where the simplified process does not support them.

Keep instructions short. No compulsory quizzes, spoken answers, spreadsheets, procurement simulation, customs paperwork, historical disruptions or vehicle mini-games in this prototype.

## 7. State and progression

Use one authoritative session state for progress, cargo and results.

- Track one material lot with a stable identity through its transformations.
- Early material is a batch; an ingot yields wafers, and a wafer contains many dies. Do not imply one rock equals one chip.
- After separation, follow one representative good chip to the phone. A full factory mass-balance simulation is unnecessary.
- Quantities must use appropriate units and remain consistent with the simple model. Never create stock from a false zero/default value or ship unavailable output.
- Preserve quality results during travel. Retesting the same lot must not reroll it.
- A real stage unlocks the next only after success. Completed stages can be reviewed.
- Save at stage boundaries. Reset starts a genuinely fresh run. Hiding controls and changing cameras must preserve progress.
- Retry restores a clean checkpoint for that stage; cancel any pending animations/timers from the old attempt.

For skeleton stages, a **“Complete placeholder”** button may advance the session using a clearly labeled demonstration output. Do not present it as a real manufacturing result or mix placeholder outputs with earned quality scores.

No cost economy or logistics incident is required yet. Travel is a brief visual handoff that preserves cargo state.

## 8. Sources and simplifications

The route's activities have evidence; the links between its fictional facilities are scenario choices. Do not imply that example companies supply each other or Apple without direct evidence.

Keep stage descriptions and factual claims in data, separate from interface code. Link claims to the relevant source IDs. Distinguish source-supported facts from game assumptions; exclude unverified claims from teaching content.

Use `SOURCES.md` to check the specific claim being used. A site location does not prove a contract. An opinion, generated image or search snippet is not primary evidence.

No exact factory layouts, node sizes, market shares, process temperatures, purity percentages or transport times are needed. Displayed toy settings must not masquerade as industrial specifications.

The old generated Japan infographic is retired. Do not restore it or generate a replacement image. Build the simple map directly from the seven-point route; polished artwork comes later.

## 9. What Gemini should do in the first run

**Deliver a working skeleton, not the whole finished game.**

1. Make the app build and start.
2. Display the world map with exactly the seven route points above.
3. Let the player enter each stage, see its place/input/output, complete a clearly marked placeholder and progress to the ending.
4. Keep cargo identity and state consistent through the whole journey.
5. Add stage-boundary save/resume and full reset.
6. Write `BUILD_NOTES.md`: what works, what is placeholder, known bugs, and the suggested next step.

If there is time after this works, improve clarity and fix bugs. Do not add extra stages or try to finish one elaborate factory.

Use plain shapes, simple panels and no sound. Prefer the existing workable framework and avoid unnecessary dependencies. Keep basic controls keyboard-operable, labels readable, panels scrollable and status understandable without color alone.

**Following iterations, within the same scope:**
- First implement stops 3 and 4 with real spatial tasks and outcomes.
- Then implement stops 5 and 6 and improve the ending.
- Then replace the remaining placeholders at stops 1 and 2.
- Only after a coherent end-to-end journey works, improve pixel art, animation and audio.

No branches or additional map points are part of this iteration plan.

## 10. Acceptance check

Before handing back a run, verify:

- The app starts and the seven-stop journey reaches phone use.
- Map, stage titles and next-stage links agree.
- Implemented tasks have understandable consequences; placeholders are explicitly marked.
- Camera changes, hide/show, retry, reset and save/resume do not contradict progress.
- Failed output cannot silently advance a real production stage.
- Source references resolve; unsupported details are absent or clearly illustrative.
- `BUILD_NOTES.md` accurately distinguishes tested behavior from untested claims.

A rough but understandable working prototype is the intended result. Add detail only when it improves understanding of this single road.
