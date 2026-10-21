# Norway control panel and chat box: art spec

21 October 2026. The panel and chat box in the game are placeholders drawn in code. This file tells the artist (Gemini) what to draw so the art drops in without moving any button.

## Screen layout

- Left: the 3D workshop (unchanged).
- Right, top: the **control panel**. Fixed, like a plane cockpit: it never moves or changes layout. Only lights, gauge needles and readouts change.
- Right, below the panel: the **chat box**, where Sigurd says what is happening ("too cold", "too hot") and what to do next. The player works out which buttons fix it.

## Control panel canvas

**480 × 400 px**, pixel art, opaque background, drawn with every control in its **off** state. Layout lives in `src/content/norwayPanel.ts`; the rectangles below are copied from it (x, y, width, height).

| Section | Rect |
|---|---|
| STATUS | 6, 6, 468, 62 |
| READINGS | 6, 74, 468, 118 |
| FURNACE | 6, 198, 468, 94 |
| MATERIALS | 6, 298, 468, 96 |

**Status lamps** (each 56 × 44, starting x = 14, step 66, y = 20): QUARTZ IN, CARBON IN, MAIN ON, HEAT OK, MOLTEN, COOL, BAGGED.

**Gauges**

| Gauge | Rect | Shows |
|---|---|---|
| FURNACE TEMP | 14, 88, 150, 100 | °C, with a marked green working band |
| REACTION | 174, 88, 90, 100 | 0–100 % |
| LIQUID Si | 274, 88, 90, 100 | liquid level in the furnace |
| MOULD TEMP | 374, 88, 92, 100 | casting temperature while it cools |
| POWER LEVEL | 150, 214, 90, 72 | 5 bars |

**Buttons** (each has a small light above and a name below)

| Button | Rect |
|---|---|
| MAIN POWER (big red) | 14, 214, 70, 72 |
| POWER − | 92, 214, 52, 72 |
| POWER + | 246, 214, 52, 72 |
| ELEC ▲ | 306, 214, 52, 72 |
| ELEC ▼ | 364, 214, 52, 72 |
| TAPHOLE (red) | 422, 214, 46, 72 |
| PICKAXE, HAMMER, LOAD QUARTZ, LOAD CARBON, BAG, SHIP | y = 314, x = 14 + n × 77, each 68 × 74 |

Separate small sprites, if wanted: lamp on (amber, green, orange), button pressed, button light blinking. Otherwise the code draws lights on top of the art.

## Chat box

Any width ≈ 420 px, at least 150 px tall; frame plus a portrait slot (Sigurd, 40 × 40 shown; the current 64 × 72 guide sprite is used for now). Text is rendered in code.

## Furnace rules (for reference)

Power level 1–5 and electrodes up/down set the furnace temperature. Only power 4 with electrodes down sits in the working band (~1750–2150 °C), and smelting only progresses there. Teaching values, not an operating recipe; see `src/content/norwayControls.ts`.
