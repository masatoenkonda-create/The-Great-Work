# Norway workshop: simple step plan

Agreed 21 October 2026 (user + Claude). This replaces the open questions in [HANDOFF.md](HANDOFF.md). Codex: build this as a working sample now; details come later.

## Goal

The game only has to answer four simple questions for the player:

1. **Why do I need this?** Chips are made of silicon.
2. **Where does it come from?** Quartz rock, dug out of the ground.
3. **How do I do it?** Put rock + carbon into an electric furnace and switch it on.
4. **What does it look like when I handle it?** Fist-sized rocks go in; shiny grey metal lumps come out.

Leave out anything the player doesn't need for those four answers: no temperatures, pressure, purity numbers, gas flow, refining or tapping hardware.

## Steps

| # | Step | What the player does | What they see | Why it matters (one line on screen) |
|---|---|---|---|---|
| 1 | Mine | Swing the pickaxe at the quartz wall (chop, chop) | A big pale rock drops | "Silicon comes from quartz rock." |
| 2 | Break to size | Hit the big rock once more | It splits into a few fist-sized chunks | "Fist-sized pieces go in the furnace." |
| 3 | Load | Drop the quartz chunks, then the coal / wood chips, into the furnace top | Pale rocks and dark carbon sit together inside | "Carbon pulls the oxygen out of the quartz." |
| 4 | Switch on | Press the power switch | Three electrodes lower into the pile, the inside glows orange, smoke rises | "Electricity makes it hot enough to melt." |
| 5 | Pour | Open the tap | Glowing liquid silicon runs into a mould | "The quartz has turned into liquid silicon." |
| 6 | Cool and break | Wait, then hit the slab | The glow fades to shiny silver-grey metal; it breaks into lumps | "This is silicon metal." |
| 7 | Ship | Put the lumps in a bag and send it | Bag leaves for Germany | "Germany will clean it until it is pure enough for chips." |

## Changes from the current build (`NorwayManufacturing.tsx`, `NorwaySmelterScene.tsx`)

- **Remove** the pale/dark rock sorting. It teaches nothing real.
- **Add** steps 1–2 (pickaxe mining, break to size) in place of the rock tray.
- **Player adds carbon** in step 3. It is no longer automatic.
- **Keep** the furnace cutaway, electrodes, glow, pour and mould. They already work.
- **Change the end result:** the cooled slab should look like shiny silver-grey metal, not a flat grey box. Break it into lumps and ship a bag.
- Keep the current controls (buttons + clicking the 3D scene) for this sample. Walk-to-object controls can come later.
- Show the one-line "why" text for each step. Nothing else.
- The pickaxe is a game shortcut; real quarries blast and crush the rock. No need to say this on screen.

## Facts behind the steps

- Quartz is dug from open-pit quarries in Norway (Elkem Tana). Crushed quartz for furnaces is roughly fist-sized (Elkem Mårnes sells 10–50 mm).
- Quartz + carbon (coal, charcoal, wood chips) are heated in an electric furnace with carbon electrodes; the liquid silicon is drained, cast in moulds, then crushed into lumps (typically 0–100 mm).
- Silicon is the main material of integrated circuits.

Sources: [Elkem: From quartz to silicon](https://magazine.elkem.com/is/material-science-insights/from-quartz-to-silicon-to-silicones/), [Elkem Tana](https://elkem.com/es/about-elkem/worldwide-presence/norway/elkem-tana), [Elkem Mårnes](https://elkem.com/about-elkem/worldwide-presence/norway/elkem-marnes-kvartsittbrudd), [Elkem silicon sizes](https://www.elkem.com/products/silicon/silicon-powder-micronized-silicon/), plus N02, N04 and N05 in [README.md](README.md).
