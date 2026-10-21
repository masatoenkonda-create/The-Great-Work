import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { reactorZone, rodTarget, HEAT_LEVELS, MIX_LEVELS, ROD_BAND } from './germanyControls';

describe('Germany deposition reactor', () => {
  it('only heat 3 with mix 3 grows the rods', () => {
    const working: string[] = [];
    for (let heat = 1; heat <= HEAT_LEVELS; heat++) {
      for (let mix = 1; mix <= MIX_LEVELS; mix++) {
        if (reactorZone(true, heat, mix, rodTarget(true, heat)) === 'ok') working.push(`${heat}/${mix}`);
      }
    }
    assert.deepEqual(working, ['3/3']);
  });

  it('heat problems are reported before the gas mix', () => {
    assert.equal(reactorZone(true, 1, 5, rodTarget(true, 1)), 'cold');
    assert.equal(reactorZone(true, 5, 1, rodTarget(true, 5)), 'hot');
  });

  it('right heat reports warming until the band is reached', () => {
    assert.equal(reactorZone(true, 3, 3, 400), 'heating');
    assert.equal(reactorZone(true, 3, 3, ROD_BAND[0] + 5), 'ok');
  });

  it('thin and rich mixes are told apart', () => {
    const hot = rodTarget(true, 3);
    assert.equal(reactorZone(true, 3, 1, hot), 'lean');
    assert.equal(reactorZone(true, 3, 4, hot), 'rich');
    assert.equal(reactorZone(false, 3, 3, 20), 'off');
  });
});
