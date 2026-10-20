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
