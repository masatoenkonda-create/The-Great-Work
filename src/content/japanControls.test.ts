import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { growthZone, meltTarget, meltZone, HEAT_LEVELS, PULL_LEVELS, MELT_POINT } from './japanControls';

describe('Japan crystal puller', () => {
  it('heat 3 and above melts the charge; below does not', () => {
    const melting = [1, 2, 3, 4, 5].filter(heat => meltZone(true, heat, meltTarget(true, heat)) === 'ok');
    assert.deepEqual(melting, [3, 4, 5]);
    assert.equal(meltZone(true, 3, MELT_POINT - 50), 'heating');
  });

  it('only heat 3 with pull 3 and rotation on grows the body', () => {
    const working: string[] = [];
    for (let heat = 1; heat <= HEAT_LEVELS; heat++) {
      for (let pull = 1; pull <= PULL_LEVELS; pull++) {
        if (growthZone(true, true, heat, pull, meltTarget(true, heat)) === 'ok') working.push(`${heat}/${pull}`);
      }
    }
    assert.deepEqual(working, ['3/3']);
  });

  it('rotation and heat problems are reported before pull speed', () => {
    const t = meltTarget(true, 3);
    assert.equal(growthZone(true, false, 3, 3, t), 'still');
    assert.equal(growthZone(true, true, 4, 1, meltTarget(true, 4)), 'hot');
    assert.equal(growthZone(true, true, 2, 5, meltTarget(true, 2)), 'cold');
  });

  it('pull speed sets thinner or wider', () => {
    const t = meltTarget(true, 3);
    assert.equal(growthZone(true, true, 3, 5, t), 'fast');
    assert.equal(growthZone(true, true, 3, 1, t), 'slow');
    assert.equal(growthZone(false, true, 3, 3, 20), 'off');
  });
});
