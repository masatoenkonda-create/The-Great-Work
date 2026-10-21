/**
 * Japan crystal puller: a teaching model, not an operating recipe.
 * Heater power and pull speed are the real coupled controls for the crystal body (research J03);
 * rotation is an on/off prerequisite. Levels and bands are game rules.
 */
export type MeltZone = 'off' | 'cold' | 'heating' | 'ok';
export type GrowthZone = 'off' | 'still' | 'hot' | 'cold' | 'settling' | 'fast' | 'slow' | 'ok';

export const HEAT_LEVELS = 5;
export const PULL_LEVELS = 5;
export const ROOM_TEMPERATURE = 20;
/** Silicon melts at 1,414 °C; melts are run at about 1,420 °C (research J01, J02). */
export const MELT_POINT = 1414;
export const GROWTH_BAND: [number, number] = [1405, 1440];
export const TEMP_GAUGE_MIN = 1200;
export const TEMP_GAUGE_MAX = 1550;
export const GOOD_PULL = 3;

export function meltTarget(on: boolean, heat: number): number {
  return on ? 1300 + heat * 40 : ROOM_TEMPERATURE;
}

export function meltZone(on: boolean, heat: number, temperature: number): MeltZone {
  if (!on) return 'off';
  if (meltTarget(on, heat) < MELT_POINT) return 'cold';
  return temperature < MELT_POINT ? 'heating' : 'ok';
}

export function growthZone(on: boolean, rotating: boolean, heat: number, pull: number, temperature: number): GrowthZone {
  if (!on) return 'off';
  if (!rotating) return 'still';
  const target = meltTarget(on, heat);
  if (target > GROWTH_BAND[1]) return 'hot';
  if (target < GROWTH_BAND[0]) return 'cold';
  if (temperature < GROWTH_BAND[0] || temperature > GROWTH_BAND[1]) return 'settling';
  if (pull > GOOD_PULL) return 'fast';
  if (pull < GOOD_PULL) return 'slow';
  return 'ok';
}

/** Aiko describes what she sees, not which button to press. */
export const AIKO_MELT: Record<MeltZone, string> = {
  off: 'The heater is off. Those chunks are staying chunks.',
  cold: "Still too cold. The chunks aren't melting.",
  heating: 'Warming up... silicon melts at 1,414 °C.',
  ok: 'Melting! Watch the chunks sink into a bright pool.',
};

export const AIKO_GROWTH: Record<GrowthZone, string> = {
  off: 'The heater is off! The melt is cooling. Growth paused.',
  still: 'The rotation is stopped. The crystal and the crucible should turn.',
  hot: 'Too hot! The crystal is melting back instead of growing.',
  cold: 'Too cold! The melt is freezing too fast at the edge.',
  settling: 'The temperature is settling. Hold steady.',
  fast: 'Pulling too fast: the crystal is getting thinner. Growth paused.',
  slow: 'Pulling too slowly: the crystal is getting wider. Growth paused.',
  ok: 'Steady! One continuous crystal, growing out of the melt. (Patience is the secret ingredient.)',
};

export const isGrowthWarning = (zone: GrowthZone) => zone !== 'ok' && zone !== 'settling';
