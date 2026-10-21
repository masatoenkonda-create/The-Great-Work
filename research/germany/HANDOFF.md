# Germany workshop: handoff and decision log

Started 21 October 2026 by Claude. **Status: research step open. Waiting for Codex's research contribution before writing the plan.** No game code changed.

## Where we are in the workflow

| Step ([WORKSHOP_WORKFLOW.md](../../WORKSHOP_WORKFLOW.md)) | Status |
|---|---|
| 1. Look at what exists | Done (see "Existing game content" in [README.md](README.md)) |
| 2. Research | Claude's first pass done (G01–G07). **Codex to add and review.** |
| 3. One-page plan | Not started. Waits for the user to close research. |
| 4+ Build, puzzle, panel, playtest, art spec | Not started |
| Shared components (`WorkshopLayout`, `ControlPanel`, `GuideBox`) | Not started; first coding task before Germany |

## Decisions so far (Claude; Codex may challenge)

| ID | Decision | Reason |
|---|---|---|
| D01 | Research only for now; the plan waits for Codex | User instruction |
| D02 | Equipment basis: **Siemens bell-jar reactor** with inverted-U rods heated by current | It is how semiconductor-grade polysilicon is made at Burghausen (G01, G02, G03). Fluidized-bed *granular* polysilicon, mostly a solar route, is out of scope |
| D03 | The chain to represent: powder + HCl → liquid trichlorosilane → distillation → rods grow in reactor → break → acid clean → double bag | Every link is sourced (G01–G07). The plan decides which links are player steps and which are short animations |
| D04 | Main visual is the **rods growing thicker** inside a glowing dome (cutaway or sight-glass view) | It's the one transformation nobody expects: silicon grown back from a gas. Answers "how" and "what does it look like" |
| D05 | Puzzle candidates must come from real controls: **rod temperature** and **gas flow** (G05) | Norway rule: every control has a real effect. Sliders for reflux ratio etc. are out |
| D06 | Numbers allowed on screen: ~1,100 °C rods; "several days" (game time compressed); purity as a toy scale | Sourced (G01, G03) or explicitly a game scale (UNIFIED_OPINION.md asks for a toy contamination scale) |
| D07 | The old `Stop2PurifyWorkspace.tsx` is replaced, not extended | Unsourced values and the ppm/ppb counter bug; Norway pattern supersedes it |
| D08 | Output carried to Japan: polysilicon chunks + a toy purity label | WORKSHOP_WORKFLOW.md results chain; `polysiliconBatchKg` stays for compatibility |

## Suggested small text fixes (not applied; for the plan step)

- Greta's line "We need 99.9999999 %" → use WACKER's figure, e.g. "Twelve nines. Ninety-nine point nine nine nine… you get it." (G02)
- `route.ts` stop 2 `summary`: "trichlorosilane gas" → "liquid trichlorosilane".

## Open research questions for Codex

1. **Reactor look.** A usable reference image or drawing of a Siemens reactor (bell jar, base plate, electrodes, hairpin rods with bridge, sight glass). WACKER media library or an equipment supplier (e.g. a reactor maker's brochure) would be ideal. How do the rod pairs connect at the top?
2. **What goes wrong, in sourced terms.** G05 supports "too fast/too hot → rough popcorn rods sold as lower grade" qualitatively. Is there a clearer source for the effect of rod temperature too low (slow growth) and gas flow too high/low? This decides the puzzle.
3. **Distillation look.** A simple, sourced picture of the distillation columns, so the player can see "dirt stays at the bottom, pure liquid goes up".
4. **Hydrochlorination step.** Is it worth showing (powder + gas in a fluid bed) or should it be a short animation feeding into distillation? Any reference image?
5. **Cleaning line.** Anything visual on the acid etch and rinse (baskets dipped in baths? conveyors?) from WACKER or others.
6. **Purity scale.** A defensible way to show "dirty → ultra-pure" without fake ppb readings (e.g. a toy 1–5 star scale tied to the puzzle result).

## Not decided (for the plan step, after research)

- Number of player steps and which links become animations only.
- Panel controls and gauges.
- Greta's step lines and feedback.
- How the purity label is computed from the puzzle and passed to Japan.
