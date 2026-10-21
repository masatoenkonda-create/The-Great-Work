export type FurnacePower = 'low' | 'working' | 'high';
export type ElectrodePosition = 'raised' | 'inCharge';

/** Relative teaching controls, not an industrial operating recipe. */
export function checkFurnace(power: FurnacePower, electrodes: ElectrodePosition): string | null {
  const problems: string[] = [];
  if (electrodes === 'raised') problems.push('Lower the electrodes into the charge.');
  if (power === 'low') problems.push('Power is too low. Increase it to medium.');
  if (power === 'high') problems.push('Power is too high. Reduce it to medium.');
  return problems.length ? problems.join(' ') : null;
}
