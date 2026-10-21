# Build Notes: The Great Work

Date: 20 October 2026  
Status: Approved Visual Assets Integration Complete (Title Background & World Map)  
Spec: [GUIDELINES.md](GUIDELINES.md) — §Current implementation request

---

## 1. What was Built & Tested in This Pass

- **Approved Title Background Applied**:
  - Wired approved artwork `public/assets/title/background.jpg` (1376×768) directly through `src/content/assets.ts`.
  - Preserved exact 1376×768 aspect ratio without stretching or distortion.
  - Placed title logo ("THE GREAT WORK") and clean New Game / Continue menu over the quiet dark upper ceiling area with subtle local scrim for crisp readability.
  - "CONTINUE" appears only when valid save data exists; "NEW GAME" starts a fresh run.
  - Full keyboard (Up/Down, Enter/Space, Mute) and mouse interaction.

- **Approved Pixel World Map & Road Chain Applied**:
  - Wired approved world map artwork `public/assets/map/world.jpg` (1376×768) directly as background.
  - Displayed inside unified SVG coordinate space (`viewBox="0 0 1376 768"`) so the entire world map is visible without cropping any continent.
  - Markers remain attached to exact country pixel anchors when resizing the browser window (desktop, laptop, narrow viewports).
  - Seven stage anchors positioned per calibrated image coordinates:
    1. Norway · Silicon (700, 150)
    2. Germany · Purify (680, 220)
    3. Japan · Wafers (1200, 280)
    4. Taiwan · Circuits (1120, 350)
    5. Malaysia · Package (1040, 445)
    6. China · Phone (1090, 300)
    7. USA · User (260, 260)
  - Clear leader lines and offset callout boxes prevent overlapping in the East Asian cluster.
  - Ordered campaign road chain: **1 → 2 → 3 → 4 → 5 → 6 → 7** drawn with high-contrast dotted/dashed paths behind markers.
  - Pacific seam crossing for Leg 6 (China → USA): 2 matching path pieces exiting east at `(1376, 275)` and entering west at `(0, 275)` with visual transit continuation cues.
  - Leg coloring: completed legs in emerald green, active/next leg in pulsing gold, future legs in muted slate.

- **Stage Entrances & Progression Rules**:
  - Clicking any marker or pressing Left/Right (or keys 1–7) and Enter opens its existing workshop stage.
  - Escape key or "Return to Map" button returns to the map immediately.
  - Entering or reviewing a stage does **not** silently mark it complete. Stages only advance upon genuine user completion.
  - Developer Preview toggle (`P` key or HUD button) allows inspection of locked entrances without modifying campaign save data.

- **Codebase Cleanliness & Verification**:
  - `npm run lint` (`tsc --noEmit`) passes with 0 errors.
  - `npm run build` succeeds completely.

---

## 2. Tested

- Approved `background.jpg` and `world.jpg` load cleanly from `public/assets/`.
- Screen flow: Title Screen → World Map → Workshop Stage → Return to Map via Escape or click.
- Marker adherence: markers and paths remain anchored to country pixels across aspect ratios and window resizes.
- Mouse click and keyboard navigation: Left/Right arrow keys hop sequentially between stops 1–7; Enter enters stage; Escape returns to map / title.
- Progression enforcement: locked stages cannot be entered in standard mode; Dev Preview mode allows testing all 7 entrances without altering campaign state.
- Stage non-completion on exit: reviewing a stage and pressing Escape keeps it uncompleted.
- Pacific seam crossing leg 6 connects China to USA without crossing Eurasia.

## 3. Untested

- Touchscreen swipe gestures for stage hopping (mouse clicks and keyboard navigation fully operational).
- Gamepad controller input.

## 4. Stubbed / Placeholder

- Workshop stages retain their existing workcell models and mechanics; workshop background art and character animations are scheduled for subsequent passes per guidelines.

## Workshop artwork integration - 20 October 2026

- Added supplied Norway smelter, Germany purification, and Japan wafer workshop JPEGs to `public/assets/stages/`, each 1376x768, through the existing asset manifest.
- Stops 1-3 show the full illustration with centered aspect-ratio preservation and letterboxing, without cropping or stretching. Existing task panels and completion handlers remain in place. Camera controls and procedural area labels are hidden for illustrated stages; a failed image load falls back to the existing 3D view.
- Kept changes separate from the concurrent title, map, fullscreen, and app sizing work. No shared layout dimensions were changed.

Tested:
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed (existing large-bundle warning).
- All three JPEG URLs returned HTTP 200 with image/jpeg from the running local Vite server; dimensions verified as 1376x768.

Untested:
- Visual browser inspection at desktop and narrow sizes, full campaign replay, and image-load failure fallback.

Stubbed / placeholder:
- Artwork is a fixed backdrop; machinery in the illustration is not individually interactive. Existing task panels drive gameplay. Stops 4-7 retain their procedural views.

## Norway manufacturing workshop - Codex, 20 October 2026

- All seven map entrances stay unlocked during development (`devPreviewMode = true`); P no longer turns access off. Earned completion is still separate.
- New isolated components: `NorwayManufacturing.tsx` owns the process and controls; `NorwaySmelterScene.tsx` owns the simple Three.js assets and animation. No new dependencies.
- Minimal integration in `Workspace3D.tsx`: retain Claude's StageIntro first; render NorwayManufacturing afterward for stop 1; skip the old Three.js renderer for that stop. Claude's dialogue, sprites, image fitting, app sizing, and other workshops were not edited in this pass.
- Norway sequence: select three quartz rocks, load quartz with carbon, switch on the furnace, tap liquid silicon into a casting mold, watch it cool, explicitly ship 12 kg to Germany. Clickable 3D quartz and matching accessible controls share state. Completion is emitted only by the final shipping action.
- Art: fixed orthographic furnace cutaway on a workbench, pale quartz, dark carbon, three electrodes, visible reaction pool, tap chute, casting mold and cooled slab. Norway artwork is dimmed behind the 3D workbench. The caller owns the separate illustrated arrival scene.
- Process basis: existing SOURCES.md R03 and Elkem's 'From quartz to silicon to silicones' (https://magazine.elkem.com/is/material-science-insights/from-quartz-to-silicon-to-silicones/), checked for quartz + carbon, electric furnace, liquid tapping, casting, and subsequent purification.

Tested:
- TypeScript and production build pass; build retains the existing bundle-size warning.
- Browser: arrival -> workshop; rejects waste rock; selects quartz through controls and directly on the 3D scene; full loading/smelting/pouring/cooling/shipping sequence; Germany receives 12 kg; completion changes to 1/7.
- Opened stage 7 with only Norway completed, exited with Escape, confirmed completion stayed 1/7.
- Desktop and 700x800 workshop layout; no browser runtime errors. Temporary viewport override reset.

Untested:
- Full seven-stage campaign, touch devices, WebGL-unavailable fallback, smallest phone sizes.

Stubbed / placeholder:
- Educational cutaway with shortened time, game-sized batch, automatic carbon addition and simplified gas particles. Refining/slag handling and industrial process control are omitted. Color sorting is a gameplay cue rather than a real purity assay. Other levels retain their existing manufacturing screens.

## Norway blank-screen report - 20 October 2026
- Found localhost:3000 was not running (browser connection refused). Restarted Vite as a hidden background Node process, independent of the interactive dev terminal.
- Tested: map -> Norway arrival -> Skip -> Norway 3D workshop; no browser runtime errors; background server returns HTTP 200.
- Untested: full dialogue playback and full production sequence in this repair pass. No gameplay or Claude-owned introduction code changed.
- Stubbed / placeholder: unchanged from the Norway workshop notes above.

## Norway arrival rework - Claude, 20 October 2026
- Replaced the full-screen pixel-sprite intro with an arrival screen in the workshop frame (same top bar and right-hand `md:w-96` panel as Germany). Left: the Norway illustration shown whole. Right: MATERIALS panel.
- Sigurd introduces quartz, coal and wood chips; each one joins the panel (and appears as a pile in the hall) on the line where it is mentioned. Then the player walks with ← → (or clicks the floor or a pile) and presses Space/E to pick up. Once all three are gathered, "Enter the workshop" (or Enter) opens Codex's `NorwayManufacturing` 3D level.
- Characters and piles are deliberate placeholders (dashed figures, coloured blocks) until real art arrives. Removed `PixelSprite.tsx` and `content/sprites.ts`.
- Script, items and floor positions live in `content/dialogues.ts` (`STAGE_INTROS`), so other stops can reuse `StageIntro` by adding an entry.

Tested: `npm run lint` passes. Browser: map -> Norway -> dialogue reveals the items one by one -> keyboard walk + Space pickup, click-to-walk pickup -> 3/3 -> Enter -> 3D workshop. No console errors.
Untested: touch input, narrow and phone layouts.

## Arrival scenes for stops 2-7 - Claude, 20 October 2026
- New Nano Banana backdrops (2752x1536, from ~/Downloads) downscaled to 1376x768 and installed as `public/assets/stages/stop2..7_backdrop.jpg`; `assets.ts` stops 4-7 now point to `.jpg`. The previous stop2/stop3 backdrops were replaced (not committed; nothing else references them).
- Every stop now opens with the same arrival screen as Norway, then its existing workshop. `Workspace3D` uses `ASSETS.stages[stop.id]` for all stops.
- `StageIntroScript` gained per-stop `goal`, `feetY`, `enterFrom`, `playerEndX`; the guide turns to face the player.
- Guides and materials: Germany GRETA (silicon metal, hydrogen chloride, hydrogen), Japan AIKO (polysilicon, quartz crucible, seed crystal), Taiwan MEI (blank wafers, photoresist, photomask), Malaysia FARID (tested wafer, substrate, gold wire, mold resin), China XIAO LIN (packaged chip, logic board, display, battery), USA SAM (phone box, charging cable, SIM card).
- Placeholder piles got a dark outline so they read on light floors (Japan, Taiwan).

Tested: `npm run lint` passes. Browser: every stop 2-7 arrival renders with characters and piles on the floor; Japan full gather -> Enter -> existing 3D workshop loads.
Untested: full gather run on stops 2, 4-7 (same code path as Japan); touch and phone layouts.

## Fullscreen preference - 20 October 2026
- Removed automatic fullscreen from New Game and Continue. Manual fullscreen controls remain available.
- Tested: TypeScript check passed. Untested: browser interaction in this small change. Stubbed / placeholder: none added.

## Supplied player, Sigurd, and background music integration - 20 October 2026

- Added supplied MP3 and character sheets to the asset manifest. Player: four 64x72 cells at ~7.14 FPS, right-facing with horizontal mirroring. Sigurd: one 64x72 explaining pose, used only for Norway. Both use the supplied (32,69) foot anchor, 3x scene scale and pixelated rendering.
- Player sheet replaces arrival/exploration placeholders across stages. Walking advances frames; stopped characters keep a static frame. Norway uses the supplied guide; other guides retain placeholders. Dialogue, material gathering and workshop progression are preserved.
- Shared looping background track continues through title, map, arrivals and workshops without restarting at screen transitions. Browser-blocked autoplay retries on click/keypress. Existing sound toggle mutes music and SFX; removed the procedural chime layer. No fullscreen changes.

Tested:
- TypeScript and production build passed (existing bundle-size warning).
- Focused browser check: title -> map -> Norway arrival; supplied player and Sigurd render on the floor; no runtime errors.

Untested:
- Full campaign replay, audible loop seam, and music mute/unmute across every screen.

Stubbed / placeholder:
- Sigurd has one supplied pose, with the existing subtle talking motion; no mouth-animation sheet was supplied. Other country guides and material piles retain their placeholders.
