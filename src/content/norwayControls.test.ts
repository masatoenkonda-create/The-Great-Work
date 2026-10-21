import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkFurnace } from './norwayControls';

describe('Norway furnace start checks', () => {
  it('only working power with electrodes in the charge starts the run', () => {
    for (const power of ['low', 'working', 'high'] as const) {
      for (const position of ['raised', 'inCharge'] as const) {
        assert.equal(checkFurnace(power, position) === null, power === 'working' && position === 'inCharge');
      }
    }
  });

  it('a failed combination explains both corrections', () => {
    const feedback = checkFurnace('low', 'raised');
    assert.match(feedback!, /Lower the electrodes/);
    assert.match(feedback!, /Increase it/);
  });

  it('excessive power receives its own correction even with contact', () => {
    const feedback = checkFurnace('high', 'inCharge');
    assert.match(feedback!, /Reduce it/);
    assert.doesNotMatch(feedback!, /Lower the electrodes/);
  });
});
