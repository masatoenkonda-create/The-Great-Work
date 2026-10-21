# China workshop: handoff and decision log

Started 21 October 2026 by Claude. **Status: research step open. Waiting for the user's product decision (D02) and Codex's contribution before the plan.** No game code changed.

## Where we are in the workflow

| Step ([WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md)) | Status |
|---|---|
| 1. Look at what exists | Done (see "Existing game content" in [README.md](README.md)) |
| 2. Research | Claude's first pass done (C01–C08). **Codex to add and review.** |
| 3. One-page plan | Not started |
| 4+ Build, puzzle, panel, playtest, art spec | Not started. Shared `src/components/workshop/` ready to reuse |

## Decisions so far

| ID | Decision | Reason |
|---|---|---|
| D01 | Research only for now | User instruction |
| **D02** | **Open, for the user: TV or phone?** Claude recommends **TV**: (1) the game's story is a man whose **TV** won't work (memory: TV-chip premise); (2) the chip we built in Malaysia, a wire-bonded plastic BGA, is believable for a cost-sensitive TV main processor but not for a modern phone's main processor, which is flip-chip with memory on top (C04); (3) China is the world's TV assembly hub (C06). If TV: China builds the TV main board and the TV; USA becomes "deliver the TV, plug it in, watch". If phone: keep the current route, but our chip is better described as one of the phone's smaller chips | Story fit, technical fit, setting |
| D03 | The shared core regardless of D02: **SMT board line**: paste print → paste check → place chip → reflow → inspect, **with X-ray for the hidden joints** | C01–C03; the "aha": the joints you can't see |
| D04 | Main visuals: stencil print leaving grey paste dots; the chip dropped on; the board riding through a glowing tunnel oven; an X-ray inset revealing round joints under the chip; then final assembly and the screen lighting up | Four questions |
| D05 | Puzzle candidates with a real basis: **reflow profile** (peak heat and time: too cold = balls don't fully melt, e.g. head-in-pillow; too hot = damage). Alternative: **paste print** (too little / too much paste = open joints or bridges) | C02, C03 |
| D06 | Final test after assembly: for a TV, power on and aging/screen check (C05); not invented "bus comms" diagnostics | C05; old code's unsourced checks |
| D07 | Product ID: neutral, derived from Malaysia's chip serial; no "A18" | UNIFIED_OPINION.md |
| D08 | Old `Stop6AssemblyWorkspace.tsx` replaced, not extended | Tick-box steps, unsourced diagnostics, Apple-style serial |

## Open questions for Codex

1. **TV main processor package (C04).** A source showing what a typical TV main processor (e.g. MediaTek TV SoC) is packaged as. Does a wire-bonded BGA fit?
2. **Reflow puzzle basis.** A primary source (paste maker, IPC, or oven maker) for what goes wrong when the reflow profile is too cold or too hot, especially for BGAs (head-in-pillow, voids, warpage). Enough for a two-control puzzle?
3. **TV final assembly.** A clear source for the order: panel module, main board, power board, cables, back cover, then aging and screen test. One Chinese TV maker would be ideal.
4. **Reference images** (C08) for the stencil printer, placement head, reflow oven, X-ray view, TV main board.
5. **Scope.** How much final assembly to show after the board line: suggest board line in full, final assembly as one or two short beats, then power-on.
6. If the user keeps the **phone** (D02): which phone chip a wire-bonded BGA could honestly be (e.g. a power-management or audio chip), and how to word it.
