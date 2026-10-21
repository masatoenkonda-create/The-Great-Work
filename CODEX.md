# Supply Chain Gang: notes for Codex

A browser game (React, Three.js, Vite) following one chip from quartz in Norway to a TV in the USA. Codex and Claude work in this repo together, in turns.

## Read first
- [WORKSHOP_WORKFLOW.md](WORKSHOP_WORKFLOW.md): how every level is researched, planned and built. Follow its **research standard** on every research or review pass.
- `research/<country>/HANDOFF.md`: where that level stands and what was decided.
- [BUILD_NOTES.md](BUILD_NOTES.md): log every pass (what changed, what was checked, what's a placeholder).

## Working rules
- Keep the game simple; keep the research rigorous. Never present a source as read if it wasn't opened.
- When reviewing Claude's pass, open the sources the build depends on; don't accept records at face value.
- Don't ask the user technical questions; make the call and record it. Ask only about feel or direction.
- The user does the browser testing. Say plainly what you did and didn't check.
- Leave work uncommitted for Claude to commit, unless the user says otherwise.
