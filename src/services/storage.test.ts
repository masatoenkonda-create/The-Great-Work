import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCargo, resetFrom, INITIAL_CARGO_STATE } from './storage';
import { buildWaferMap, chipSerial, tvSerialFor, FIELDS } from '../content/waferMap';

const map = buildWaferMap('LOT-7', 1, FIELDS.map(field => ({ field, dx: 0, dy: 0 })));
const chip = chipSerial(map, map.dies.find(d => d.status === 'pass')!);
const v1 = (extra: object) => {
  const { saveVersion, waferMap, tvChipSerial, tvSerial, isTvOperational, ...old } = INITIAL_CARGO_STATE;
  return { ...old, lotId: 'LOT-7', phoneSerial: null, isPhoneOperational: false, ...extra };
};
const v2 = (extra: object) => ({ ...v1({}), saveVersion: 2, waferMap: map, ...extra });
const load = (data: unknown) => normalizeCargo(data)!;

describe('save migration', () => {
  it('keeps an old save that has not reached Taiwan', () => {
    const { cargo, notice } = load(v1({ currentStopId: 3, completedStops: [1, 2] }));
    assert.equal(cargo.saveVersion, 3);
    assert.equal(cargo.currentStopId, 3);
    assert.equal(notice, null);
  });

  it('sends a save past Taiwan without a map back to Taiwan', () => {
    const { cargo, notice } = load(v1({ currentStopId: 6, completedStops: [1, 2, 3, 4, 5], selectedChipSerial: 'CHIP-LOT26-D28' }));
    assert.equal(cargo.currentStopId, 4);
    assert.deepEqual(cargo.completedStops, [1, 2, 3]);
    assert.equal(cargo.selectedChipSerial, null);
    assert.ok(notice);
  });

  it('a chip that does not match the map sends the save back to Malaysia', () => {
    const { cargo } = load(v2({ currentStopId: 6, completedStops: [1, 2, 3, 4, 5], selectedChipSerial: 'LOT-7-W01-R0C0' }));
    assert.equal(cargo.currentStopId, 5);
    assert.ok(cargo.waferMap);
  });

  it('an old finished phone is not a TV: keeps the chip, restarts China', () => {
    const { cargo, notice } = load(v2({ currentStopId: 7, completedStops: [1, 2, 3, 4, 5, 6], selectedChipSerial: chip, phoneSerial: 'PHONE-A18', isPhoneOperational: true }));
    assert.equal(cargo.currentStopId, 6);
    assert.equal(cargo.selectedChipSerial, chip);
    assert.equal(cargo.isTvOperational, false);
    assert.equal('phoneSerial' in cargo, false);
    assert.match(notice!, /TV/);
  });

  it('keeps a valid finished TV and rejects a mismatched one', () => {
    const base = { ...INITIAL_CARGO_STATE, lotId: 'LOT-7', waferMap: map, selectedChipSerial: chip, currentStopId: 7, completedStops: [1, 2, 3, 4, 5, 6] };
    assert.equal(load({ ...base, tvChipSerial: chip, tvSerial: tvSerialFor(chip), isTvOperational: true }).cargo.currentStopId, 7);
    assert.equal(load({ ...base, tvChipSerial: 'other', tvSerial: 'TV-other', isTvOperational: true }).cargo.currentStopId, 6);
  });

  it('replaying Malaysia clears China and the USA', () => {
    const done = { ...INITIAL_CARGO_STATE, currentStopId: 7 as const, completedStops: [1, 2, 3, 4, 5, 6] as (1 | 2 | 3 | 4 | 5 | 6)[], selectedChipSerial: chip, tvChipSerial: chip, tvSerial: tvSerialFor(chip), isTvOperational: true, completionMethod: { ...INITIAL_CARGO_STATE.completionMethod, 6: 'interactive' as const } };
    const reset = resetFrom(5, done);
    assert.deepEqual(reset.completedStops, [1, 2, 3, 4]);
    assert.equal(reset.tvSerial, null);
    assert.equal(reset.completionMethod[6], null);
  });

  it('rejects unknown formats and junk', () => {
    assert.equal(normalizeCargo({ ...INITIAL_CARGO_STATE, saveVersion: 9 }), null);
    assert.equal(normalizeCargo('nope'), null);
  });
});
