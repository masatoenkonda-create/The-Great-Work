# Loop 2 Germany: art list

Claude, 22 October 2026. Plan: [GERMANY_PLAN.md](GERMANY_PLAN.md). Prompts: [LOOP2_GERMANY_ASSET_PROMPTS.md](LOOP2_GERMANY_ASSET_PROMPTS.md). Files go in **`public/assets/supply/germany/`** with these names; they replace the placeholders with no code change. Same style rules as [Norway's list](LOOP2_NORWAY_ASSETS.md): pixel art, no text or numbers, transparent PNG except the map. Sizes are the installed sizes; Gemini's output is scaled down.

Already shared with Norway (nothing to draw): electricity product and icon, silicon icon, invoice icon, truck.

## 1. Must have

| # | File | Size (px) | What it shows |
|---|---|---|---|
| 1 | `map.jpg` | 2752 × 1536 | A river valley in southern Germany, seen from above: a winding river from the top centre down to the bottom, a big **chemical park** (flat, grey, pipes) in the middle, a small town on the left, forest and fields on the right, low hills with **dams** at the top. No buildings for the pins: they are separate. |
| 2 | `product_hcl_cylinders.png` | 512 × 384 | Two or three tall steel gas cylinders with valve caps, chained upright: dry hydrogen chloride gas. |
| 3 | `product_hcl_acid.png` | 512 × 384 | Plastic chemical drums or canisters of liquid acid (hazard-looking but no symbols or text). Must look clearly **different** from the steel cylinders. |
| 4 | `product_h2_pipeline.png` | 512 × 384 | A pipe coming out of the ground with a valve wheel and a meter: gas delivered by pipeline. |
| 5 | `product_h2_bundles.png` | 512 × 384 | A bundle of 12 gas cylinders in a steel frame on a pallet (a "cylinder bundle"). |
| 6 | `product_polysilicon.png` | 512 × 384 | The output: chunks of shiny, silvery-grey polysilicon in a clear sealed plastic bag (as at the end of the Germany workshop). |
| 7 | `icon_hcl.png` | 64 × 64 | One small steel gas cylinder. |
| 8 | `icon_hydrogen.png` | 64 × 64 | A small puff or a tiny cylinder in a different colour from HCl. |
| 9 | `icon_polysilicon.png` | 64 × 64 | One small clear bag with a silvery chunk. |

## 2. Nice to have

| # | File | Size (px) | What it shows |
|---|---|---|---|
| 10 | `pin_factory.png` | 192 × 192 | Your purification plant: tall reactor halls and a distillation column (same plant as the workshop, from outside). |
| 11 | `pin_gas_dealer.png` | 128 × 128 | Rhine Gases: a gas depot with cylinder racks. |
| 12 | `pin_discount.png` | 128 × 128 | Discount Chemicals: a cheap-looking warehouse with drums outside. |
| 13 | `pin_park.png` | 128 × 128 | Chemical Park Hydrogen: a small gas plant with a stack and pipes. |
| 14 | `pin_depot.png` | 128 × 128 | Town Gas Depot: a small yard with cylinder bundles and a forklift. |
| 15 | `pin_grid.png` | 128 × 128 | Regional Grid: a substation with transformers. |
| 16 | `pin_hydro.png` | 128 × 128 | Alpine Hydro: a river dam with a power house. |
| 17 | `pin_customer.png` | 128 × 128 | Japan customer: a clean crystal-pulling plant with a small Japanese flag. |
| 18 | `pin_buyer.png` | 128 × 128 | Other wafer makers (used for both): a modern factory hall. |
| 19 | `rep_<supplier>.png` × 7 | 128 × 144 | Portraits, same size as Norway's: `rep_rhine`, `rep_discount`, `rep_park`, `rep_depot`, `rep_grid`, `rep_alpine`, `rep_buyer` (Japanese buyer). |

## Rough map layout (for item 1)

```
 +-------------------------------------------------------------+
 |              dams (top centre)      grid substation (right)   |
 |  gas dealer (left)                                            |
 |                     [ CHEMICAL PARK, plant in the middle ]    |
 |  town (gas depot)                 hydrogen plant (centre right)|
 |                                          other buyers (right) |
 |  warehouse (lower left)     road south → Japan pin            |
 +-------------------------------------------------------------+
```

As in Norway, keep the right-hand strip calm; the store panel covers it on wide screens.
