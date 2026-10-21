/**
 * Germany deposition reactor: a teaching model, not an operating recipe.
 * Rod heat and precursor proportion are the two real control variables (research G05);
 * the levels and bands below are game rules.
 */
export type ReactorZone = 'off' | 'cold' | 'heating' | 'hot' | 'lean' | 'rich' | 'ok';

export const HEAT_LEVELS = 5;
export const MIX_LEVELS = 5;
export const ROOM_TEMPERATURE = 20;
/** Rods are heated to around 1,100 °C (research G03); the band is a game choice. */
export const ROD_BAND: [number, number] = [1000, 1150];
export const ROD_GAUGE_MAX = 1400;
export const GOOD_MIX = 3;

export function rodTarget(on: boolean, heat: number): number {
  return on ? 700 + heat * 130 : ROOM_TEMPERATURE;
}

export function reactorZone(on: boolean, heat: number, mix: number, temperature: number): ReactorZone {
  if (!on) return 'off';
  const target = rodTarget(on, heat);
  if (target > ROD_BAND[1]) return 'hot';
  if (target < ROD_BAND[0]) return 'cold';
  if (temperature < ROD_BAND[0]) return 'heating';
  if (mix > GOOD_MIX) return 'rich';
  if (mix < GOOD_MIX) return 'lean';
  return 'ok';
}

/** Greta describes what she sees, not which button to press. */
export const GRETA_REACTOR: Record<ReactorZone, string> = {
  off: 'Power is off. The rods are cooling down.',
  cold: "The rods aren't hot enough. Nothing is sticking to them.",
  heating: 'The rods are warming up. Patience!',
  hot: 'The rods are getting too hot! Growth paused. (We want silicon rods, not silicon soup.)',
  lean: 'Hardly any silicon is reaching the rods. The gas is too thin.',
  rich: 'Silicon is forming as dust in the gas instead of on the rods! Too much in the mix.',
  ok: 'Perfect! Silicon from the vapour is growing onto the hot rods. Watch them thicken!',
};

export const isWarning = (zone: ReactorZone) => zone === 'cold' || zone === 'hot' || zone === 'lean' || zone === 'rich';
