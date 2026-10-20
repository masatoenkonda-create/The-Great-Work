# Player walking sprite

Prepared from the four poses supplied by Maxence on 20 October 2026.

- `player-walk.png`: transparent PNG, 256 × 72 pixels.
- Four frames in a single horizontal row; each cell is 64 × 72 pixels.
- Character height: 64 pixels, with padding.
- Shared palette: at most 24 opaque colors.
- Bottom-center placement anchor: x=32, y=69 in each cell (feet occupy up to y=68).
- Frames face right. Mirror horizontally for left-facing movement.
- Suggested starting playback: approximately 7 frames per second, looping in order 0, 1, 2, 3.
- `player-walk.json`: frame dimensions, timing, anchor and source-crop metadata.

Use nearest-neighbor scaling (`image-rendering: pixelated`), preferably at integer display scales. Crop each frame from x=frameIndex*64, y=0, width=64, height=72. Place every frame using the same anchor. Source bounds and offsets in the JSON describe the preparation process; they are not additional runtime offsets.

The background was removed, frame height and baseline standardized, and one palette applied to all frames. The poses were not redrawn; small anatomical and gait differences from the generated source remain.

These are asset files only. Connect them to the player's movement renderer separately; this commit does not change gameplay.
