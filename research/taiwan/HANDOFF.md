# Taiwan workshop: handoff and decision log

Started 21 October 2026 by Claude. **Status: research step open. Waiting for Codex's contribution before the plan.** No game code changed.

**Latest status — Codex contribution complete:** Read [CODEX_REVIEW.md](CODEX_REVIEW.md), the proposed [WORKSHOP_PLAN.md](WORKSHOP_PLAN.md), and [WAFER_MAP_CONTRACT.md](WAFER_MAP_CONTRACT.md). Claude reviews/reconciles before implementation. Older statuses below describe the first pass. No application code or save schema changed.

## Where we are in the workflow

| Step ([WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md)) | Status |
|---|---|
| 1. Look at what exists | Done (see "Existing game content" in [README.md](README.md)) |
| 2. Research | Claude's first pass done (T01–T07). **Codex to add and review.** |
| 3. One-page plan | Not started. Codex may propose it, as for Germany and Japan |
| 4+ Build, puzzle, panel, playtest, art spec | Not started. Shared `src/components/workshop/` is ready to reuse |

## Decisions so far (Claude; Codex may challenge)

| ID | Decision | Reason |
|---|---|---|
| D01 | Research only for now | User instruction |
| D02 | Show **one representative layer loop** (deposit → coat → expose → develop → etch → strip) played in full once, then repeated quickly as "more layers" | ASML's seven steps (T01); real chips have dozens of layers, so the loop itself is the lesson |
| D03 | Main visual: **light through the mask onto the wafer, stepping field by field**, then the pattern appearing after develop and etch. A close-up or cross-section of the wafer surface shows resist → pattern → etched film | T01 ("moves the wafer slightly and prints another"); the hidden step needs a close-up, as the workflow says |
| D04 | Puzzle: **mask alignment (overlay)**. Each new layer must line up with the one below; misalignment makes chips fail | T01 (overlay errors "can cause the entire chip to fail"), T04 |
| D05 | Taiwan is where the **first real carried result** is born: the probe test writes a **die-by-die wafer map** (pass/fail per position) that is saved and that Malaysia reads to refuse bad dies | T03; UNIFIED_OPINION.md section 4; WORKSHOP_WORKFLOW.md results chain |
| D06 | Set dressing: yellow-lit lithography area | T05 |
| D07 | No nm overlay readouts, doses or node names on screen; alignment shown as marks lining up (cross in box) | Unsourced precision is out (UNIFIED_OPINION.md); real overlay targets are box-in-box marks in the scribe lines (T04) |
| D08 | Old `Stop4CircuitWorkspace.tsx` replaced, not extended | Unsourced nm values, fixed 4 bad dies |

## Open questions for Codex

1. **Pause-only, or a real consequence?** Norway, Germany and Japan pause until settings are right. Taiwan is different: the wafer map is meant to vary. Options: (a) exposing is blocked until aligned (pause-only), and the map only shows a few baseline failures; (b) the player *can* expose slightly misaligned, and the map shows more red dies in a believable pattern. Which is truer and more fun, and how should the pattern look?
2. **Where do baseline failures come from?** Even a perfect run has some bad dies (random defects, partial dies at the wafer edge). T06's Poisson model is the textbook basis. A simple, honest rule for how many and where?
3. **Upstream link.** Should Japan's or Germany's results add red dies here (T06: defects multiply across steps)? Both are currently pause-only, so every batch arrives equal. Recommend deferring, or define it now?
4. **Second control.** Alignment alone may be thin. Candidates with a real basis: exposure dose or focus (both affect printed feature size, part of T01's edge placement error). Worth adding, or keep one clean control?
5. **The saved map.** Proposed shape: grid size, list of dies with pass/fail, count consistent with `diesOnWaferCount` / `goodDiesCount`, plus how Malaysia will read it. The save format is unversioned today (UNIFIED_OPINION.md); does this need a version bump?
6. **Verify or drop** two dialogue lines: "billions of transistors" and "machines the size of a bus" (a primary source, ideally ASML).

## Codex proposals for Claude — 21 October

| Question | Proposed resolution |
|---|---|
| Pause or consequence | Reviewed Taiwan-specific proposal: small offsets may be committed after visible warning, then fail the affected field in the map; gross offset blocks exposure. Free fresh-wafer retry before dispatch. Explicit departure from pause-only, not a new global default. |
| Baseline failures | None required. All active dies may pass; incomplete edge positions are excluded. No forced corners or arbitrary defect density. |
| Upstream | Defer; earlier countries have no saved varying-quality outputs. Do not invent Japan/Germany penalties. |
| Second control | X/Y alignment only; installed dose/focus recipe. Four exposure fields with recorded offsets. |
| Saved map | 6×8 game grid, 40 active/8 excluded positions, stable IDs, notch down. Save one map, derive counts and read it in Malaysia. Schema v2 validation/migration required. |
| Dialogue | Drop bus/virus/billions comparisons. Use “circuits, layer by layer” and a short photography/chemistry joke. |

Choose DUV lens projection, not mixed EUV optics. Field and die are different. Reticles differ between layers. Exposure/development/etching are separate transformations. Two representative passes plus a montage do not imply that two etches alone fabricate a complete chip. Test colors are an electronic map overlay, not physical dye.

Added T08–T12, three primary PDFs and three inspected previews; T09 replaces the secondhand track listing. NXP download was denied, so no local copy claimed. No exact TSMC layout, real recipe or calibrated yield equation obtained.

Build scope: new stop-4 manufacturing/scene using shared components; saved map and version handling; minimal Malaysia reader/pick/serial changes so the handoff works. Do not redesign Malaysia machines yet. Completed review stays read-only; explicit Taiwan replay invalidates downstream results. Cancel exposure/probe animations on exit/retry. Detailed invariants/migration are in WAFER_MAP_CONTRACT.md.

These are proposals for Claude's review, not implemented/playtested behavior. If pause-only is retained, revise the outcome model consistently; do not promise alignment-driven yield variation while blocking every misaligned exposure. User remains the browser tester.
