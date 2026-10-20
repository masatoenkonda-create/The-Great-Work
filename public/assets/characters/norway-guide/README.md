# Norway guide sprite

Prepared from Maxence's supplied worker image on 20 October 2026.

- Transparent PNG sheet: 64×72 pixels, one frame.
- Character is 64 pixels tall; feet occupy up to y=68.
- Place using the anchor x=32, y=69 (same cell dimensions and vertical anchor as the player).
- Cropped and resized with nearest-neighbor sampling; 24 opaque colors.
- Source contains one right-facing explanatory pose only. This is a static guide sprite, not an invented walking animation. Future poses should reuse this palette and placement anchor.
- Render with pixelated/integer scaling. JSON contains runtime dimensions and source-processing information.

Asset preparation only; no character or dialogue behavior is changed by this commit.
