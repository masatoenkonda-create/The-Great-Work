# Build guidelines: The Great Work

Updated: 20 October 2026  
Basis: [UNIFIED_OPINION.md](UNIFIED_OPINION.md) plus Maxence's feedback and three visual references supplied on 20 October 2026.  
Where this file and the opinion files differ, **this file wins**.

## Current implementation request: apply the two approved images

**This is the next task. It takes priority over the broader run plan below.** Apply the supplied title and world-map artwork, add seven stage entrances and one connecting route. Do not generate replacement art or rebuild production tasks in this pass.

Approved files, already in this repository:

| Use | Repository file | Original size |
|---|---|---|
| Title background | `public/assets/title/background.jpg` | 1376×768 |
| World-map background | `public/assets/map/world.jpg` | 1376×768 |

Use these exact JPEG files through the asset manifest. Do not rename a JPEG to PNG or stretch it to the earlier proposed 2:1 map canvas. These approved images supersede the placeholder dimensions in the original manifest. Preserve their aspect ratio.

### What to build now

1. **Title:** display the approved corridor artwork, with THE GREAT WORK and a small New game / Continue menu rendered separately. Place readable text over the quiet dark upper area; a subtle local scrim is fine. Continue appears only with a valid save. No worker asset is required for this pass.
2. **Map:** display the approved map without cropping any continent. Add seven numbered stage markers, short labels, a selected-position marker and the six connections below. Simple code-drawn pixel-style markers are sufficient; no new image assets are required.
3. **Entrances:** click a marker or select it with Left/Right and Enter to open its existing stage. Escape returns to the map. Preserve existing workshop gameplay; if an entrance has no room yet, provide a minimal room shell with its short stage title and a return action. Do not fabricate completion merely by opening or leaving a stage.
4. Keep the normal progression/unlock rules. All seven stops remain visible. A developer preview may open locked entrances without modifying the campaign.
5. Stop after this integration. Workshop backgrounds, new recipes, character animation and detailed production mechanics belong to later requests.

### How to put stages on this image

The image is a **background**, not an interactive map service. Overlay the markers and paths in code:

- Use one shared coordinate system: an SVG with `viewBox="0 0 1376 768"` is a straightforward solution. Put the background image, route paths and stage anchors inside that same coordinate space, with uniform scaling and centered aspect-ratio preservation. Alternatively use a correctly sized aspect-ratio wrapper with percentage-positioned overlays.
- Never position markers relative to the whole browser window. If the image is letterboxed, the overlays must follow the displayed image rectangle, not the outer container.
- Do not use `object-fit: cover` or crop the map. No Leaflet, tiles, map API or latitude/longitude projection is needed.
- The supplied artwork is stylized and not a calibrated geographic projection. Start from the approximate image coordinates below, then inspect and adjust visually on this exact picture. These are representative country anchors, not verified factory locations.
- Keep anchor positions separate from label offsets. Move a label and draw a short leader line when needed; do not move Japan or Taiwan just to prevent text overlap.
- Make markers easy to click and keyboard-focusable. Use actual accessible buttons or focusable SVG controls with short accessible names. Labels should stay readable at the normal desktop view; do not cram them directly into the East Asian cluster.

Starting anchor coordinates (pixels on the 1376×768 image; x from left, y from top):

| Order | Marker label | x | y |
|---|---|---:|---:|
| 1 | Norway · Silicon | 700 | 150 |
| 2 | Germany · Purify | 680 | 220 |
| 3 | Japan · Wafers | 1200 | 280 |
| 4 | Taiwan · Circuits | 1120 | 350 |
| 5 | Malaysia · Package | 1040 | 445 |
| 6 | China · Phone | 1090 | 300 |
| 7 | USA · User | 260 | 260 |

Store these seven entries in one ordered data array with IDs, labels, coordinates and existing stage destinations. Derive keyboard order and route connections from that same array. Do not add a second conflicting route definition.

### How to draw the road

- Draw exactly this ordered chain: **1 → 2 → 3 → 4 → 5 → 6 → 7**. It is one campaign road with six legs, not a supplier-network diagram.
- Use restrained dotted or dashed paths with a dark outline for contrast; place paths behind the markers. Gently curve them where useful. They are travel links, not literal highways or verified freight routes.
- Keep completed legs distinct, highlight the next leg and mute future legs. Show the selected stage's activity in one short caption.
- Avoid a giant China–USA diagonal across the other five stops. That last leg may cross the Pacific map seam as two path pieces exiting the right edge and entering the left edge, with matching continuation cues. Those two pieces represent **one leg**, not two branches; the world itself need not scroll.
- Separate nearby Asian labels using small callouts. Highlight the selected/next connection if the full chain is busy. No extra hubs, branches, shipping icons or information panels.

### Check this pass

Confirm that both local images load, every marker remains attached to its country when resizing, all seven stage entrances work with mouse and keyboard, Escape returns to the map, and entering/reviewing does not silently complete stages. Check a normal desktop size and a narrower window. Update `BUILD_NOTES.md` with what was actually tested. No full campaign replay or production-task overhaul is requested.

## 0. How to work

This is an **alpha prototype**, built in several runs, layer by layer. Nobody expects a finished game from one run.

- Placeholders are fine: coloured boxes, simple sprites, temporary sounds. Mark them in `BUILD_NOTES.md`, never on screen.
- Finish one run's scope before starting the next (see §13). Do not add stops, countries, branches or features.
- **Current priority: establish the whole-game experience first — welcoming title → readable pixel world map → illustrated location → return to map.** Build this connected visual slice before deepening production mechanics. Technical repairs support that flow; do not let the bug list become the next creative brief.
- Use the detailed task descriptions below as a later backlog. They are not requirements for the first visual milestone.
- At the end of every run, update `BUILD_NOTES.md` with three lists: **tested** (what you actually ran), **untested**, and **stubbed / placeholder**.
- Keep `GUIDELINES.md`, `SOURCES.md` and the opinion files. Old code can be deleted; Git keeps history.

## 1. The game in one paragraph

You play a **fab worker in a white bunny suit**. You follow **one chip** around the world, from quartz to a phone in someone's hand. A **pixel-art world map** links seven stops. At each stop you enter a small **workshop** with a fixed backdrop, and you do the job yourself: walk, pick things up, load the machine, set it, and **watch the material change**. The look is **16-bit-era pixel art**. Use an original visual identity informed by Maxence's references: Street Fighter II for recognizable world geography and flags, Donkey Kong Country for an inviting progression route, and a fighting-game stage for a richly illustrated fixed location background. These are references for composition and function, not assets to copy.

The player learns by doing and seeing, not by reading.

## 2. Screen flow

**Title → world map → stop 1 … stop 6 → ending (stop 7) → route recap → back to title.**

- `Enter` confirms, `Escape` goes back or opens a small pause menu (Resume / Map / Title).
- Autosave after each completed stop.
- The title screen shows **Continue** only when a valid save exists. **New game** asks once before erasing a save.

## 3. Art direction and asset pipeline

### Visual brief: what the references mean

- **Welcome:** an inviting illustrated title screen that feels like entering a game. The industrial journey should be apparent from the art; avoid a dashboard or a wall of explanation.
- **Journey:** recognizable continents, seven clearly selectable stops, one road and one current-position marker. Borrow the readable progression of the island reference without turning the world into a fictional island or adding branches. Keep the existing seven-stop route.
- **Places:** a fixed, detailed background establishes each location, with a clear floor and space for objects in front. This is the role of the rooftop reference; do not transplant its castle, logos or fighting theme into every factory.
- **One visual family:** title, map, backgrounds, worker and UI share palette, pixel scale, lighting conventions and typography. The world can be colorful and welcoming while equipment remains readable.
- **Keep the first implementation simple:** 2D backgrounds and sprites with a 2D or 2.5D interaction layer are sufficient. Full 3D is optional and must not dictate the visual direction.

### Separate asset creation from game assembly

Create the visual brief and a small coherent asset pack separately, then have the game builder integrate those files. Codex's image-generation tools or a dedicated Gemini image session can produce candidate illustrations; the implementation session should not have to invent the whole art direction while writing the game.

First produce **one title background, one world map, and one representative workshop backdrop**. Review them together before producing the remaining locations. Use a shared palette and approved reference image for subsequent assets. Do not generate all seven backgrounds independently.

Treat generated illustrations as artwork, not authoritative geography or technical diagrams. Check continent shapes and country positions against a geographic reference. Put route lines, markers, flags, text and buttons in code so they remain accurate, readable and movable. Do not bake these into a generated map image.

### Asset integration

- Style: original 16-bit SNES pixel art. Low resolution scaled up with nearest-neighbour filtering (`image-rendering: pixelated`). Limited palette, chunky outlines. No copied Nintendo or Capcom art.
- The builder can start the screen skeleton with placeholders while the first asset pack is prepared. **Integrate the first approved artwork in the visual milestone**, rather than postponing all art until after the production systems. Code must not depend on the appearance of a placeholder.
- Load every image from `public/assets/` through one file, `src/content/assets.ts`, which maps a name to a path. If an image is missing, draw a coloured box of the right size, not an error.

Asset manifest (only the first visual pack is needed for Run A; remaining entries are later):

| File | Size (px) | Content |
|---|---|---|
| `title/background.jpg` | 1376×768 | Approved supplied corridor artwork |
| `characters/worker.png` | 64×96 per frame | Shared transparent worker sprite sheet; idle first, walk/carry/use added with gameplay |
| `title/logo.png` | optional | Original logo artwork; a crisp text title is sufficient initially |
| `map/world.jpg` | 1376×768 | Approved supplied world map; stages and route overlaid in code |
| `map/flag_<country>.png` | 16×12 | norway, germany, japan, taiwan, malaysia, china, usa |
| `map/vehicle.png` | 16×16 per frame | Small truck; optional boat and plane frames for sea or air legs |
| `stages/stop<N>_backdrop.png` | 320×180 | Fixed backdrop for stops 1–7 |
| `ui/*` | free | Cursor, slot outline, target band, buttons |

For each illustrated asset, record its canvas size, intended crop and clear areas for UI or playable objects. Backgrounds are opaque; character and object sprites use transparency. Render labels and menus in code. Keep pixel scaling consistent; do not mix blurry enlarged art with crisp sprites. The listed sizes are base canvases, not a requirement to force unrelated generated images into different pixel densities.

## 4. Title screen

- Logo, the worker idling in front of the backdrop, blinking **PRESS ENTER**.
- Menu: **New game**, **Continue** (only with a save), **Sound on/off**.
- Nothing else. No explanation paragraph.

## 5. World map (world geography with a simple progression road)

- Start with a stable, readable world overview. Gentle scrolling or wraparound is optional polish after selection works; selected stops and labels must remain easy to follow. A rotating-globe effect is not a requirement.
- Each of the seven stops is a **flag** anchored to its country. Completed stops get a small check mark. The next stop blinks. Separate nearby East Asian labels with small callouts so Japan, Taiwan, Malaysia and China remain readable; do not move countries to make space.
- A small **position marker** sits on the current flag. **Arrow keys hop it to the next or previous unlocked flag**, with a short travel animation along the route line. A dot or worker icon is sufficient first; truck/boat/plane variants are later polish. No free driving or steering.
- `Enter` on a flag enters that stop. Locked stops cannot be entered.
- The map is **local and offline**. Remove Leaflet and every tile server. Show the selected stop's country, short activity name and enter prompt; no dense information panels.
- Draw only the seven-stop campaign road, not the world's real supplier network. Highlight the next leg and mute the rest if lines become visually crowded.

Route (unchanged): **Norway → Germany → Japan → Taiwan → Malaysia → China → User (USA)**.

## 6. Workshop screen

- **Fixed backdrop** per country (the stage art), with a clear playable floor and separate objects in front of it in 2D or 2.5D; use simple 3D only where it helps. The camera stays fixed; at most one close-up shot during the "watch" step.
- The **worker is visible and controllable**: arrow keys or WASD to walk, `E` or `Space` to pick up or drop. The worker carries **one item at a time**.
- Minimal HUD: stop name, current objective in one line, the item being carried.
- **Everything that changes is animated.** If the player cuts an ingot, the cylinder visibly gets sliced and wafers fall off. If a furnace melts, it glows and the output pours. If something is invisible in real life, show a simple close-up or cross-section instead.
- No sidebars full of buttons. Actions happen by walking to objects.

## 7. The guided task loop (later gameplay runs)

This is the intended interaction pattern after the visual flow is approved. Run A does not rebuild this loop or all seven production tasks.

1. **Objective:** one line, for example "Fill the reactor."
2. **Gather:** walk around the workshop and pick up the needed items, one by one. Do not hand them to the player.
3. **Load:** the machine shows **empty slot outlines** for what it needs. Drop each item into its slot.
4. **Set:** choose a setting (for example a mix or a speed). Show a **target band** marked LOW / OK / HIGH. The player is **not told the exact right value**. After a failed try, give a one-line hint ("Too much of B.").
5. **Run and watch:** the machine animates and the material changes.
6. **Result on the object:** the output itself shows how it went (clean, cloudy, cracked, red dies). One short line at most.
7. **Release:** carry the output to the exit dock. Then return to the map.

Failure is cheap: retry restores the stop's starting state. Settings are **toy values**, not industrial recipes.

## 8. The seven stops (route and later interaction backlog)

| Stop | Pick up | Machine / animation | Mistake the player can make | Carried forward |
|---|---|---|---|---|
| **1. Norway: make silicon** | Quartz chunks, carbon (coal/wood chips) | Furnace glows, silicon metal pours into a mould | Wrong feed balance: dirty or low output | Silicon metal batch |
| **2. Germany: purify** | Silicon metal, chemical canisters A and B | Walk the lab, load each canister, set the **mix**; rods grow inside an enclosed reactor | Wrong mix: cloudy rods, more contamination | Polysilicon batch with a **purity label** (toy scale) |
| **3. Japan: make wafers** | Polysilicon, seed crystal | Crystal is pulled and grows into a cylinder; **saw visibly slices it**; wafers are polished and cleaned | Pulling too fast or skipping cleaning: more defects | Wafer stack with a **contamination level** |
| **4. Taiwan: build circuits** | Wafer, mask | Coat → align mask → expose → develop → etch, shown on the wafer surface; then a test probe colours each die green or red | Bad **alignment** or bad cleaning upstream: more red dies | **The actual wafer map** (which dies are red) |
| **5. Malaysia: cut and package** | Tested wafer, package parts | Saw cuts along the grid; worker picks a die; it is attached, wired and covered in resin | Picking a red die: **refused** | One packaged chip with a **serial derived from the lot** |
| **6. China: assemble the phone** | Chip, board, battery, screen, case | Place the chip on the board, then the parts snap together; phone powers on | Wrong order: the phone won't close | A working phone |
| **7. Ending: the user** | — | Phone delivered, unboxed, powered on, someone takes a photo | — | **Route recap** using this run's real results |

The wafer map from stop 4 is the main carried consequence. Stops 2 and 3 feed into it: their purity and contamination results raise the number of red dies at stop 4. Stop 5 shows the **same map** and refuses its red dies.

## 9. Text rules

- No paragraphs anywhere in the game. One line per objective, hint or result.
- No sources, citations, disclaimers, "teaching simplification" notes or verification talk in the game. That is for the team, not the player (see §11).
- No placeholder text on screen ("Lorem", "TODO", "Complete placeholder"). A placeholder is a plain shape, not words.

## 10. Run-state rules

- **One run state** holds the lot ID, each stop's result and the wafer map. Every stop reads its input from it.
- **No `||` fallback numbers.** Missing input shows as missing, and zero stays zero.
- Revisiting a completed stop is **read-only review**. Replay, if offered, resets that stop and everything after it.
- Each stop starts from a checkpoint. Leaving or retrying **cancels all timers and animations** from the old attempt.
- The save format has a **version number**. An incompatible save is ignored with a "Start new game" message.
- Reaching the ending saves completion.
- Demo shortcuts exist **only in developer mode** (for example `?dev=1`), and results they produce are marked as demo in the run state.

## 11. Accuracy, behind the scenes

The player never sees sources, but the content must still be true.

- Put stop facts (names, inputs, outputs, one-line objectives, hints) in `src/content/stops.ts`. Each fact can carry a hidden `sourceIds` field that points to `SOURCES.md`. Nothing is rendered from it.
- Do not invent industrial numbers (temperatures, ppm, purities, tolerances). Use toy bands instead.
- Fix these known errors:
  - The ppm → ppb unit switch without conversion, and the impossible "certified" value.
  - "11 Nines (99.9999999%)": that percentage is 9N. Just drop the number and use the toy purity scale.
  - "Atomic flatness" → "mirror-polished".
  - "Hermetically sealed" → "protected in molded resin".
  - The `PHONE-A18` serial → a neutral serial derived from the lot ID.

## 12. Cleanup

- Delete unused old prototype files: `StageMinigames.tsx`, `ThreeCanvas.tsx`, `HUD.tsx`, `TitleScreen.tsx` (rebuild a new one per §4), `SupplyChainMapModal.tsx`, `types/game.ts`.
- Delete `SourcesPanel.tsx` and `SOURCES_REGISTER` in `types/route.ts`.
- Delete the retired PNG `public/assets/aistudio/japan-supply-chain-map-v2_a7109ee3.png`, but keep the `.md`/`.txt` notes in that folder.
- Remove unused dependencies: `leaflet`, `@google/genai`, `express`, `dotenv`, `tsx`. Rename the package to `the-great-work`.
- Fix raw `$\rightarrow$` arrows in visible text.
- Dispose three.js geometries, materials and renderers when leaving a workshop.

## 13. Run plan

**Run A: the game at a glance — current milestone**
- A welcoming title screen, a proper offline pixel world map, and one representative illustrated location (Germany's lab is a suitable first example).
- Connect title → map → location → map. Show all seven route stops, with a clear current stop and readable selection. A development preview can expose the representative room without pretending earlier production was completed.
- Integrate the first coherent art pack: title background, world map and workshop backdrop. Use simple temporary sprites/objects where necessary.
- The location needs a clear floor, a worker or player marker, a few separate equipment/input/output objects, and a return action. Detailed recipes, parameter tuning and failure models are deferred.
- Preserve existing playable work where practical. Other stops can use simple preview rooms; document their status in build notes.
- Make only the state and cleanup changes necessary for this connected flow. Do not rebuild every system as a prerequisite.
- Review the three screens together for composition, consistency and clarity before proceeding.

**Run B: one hands-on workshop**
- Add movement, pickup/load/run and one visible material transformation in the approved room.
- Establish reusable sprites, interaction cues and animation conventions.
- Keep the task short; assess whether the action is understandable before expanding it.

**Run C: carry the result**
- Build the Taiwan → Malaysia wafer-map handoff, then expand the other stops with the same established interaction language.
- Apply the remaining run-state fixes, save/resume behavior and source-linked content checks as those features are connected.

**Run D: complete the journey**
- Complete remaining locations and the ending/route recap.
- Extend the approved art family across the remaining backdrops, then add optional animation and sound polish.
- No additional routes, countries or production branches.

## 14. Acceptance checks

### Current milestone: Run A
- TypeScript check and production build pass using the documented setup.
- Title → map → representative location → map works without errors.
- The title feels welcoming, the map reads as a world journey, and the location reads as a place with a usable foreground.
- All seven stops and the single road are readable, including the closely spaced Asian stops.
- Map selection and screen navigation work with the keyboard. Geography and artwork load locally without tile services.
- The first three screens share one coherent pixel-art direction; labels and menus remain crisp and legible.
- No dense sidebars, paragraphs or production-parameter work distract from this milestone.
- `BUILD_NOTES.md` honestly lists tested, untested and placeholder items. Do not claim the complete campaign was tested from this visual slice.

### Later gameplay milestones
- Rebuilt tasks let the player act on objects and watch a meaningful transformation.
- Mistakes have a visible result and can be retried.
- One lot and its wafer map remain consistent through downstream use, navigation and save/resume.
- Review, retry, reset and ending completion obey §10.
- The completed journey works title → stops → ending → recap; scope acceptance checks to the features actually rebuilt.

