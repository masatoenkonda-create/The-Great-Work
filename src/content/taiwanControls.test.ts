import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { alignState, canExpose, nudge, START_OFFSETS, OFFSET_LIMIT } from './taiwanControls';

describe('Taiwan scanner alignment', () => {
  it('only zero offset is aligned', () => {
    assert.equal(alignState(0, 0), 'aligned');
    assert.equal(alignState(1, 0), 'near');
    assert.equal(alignState(-1, 1), 'near');
    assert.equal(alignState(2, 1), 'far');
  });

  it('near offsets can be exposed, far ones cannot', () => {
    assert.equal(canExpose(0, 0), true);
    assert.equal(canExpose(1, -1), true);
    assert.equal(canExpose(3, 0), false);
  });

  it('every field starts out of line but within reach', () => {
    for (const { dx, dy } of Object.values(START_OFFSETS)) {
      assert.notEqual(alignState(dx, dy), 'aligned');
      assert.ok(Math.abs(dx) <= OFFSET_LIMIT && Math.abs(dy) <= OFFSET_LIMIT);
    }
  });

  it('nudges stay inside the limit', () => {
    assert.equal(nudge(OFFSET_LIMIT, 1), OFFSET_LIMIT);
    assert.equal(nudge(-OFFSET_LIMIT, -1), -OFFSET_LIMIT);
    assert.equal(nudge(0, 1), 1);
  });
});
