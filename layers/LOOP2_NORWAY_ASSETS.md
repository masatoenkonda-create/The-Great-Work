# Loop 2 Norway: art list

Claude, 22 October 2026. The user will draw these; Claude codes the supplier map once they arrive. Until then, code draws plain shapes in the same slots.

## Decisions (user, 22 October 2026)

- A **Norway supplier map** is the main loop 2 screen: the smelter in the middle, suppliers as pins around it, and **Germany as a customer pin** on the same map (selling happens there).
- A **store panel** on the side shows what you own: needed items as grey outlines, bought items as pictures with counts, invoices and cash.
- When buying or negotiating, a **product view** shows the physical thing being bought.
- The Norway workshop stays exactly as it is, including mining and breaking the rock.

## Style for everything

- Same 16-bit pixel style as the title and world map; limited palette; crisp edges (scaled up with nearest-neighbour).
- PNG with a transparent background for everything except the map backdrop.
- **No text, labels, prices or numbers in the art**; the code adds them so they can change.
- Exact sizes below. If a size doesn't suit you, keep the **proportions** and tell me the new size.

## 1. Must have

| # | File (in `public/assets/supply/`) | Size (px) | What it shows |
|---|---|---|---|
| 1 | `norway_map.jpg` | 1376 × 768 | The region around the smelter, seen from above like the world map: fjord, mountains, a river, a plateau, a harbour, a valley with forest. Roads optional (I can draw them). **No buildings**: they are separate pins (section 2), so I can move them. Leave the layout below roughly free. |
| 2 | `product_quartz_crushed.png` | 256 × 192 | Quartz as it comes out of the crusher: white/grey chunks **mixed with sand and dust (fines)**. |
| 3 | `product_quartz_screened.png` | 256 × 192 | Clean quartz chunks, similar size, no dust. |
| 4 | `product_quartz_sieve.png` | 256 × 192 | The delivery check: a sieve or screen with **chunks on top and a small pile of fines underneath**. |
| 5 | `product_coal_bags.png` | 256 × 192 | A few closed sacks of coal / carbon feed on a pallet. |
| 6 | `product_coal_bulk.png` | 256 × 192 | A big heap of coal on a dockside (the bulk importer's "20 minimum"). |
| 7 | `product_woodchips.png` | 256 × 192 | Sacks or a heap of wood chips (chips, not sawdust). |
| 8 | `product_power.png` | 256 × 192 | Electricity as a service: a pylon and cables, or a big switch/meter. |
| 9 | `product_silicon.png` | 256 × 192 | The output for sale: a bag of grey, shiny silicon metal lumps (same look as the bag in the workshop). |
| 10 | `icon_quartz.png` | 32 × 32 | One quartz chunk (store panel; repeated once per unit). |
| 11 | `icon_carbon.png` | 32 × 32 | One small coal sack. |
| 12 | `icon_woodchips.png` | 32 × 32 | One small wood chip sack. |
| 13 | `icon_power.png` | 32 × 32 | A lightning bolt or plug. |
| 14 | `icon_silicon.png` | 32 × 32 | One small silicon bag. |
| 15 | `icon_fines.png` | 32 × 32 | A little pile of dust (waste you paid for). |
| 16 | `icon_invoice.png` | 32 × 32 | A sheet of paper with lines (an invoice waiting). |

## 2. Nice to have (placeholders work until then)

| # | File (in `public/assets/supply/`) | Size (px) | What it shows |
|---|---|---|---|
| 17 | `pin_smelter.png` | 96 × 96 | Your smelter (same building as the workshop, seen from outside). Centre of the map. |
| 18 | `pin_quarry.png` | 64 × 64 | Fjord Quarry: rock face and a crusher. |
| 19 | `pin_trader.png` | 64 × 64 | Nordic Minerals: a depot or warehouse with piles. |
| 20 | `pin_harbour.png` | 64 × 64 | Harbour Coal: small stockyard by the quay. |
| 21 | `pin_bulk.png` | 64 × 64 | Bulk Importer: a ship at a terminal. |
| 22 | `pin_sawmill.png` | 64 × 64 | Valley Sawmill: wooden mill with logs. |
| 23 | `pin_power.png` | 64 × 64 | River Power: hydro dam/station. |
| 24 | `pin_customer.png` | 64 × 64 | Germany customer: a factory with a small German flag. |
| 25 | `truck.png` | 64 × 32 | A small delivery truck facing right (I mirror it). Two frames side by side (128 × 32) if you want wheels turning. |
| 26 | `rep_<supplier>.png` × 7 | 64 × 72 | Portraits of who you negotiate with, same size as Sigurd's: `rep_fjord`, `rep_nordic`, `rep_harbour`, `rep_bulk`, `rep_sawmill`, `rep_hydro`, `rep_buyer` (the German buyer). |

## Rough map layout (for item 1)

```
 +-------------------------------------------------------------+
 |  fjord + Fjord Quarry      River Power (river, dam)          |
 |                                                  Bulk ship   |
 |  Nordic Minerals depot       [ SMELTER ]         Harbour     |
 |                                                              |
 |  plateau (the trader's quarry)       Valley Sawmill (forest) |
 |                                          road → Germany pin  |
 +-------------------------------------------------------------+
```

The right-hand ~380 px of the screen is covered by the store panel, so keep important scenery away from that strip, or tell me and I'll put the panel on the left.

## What stays in code

Pins' positions, roads and paths, the moving truck's route, every label, price, count and button, the store panel's frame, and the negotiation panel's frame.
