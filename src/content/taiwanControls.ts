/**
 * Taiwan scanner alignment: a teaching model, not an overlay recipe.
 * Each exposure field starts a few game steps out of line (no nm values; research D07).
 * Small offsets can be exposed after a warning and fail that field; large ones are blocked.
 */
import type { FieldId } from './waferMap';

export type AlignState = 'aligned' | 'near' | 'far';
export const OFFSET_LIMIT = 3;

/** Starting misalignment per field, in enlarged game steps. */
export const START_OFFSETS: Record<FieldId, { dx: number; dy: number }> = {
  A: { dx: 2, dy: -1 }, B: { dx: -1, dy: 2 }, C: { dx: -2, dy: 1 }, D: { dx: 1, dy: -2 },
};

export function alignState(dx: number, dy: number): AlignState {
  const distance = Math.abs(dx) + Math.abs(dy);
  return distance === 0 ? 'aligned' : distance <= 2 ? 'near' : 'far';
}

export const canExpose = (dx: number, dy: number) => alignState(dx, dy) !== 'far';
export const nudge = (value: number, step: number) => Math.max(-OFFSET_LIMIT, Math.min(OFFSET_LIMIT, value + step));

/** Mei describes what the marks show. */
export const MEI_ALIGN: Record<AlignState, string> = {
  aligned: 'Marks centred! The new contact lands right on the layer below.',
  near: 'Close, but the new contact will miss the layer below. Expose now and this field fails.',
  far: "Way out of line. The scanner won't expose like that.",
};
