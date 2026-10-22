# Supply Chain Gang: notes for Codex

A browser game (React, Three.js, Vite) following one chip from quartz in Norway to a TV in the USA. Codex and Claude work in this repo together, in turns.

## Read first
- [GAME_VISION.md](GAME_VISION.md): the story and the four loops (production, procurement, shipping, compliance).
- [PROCUREMENT_WORKFLOW.md](PROCUREMENT_WORKFLOW.md): how every loop 2 (procurement) stop is built, from the Norway session.
- `layers/HANDOFF.md`: where loop 2 (procurement) stands, its decisions and files. `layers/` also holds the brainstorm and reviews.
- [WORKSHOP_WORKFLOW.md](WORKSHOP_WORKFLOW.md): how every level is researched, planned and built. Follow its **research standard** on every research or review pass.
- `research/<country>/HANDOFF.md`: where that level stands and what was decided.
- [BUILD_NOTES.md](BUILD_NOTES.md): log every pass (what changed, what was checked, what's a placeholder).

## Working rules
- Keep the game simple; keep the research rigorous. Never present a source as read if it wasn't opened.
- Before handing over, run the **hand-over checklist** in WORKSHOP_WORKFLOW.md (6 lines).
- When reviewing Claude's pass, open the sources the build depends on; don't accept records at face value.
- Don't ask the user technical questions; make the call and record it. Ask only about feel or direction.
- The user does the browser testing. Say plainly what you did and didn't check.
- Leave work uncommitted for Claude to commit, unless the user says otherwise.
