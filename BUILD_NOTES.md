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

- Ran workflow steps 1–2 for Germany. Added [research/germany/README.md](research/germany/README.md) (G01–G07, answers to the four player questions, check of the existing dialogue/workshop) and [research/germany/HANDOFF.md](research/germany/HANDOFF.md) (decisions D01–D08, suggested text fixes, six open research questions for Codex). Linked from SOURCES.md.
- Stopped before the plan, per the user: Codex adds research next. No code changed.

## Germany independent review and build handoff — Codex, 21 October 2026

- Reviewed Claude's G01–G07, the revised workflow, active Germany form/scene wiring, arrival items and cargo schema. Added [CODEX_REVIEW.md](research/germany/CODEX_REVIEW.md) and a compact [WORKSHOP_PLAN.md](research/germany/WORKSHOP_PLAN.md) for Claude to review before building.
- Added G08–G10 and rechecked G05: reactor geometry/current path, lighter/heavier separation fractions, clean finishing and control limits. Saved original G08 reactor patent and G02 producer PDF; rendered/visually inspected Figure 1 and cleaning-line page 6.
- Proposed six visual beats, rod heat + precursor-proportion puzzle, cold solid rod handling and clean-pack output. Corrected melting-versus-chemical conversion, all-dirt-at-bottom distillation, purity-percent dialogue and the unsupported equivalence of rod roughness with chemical purity. Proposed process-status fields explicitly remain unimplemented.
- Added reusable workflow review checks for material-state continuity, control meaning, sourced relationships versus teaching rules, purity versus appearance, bounded reuse and a concrete builder handoff. Updated evidence/handoff/source links.

Checked: code/document inspection and primary-source research; original PDF metadata/text checked with Poppler, two pages rendered and visually inspected. No application tests/playthrough; no code or game assets changed. G01 detailed narrative not independently recovered through page extraction; G03 PDF access timed out. No validated kinetics, OEM plan or exact Burghausen apparatus reconstruction claimed.

## Germany workshop built + shared workshop components - Claude, 21 October 2026

- Shared `src/components/workshop/` (layout, cockpit panel, guide box, Space key and timed-phase hooks) extracted from Norway; Norway now uses them, with no change intended to its look or controls.
- New Germany workshop per Codex's plan and Claude's build decisions (research/germany/WORKSHOP_PLAN.md): mill, convert, distill, grow rods (rod heat + gas mix puzzle), cool and open, break, clean and double-bag, ship. Stop 2 now routes to `GermanyManufacturing`. Arrival wording and route summary corrected (no nines claim, lumps milled in Germany, liquid compound not melted silicon).
- No save-schema change; purity flags deferred until a later level reads them.

Tested: `npm run lint` passes; `bun test src/content` 8/8 (Norway and Germany controls). Not tested: anything in the browser (user tests), Norway regression after the extraction, narrow screens.
Placeholders: code-drawn panel and guide box, "G" portrait for Greta, primitive geometry, compressed times.

## Japan research, first pass - Claude, 21 October 2026

- Ran workflow steps 1–2 for Japan. Added [research/japan/README.md](research/japan/README.md) (J01–J05, answers to the four player questions, check of the existing dialogue and the old slider workshop) and [research/japan/HANDOFF.md](research/japan/HANDOFF.md) (decisions D01–D08, one dialogue fix, six open questions for Codex, including whether Japan's pull speed should finally feed red dies in Taiwan). Linked from SOURCES.md.
- Stopped before the plan: Codex's turn. No code changed.

## Japan independent review and proposed workshop — Codex, 21 October 2026

- Reviewed J01–J05, all six handoff questions, old Japan/Taiwan task code, current cargo schema and the shared workshop components. Added [CODEX_REVIEW.md](research/japan/CODEX_REVIEW.md) and [WORKSHOP_PLAN.md](research/japan/WORKSHOP_PLAN.md) for Claude to review before building.
- Added J08–J10, saved the original J03 chapter, PVA semiconductor-puller brochure and Siltronic process presentation. Inspected J03 Fig.1, PVA exterior and Siltronic slide 14 after rendering; checked J03's CC BY 3.0 statement. Full structure-loss article pages returned 403; only primary indexed excerpts were used to bound the finding, not prescribe a detector.
- Proposed seven visual beats with crucible/seed handling, automatic neck/shoulder/tail, a body-growth heat/pull puzzle, cool/crop/grind before batch wire slicing, finishing and FOSB dispatch. Retained recoverable growth; no arbitrary contamination score or claimed Taiwan integration. Added workflow checks for phase-specific controls and physically coherent recovery.

Checked: code/document/source inspection, original PDF metadata/text, three rendered pages and license statement. No application code or game assets changed; no tests/build/playthrough run. Exact site geometry, defect equations and variable downstream yield remain unvalidated/deferred.

## Japan workshop built - Claude, 21 October 2026

- Reviewed Codex's Japan research (J08–J10, review, plan): sources verified, corrections accepted. Decisions recorded at the end of research/japan/WORKSHOP_PLAN.md.
- New Japan workshop: load crucible and chunks, melt (heater past 1,414 °C), dip the seed (automatic neck and shoulder), grow the body (heat + pull + rotation puzzle, pause-and-recover), automatic tail, cool and move (crop, grind), wire saw, polish, inspect and box, ship. Stop 3 now routes to `JapanManufacturing`. Aiko's arrival wording corrected.
- No save-schema change; Taiwan defect link deferred.

Tested: `npm run lint` passes; `bun test src/content` 12/12 (Norway, Germany, Japan controls). Not tested: anything in the browser (user tests), narrow screens.
Placeholders: code-drawn panel and guide box, "A" portrait for Aiko, primitive geometry, compressed times.

## Taiwan research, first pass - Claude, 21 October 2026

- Ran workflow steps 1–2 for Taiwan. Added [research/taiwan/README.md](research/taiwan/README.md) (T01–T07, answers to the four player questions, check of the dialogue, the old alignment workshop and the cargo state) and [research/taiwan/HANDOFF.md](research/taiwan/HANDOFF.md) (decisions D01–D08, six open questions for Codex). Key point: Taiwan is where the saved die-by-die wafer map should be born, for Malaysia to read.
- Stopped before the plan: Codex's turn. No code changed.

## Taiwan independent review, workshop proposal and wafer-map contract — Codex, 21 October 2026

- Reviewed T01–T07, all six handoff questions, old Taiwan/Malaysia task code, cargo/storage and completion logic. Added [CODEX_REVIEW.md](research/taiwan/CODEX_REVIEW.md), [WORKSHOP_PLAN.md](research/taiwan/WORKSHOP_PLAN.md) and [WAFER_MAP_CONTRACT.md](research/taiwan/WAFER_MAP_CONTRACT.md) for Claude to review before building.
- Added T08–T12: coherent DUV optics/metrology, primary TEL track and ACCRETECH prober references, original SWTest map-to-packaging evidence, and positive-resist development semantics. Saved three valid primary PDFs; rendered/inspected ASML PDF p.13 (printed 14), wafer-test p.2 and development p.1. NXP's PDF was web-readable but direct download denied; no local copy retained.
- Proposed seven visual beats with a first reference pass, a second alignment pass and a compressed remaining process before electrical probing. Proposed a reviewed Taiwan-specific exposure-error consequence with free fresh-wafer retry, rather than silently changing the earlier pause-only levels. Baseline failures are not forced; edge exclusions are distinct from electrical failures.
- Specified stable wafer/die IDs and orientation, 40 active positions in a 6x8 teaching layout, field exposure capture, derived counts, versioned save migration, exact Malaysia map consumption and replay invalidation. These remain design proposals; no map/schema/reader is implemented in this pass. Added reusable workflow checks for committed errors and positional result handoffs.

Checked: code/document inspection, primary-source research, PDF metadata/text and three rendered reference pages. Poppler emitted annotation/font-substitution warnings; inspected pages were readable. No application code or game assets changed; no build/tests/playthrough run. No exact TSMC line, chip design, process recipe or calibrated yield equation claimed.

## Taiwan workshop built + saved wafer map - Claude, 21 October 2026

- Reviewed Codex's Taiwan research, plan and wafer-map contract (accepted; decisions at the end of research/taiwan/WORKSHOP_PLAN.md).
- New Taiwan workshop: load, automatic first layer, align and expose four fields (small offsets fail their field, large ones are blocked), finish the layers, probe test, ship or retry with a new wafer. Live layer-detail and wafer-map insets.
- First real carried result: `waferMap` saved with the stop (save format v2, validated, old saves migrated back to Taiwan with a backup). Malaysia now picks only dies that passed this map, with a wafer-derived serial. Replaying an earlier stop no longer rewinds progress; replaying Taiwan clears stops 5–7.
- Mei's dialogue: unsourced comparisons removed; "photomask set".

Tested: `npm run lint` passes; `bun test src` 24/24 (controls for all four workshops, wafer map, save migration). Not tested: anything in the browser (user tests), loading a real old save in a browser, Malaysia's picker on screen.
Placeholders: code-drawn panel, insets and guide box, "M" portrait for Mei, primitive geometry, compressed times. No on-screen notice yet when an old save is sent back to Taiwan.

## Malaysia research, first pass - Claude, 21 October 2026

- Ran workflow steps 1–2 for Malaysia. Added [research/malaysia/README.md](research/malaysia/README.md) (M01–M08, answers to the four player questions, check of the dialogue and the old packaging workshop) and [research/malaysia/HANDOFF.md](research/malaysia/HANDOFF.md) (decisions D01–D08, six open questions for Codex, including the puzzle choice and whether final test should send the player back to pick another good die).
- Stopped before the plan: Codex's turn. No code changed.

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

- The user rejected the first, search-only pass as too thin and chose **TV** for China. Redid step 2 properly: 7 primary PDFs saved in research/china/sources and read (IPC head-in-pillow papers, Indium reflow profiling, Infineon BGA board-assembly guide, NASA BGA guidelines, MediaTek TV SoC briefs, IPC X-ray voids paper), Infineon's X-ray figure rendered, plus China's 2024 statistical communiqué (207.5 million colour TVs) and EIZO's factory account of display assembly and aging.
- README and HANDOFF rewritten for TV (decisions D01–D09, six questions for Codex). Puzzle basis: reflow peak temperature and time above melting (C09–C11, C13, C14).
- No code changed.


## China independent research and TV proposal - Codex, 21 October 2026

- Reviewed Claude's second primary-source pass, workflow and active assembly/ending/storage code. Added C17?C20 to [the evidence pack](research/china/README.md), two saved original PDFs and four new inspected page previews; independently inspected the existing X-ray figure.
- Wrote [CODEX_REVIEW.md](research/china/CODEX_REVIEW.md), [WORKSHOP_PLAN.md](research/china/WORKSHOP_PLAN.md) and [TV_HANDOFF_CONTRACT.md](research/china/TV_HANDOFF_CONTRACT.md): six TV assembly beats, heat/belt-speed puzzle, joint cooling, bounded X-ray claims, representative LCD architecture and coherent USA TV ending.
- Proposed save v3 with chip-bound TV identity, preservation of valid progress through Malaysia, replay of old phone completion, and downstream invalidation on Malaysia/China replay. Specific TV SoC package and factory-exact order remain unverified, declared teaching limits.
- Updated handoff, source index and reusable workflow checks. Verified documentation links and diff formatting. No application code changes, application tests, browser playthrough or new game art in this pass. Claude reviews the proposal before building; user playtests.

## Research standard and agent notes - Claude, 21 October 2026

- After the user found search-only research passes (China first pass; most of Claude's Germany, Taiwan and Malaysia records), WORKSHOP_WORKFLOW.md step 2 now points to a short **research standard**: facts the build depends on must come from primary documents actually read and saved; every record is marked Read / Skimmed / Lead; reviews must open the sources; reports must say how deep they went.
- Added CLAUDE.md and CODEX.md (project in one line, files to read first, working rules) and a one-line AGENTS.md pointing Codex to CODEX.md, since Codex loads AGENTS.md automatically.
- Not yet done: relabelling earlier records by status and re-reviewing Taiwan and Malaysia sources (planned for the next quality pass over all levels).

## China TV workshop + save v3 + minimum USA ending - Claude, 21 October 2026

- Reviewed Codex's China pass (C17 and C18 opened; C19, C20 not opened by Claude) and built it: print paste, place the chip, reflow (heat + belt puzzle with predicted profile), X-ray (balls and bond wires), assemble the TV, power and check, pack and ship. Decisions at the end of research/china/WORKSHOP_PLAN.md.
- Save format v3: TV fields replace phone fields, with a validated map → chip → TV chain, per-version backups and a one-time notice; replaying Taiwan, Malaysia or China clears later stops.
- Minimum USA ending for the TV and TV wording across the game.

Tested: `npm run lint`, `bun test src` 33/33, `npm run build` all pass. Not tested: anything in the browser (user tests), loading a real old save in a browser.
Placeholders: code-drawn panel, insets and guide boxes, "X" and "S" portraits, primitive geometry, compressed times.

## Self-audits and hand-over checklist - Claude, 21 October 2026

- Read Codex's self-audit (from its local session log; it changed no files). It confirms that its records lacked Read / Skimmed / Lead labels, used broad words such as "validated" and "research complete", had no retained test output, and that commit `3962a69` deleted 72 lines of this file (nine entries, Germany to Malaysia). Claude committed that deletion without checking the diff.
- Restored the nine deleted entries unchanged in their original place.
- Added a six-line **hand-over checklist** to WORKSHOP_WORKFLOW.md (labels, no vague words, test result lines, logs only grow, `git diff --stat` before committing the other agent's work, one-page plans) and clarified that "read" means the cited passage, not the whole paper. CLAUDE.md and CODEX.md point to it.
- Both agents' self-audits are the starting list for tomorrow's quality pass.

## End-of-day cleanup - Claude, 21 October 2026

- `Workspace3D.tsx` reduced from 908 to ~65 lines: it now only shows the arrival scene, then routes each stop to its workshop (Escape returns to the map). The old procedural 3D stage and phone/old-level panels were unreachable since every stop got its own workshop.
- Removed the six unused old workshops (`Stop1SmelterWorkspace` … `Stop6AssemblyWorkspace`) and the unused `src/content/stops.ts` and `src/types/game.ts`; research notes that mention them describe history. Removed the empty `tmp/` folder.
- Moved `CLAUDE_OPINION.md`, `CODEX_OPINION.md` and `UNIFIED_OPINION.md` to `docs/history/` and updated the mentions in GUIDELINES.md and the research files. GUIDELINES.md title now says Supply Chain Gang.

Tests: `npm run lint` passes; `bun test src` 33 pass; `npm run build` "built in 511ms" (existing bundle-size warning). Not run: browser.

## Layer 2 brainstorm started - Claude, 22 October 2026

- The user's game vision (four loops: production, procurement, shipping, compliance; TV story) was only in Claude's private notes. Copied it into [GAME_VISION.md](GAME_VISION.md) so Codex can read it.
- New shared file [layers/LAYER_2_BRAINSTORM.md](layers/LAYER_2_BRAINSTORM.md) for Claude and Codex to work out loop 2 in turns: procurement or shipping second (Claude: procurement), a mechanics menu, a Norway walk-through, a money model, questions for Codex and for the user, research leads R1–R5.
- CLAUDE.md and CODEX.md now list both files under "Read first".

Sources: none opened (brainstorm; all research items are Leads). Tests: not run (no code changed).

## Procurement research and brainstorm turn 2 - Codex, 22 October 2026

- Read the updated CODEX.md, GAME_VISION.md and Claude's layer brainstorm. Added the user's latest direction to GAME_VISION.md without replacing earlier vision text: continue after funds run out, explore supplier branches and four progressively richer workshop runs, prioritize workflow over narrative. Distinguished confirmed direction from candidate mechanics.
- Added [Codex's turn 2](layers/LAYER_2_BRAINSTORM.md#turn-2-codex-22-october-2026), answering Q1-Q6 and proposing need/specification, supplier evidence, usable order quantity, physical acceptance and production as the layer's workflow. Preserved Claude's contribution. Added a [one-page proposal](layers/LAYER_2_PROPOSAL.md) for the next discussion, not an implementation plan.
- Added [16 source records](layers/sources/README.md) with Read status, passage locators and limits; retained two original supplier PDFs and two rendered previews. Read AIM's three-page solder-powder paper and selected TI supplier-guideline sections; read named web passages from CIPS, APQC, DigiKey, MicroChemicals, Kayaku, the quartz study, Elkem, Fraunhofer, the historical Wacker/SunPower contract, Heraeus and TI. Rendered and visually inspected AIM p. 2 and TI p. 10. Font-substitution warnings occurred; inspected pages were legible. Downloaded originals after approved network access.
- Proposed short supplier branches that rejoin the seven-stop route, preserving material ownership and wafer/chip/TV identity; differentiated financial failure from technical failure. Challenged generic price-to-quality tiers, arbitrary cheap-input die failures, real-time reading penalties and double-counted energy. Proposed paid access to existing workshops, distinct cash/consumption/stock accounting, and finite represented batch costs.

Checks: `git diff --check` returned no whitespace errors; local document links: PASS; PDF originals: 2 (both have PDF headers; pdfinfo reports 3 and 18 pages). Application tests: not run (documentation/research only). Browser: not run. No application code or game art changed; work left uncommitted.

Open / placeholder: exact supplier specifications and interactions for Germany/Japan/Malaysia, playable material-test parameters, pack sizes, prices, energy rates, budget feasibility, restart/debt details and per-run action allocation. No researched country cost percentages, solo-TV price, calibrated yield model, TV-shortage narrative verification, or shipping/compliance evidence claimed. Claude's next turn should challenge the workflow and narrow the proposal before building.

## Layer 2 brainstorm turn 3: a step back - Claude, 22 October 2026

- Committed Codex's turn 2 separately first (`git diff --stat` checked: the only removed lines were the empty "Turn 2" placeholder).
- At the user's request, stepped back from per-stop puzzles and endings. [Turn 3](layers/LAYER_2_BRAINSTORM.md#turn-3-claude-22-october-2026): what procurement is (5 plain steps from CIPS's 13), how it fits the supply chain (SCOR, Lead only), Kraljic's matrix with a first guess for our inputs, six real trade-offs with evidence, design rules (no clock, visible risk), a paper engine skeleton (sourcing desk, one turn per stop, supply events, bill and debrief), and a one-TV-or-batch question. Summary in K12.
- Sources: added P17–P26 to [the register](layers/sources/README.md). Read: P20 (SIA RFI comments, PDF pp. 12, 14, 27, 29), P23 (Microchip FY2021 10-K, Preferred Supply Program and supplier risk passages), P24 (BCG × SIA 2021, PDF pp. 39–41, 45), P25 (Dubois & Pedersen 2001, pp. 2, 4–5, Kraljic quoted). Skimmed: P26 (Harris 1913, abstract). Leads: P17 Kraljic original, P18–P19 SCOR, P21 Microchip letter, P22 Commerce results (downloads blocked or refused). Re-opened Codex's P01 (CIPS, 13 stages confirmed); P03 (APQC) returned 403.
- Added the user's no-clock and engine-first direction to GAME_VISION.md.

Tests: not run (no code changed). Browser: not run.

## Loop 2 prototype: Norway buying desk - Claude, 22 October 2026

- The user stopped the discussion ("we won't know until we try") and asked for a bare-bones, playable loop 2 for Norway only, to get a feel for procurement.
- Finishing the USA stop now opens a **replay screen** (the TV worked, then a $1,000,000,000 bill) with "Replay: Loop 2". The map then shows all seven stops done, with a "Loop 2" badge; only Norway opens (others show a notice). `?loop=2` in the URL opens the replay screen directly, for testing.
- Norway in loop 2 (`NorwayProcurement.tsx`, model in `src/content/norwayProcurement.ts` + test): **buying desk** (quartz, coal, wood chips, electricity; two suppliers each, showing lot size, total, leftover and a visible risk with its odds) → **deliveries** (each risk rolled once; a short delivery must be covered by another supplier's lot or an emergency broker) → the unchanged loop-1 furnace → **the bill** (bought / used / left over / paid, budget left or debt, one lesson line per item).
- Loop state is not saved (reloading returns to loop 1). No arrival scene in loop 2.

Tests: `npm run lint` passes; `bun test src` 38 pass; `npm run build` "built in 6.41s". Browser: not run (user tests).
Placeholders: all prices, lots, odds and the $1B bill are teaching values, not market data; fictional suppliers; text-and-card UI, no art. The furnace still has the player mine quartz although it was bought (to fix if the idea stays).

## Norway procurement revision - Codex, 22 October 2026

- Reviewed the user's playtest of Claude's prototype; findings and evidence limits in layers/NORWAY_PROCUREMENT_REVIEW.md, discussion in brainstorm turn 5.
- Replaced random supplier-card outcomes with a source map, sample/specification checks, negotiated preparation/pack terms, purchase orders and receipt acceptance. Quartz bought is distinct from usable chunks. The furnace requires accepted stock, starts with supplied feed rather than mining again, and spending survives world-map navigation.
- Replaced the old random-risk model/five tests with norwaySourcing.ts and ten engine tests. Prices, quantities, yields and supplier places are fictional teaching values. Auxiliary inputs remain simple; reload persistence and the rest of loop 2 are deferred.
- Checks: npm.cmd run lint exit 0; bun test src: 43 pass, 0 fail; production build: built in 783ms, existing bundle-size warning. Browser/playtest not run; left to the user. Five source sections reopened, as recorded in the review. Work uncommitted.

## Loop 2 Norway: buy → make → sell engine - Claude, 22 October 2026

- User playtest: the first prototype was "just clicking", Codex's revision too text-heavy. User idea: buying means selling too; balance costs across the step, success = a $0 bill or a profit; wanted negotiation and a real procurement process.
- New shared engine `src/content/tradeEngine.ts` (pure reducer, reusable by any stop) + Norway data `src/content/norwayMarket.ts`. Each input goes through the real purchase-to-pay steps: quote (lot × price, usable share unknown until sampled) → negotiate (each supplier has 1–2 asks and a patience limit; some agree, some refuse) → order (choose lots) → check the delivery (fines show up as unusable) → check the invoice (Harbour Coal's first invoice bills one bag too many; Pay or Dispute) → paid. Then the furnace (Codex's supplied-feed start kept), then **sell the silicon to Germany** (one counter-offer) and sell spares back at a loss. Result: spent, earned, profit or "your bill", plus one lesson per thing done or missed. No clock, no dice.
- Kept from Codex: bought ≠ usable (fines), receipt check before use, furnace skips mining, state held in App across map visits. Replaced Codex's `norwaySourcing.ts` (and its tests) and its supply-map screen with the shorter card layout; origins are one line on each supplier card.
- Tuned so careful play just breaks even (about +$20) and careless play loses about $100.

Tests: `npm run lint` passes; `bun test src` 38 pass (5 new engine tests). Browser: not run (user tests).
Placeholders: fictional suppliers, teaching prices; plain cards, no art; loop state not saved on reload.

## Norway buying visuals and full manufacturing - Codex, 22 October 2026

- Reviewed Claude's buy/make/sell prototype and the user's feedback. Kept the selling/spares/profit engine. Restored the clickable supply map and source/seller distinction; added representative materials and a short delivery illustration. Buying now focuses on one input and one supplier, with numbered steps and optional negotiation controls. Outstanding invoices remain signposted when changing suppliers.
- Restored all manufacturing actions, including mining and rock breaking, at the user's explicit request. Review and next visual suggestions: layers/NORWAY_BUYING_UI_REVIEW.md.
- Checks: TypeScript passes; 38 pass, 0 fail; build built in 618ms (existing bundle warning). Browser/playtest not run; user tests. No new external research; fictional locations, initials badges and simple objects remain prototype presentation. Uncommitted for Claude.

## Loop 2 Norway: supplier map with placeholders - Claude, 22 October 2026

- Per the user's decisions (layers/LOOP2_NORWAY_ASSETS.md): loop 2 Norway is now a full-screen **supplier map**. Smelter in the centre, six supplier pins and a **Germany customer pin**, roads to the smelter. Clicking a supplier opens a panel with the **product view** (what you're buying), the supplier's portrait, offer, sample, negotiation asks, lots and Order. A truck runs along the road when you order (visual only).
- A **store panel** on the right: cash, your stock as icons (grey = still needed, fines counted), the "at the gate" inbox (check delivery, then compare order vs invoice, Pay or Dispute), Sigurd's line, and "Go to the smelter". Smelter pin starts the unchanged loop-1 workshop; afterwards the Germany pin opens for selling, then the result and lessons.
- Engine unchanged (`tradeEngine.ts`, `norwayMarket.ts`). Codex's inset `NorwaySupplyMap.tsx` removed (replaced by the full map). New `ASSETS.supply` paths; every image falls back to a placeholder (code-drawn map, coloured discs, emoji) until the user's art lands in `public/assets/supply/`.

Tests: `npm run lint` passes; `bun test src` 38 pass. Browser: not run (user tests).
Placeholders: everything visual on this screen.

## Norway supplied map and review improvements - Codex, 22 October 2026

- Integrated the user's original coastal JPEG at public/assets/supply/norway_map.jpg, byte-for-byte unchanged. Full-image SVG coordinate system, terrain-based pins/routes, upstream source markers, keyboard access and stacked narrow layout.
- Store now reflects consumed inputs, unsold silicon and sold spares; purchasing evidence and revenue arithmetic are preserved. Reset supplier quantities on company change, show Germany's opening offer before buying, and show before/after negotiation terms. Reset sample knowledge after material-preparation changes and retry changed image assets after a missing-file fallback. Full manufacturing and selling retained.
- Tests: TypeScript exit 0; 41 pass, 0 fail across 9 files; build built in 707ms, existing bundle-size warning; whitespace check clean. Asset hashes match. No browser/playtest or external source research; map origins remain fictional illustration. Pin alignment and feel left to the user. See layers/HANDOFF.md. Uncommitted for Claude.

## First loop 2 art installed - Claude, 22 October 2026

- Committed Codex's map/review pass separately (`ec674e0`; reviewed the engine diff: stock on hand after the furnace, fresh sample after a preparation change; 41 pass).
- Installed five product views from the user's Gemini images (background removed, 512 × 384 transparent PNG); details in layers/HANDOFF.md. Added a "no floor" tip to the prompt file for the remaining assets.

Tests: `npm run lint` passes; `bun test src` 41 pass. Browser: not run. Cut-outs checked by eye on a dark preview sheet.

## Wood-chip/power images and visual buying feedback - Codex, 22 October 2026

- Reviewed Claude's product-art commit; inspected crushed quartz and bulk coal. Kept the assets; lightened the coal preview backing for legibility.
- Added the two supplied JPEG originals unchanged, routed their product paths through the asset manifest, and retained white backgrounds to keep this prototype pass small. Hashes match.
- Added a visual quartz sample result and explicit shortage/spare outcome to the order preview. No engine/economics change. TypeScript passes; 41 pass, 0 fail; build passes with existing bundle warning; no browser/playtest or new external research. Details in layers/HANDOFF.md. Uncommitted.

## Loop 2 Norway: selling with quotes and payment check, clearer map - Claude, 22 October 2026

- Committed Codex's wood-chip/power/sample-preview pass separately (`e822674`).
- Selling: competing quotes from two other customers, quote matching, buyer patience and cap, then a short payment to check against the invoice. Map: colour-coded pins with product icons, status badges, legend, "Next:" bar; no more broken-image icons. Bigger store icons. Second art batch installed. Decisions L14–L16 in layers/HANDOFF.md.

Tests: `npm run lint` passes; `bun test src` 42 pass. Browser: not run (user tests). Cut-outs checked by eye on dark preview sheets.

## Loop 2: chain model recorded, new map, cargo-ship pin - Claude, 22 October 2026

- User chose option A (chain); Norway only for now (L17–L19 in layers/HANDOFF.md, with the draft per-stop plan). Norway's result panel explains that Germany's payment becomes Germany's starting cost.
- Installed the user's snowy autumn map and the cargo-ship pin; moved two pins onto clearings.

Tests: `npm run lint` passes; `bun test src` 42 pass. Browser: not run. Pin positions checked against the map image by overlay, not in the game.

## Loop 2 Norway: calmer map and winter art - Claude, 22 October 2026

- User: the map looked like a cheap mobile game. Removed coloured discs, pulsing badges, legend and bright borders; plain building pins with one neutral label and status in words; faint roads; plain "Next:" line. Installed the winter map. Decision L20 in layers/HANDOFF.md.

Tests: `npm run lint` passes; `bun test src` 42 pass. Browser: not run (user tests).

## Procurement workflow file - Claude, 22 October 2026

- Added PROCUREMENT_WORKFLOW.md (what a loop 2 stop is, the 10-step workflow, the plan for the other stops, rules learned in Norway, art pipeline, testing) and `tools/cut_art.py` (the cut-out script used for all loop 2 art). Linked from CLAUDE.md, CODEX.md and layers/HANDOFF.md. Codex's section left open.

Tests: not run (documentation and a standalone script; no game code changed).

## Procurement workflow reviewed and expanded - Codex, 22 October 2026

Reviewed PROCUREMENT_WORKFLOW.md against today's build log, decisions L01-L20, game vision and active engine/App entry points. Integrated Codex's contribution into the main instructions rather than creating a competing workflow. Added the session's iteration history, reusable visual/economic rules, source/seller and stock/evidence distinctions, input/price/identity checklist for the chosen factory chain, incremental art handling, and bounded review/playtest cadence. Clarified that cross-country loop-2 handoffs are not implemented and the per-country lesson table is optional/unverified, not a build order. Corrected the commit instruction: Codex leaves work uncommitted unless asked. Existing logs preserved.

Checks: workflow local links PASS; no unfilled Codex placeholder; git diff --check clean. Application tests/build/browser: not run (documentation only). No new external source research or game-code changes. Work uncommitted for Claude.

## Procurement workflow review - Claude, 22 October 2026

- Committed Codex's expansion of PROCUREMENT_WORKFLOW.md separately (`f5ed7f4`). Kept its additions (session history table, chain-connection checklist, testing/reporting rules). Restored the user-approved one-lesson-per-stop direction, which Codex had relabelled as optional; added the stop goal (L05: $0 bill or a profit).
- Norway result text now names the **agreed** price as Germany's starting cost (Codex's point: a short payment is settled separately, not a price change).

Tests: `npm run lint` passes. Browser: not run.

## Loop 2 Norway: neater pins and blended UI - Claude, 22 October 2026

- Buildings anchored on their point with ground shadows; product markers for places without building art; outlined map lettering instead of label boxes; one translucent box style for the map buttons, panels and store. Silicone Works moved onto land.

Tests: `npm run lint` passes; `bun test src` 42 pass. Placement checked on an offline mock render of the map, not in the browser.

## Loop 2 Norway: badge-style map places - Claude, 22 October 2026

- Each map place is a round plate with its building/product and an attached label tab; material origins likewise. Harbour Coal moved to avoid overlap. Checked on an offline mock render.

Tests: `npm run lint` passes; `bun test src` 42 pass. Browser: not run.

## Loop 2 Norway: last art batch - Claude, 22 October 2026

- Installed truck, three building pins and seven portraits; the German-flag customer building is used for Germany only. 25 of 26 listed assets now installed (missing `pin_harbour`). Cut-outs checked by eye on dark previews.

Tests: `npm run lint` passes. Browser: not run.

## Germany loop 2: procurement research - Codex, 22 October 2026

- At the user's request, ran procurement workflow steps 1-2 for Germany. Reread the game vision/workflow and reconciled Norway's carried silicon, Germany's HCl/H2/electricity needs, unchanged workshop and Japan output. Added [research/germany/PROCUREMENT_RESEARCH.md](research/germany/PROCUREMENT_RESEARCH.md), with GP01-GP11 records, contract distinctions, supplier/origin limits and a bounded handoff for Claude.
- Read selected passages in 4 saved primary PDFs and 7 primary web pages. Rendered and inspected the HCl package/specification table and WACKER's process illustration. One Nippon Sanso brochure is Lead because its URL redirected to a country selector. Four originals and two previews saved under Germany's research folders. Earlier workshop records were context, not independently re-reviewed in full.
- Evidence supports the contract/minimum-commitment lesson for on-site industrial gas, with different terms for merchant/cylinder supplies. Real German HCl/H2 sales channels and an actual future Burghausen electricity PPA documented. Purchasing fresh HCl must be distinguished from recycled plant flow. No private quotations, exact local supplier count, plant qualification specifications or sourced game prices claimed.
- Appended country and layer handoffs; linked from Germany's source README. No plan, game code, market tuning or art changed. Next: Claude reviews the evidence; the one-page Germany plan is a later phase when requested.

Checks: Poppler document identity/page counts and local research links; git diff --check. Application tests/build/browser: not run (research/documentation only). Recommendations are not user decisions; all existing logs preserved. Changes left uncommitted.

## Germany loop 2: research review and additions - Claude, 22 October 2026

- Reviewed Codex's Germany procurement research. Re-verified GP01 (Linde gas contract terms), GP02 (WACKER report, pages and quotes) and GP05 (VERBUND power deal) against the originals: confirmed, no corrections. GP06 unreachable (HTTP 503); the other records not reopened.
- Added GP02 passages (polysilicon sold on short and long-term contracts; customers' advance payments; WACKER's long-term contracts and volume guarantees) and three new saved, read primary sources: GP12 (2026 Bavarian grid-fee price sheet), GP13 (StromNEV § 17, § 19) and GP14 (Hemlock v. SolarWorld, a German polysilicon buyer's take-or-pay contract). One new Lead (GPL02, Kyocera case, not read).
- Findings: the minimum-commitment lesson is real and cuts both ways (cheap if you use it, a bill if you don't); German electricity bills charge for the year's single highest peak, a candidate way to show power at this stop; the sale to Japan can be long-term with advance payment or short-term at a benchmark price. Recommendations only; no plan, code or art.

Checks: page numbers and quotes checked with Poppler. Application tests/build/browser: not run (research only).

## Germany loop 2: Codex review and research contribution - 22 October 2026

- Reviewed Claude's `dfb4591`, reopening GP02's new passages and GP12-GP14 source pages. Corrected page references, advance-payment balance interpretation, the undisclosed hourly electricity profile, peak-demand wording and the distinction between annual take-or-pay and future-term termination damages. Integrated corrections in the research document; historical logs preserved.
- Added GP15, a primary regulator announcement describing the intended 2029 grid-tariff reform, with explicit review limits. Reopened GP05 and live § 19; live § 17/PDF requests timed out. Read selected passages in 4 existing PDFs; rendered and inspected GP12 p. 1 and GP14 p. 3, saving two previews. Other earlier records/leads not reopened; no new PDFs downloaded.
- Contributed a comparison checklist and accounting distinctions for future planning. Recommend one commitment lesson, deferring workshop peak tracking and advance-payment mechanics. An advance reduces the outstanding sale balance; a payment obligation creates no undelivered stock. These are agent recommendations, not new user decisions. No Germany plan, game code, prices, quantities or art changed.

Checks: local research links and git diff --check. Application tests/build/browser: not run (documentation/research only). Changes uncommitted for Claude.

## Germany loop 2: final research review - Claude, 22 October 2026

- Checked every correction from Codex's review against the saved PDFs (GP02 pp. 77, 89; GP12 p. 10; GP13 p. 1; GP14 pp. 17, 19) and reopened GP15: all accepted. Noted that only GP14 states a pay-if-not-taken clause in words.
- Agreed to defer the electricity peak charge. Added GP16 (Air Liquide's on-site hydrogen/CO contract at Chempark Dormagen) and Lead GPL03 (other German on-site contracts, trade press only).
- Wrote "Research closed: what the plan can use", the joint summary for `layers/GERMANY_PLAN.md`.

Checks: quotes and pages via Poppler. Application tests/build/browser: not run (research only).
