/**
 * Malaysia wire bonder: a teaching model, not a bonding recipe.
 * Bond force and ultrasonic drive are the two factors a Malaysian ball-bonding study varied
 * (research M09), reporting non-stick bonds and smashed bonds. Heat and bond time stay fixed.
 * The levels and the accepted combinations are game rules.
 */
export type BondState = 'weak' | 'tooMuchForce' | 'tooMuchVibration' | 'harsh' | 'ok';

export const LEVELS = 5;
/** Force and vibration add up; the sweet spot is a balanced middle, and maximum is never right. */
export const TARGET_ENERGY = 6;

export function bondState(force: number, ultrasonic: number): BondState {
  if (force === LEVELS) return 'tooMuchForce';
  if (ultrasonic === LEVELS) return 'tooMuchVibration';
  const energy = force + ultrasonic;
  if (energy < TARGET_ENERGY) return 'weak';
  if (energy > TARGET_ENERGY) return 'harsh';
  return 'ok';
}

/** Farid describes what would happen, not which button to press. */
export const FARID_BOND: Record<BondState, string> = {
  weak: "Not enough pressure and vibration. The ball wouldn't weld to the pad: a non-stick.",
  tooMuchForce: 'Way too much force! That would smash the ball flat and could crack the pad.',
  tooMuchVibration: 'Way too much vibration! That would shake the bond apart and damage the pad.',
  harsh: 'Too much, all together. That would smash the bond. Ease off a little.',
  ok: 'That feels right. Pressure and vibration together weld the ball to the pad.',
};
