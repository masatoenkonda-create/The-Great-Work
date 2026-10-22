# Loop 2 Norway: Gemini prompts

Claude, 22 October 2026. One prompt per asset, for the files in [LOOP2_NORWAY_ASSETS.md](LOOP2_NORWAY_ASSETS.md). Each prompt = **one shared block (A, B or C) + the asset's own lines**. Paste both into the same request and attach the approved world map (and, for B and C, one finished asset from the same group) so the style stays consistent.

**Tip from the first batch (22 Oct):** Gemini returns a JPG on white instead of a transparent PNG; that's fine, Claude cuts the white away. But twice it added a sci-fi **floor** under the object, which is hard to remove. Add this line to every block B/C request: *"Plain pure white background, no floor, no ground, no scenery."*

Gemini rarely outputs exact sizes. That's fine: send the image as it comes and Claude scales it to size with nearest-neighbour (no blur) and trims transparent padding. Only the proportions matter.

---

## Shared block A: the supplier map (use for asset 1)

> We are creating original visual assets for THE GREAT WORK, an educational game following one chip around the world.
>
> ART DIRECTION
> Colorful 16-bit-era pixel art: crisp pixel clusters, stepped edges, restrained shading, readable silhouettes and a cohesive limited palette. Inviting, adventurous and industrial. Match the attached approved world map exactly in palette, pixel density and level of detail.
>
> CONSISTENCY
> Favor clear composition over dense texture. No painterly blur, photorealism, smooth vector illustration or excessive tiny details.
>
> CANVAS
> Compose on a 344×192 logical canvas (wide 16:9), to be enlarged 4× with nearest-neighbor scaling.
>
> DO NOT INCLUDE
> Text, letters, numbers, logos, watermarks, menus, buttons, flags, route markers, map pins, buildings or characters. Interactive objects will be added separately in the game.
>
> Generate one asset per request.

## Shared block B: products and icons (use for assets 2–16 and 25)

> We are creating original object sprites for THE GREAT WORK, a colorful pixel-art semiconductor adventure.
>
> ART DIRECTION
> Crisp 16-bit-era pixel art matching the attached approved images: stepped edges, restrained shading, strong readable silhouettes, cohesive limited palette, slightly elevated three-quarter view from the front, soft light from the upper left.
>
> These are isolated game objects shown in an inventory or shop window, not scenes. The material must be recognizable at a glance: its shape, color and texture tell the player what it is.
>
> OUTPUT RULES
> One object or one small group of objects, centered, with clear padding around it.
> Transparent PNG background, without a floor, table, ground plane or baked cast shadow.
> No text, labels, numbers, prices, logos, brand marks, watermarks or decorative frame.
> Do not draw a checkerboard to imitate transparency.
>
> Generate ONE asset per request.

## Shared block C: map pins and portraits (use for assets 17–24 and 26)

> We are creating characters and map buildings for THE GREAT WORK, a colorful pixel-art semiconductor adventure.
>
> Match the attached approved backgrounds: crisp 16-bit-inspired pixel art, strong silhouettes, readable expressions, restrained shading and an inviting arcade personality.
>
> Characters should be expressive and slightly exaggerated, with practical workwear and memorable individual details. Cultural references provide personality without replacing their professional role. Use consistent character proportions, pixel density and camera angle across the cast. Slightly oversized heads and hands are welcome for readability.
>
> Map buildings are small, chunky, toy-like icons seen from a high three-quarter angle, like buildings on a classic console overworld map. Each must be identifiable from its silhouette alone.
>
> OUTPUT RULES
> Isolated sprite with clear padding around the entire silhouette.
> Transparent PNG background, without a ground plane or baked cast shadow.
> No text, labels, logos, flags (unless requested), watermarks or decorative frame.
> Do not draw a checkerboard to imitate transparency.
>
> Generate ONE character or building per request.

---

## Must have

### 1. `norway_map.jpg` (block A)
> A top-down overworld map of a fictional stretch of the Norwegian coast around one industrial site, in the same style as the attached world map.
> Layout: a deep blue fjord cutting in from the upper left, steep grey-green mountains with snow on the peaks along the top, a river running down from the top centre with a small waterfall, a pale high plateau in the lower left, a harbour with a quay and open sea on the right, and a green forested valley in the lower right. A few winding dirt roads may connect the areas, all meeting at an empty flat clearing in the exact centre.
> Keep the centre clearing and six spots for buildings (upper left by the fjord, centre left, lower left on the plateau, top centre by the river, right by the harbour, lower right in the valley) as flat, empty, readable ground.
> Keep the rightmost quarter of the image calm and low in detail (open sea and coastline), because an interface panel will cover it.
> No buildings, no pins, no text.

### 2. `product_quartz_crushed.png` (block B, logical 64×48)
> A small heap of freshly crushed quartz rock: white, pale grey and milky translucent angular chunks of mixed sizes, mixed with a lot of fine sand and pale dust collected around and between them. It should look cheap and unsorted.

### 3. `product_quartz_screened.png` (block B, logical 64×48)
> A neat small heap of clean quartz chunks: white, pale grey and milky translucent angular stones, all roughly the same fist-like size, with no dust or sand at all. It should look sorted and premium.

### 4. `product_quartz_sieve.png` (block B, logical 64×48)
> A simple rectangular metal sieve tray with a coarse grid, seen from slightly above. Clean white quartz chunks sit on top of the grid; underneath and in front of it, a small separate pile of fine pale sand and dust that fell through. The difference between "kept" and "fell through" must be obvious.

### 5. `product_coal_bags.png` (block B, logical 64×48)
> Four or five closed, sturdy woven sacks filled with coal, stacked on a small wooden pallet; a few black coal lumps visible at a tied opening. Dark sacks with a subtle brown-grey weave.

### 6. `product_coal_bulk.png` (block B, logical 64×48)
> A large, wide heap of black coal lumps with glints of dark grey, the kind dumped straight from a ship; much bigger than a few sacks. A small yellow wheel loader bucket at one edge may suggest scale.

### 7. `product_woodchips.png` (block B, logical 64×48)
> Two or three open woven sacks overflowing with light brown and blond wood chips (small flat chips, clearly larger than sawdust), with a few chips spilled in front.

### 8. `product_power.png` (block B, logical 64×48)
> A steel electricity pylon with three thick cables leading to a large industrial wall switch box with a lever handle and a round meter dial (no numbers), a few small yellow sparks around the switch. Electricity shown as a service, not a product in a box.

### 9. `product_silicon.png` (block B, logical 64×48)
> One large open white bulk bag filled with lumps of silicon metal: grey, metallic, slightly bluish lumps with bright silver highlights and rough broken faces. A few lumps on the ground in front.

### 10. `icon_quartz.png` (block B, logical 16×16)
> A single small quartz chunk, white and pale grey with one bright highlight, very simple and readable at tiny size.

### 11. `icon_carbon.png` (block B, logical 16×16)
> A single small tied sack of coal, dark brown-grey, with two black lumps showing at the top.

### 12. `icon_woodchips.png` (block B, logical 16×16)
> A single small tied sack with light brown wood chips showing at the top.

### 13. `icon_power.png` (block B, logical 16×16)
> A bold yellow lightning bolt with a dark outline.

### 14. `icon_silicon.png` (block B, logical 16×16)
> A single small white bag holding metallic grey silicon lumps with one silver glint.

### 15. `icon_fines.png` (block B, logical 16×16)
> A tiny low pile of pale grey dust and sand, clearly waste.

### 16. `icon_invoice.png` (block B, logical 16×16)
> A single sheet of white paper with a folded corner and a few grey horizontal lines (no readable text), slightly tilted.

## Nice to have

### 17. `pin_smelter.png` (block C, logical 48×48)
> The player's silicon smelter as a map building: a tall dark industrial furnace hall with a chimney releasing a little white smoke, a glowing orange window and three thick electrode columns on the roof. Same building as the game's Norway workshop, seen from outside.

### 18. `pin_quarry.png` (block C, logical 32×32)
> A small quarry: a cut white-grey rock face with a small yellow crusher machine and a pile of broken rock.

### 19. `pin_trader.png` (block C, logical 32×32)
> A minerals trader's depot: a corrugated-metal warehouse with an open front showing neat piles of white stone, and a small office door.

### 20. `pin_harbour.png` (block C, logical 32×32)
> A small harbour stockyard: a quay edge with a stack of dark sacks and a little crane.

### 21. `pin_bulk.png` (block C, logical 32×32)
> A short, chunky bulk cargo ship moored at a concrete terminal, with a dark heap of coal on the quay beside it.

### 22. `pin_sawmill.png` (block C, logical 32×32)
> A wooden sawmill with a pitched roof, a stack of logs and a small heap of light wood chips, at the edge of a pine forest.

### 23. `pin_power.png` (block C, logical 32×32)
> A small hydroelectric dam across a river, water flowing out of the bottom, with a little power station building and one pylon.

### 24. `pin_customer.png` (block C, logical 32×32)
> A clean modern chemical plant with silver tanks and a tall pale building, flying a small German flag (black, red, gold) on a pole. This is the customer who buys the silicon.

### 25. `truck.png` (block B, logical 32×16)
> A small chunky flatbed delivery truck seen from the side, facing right, cab in a bright color, a load covered with a tarp on the back. Optionally two frames side by side with the wheels in different positions.

### 26. Negotiation portraits (block C, full body, 64×72 like Sigurd)
Use block C plus the line below, one request each, attaching Sigurd's sprite for scale.

| File | Line to add |
|---|---|
| `rep_fjord.png` | A burly Norwegian quarry owner in a dusty orange hi-vis vest and hard hat, grey beard, holding a chunk of rock, cheerful and a bit pushy. |
| `rep_nordic.png` | A neat minerals trader in a navy fleece with a clipboard and reading glasses, polite but firm. |
| `rep_harbour.png` | A weathered harbour stockyard manager in a knitted cap and a heavy work jacket, coal dust on the hands, sly grin. |
| `rep_bulk.png` | A shipping-terminal agent in a high-collar windbreaker and safety helmet, holding a tablet, impatient expression. |
| `rep_sawmill.png` | A friendly sawmill worker in a checked shirt and suspenders, ear defenders around the neck, sawdust in the hair. |
| `rep_hydro.png` | A calm power-company engineer in a dark blue utility jacket with a lightning-bolt patch (no text), holding a meter. |
| `rep_buyer.png` | A sharp German purchasing manager in a white lab coat over a shirt and tie, safety glasses pushed up, holding a small bag of silicon to inspect it, skeptical eyebrow. |
