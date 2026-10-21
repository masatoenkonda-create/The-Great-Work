import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildWaferMap, isActive, isValidWaferMap, mapCounts, fieldOf, FIELDS, ROWS, COLUMNS } from './waferMap';

const aligned = FIELDS.map(field => ({ field, dx: 0, dy: 0 }));

describe('wafer map', () => {
  it('has 40 active dies, ten in each field, and 8 excluded corners', () => {
    let active = 0;
    const perField: Record<string, number> = {};
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        if (!isActive(row, col)) continue;
        active++;
        perField[fieldOf(row, col)] = (perField[fieldOf(row, col)] ?? 0) + 1;
      }
    }
    assert.equal(active, 40);
    assert.deepEqual(perField, { A: 10, B: 10, C: 10, D: 10 });
  });

  it('an aligned run passes every active die', () => {
    const map = buildWaferMap('LOT-1', 1, aligned);
    assert.deepEqual(mapCounts(map), { diesOnWaferCount: 40, goodDiesCount: 40 });
    assert.equal(map.waferId, 'LOT-1-W01');
  });

  it('a misaligned field fails exactly its ten dies', () => {
    const map = buildWaferMap('LOT-1', 2, aligned.map(e => (e.field === 'B' ? { ...e, dx: 1 } : e)));
    assert.deepEqual(mapCounts(map), { diesOnWaferCount: 40, goodDiesCount: 30 });
    assert.ok(map.dies.filter(d => d.status === 'fail').every(d => d.field === 'B'));
  });

  it('validates its own maps and rejects tampered ones', () => {
    const map = buildWaferMap('LOT-1', 1, aligned);
    assert.equal(isValidWaferMap(map, 'LOT-1'), true);
    assert.equal(isValidWaferMap(map, 'LOT-2'), false);
    const corner = map.dies.find(d => !isActive(d.row, d.col))!;
    assert.equal(isValidWaferMap({ ...map, dies: map.dies.map(d => (d === corner ? { ...d, status: 'pass' } : d)) }, 'LOT-1'), false);
    assert.equal(isValidWaferMap(null, 'LOT-1'), false);
  });
});
