import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCargo, INITIAL_CARGO_STATE } from './storage';
import { buildWaferMap, FIELDS } from '../content/waferMap';

const v1 = (extra: object) => {
  const { saveVersion, waferMap, ...old } = INITIAL_CARGO_STATE;
  return { ...old, lotId: 'LOT-7', ...extra };
};

describe('save migration', () => {
  it('keeps an old save that has not reached Taiwan', () => {
    const cargo = normalizeCargo(v1({ currentStopId: 3, completedStops: [1, 2] }))!;
    assert.equal(cargo.saveVersion, 2);
    assert.equal(cargo.currentStopId, 3);
    assert.deepEqual(cargo.completedStops, [1, 2]);
    assert.equal(cargo.waferMap, null);
  });

  it('sends an old save past Taiwan back to Taiwan, keeping earlier stops', () => {
    const cargo = normalizeCargo(v1({ currentStopId: 6, completedStops: [1, 2, 3, 4, 5], goodDiesCount: 44, selectedChipSerial: 'CHIP-LOT26-D28' }))!;
    assert.equal(cargo.currentStopId, 4);
    assert.deepEqual(cargo.completedStops, [1, 2, 3]);
    assert.equal(cargo.goodDiesCount, 0);
    assert.equal(cargo.selectedChipSerial, null);
  });

  it('keeps a current save with a valid map', () => {
    const map = buildWaferMap('LOT-7', 1, FIELDS.map(field => ({ field, dx: 0, dy: 0 })));
    const cargo = normalizeCargo({ ...INITIAL_CARGO_STATE, lotId: 'LOT-7', currentStopId: 5, completedStops: [1, 2, 3, 4], waferMap: map })!;
    assert.equal(cargo.currentStopId, 5);
    assert.equal(cargo.waferMap?.waferId, 'LOT-7-W01');
  });

  it('rejects unknown formats and junk', () => {
    assert.equal(normalizeCargo({ ...INITIAL_CARGO_STATE, saveVersion: 9 }), null);
    assert.equal(normalizeCargo('nope'), null);
  });
});
