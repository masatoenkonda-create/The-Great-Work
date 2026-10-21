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

## Norway fidelity research - Codex, 21 October 2026

- User requested real Norway furnace sources before a joint workshop redesign review, and an explicit decision trail for Claude.
- Created [Norway evidence pack](research/norway/README.md): eight annotated records covering a Norwegian pilot experiment, industrial reaction zones, Elkem tapping, furnace equipment, Salten casting and ladle refining. Includes three original PDFs, one schematic image and three rendered review pages.
- Added [Claude handoff and decision log](research/norway/HANDOFF.md), with unresolved choices and continuation steps; linked the pack from SOURCES.md. Pilot/industrial scales and silicon/ferrosilicon evidence are kept distinct.
- Verified PDFs with pypdf, inspected key drawings, and checked local document links. Invalid HTML download responses excluded. Application tests not run because no game code changed.
- Pending: joint source review and selection of the workshop's equipment/process basis. No redesign, simulation parameters or new artwork approved or implemented.

## Norway simple workshop plan - Claude, 21 October 2026

- Reviewed Codex's Norway research with the user. Agreed a simple 7-step plan in [research/norway/WORKSHOP_PLAN.md](research/norway/WORKSHOP_PLAN.md): mine with a pickaxe, break to fist size, load quartz + carbon, switch on, pour, cool and break into shiny grey lumps, ship. The plan drops rock-colour sorting and all temperature/pressure/purity detail.
- No game code changed. Next: Codex implements the plan.

## Norway 7-step workshop sample - Claude, 21 October 2026

- Implemented [research/norway/DESIGN_REVIEW.md](research/norway/DESIGN_REVIEW.md) (Codex) on top of the [simple step plan](research/norway/WORKSHOP_PLAN.md), after the user approved coding. Rewrote `NorwaySmelterScene.tsx` and `NorwayManufacturing.tsx`; no other files changed.
- Fixed isometric workcell, left to right: quartz outcrop + pickaxe -> breaking pad + hammer -> quartz and carbon feed bins -> round three-electrode furnace with the front wedge cut away (lined shell, visible wall thickness, hood, duct) -> low taphole, runner, mould and second hammer -> bulk bag on a pallet. Plain background; the blurred Norway illustration is gone from this screen.
- Steps: mine, break, load quartz, load carbon, switch on, open taphole, cool, hammer the casting, bag, send. Each action animates on its object: block breaks free and lands on the pad, chunks hop into the bin, bins tip and chunks arc into the feed opening, charge glows low under the electrodes, carbon lumps shrink, gas rises, liquid pools and runs down the runner, casting cools from orange to reflective silver-grey, splits into lumps, lumps fly into the bag, bag ties and leaves.
- One instruction at a time, three short result lines (oxygen removal, "This is silicon metal.", Germany purifies next). A yellow arrow and label mark the next object. Click the object, press the single button, or press Space/Enter. Power before carbon: "Add carbon first."; hammering hot casting: "Too hot. Let it cool first." Removed rock-colour sorting. Completion only fires after the bag leaves; still passes `siliconMetalBatchKg: 12` for stop 2 compatibility (not shown to the player).

Tested: `npm run lint` passes. Browser: map -> Norway arrival -> workshop renders; mining, breaking, loading and smelting animations checked; the user then played it to the end and reported it works.
Untested: narrow/phone layouts, touch input, WebGL-unavailable fallback.
Stubbed / placeholder: no ladle or refining (direct runner-to-mould casting, as DESIGN_REVIEW records); primitive shapes, not final art; times and sizes compressed.

## Norway workshop controls and stable layout - Codex, 21 October 2026

- Replaced the top step strip and variable-height bottom action area with a stable 3D viewport and a separate control panel. On desktop the panel scrolls independently; narrower screens stack a viewport with a fixed viewport-relative height above the panel. Buttons, progress and feedback no longer determine the canvas size.
- Removed floating object text labels and the small cutaway/compression caption; retained the existing 3D arrow, models and process animations. Added clear stage titles and material explanations covering quartz, carbon, electrical heat, casting, cooling and downstream purification.
- Added relative electrical-power and electrode-position controls. Starting with an invalid combination leaves the batch loaded, prevents the smelting animation and explains each needed correction. Working power with electrodes in the charge starts the existing process. The button, scene switch and keyboard share this validation. Controls lock during the run; focused form controls and held keys do not accidentally advance the process.
- These are teaching controls, not industrial temperature/pressure recipes or a validated furnace simulation. No pressure control was introduced for this furnace. A failed start does not consume the batch. Earlier design exclusions of control panels/parameter choices are superseded for Norway by the user's current request.

Tested:
- Three furnace-control tests passed (`bun test src/content/norwayControls.test.ts`), covering all six setting combinations and corrective feedback.
- `bun run lint` and `bun run build` passed. Existing bundle-size warning remains.
- User completed the browser test and reported: "Test is done it works." Agent browser navigation reached Norway arrival; the user took over the interactive check.

Untested:
- Agent measurements of canvas dimensions during transitions, phone/narrow-screen interaction, WebGL-unavailable fallback, and full campaign replay.

Stubbed / placeholder:
- Existing simplified furnace physics, fixed compatibility output quantity and compressed process times remain. No new artwork or machine geometry was introduced.

## Norway: controls only, persistent workshop log - Codex, 21 October 2026

- Removed the explanatory content and feedback from the control panel. The narrower panel now contains icon-led tool buttons, three power buttons with level bars, and an electrode lever with Up/Down buttons. Short labels, accessible names and tooltips identify the controls.
- Moved brief material explanations, guidance and failed-start feedback into a permanent, fixed-height workshop log below the workcell. History is scrollable, capped at 30 entries, and follows new messages; animation starts do not repeat their stage's instructions. The log stays visible while the upper work area scrolls on smaller screens.
- Preserved furnace validation, retries, process timing and all 3D geometry/animations. No added pressure or numeric recipe controls. Older requests for explanatory text inside the control panel are superseded by this latest user direction.

Tested: no tests or browser interactions run for this pass, at the user's explicit request to handle testing themselves.
Untested: this revision's layout, controls and message log in the browser, typecheck and production build.
Stubbed / placeholder: unchanged simplified furnace simulation and existing compatibility output quantity.

## Norway cockpit panel and Sigurd chat (placeholders) - Claude, 21 October 2026

- Layout per the user: 3D workshop on the left (unchanged), fixed cockpit-style control panel top right, Sigurd's chat box beneath it. Replaces Codex's side panel and full-width workshop log.
- Panel (placeholder, `src/content/norwayPanel.ts` + `NorwayManufacturing.tsx`): fixed 480x400 canvas scaled to fit; 7 status lamps, 4 gauges (furnace temp with working band, reaction %, liquid level, mould temp), power-level bars, and 12 buttons with a light above and a name below (MAIN POWER, POWER −/+, ELEC ▲/▼, TAPHOLE, PICKAXE, HAMMER, LOAD QUARTZ, LOAD CARBON, BAG, SHIP). The next useful button's light blinks. Art spec with every rectangle: [research/norway/CONTROL_PANEL_SPEC.md](research/norway/CONTROL_PANEL_SPEC.md).
- Furnace is now a small puzzle: main power on, then power level 1-5 and electrodes up/down set a target temperature the gauge eases toward. Smelting only progresses inside the working band (power 4, electrodes down). Sigurd reports what he sees ("heat going up the chimney", "too cold", "way too hot", "that's it") without naming the fix. `norwayControls.ts` replaces Codex's start check; tests updated.
- 3D scene: only two new optional props (`heat`, `electrodesRaised`) so electrodes visibly rise/lower and the glow follows the panel.

Tested: `npm run lint` passes; `bun test src/content/norwayControls.test.ts` 4/4. Browser: workshop layout renders; panel buttons drive mine, break, load quartz, load carbon, main power, electrodes; Sigurd's furnace feedback appears. Stopped there at the user's request (user tests).
Untested by agent: rest of the run after smelting, narrow screens.
Stubbed / placeholder: panel and chat box are code-drawn until the pixel art arrives; temperatures are teaching values.

## Rename and title screen - Claude, 21 October 2026

- Game renamed **Supply Chain Gang** (title screen, page title, og:title, metadata.json, code comments). Tagline: "One chip. Seven countries. Zero shortcuts."
- Removed the full-screen dark gradient over the title art; the logo and tagline stay readable with a pixel outline instead. Added the Press Start 2P pixel font (Google Fonts).
- New chunky pixel buttons with bevel, press-down effect and blinking ▶ ◀ cursor; "PRESS ENTER" blinks at the bottom. Keyboard (Up/Down, Enter/Space, M) and Continue/New game logic unchanged. Animations stop under reduced-motion.

Tested: `npm run lint` passes; one screenshot of the title screen. Untested: Continue state, narrow screens.

## Map and arrival screen cleanup - Claude, 21 October 2026

- Map: route paths, markers and keyboard/click behaviour unchanged. Removed the dark vignette and the DEV badge. Stop callouts are now pixel-font country tags (yellow when selected, green when done) with drop shadows; the Pacific "TO USA / FROM ASIA" cues are plain outlined text. Japan's tag moved above its pin so wide screens don't crop it. Bottom card shows "STOP n OF 7", the country and one friendly line (new `pitch` field in `route.ts`), with a pixel GO button. Progress chip reads "n / 7 DONE".
- Arrival scene (shared by all stops): dark theme to match the workshop. Top bar is just "◀ MAP", the country and its one-liner (stage number, location, lot number and arrival goal removed). Right panel is "COLLECT n / 3" with item cards and "?" slots; "IN HALL"/"NEW" tags and the long purpose line removed. Pixel "ENTER WORKSHOP" button.

Tested: `npm run lint` passes; one screenshot each of the map and Norway arrival. Untested: narrow screens, completed-stop states.

## Norway panel review and lighter Sigurd dialogue - Codex, 21 October 2026

- Reviewed Claude's fixed cockpit against the process: it covers material loading, main power, power level, electrode selection, working heat, reaction progress, liquid silicon, cooling and dispatch. Kept the 480x400 layout and every art/hotspot rectangle. Added a compact dynamic POWER n/5 label, on/off tooltips and accessible pressed states for main power/electrodes, and numeric accessibility values for gauges.
- Replaced the accumulating chat history with one current message. New step guidance or furnace feedback replaces the old text; intermediate tool animations retain their step's message. Turning the main power off now produces relevant feedback too.
- Gave Sigurd's box a teal frame/header, amber portrait/name, mint accents and a distinct amber warning bubble. Shorter, friendlier lines include occasional parenthetical jokes in warm gold italics. No chat typing animation or layout resizing added; 3D and furnace mechanics unchanged.
- Updated [control-panel art spec](research/norway/CONTROL_PANEL_SPEC.md) with the reviewed coverage and dynamic overlays to preserve in code when artwork arrives.

Tested: no automated checks or browser tests run; the user's standing instruction leaves testing to them.
Untested: current-message transitions, visual styling and panel readouts in the browser; typecheck/build for this revision.
Stubbed / placeholder: existing code-drawn panel/chat artwork and teaching furnace model remain.

## Norway complete for now; reusable workshop instructions — 21 October 2026

- User declared Norway complete for now and requested today's full workflow be recorded for the other levels.
- Added [WORKSHOP_WORKFLOW.md](WORKSHOP_WORKFLOW.md), covering research, process simplification, pre-coding review, 3D interactions, causal controls/failure, stable cockpit UI, current-step guide dialogue, art handoff and the user's testing preference. Includes a per-level design checklist and links to the Norway reference files.
- Linked the workflow prominently from GUIDELINES.md and recorded Norway's accepted baseline in its handoff. Historical design decisions remain available; the workflow identifies which later directions supersede them.

Tested: documentation task only; no application tests run. No game code or assets changed in this task. Other levels remain unchanged.

## Workshop workflow review - Claude, 21 October 2026

- Revised Codex's [WORKSHOP_WORKFLOW.md](WORKSHOP_WORKFLOW.md): shorter, and now leads with the four player questions (why, where from, how, what it looks like). Added: how map pitch, arrival items and workshop must agree; a shared-component step (`WorkshopLayout`, `ControlPanel`, `GuideBox`) before Germany so levels reuse Norway's code; the cross-level results chain (purity → defects → wafer map → refused dies); a copy-paste plan template; draft sketches for Germany to USA matching the existing arrival items; "don't ask the user technical questions". Testing rule: user plays; agents may run the type check and must say what wasn't checked.
- Documentation only; no code changed.

## Germany research, first pass - Claude, 21 October 2026

## Malaysia workshop built - Claude, 21 October 2026

- Reviewed Codex's Malaysia research and plan (accepted; decisions at the end of research/malaysia/WORKSHOP_PLAN.md).
- New Malaysia workshop: saw the wafer on its tape frame, choose a passing die on Taiwan's saved map and pick it, set bond force and ultrasonic (pause-only puzzle), wire-bond, transfer-mold, attach solder balls, test and laser-mark, ship. Map and package cross-section insets. The chip serial is derived from wafer + die and released only on shipping.
- China no longer shows a made-up serial when none exists. Farid's hair comparison dropped.

Tested: `npm run lint` passes; `bun test src` 27/27. Not tested: anything in the browser (user tests).
Placeholders: code-drawn panel, insets and guide box, "F" portrait for Farid, primitive geometry, compressed times.

## China research, first pass - Claude, 21 October 2026

- Ran workflow steps 1–2 for China. Added [research/china/README.md](research/china/README.md) (C01–C08, four player questions, check of the dialogue, old workshop, route and USA stop) and [research/china/HANDOFF.md](research/china/HANDOFF.md). Key open decision for the user (D02): TV or phone. Claude recommends TV: it fits the story and the wire-bonded package we built in Malaysia, which a modern phone's main processor would not use.
- Stopped before the plan: user decision and Codex's turn. No code changed.

## China research, second pass (primary sources, TV) - Claude, 21 October 2026

- The user rejected the first, search-only pass as too thin and chose **TV** for China. Redid step 2 properly: 8 primary PDFs saved in research/china/sources and read (IPC head-in-pillow papers, Indium reflow profiling, Infineon BGA board-assembly guide, NASA BGA guidelines, MediaTek TV SoC briefs, IPC X-ray voids paper), Infineon's X-ray figure rendered, plus China's 2024 statistical communiqué (207.5 million colour TVs) and EIZO's factory account of display assembly and aging.
- README and HANDOFF rewritten for TV (decisions D01–D09, six questions for Codex). Puzzle basis: reflow peak temperature and time above melting (C09–C11, C13, C14).
- No code changed.
