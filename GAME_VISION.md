# Supply Chain Gang: the game vision

The user's vision, given to Claude on 21 October 2026 and kept in Claude's notes until 22 October 2026, when it was copied here so Codex can read it too. The user's newest instruction overrides this file.

## The story

An American guy's TV won't start. The chip it needs is unavailable because of a supply chain problem. He refuses to be told what to do, so he puts on a white bunny suit and sets off to make his own chip, knowing nothing about chips.

The route has seven stops: Norway → Germany → Japan → Taiwan → Malaysia → China → home (USA). (The TV ending was chosen on 21 October 2026; it replaced the earlier phone.)

## Four loops of the same route

The game is played as **loops** of the same seven-stop route, starting and ending at home. Each loop keeps the layers before it and adds one:

| Loop | Layer added | What goes wrong at home at the end of the loop |
|---|---|---|
| 1 | **Production**: make the chip and the TV yourself | The TV works for 5 minutes, then stops: his electricity bill has exploded |
| 2 | **Procurement**: order, buying and procurement as one layer. Make it at a price that makes sense, or go bankrupt | The TV works with no crazy bill, then stops again |
| 3 | **Shipping**: delivery and returns as one flow (late shipments, sending back defects) | (to be decided) |
| 4 | **Compliance**: the government says his chip is illegal | Everything works: that is what a supply chain is |

Order of loops 2–4 as given by the user on 22 October 2026: production, procurement, shipping, compliance. Whether procurement or shipping should come second is open for discussion (see [layers/LAYER_2_BRAINSTORM.md](layers/LAYER_2_BRAINSTORM.md)).

**Planning** (forecasting, scheduling) stays out of the game until later.

## Why loops

Each loop's failure at home gives the reason for the next layer. Build layer by layer and don't start a loop's layer early.

## Where we are

- Loop 1 (production): all seven stops have a playable workshop; the USA stop has a minimum TV ending. The "electricity bill" failure at home is **not built yet**.
- Loop 2: brainstorm started 22 October 2026 in [layers/LAYER_2_BRAINSTORM.md](layers/LAYER_2_BRAINSTORM.md).

## User's new direction, 22 October 2026 — recorded by Codex

This supplements the original vision; the earlier ending sketches remain historical context. The immediate task is workflow and layer design, not writing the opening or endings and not coding.

- **Decision:** running out of money does not stop the journey. Continue to a bad ending at home, then restart. The restart boundary and the fictional way further purchases remain possible still need a design proposal; do not present unlimited real supplier credit as a fact.
- **Idea to explore:** sourcing/material branches leave the seven-stop road and rejoin it. These are additions to the workflow, not approval for new main countries or unrelated errands.
- **Idea to explore:** four runs progressively expose workshop complexity, materials and dependencies. The first run should be simpler; the later runs should offer new actions, beyond a wallet added to the existing game. Preserve real material transformations even when a guide handles unseen work.
- **Direction:** teach what sourcing and buying actually involve through the four workshop questions. Research real challenges before choosing mechanics; price selection alone is insufficient.
- **Direction:** explore the high cost of making a TV alone. No numerical cost target or real-world TV cost estimate is established by this discussion.

Codex's research and response to Claude are in [brainstorm turn 2](layers/LAYER_2_BRAINSTORM.md#turn-2-codex-22-october-2026). Evidence is in [layers/sources/README.md](layers/sources/README.md); a concise candidate is in [LAYER_2_PROPOSAL.md](layers/LAYER_2_PROPOSAL.md). These are proposals for Claude and the user to discuss, not accepted gameplay or an implementation instruction.

## User's direction, 22 October 2026 (second message) — recorded by Claude

- **No clock, ever.** No real-time play, no ticking timer that can be paused (as in Europa Universalis), no continuous flow (as in Age of Empires). The player can take ten minutes before a click. The goal is to enjoy and understand, not to perform.
- **Engine first.** Each layer is an economic game engine to design as a skeleton: what the real activity is, its challenges and trade-offs, and how to simulate them. Openings, endings and story come later.
- **Understand before designing.** Start from what procurement actually is and how it relates to the supply chain, backed by primary sources, before any per-stop puzzles.
