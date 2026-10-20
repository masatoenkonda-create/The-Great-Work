# Build guidelines: The Great Work

Updated: 20 October 2026  
Basis: [UNIFIED_OPINION.md](UNIFIED_OPINION.md) plus Maxence's feedback after playing the first alpha.  
Where this file and the opinion files differ, **this file wins**.

## 0. How to work

This is an **alpha prototype**, built in several runs, layer by layer. Nobody expects a finished game from one run.

- Placeholders are fine: coloured boxes, simple sprites, temporary sounds. Mark them in `BUILD_NOTES.md`, never on screen.
- Finish one run's scope before starting the next (see §13). Do not add stops, countries, branches or features.
- Priority order when time runs short: **working state and progression → visible action and animation → less text → art.**
- At the end of every run, update `BUILD_NOTES.md` with three lists: **tested** (what you actually ran), **untested**, and **stubbed / placeholder**.
- Keep `GUIDELINES.md`, `SOURCES.md` and the opinion files. Old code can be deleted; Git keeps history.

## 1. The game in one paragraph

You play a **fab worker in a white bunny suit**. You follow **one chip** around the world, from quartz to a phone in someone's hand. A **pixel-art world map** links seven stops. At each stop you enter a small **workshop** with a fixed backdrop, and you do the job yourself: walk, pick things up, load the machine, set it, and **watch the material change**. The look is **16-bit Super Nintendo pixel art**. For the map and the fixed stage backdrops, think of **Street Fighter II**: a slowly turning world with flags, and a fixed background behind each stage.

The player learns by doing and seeing, not by reading.

## 2. Screen flow

**Title → world map → stop 1 … stop 6 → ending (stop 7) → route recap → back to title.**

- `Enter` confirms, `Escape` goes back or opens a small pause menu (Resume / Map / Title).
- Autosave after each completed stop.
- The title screen shows **Continue** only when a valid save exists. **New game** asks once before erasing a save.

## 3. Art direction and asset pipeline

- Style: original 16-bit SNES pixel art. Low resolution scaled up with nearest-neighbour filtering (`image-rendering: pixelated`). Limited palette, chunky outlines. No copied Nintendo or Capcom art.
- **Gemini builds with placeholders.** The final images will be generated separately (for example with Codex) and dropped into the same files later. So the code must never depend on how a placeholder looks.
- Load every image from `public/assets/` through one file, `src/content/assets.ts`, which maps a name to a path. If an image is missing, draw a coloured box of the right size, not an error.

Asset manifest (create a placeholder for each one):

| File | Size (px) | Content |
|---|---|---|
| `title/background.png` | 320×180 | Fab corridor or clean-room window |
| `title/worker.png` | 64×96 per frame | Bunny-suit worker sprite sheet: idle, walk (4 frames), carry, use |
| `title/logo.png` | free | "THE GREAT WORK" logo |
| `map/world.png` | 640×320 | Wraparound pixel world map, left and right edges match |
| `map/flag_<country>.png` | 16×12 | norway, germany, japan, taiwan, malaysia, china, usa |
| `map/vehicle.png` | 16×16 per frame | Small truck; optional boat and plane frames for sea or air legs |
| `stages/stop<N>_backdrop.png` | 320×180 | Fixed backdrop for stops 1–7 |
| `ui/*` | free | Cursor, slot outline, target band, buttons |

## 4. Title screen

- Logo, the worker idling in front of the backdrop, blinking **PRESS ENTER**.
- Menu: **New game**, **Continue** (only with a save), **Sound on/off**.
- Nothing else. No explanation paragraph.

## 5. World map (Street Fighter II style)

- The pixel world scrolls **slowly sideways and wraps around**, like a rotating globe seen flat.
- Each of the seven stops is a **flag** on its country. Completed stops get a small check mark. The next stop blinks.
- A small **vehicle** sits on the current flag. **Arrow keys hop it to the next or previous unlocked flag**, with a short travel animation along the route line (truck on land, boat or plane across the sea). No free driving, no steering.
- `Enter` on a flag enters that stop. Locked stops cannot be entered.
- The map is **local and offline**. Remove Leaflet and every tile server. Country name in one small label; nothing more.

Route (unchanged): **Norway → Germany → Japan → Taiwan → Malaysia → China → User (USA)**.

## 6. Workshop screen

- **Fixed backdrop** per country (the stage art), with the playable floor in front of it in 3D or 2.5D. The camera stays fixed; at most one close-up shot during the "watch" step.
- The **worker is visible and controllable**: arrow keys or WASD to walk, `E` or `Space` to pick up or drop. The worker carries **one item at a time**.
- Minimal HUD: stop name, current objective in one line, the item being carried.
- **Everything that changes is animated.** If the player cuts an ingot, the cylinder visibly gets sliced and wafers fall off. If a furnace melts, it glows and the output pours. If something is invisible in real life, show a simple close-up or cross-section instead.
- No sidebars full of buttons. Actions happen by walking to objects.

## 7. The guided task loop (every stop)

1. **Objective:** one line, for example "Fill the reactor."
2. **Gather:** walk around the workshop and pick up the needed items, one by one. Do not hand them to the player.
3. **Load:** the machine shows **empty slot outlines** for what it needs. Drop each item into its slot.
4. **Set:** choose a setting (for example a mix or a speed). Show a **target band** marked LOW / OK / HIGH. The player is **not told the exact right value**. After a failed try, give a one-line hint ("Too much of B.").
5. **Run and watch:** the machine animates and the material changes.
6. **Result on the object:** the output itself shows how it went (clean, cloudy, cracked, red dies). One short line at most.
7. **Release:** carry the output to the exit dock. Then return to the map.

Failure is cheap: retry restores the stop's starting state. Settings are **toy values**, not industrial recipes.

## 8. The seven stops

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

**Run A: frame and first two stops**
- Title screen, world map, workshop frame with the controllable worker, asset loader with placeholders.
- Run-state fixes (§10), text cleanup (§9), cleanup (§12).
- Rebuild stops 2 and 3 with the full task loop (§7). Stop 2 is the chemical lab: walk, pick each canister, set the mix.
- Other stops may stay as simple pass-through rooms for now.

**Run B: the wafer map**
- Stops 4 and 5, with the carried wafer map and red-die refusal.

**Run C: the rest of the road**
- Stops 1, 6 and the ending (7) with the route recap.

**Run D: real art**
- Replace placeholders with the generated assets from the manifest (§3). Add sound.

## 14. Acceptance check (every run)

- `bun install`, `bunx tsc --noEmit` and `bunx vite build` pass.
- The game goes title → map → stops → ending without errors, using the keyboard only.
- The map works offline, scrolls, and the arrow keys hop the vehicle between flags.
- In every rebuilt stop, the worker gathers items, loads slots, sets a value against a target band, and **watches the material change**.
- A mistake shows on the object, gives a hint, and can be retried.
- The wafer map is the same at stop 4, stop 5, after save/resume, and in the recap.
- No paragraphs, source panels or placeholder text appear on screen.
- `BUILD_NOTES.md` lists tested, untested and stubbed items honestly.
