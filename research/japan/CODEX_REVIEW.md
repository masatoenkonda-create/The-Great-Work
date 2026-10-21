# Japan: independent review and contribution

21 October 2026. Review of Claude's J01–J05 research, six handoff questions, current Japan/Taiwan code and shared workshop components. Research and design only; Claude reviews the proposed [WORKSHOP_PLAN.md](WORKSHOP_PLAN.md) before building.

## What to keep and correct

Keep the Czochralski puller and multi-wire slicing as the two main reveals. This is **solidification from a melt**, unlike Germany's silicon deposition from vapor. The important realization is that pure chunks are not yet one crystal: the seed sets the crystal orientation as the melt solidifies.

| Finding | Build direction |
|---|---|
| “One giant perfect crystal” / “every atom lines up” | Say “one continuous crystal” or “a single crystal.” Orientation matters, but even dislocation-free material can contain other defects. Do not certify absolute perfection. |
| J03 says pull rate is adjusted with heater power | Treat this as coupled growth control, not a literal heater driving the lift motor. Heat changes solidification conditions; the pull drive sets withdrawal. Both must work together. |
| One speed window for all growth | Neck, shoulder, body and tail have different targets. Keep neck/shoulder/tail automatic; apply the player's steady-body puzzle only after the shoulder reaches its target. |
| Visible shiny ring | It is the meniscus reflecting hot-zone light, not a boiling ring or proof of a flawless lattice. Show a stable bright boundary, not lava bubbles. |
| Disappearing growth ridges as a failure gauge | Primary studies support it in examined industrial crystals, but not as a universal instant defect meter. Use diameter/meniscus feedback for this sample. |
| Thin/wide body = contamination | Geometry, dislocations, intrinsic point defects and surface particles are separate. Do not turn a diameter excursion or number of retries into a chemical-contamination score. |
| A saw slicing a standing hot boule one disc at a time | Cool and extract first; crop/grind a body section, support it horizontally, then lower/feed it into a moving wire web. Parallel wires slice a batch in one operation. |
| “Diamond slurry saw” / “without kerf loss” in the old UI | Choose one coherent saw depiction: a slurry-fed wire web, supported by J09. Sawing removes material; do not claim zero kerf loss. Diamond wire is an alternative, not a reason to mix both descriptions. |
| Rough discs directly become mirror wafers with no material contact | Compress edge preparation, lapping/etching and cleaning, but show the wafer held against polishing pads with process fluid, then rinsed/dried and inspected. No free-floating magic shine. |
| “Several days” as a universal correction | J02's days apply to its historical large crystal. For the proposed representative ingot, “Grown slowly; time is shortened here” belongs in team notes. Aiko can say “A big crystal takes patience. (And snacks.)” without claiming every run has the same duration. |

## Six decisions for Claude

1. **Results chain: choose pause-and-recover for this build.** This follows the current workflow and existing countries. A validated mapping from pull setting to extra failed dies has not been established; Taiwan currently hard-codes four failed positions and has no Japan-result reader. Ship a qualified batch after recovery. If process-status fields are added, distinguish crystal-growth qualification from surface-cleaning completion. Do not call either a measured contamination level. Variable upstream consequences remain a future explicit design task, not a hidden random penalty.
2. **Visible errors: show the interface and diameter trend.** At fixed thermal conditions, too-fast withdrawal can narrow the forming crystal and slower withdrawal can widen it; use these as qualitative tendencies, not universal thresholds. Heat changes the solidification front too. A warning can show the meniscus/trend without adding a permanently defective segment. Pause accepted growth before damage and resume from that checkpoint. Never show a bent/faulty grown section becoming a perfect cylinder retroactively. Actual structure loss would require different handling and is outside this sample.
3. **Puller basis: J03 Figure 1 for the interior; J08 for the silhouette.** Both are saved and inspected locally. Keep a tall upper receiving chamber, lower hot-zone chamber, quartz crucible, surrounding graphite support/heater, seed holder and restrained gas/vacuum connections. The lower graphite part supports the quartz; it is not a second bowl of melt. Use a clear section cut while retaining the steel shell. J03's last page states CC BY 3.0; preserve attribution for reuse and check figure-specific credits. J02 has publisher/photograph credits, so do not assume its images are freely reusable. Manufacturer references are not licensed game art.
4. **Wafer steps: compress the long production line.** Agree with Claude, with one addition: keep a brief crop/grind transition before slicing. The neck/crown/tail are not usable full-diameter discs. Follow with wire slicing → combined finishing → inspection/boxing. Do not add an etch recipe, abrasive selection or second tension puzzle.
5. **Seed/neck: seed installation and dipping are player actions; necking is automatic.** Show the thin neck and shoulder as part of the growth animation, then give control of the body. Do not teach “slower is always better” across the necking phase. It has a different purpose and speed regime.
6. **Crucible: install it.** The arriving quartz crucible visibly seats in the graphite support before loading polysilicon. Its condition is not another puzzle. Used-crucible removal may be a background end animation; there is no learning need for a waste-management step. Argon, utilities and controlled dopant addition are installed supplies, not extra pickups.

## Control proposal and limits

Main tuning: **HEAT −/+** and **PULL −/+**. One **ROTATE** switch starts visible counter-rotation; it is a prerequisite rather than a third tuning puzzle. A small asymmetric marker on the chuck/support makes rotation readable even when the crystal is round. Show heat response, pull setting, body growth and diameter/trend. Fixed detents/bands are teaching values; do not carry over the old 1.0–1.4 mm/min window.

The only meaningful “success” is a stable growing body followed by completed finishing and inspection. Within this simplified model, stop the growth timer when conditions are unsuitable, retain already accepted growth and explain the observed condition in Aiko's single-message box. Keep physical melt level and growing-body length linked visually. No silent progress with the drive stopped or rotation off.

Do not make a pressure, magnetic-field or dopant-ratio control merely because it exists in industry. A small controlled addition sets electrical properties in real production; unwanted contaminants are a different concept. This lesson is about crystal growth and wafer preparation, not deliberate doping design.

## Code handoff audit

- `Workspace3D.tsx` routes stops 1 and 2 to their dedicated manufacturing components; stop 3 still renders `Stop3WaferWorkspace.tsx` and the old generic stage scene. Add Japan's dedicated route and bypass the old form/scene for that stop. Replacing only its text will not produce the new workshop.
- Reuse `WorkshopLayout`, `CockpitPanel`, `GuideBox`, `useActKey` and `useTimedPhase` already present in `src/components/workshop/`. There is no need to repeat Germany's extraction step or change Norway/Germany.
- Old pull temperature and rate controls are disabled during pulling, so recovery is currently a retry/reset rather than a live puzzle. Old wire tension changes no slicing result. Polishing can start multiple untracked intervals. Replace those behaviors with one controlled attempt and cancellation on navigation/retry.
- Arrival inputs are polysilicon, quartz crucible and seed. Show all three being used. Keep map pitch, arrival and workshop consistent, and preserve the Germany-output-to-Japan-input link without inventing missing purity flags.
- `CargoState` currently stores `wafersProducedCount` but no crystal or contamination status. Taiwan reads a count with a `|| 25` fallback and produces four fixed bad dies. No variable defect consequence exists today. Proposed new fields in the plan are unimplemented until Claude explicitly adds them with save/version handling and downstream readers.
- Completion must wait for inspection, edge-supported loading into the shipping box and dispatch. Finished wafers are blank: no die grid, circuit pattern or electrical die probe at this level.
- Keep 25 as an internal compatible representative batch if needed, not a sourced yield from a 300 mm × 2 m crystal or Germany's 10 kg batch. Choose a short representative body section and compressed scale; avoid combining mutually incompatible production quantities on screen.

## Validation

Read the current code and primary producer/equipment pages; downloaded J03, J08 and J09 originals. Poppler validated their metadata/text and rendered the selected pages. Inspected J03 PDF p.2, J08 p.1 and J09 p.14 visually. Poppler emitted font-substitution warnings for the chapter; the inspected diagram and caption are readable. J03's license statement was checked on PDF p.30. The structure-loss papers' full publisher pages returned 403; only indexed primary-publisher excerpts informed the bounded J10 record. No validated control model, exact Imari puller or automatic structure-loss detector was obtained. No app code, tests or browser playthrough changed/run.
