export type ElectrodePosition = 'raised' | 'inCharge';
/** What Sigurd reacts to while the furnace is on. */
export type FurnaceZone = 'off' | 'escaping' | 'cold' | 'heating' | 'ok' | 'hot';

export const POWER_LEVELS = 5;
export const ROOM_TEMPERATURE = 20;
/** Working band, in °C. Teaching values around the ~2000 °C reaction zone, not an operating recipe. */
export const WORKING_TEMPERATURE: [number, number] = [1750, 2150];
export const GAUGE_MAX = 2500;

/** Temperature the furnace settles at for these panel settings. Raised electrodes lose heat up the stack. */
export function targetTemperature(on: boolean, power: number, electrodes: ElectrodePosition): number {
  if (!on) return ROOM_TEMPERATURE;
  const temperature = 300 + power * 380;
  return electrodes === 'raised' ? Math.min(temperature, 1100) : temperature;
}

export function furnaceZone(on: boolean, power: number, electrodes: ElectrodePosition, temperature: number): FurnaceZone {
  if (!on) return 'off';
  if (electrodes === 'raised') return 'escaping';
  const target = targetTemperature(on, power, electrodes);
  if (target < WORKING_TEMPERATURE[0]) return 'cold';
  if (target > WORKING_TEMPERATURE[1]) return 'hot';
  return temperature < WORKING_TEMPERATURE[0] ? 'heating' : 'ok';
}

/** Sigurd describes what is happening, not which button to press. */
export const SIGURD_FURNACE: Record<FurnaceZone, string> = {
  off: 'Main power is off. The batch is loaded and waiting!',
  escaping: "The electrodes aren't touching the charge. (We're not here to heat the chimney.)",
  cold: 'Too cold for the reaction. The quartz is staying quartz.',
  heating: "Warming up nicely. Hold it steady!",
  ok: 'That’s the working range! Carbon removes oxygen; liquid silicon collects below.',
  hot: 'Above the working range! The reaction is paused. (The electricity bill just winced.)',
};
