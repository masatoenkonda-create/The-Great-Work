import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bondState, LEVELS } from './malaysiaControls';

describe('Malaysia wire bonder', () => {
  it('accepts only balanced middle settings', () => {
    const ok: string[] = [];
    for (let force = 1; force <= LEVELS; force++) {
      for (let us = 1; us <= LEVELS; us++) if (bondState(force, us) === 'ok') ok.push(`${force}/${us}`);
    }
    assert.deepEqual(ok, ['2/4', '3/3', '4/2']);
  });

  it('maximum on either control is never right', () => {
    assert.equal(bondState(LEVELS, 1), 'tooMuchForce');
    assert.equal(bondState(1, LEVELS), 'tooMuchVibration');
  });

  it('tells weak from harsh', () => {
    assert.equal(bondState(1, 1), 'weak');
    assert.equal(bondState(2, 3), 'weak');
    assert.equal(bondState(4, 4), 'harsh');
  });
});
