import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { reflowState, predictProfile, LEVELS, LIQUIDUS } from './chinaControls';

describe('China reflow oven', () => {
  it('works only along the diagonal: hotter needs a faster belt', () => {
    const ok: string[] = [];
    for (let heat = 1; heat <= LEVELS; heat++) {
      for (let belt = 1; belt <= LEVELS; belt++) if (reflowState(heat, belt) === 'ok') ok.push(`${heat}/${belt}`);
    }
    assert.deepEqual(ok, ['2/1', '3/2', '3/3', '4/4', '4/5']);
  });

  it('the starting settings and the maximum are both wrong', () => {
    assert.equal(reflowState(1, 5), 'cold');
    assert.equal(reflowState(5, 5), 'hot');
  });

  it('a working profile peaks 15-33 °C above melting', () => {
    const { peak, timeAboveMelt } = predictProfile(3, 3);
    assert.ok(peak - LIQUIDUS >= 15 && peak - LIQUIDUS <= 33);
    assert.ok(timeAboveMelt >= 30 && timeAboveMelt <= 90);
  });
});
