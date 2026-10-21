/**
 * China reflow oven: a teaching model, not a solder recipe.
 * The player sets zone heat and belt speed (research C18: speed is part of the board's thermal
 * history). Peak temperature and time above melting are *predicted results*, not knobs (C11, C18).
 * Lead-free solder melts at about 217 °C; guidance puts the peak 20–30 °C above that, for 30–90 s
 * (C11). Levels, formulas and bands are game rules.
 */
export type ReflowState = 'cold' | 'hot' | 'long' | 'short' | 'ok';

export const LEVELS = 5;
export const LIQUIDUS = 217;
export const PEAK_BAND: [number, number] = [232, 250];
export const TAL_BAND: [number, number] = [30, 90];

/** Predicted board profile from the two settings: hotter zones raise the peak; a faster belt lowers it and shortens the time. */
export function predictProfile(heat: number, belt: number) {
  const peak = 190 + heat * 16 - (belt - 3) * 8;
  const timeAboveMelt = Math.max(0, 30 + (heat - 1) * 12 + (3 - belt) * 18);
  return { peak, timeAboveMelt };
}

export function reflowState(heat: number, belt: number): ReflowState {
  const { peak, timeAboveMelt } = predictProfile(heat, belt);
  if (peak < PEAK_BAND[0]) return 'cold';
  if (peak > PEAK_BAND[1]) return 'hot';
  if (timeAboveMelt > TAL_BAND[1]) return 'long';
  if (timeAboveMelt < TAL_BAND[0]) return 'short';
  return 'ok';
}

/** Xiao Lin names the physical risk, not the fix. */
export const XIAO_LIN_REFLOW: Record<ReflowState, string> = {
  cold: "Not hot enough. The solder wouldn't fully melt and wet the pads: weak or open joints.",
  hot: 'Too hot! The board and the package could warp, and the flux burns out. Joints may not join.',
  long: 'Too long in the heat. The flux gets used up before the joints form.',
  short: 'Too quick. The solder barely melts before it leaves the hot zone.',
  ok: 'That profile looks right: hot enough, for long enough, then a clean cool-down. Feed the board!',
};
