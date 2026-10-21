# Claude opinion: The Great Work, first alpha

Reviewed 2026-10-20 at commit `bbfe372` on `main`, against this repo's `GUIDELINES.md` ("one chip, one road", seven stops).

**Method.** This is a source review only. As requested, I did **not** playtest. I read the code, `BUILD_NOTES.md`, `GUIDELINES.md` and `SOURCES.md`, then ran the build and typecheck:

- `bun install`, then `tsc --noEmit`: **passes, no errors**.
- `vite build`: **passes**, with a large-chunk warning (three.js + Leaflet in one bundle).

I wrote this before reading `CODEX_OPINION.md`, so the two stay independent. Anything about how the game *feels* on screen is inferred from the code and still needs a playtest.

---

## 1. Verdict

**A big step forward, and a solid base to iterate on.**

- The whole seven-stop journey exists.
- One lot travels the route with save/resume.
- Every stop has a real workspace instead of a stub.
- Three stops (Norway, Germany, Japan) already have genuine fail-and-retry states with explanations.

That is more than the first-run brief asked for.

The weak points are the ones the guidelines warned about:

- **Results don't carry forward.** Each stop is a pass/fail gate with fixed outputs, so the lot's "quality" never changes anything downstream.
- **Gemini invented precise numbers and citations.** The in-app source panel cites sources that are **not** the ones in `SOURCES.md`.
- **A few factual slips.**
- **Leftover old prototype code and the retired Japan infographic** are still in the repo, and the infographic still ships in the build.

None of this is surprising for an alpha. The next run should spend its effort on cause-and-effect and data honesty, not on more features or art.

## 2. Against the guidelines' first-run checklist (§9–§10)

| Requirement | Status | Note |
|---|---|---|
| Builds and starts | ✅ Builds (verified) | Startup not verified (no playtest). |
| Map with exactly seven points | ✅ | `ROUTE_STOPS` in `src/types/route.ts`. |
| Enter each stage, see place/input/output, advance to the ending | ✅ | Each stop has a workspace plus a labelled "Complete Placeholder" button. |
| Cargo identity consistent | ⚠️ Partly | Lot ID persists, but see bugs B2 and B3. |
| Stage-boundary save/resume and full reset | ✅ / ⚠️ | `services/storage.ts` saves to localStorage. Reset creates a fresh lot ID. Revisiting a completed stop can move progress backwards (B1). |
| `BUILD_NOTES.md` accurate | ⚠️ | It claims features the code doesn't show (§5). |
| "Use plain shapes, simple panels and no sound" | ➖ Exceeded | Gemini added procedural audio, OrbitControls and a three-theme real-world map. Harmless, but effort went to polish before cause-and-effect. |
| Failed output cannot silently advance a real stage | ✅ for "Release Output" | That button is disabled until the stop's task is done. But the placeholder button is always available next to it (B4). |
| No exact temperatures, purity %, transport times | ❌ | Many invented industrial numbers (§4). |
| Retired infographic not restored | ❌ | `public/assets/aistudio/japan-supply-chain-map-v2_*.png` is still in the repo and gets copied into `dist/`. |

## 3. Learning value and game design

**What works**

- **Stop 1 (Norway).** Sorting quartz from slate/granite has a reason ("iron and alumina"). The carbon ratio has two distinct failure explanations: too little carbon leaves silica slag; too much forms silicon carbide. That is a good model of "a parameter with a sweet spot and a consequence".
- **Stop 2 (Germany).** It separates the three ideas of converting, distilling and depositing. Repeated distillation passes visibly lower an impurity counter, which is the right lesson ("purity takes repeated chemistry, not more heat").
- **Stop 3 (Japan).** The crystal pull fails three different ways (too cold, too hot, too fast), each with an explanation, and offers a retry. This is the best stop.
- **Stop 5 (Malaysia).** Picking a die that was marked defective in Taiwan is refused, with a message linking the two stops. That is exactly the "testing results travel with the product" lesson. More of this, please.
- **The input/supplies/equipment/design-info distinction** (guidelines §5) is respected. Each stop has a "ready-made inputs arrived" note instead of extra levels.
- **The map legend** carries the "representative teaching scenario, not an iPhone itinerary" disclaimer, as required.

**What limits the learning**

1. **Pass/fail gates, not consequences.** Every stop produces the same fixed output however well you did:
   - Norway always gives 12 kg (`Stop1SmelterWorkspace.tsx`, `batchWeightKg`).
   - Germany always gives 10 kg.
   - Japan always gives 25 wafers.
   - Taiwan always gives the same four defective dies, the four corners (`Stop4CircuitWorkspace.tsx:76`), whatever you do in the fab loop.

   The player learns "find the green zone, then continue". They don't learn "my sloppy step earlier caused this later". The single biggest improvement is **one quality value on the lot** that each stop can raise or lower, which later stops show and react to. For example: purity from stops 1–2 affects crystal defects in stop 3, and crystal defects plus fab choices affect the die map in stop 4.
2. **Stop 4, the fab, is the weakest interaction.** Five of the six cycle steps are a "Next" click. Alignment is an "Auto-align" button. Nothing the player does changes the probe result. Since the fab loop is the core idea of the whole game, it deserves the first real model:
   - Exposure without alignment, or a skipped clean, should produce visible defects in the cross-section and more red dies.
   - Running the cycle more than once could show layers building up.
3. **The placeholder shortcut is always visible.** Guidelines §7 allows "Complete placeholder" for *skeleton* stages. Now that all six workspaces are implemented, the button sits under every real task, so a learner can skip everything. It's labelled honestly and recorded as `placeholder`, but it should be hidden behind a dev/debug toggle once a stop is real.
4. **Stop 7 ending.** It has the unbox → boot → app sequence. A short **replay of the route showing the lot's history** (what was made where, any failures retried) would make the ending teach rather than just celebrate.

## 4. Factual accuracy

Most process descriptions are right in broad strokes:

- quartz + carbon → silicon metal;
- HCl → trichlorosilane → distillation → Siemens deposition;
- Czochralski pull → wire saw → polish;
- deposit → coat → expose → develop → etch → strip;
- dice → pick good die → wire bond → mold.

**Correct these:**

| Where | Says | Problem |
|---|---|---|
| `route.ts`, stop 5 output | "**Hermetically sealed** … packaged chip" | A plastic, resin-molded package is **not hermetic**; hermetic means ceramic/metal. Say "protected in molded resin". |
| `SourcesPanel` / `route.ts` `SOURCES_REGISTER` | R11 "Industry manufacturing literature"; R13 "Chemical engineering references"; R14 "Wafer probe testing…"; R15 "OSAT industry documentation… Malaysia"; R18 "Final IC testing and burn-in" | **These citations don't match `SOURCES.md`.** There, R11 = Apple's supply chain page, R13 = WACKER 2022, R14 = DNP photomask, R15 = ASE packaging substrate, R18 = Penang back end. Gemini kept the IDs and invented new titles, publishers and "supported facts". This is the most serious accuracy issue, because the panel tells the learner "this is sourced". Generate the panel from `SOURCES.md` (or one JSON derived from it), never hand-write it. |
| Stop 4 alignment | "ALIGNED (Δ < 0.5 nm)" | The same over-precise overlay figure the first review flagged. Drop the number. |
| Stop 1 | "16–20 MW optimal", ">1900 °C" | Plausible order of magnitude for a submerged-arc furnace, but the guidelines forbid precise industrial settings. Use toy labels (low / balanced / high). |
| Stop 2 | Bed "290–320 °C", HCl "Nm³/hr", reflux "10–15", rod "1080–1120 °C", "<0.1 ppb" | Same. These look like real recipes and aren't sourced. |
| Stop 3 | Melt "1415–1425 °C", pull "1.0–1.4 mm/min", roughness "< 0.2 nm" | Same. Silicon's melting point (~1414 °C) is a fact worth keeping as a single sourced number; the "ideal windows" are invented. |
| `route.ts`, stop 3 summary | "polish to **atomic flatness**" | Marketing language; say "mirror-polished". |
| Workspace3D, phone serial `PHONE-A18-…` | "A18" | That's Apple's real chip name, which hints that the game models a real Apple part. Use a neutral serial. |
| `route.ts`, stop 6 pin | Zhengzhou | A specific city pin (a well-known iPhone assembly city) without a source entry. The guidelines say exact pins need evidence: either add a source or pin the region only. |
| Stop 7 | San Francisco as the user | Fine as a scenario choice. Label it so (it's tagged "Game scenario", good). |

**Fine as is:** 98–99% purity for metallurgical-grade silicon; the stop 2 input of HCl; "Silicon metal powder"; carbon from coal/woodchips; SiC forming with excess carbon; edge dies failing more often.

## 5. BUILD_NOTES.md vs. the code

The notes are useful, but several claims don't match the code. That matters because the next run trusts them:

- **"SNES 16-Bit Style World Map … pixel terrain outlines and water wave grid texture".** `WorldMap.tsx` is a **Leaflet** map using real web tiles (CARTO Voyager, CARTO Dark and Esri satellite imagery). I found no pixel-art layer. It also means the map **needs internet** and depends on third-party tile services.
- **"Iteration 6 complete".** The history has a single commit, so the iteration count can't be checked. Fine, but don't rely on it.
- **"Zero TypeScript linter errors".** ✅ Confirmed.
- **Sources panel: "Full citation list … from SOURCES.md".** ❌ It is not from SOURCES.md (see §4).

Ask the builder to separate **"verified by running"** from **"implemented, not checked"** in the notes, as the guidelines' acceptance check requests.

## 6. Code quality and bugs

**Structure.** Clean and readable for an alpha:

- `types/route.ts` holds the route and cargo types.
- `services/storage.ts` handles save/resume.
- `Workspace3D.tsx` is a shell with one component per stop.

Facts are *mostly* in data (`ROUTE_STOPS`), but many on-screen descriptions and all numbers are still hard-coded in the stop components.

**Bugs found by reading the code:**

- **B1: Revisiting a completed stop moves progress backwards.** `App.tsx` `handleCompleteStop` always sets `currentStopId = activeStopId + 1`. The map lets you open completed stops (`WorldMap.tsx:250`). If you're at stop 6, reopen stop 2 and press Release, you're sent back to stop 3 with downstream results overwritten. Fix: `currentStopId = max(current, active + 1)`, and make review read-only.
- **B2: Placeholder and earned results disagree.** The stop 4 placeholder records 42 good dies (`Workspace3D.tsx`), but the stop 5 die grid **hard-codes** its own defect pattern (corners 0, 7, 40, 47 → 44 good) instead of reading the wafer map from the lot. The lot says 42 while the screen shows 44. Fix: store the actual die map in `CargoState` at stop 4, and have stop 5 render that.
- **B3: "False zero" fallbacks**, which guidelines §7 explicitly forbids. Examples: `cargo.siliconMetalBatchKg || 12`, `cargo.polysiliconBatchKg || 10`, `cargo.wafersProducedCount || 25`, `cargo.goodDiesCount || 44`, `cargo.selectedChipSerial || 'CHIP-LOT26-D28'`. If a value is missing, the UI invents one instead of showing "no input". Stop 2 also always prints "→ 10 kg" regardless.
- **B4: Placeholder always offered** on real stops (§3.3).
- **B5: Untracked timers.** Several `setTimeout`/`setInterval` calls in stops 1, 2, 4, 5 and 6 are never cleared on unmount or retry. Leaving a stop mid-animation can fire `onProbeCompleted` or `onPurificationCompleted` after you've moved on.
- **B6: GPU memory.** Workspace3D disposes the renderer and controls when the stop changes, but not the geometries and materials built by `buildWorkspaceStage`. Minor for seven stops.
- **B7: Saved state isn't versioned or validated** beyond two fields. A save from an older build could load with missing fields; this is likely what triggers the `||` fallbacks. Add a version number and reset on mismatch.

**Leftovers to delete:**

- `StageMinigames.tsx`, `ThreeCanvas.tsx`, `HUD.tsx`, `TitleScreen.tsx`, `SupplyChainMapModal.tsx`, `types/game.ts`. These are unused (nothing imports them from `App.tsx`) and they still contain the old Japan-centric facts we corrected.
- The retired PNG and its folder.
- Unused dependencies: `@google/genai`, `express`, `dotenv`, `tsx`.
- The package name `react-example`.

## 7. Recommendations for the next Gemini run (in priority order)

1. **Make the sources panel honest.** Generate it from `SOURCES.md`, remove the invented entries, and delete the retired infographic and the old prototype files.
2. **Fix state bugs B1–B3 and B5:** no backward progress, the die map travels in the lot, no `||` fallbacks, and timers are cleared.
3. **Add one quality value to the lot,** and make stops 3 and 4 react to it and to the player's choices. The fab loop (stop 4) gets real consequences: misalignment or a skipped clean → defects in the cross-section → more red dies.
4. **Replace invented numbers with toy labels** (low / balanced / high), keeping only sourced facts as numbers. Fix "hermetic", "atomic flatness" and the "A18" serial.
5. **Hide the placeholder button** on implemented stops (dev toggle).
6. **Map: drop the live tile servers** for a simple offline map (an SVG outline or a static image). This is the base for later pixel art, and it removes the internet dependency.
7. **Ending:** add the route replay with the lot's history.
8. Only then: art, sound, more detail.
