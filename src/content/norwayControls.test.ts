import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { furnaceZone, targetTemperature, POWER_LEVELS, WORKING_TEMPERATURE } from './norwayControls';

describe('Norway furnace panel', () => {
  it('only lowered electrodes at one power level reach the working band', () => {
    const working: string[] = [];
    for (let power = 1; power <= POWER_LEVELS; power++) {
      for (const position of ['raised', 'inCharge'] as const) {
        const settled = targetTemperature(true, power, position);
        if (furnaceZone(true, power, position, settled) === 'ok') working.push(`${power}/${position}`);
      }
    }
    assert.deepEqual(working, ['4/inCharge']);
  });

  it('raised electrodes are reported before temperature', () => {
    assert.equal(furnaceZone(true, 4, 'raised', 1000), 'escaping');
  });

  it('correct settings report heating until the band is reached', () => {
    assert.equal(furnaceZone(true, 4, 'inCharge', 500), 'heating');
    assert.equal(furnaceZone(true, 4, 'inCharge', WORKING_TEMPERATURE[0] + 10), 'ok');
  });

  it('too little and too much power are told apart', () => {
    assert.equal(furnaceZone(true, 2, 'inCharge', 900), 'cold');
    assert.equal(furnaceZone(true, 5, 'inCharge', 2200), 'hot');
    assert.equal(furnaceZone(false, 4, 'inCharge', 20), 'off');
  });
});
