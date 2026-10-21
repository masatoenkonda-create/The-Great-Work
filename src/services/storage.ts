import { CargoState, StopId } from '../types/route';
import { dieForSerial, isValidWaferMap, tvSerialFor } from '../content/waferMap';

const STORAGE_KEY = 'chip_journey_state_v1';
/** Untouched copy of a save from an older format, one per format version, kept when it is migrated or rejected. */
const backupKey = (version: number) => `chip_journey_state_backup_v${version}`;
export const SAVE_VERSION = 3;

export const INITIAL_CARGO_STATE: CargoState = {
  saveVersion: SAVE_VERSION,
  lotId: 'LOT-2026-X1',
  currentStopId: 1,
  completedStops: [],
  siliconMetalBatchKg: 0,
  polysiliconBatchKg: 0,
  wafersProducedCount: 0,
  diesOnWaferCount: 0,
  goodDiesCount: 0,
  waferMap: null,
  selectedChipSerial: null,
  tvChipSerial: null,
  tvSerial: null,
  isTvOperational: false,
  completionMethod: {
    1: null,
    2: null,
    3: null,
    4: null,
    5: null,
    6: null,
    7: null
  },
  lastSavedAt: new Date().toISOString()
};

/**
 * Clears a stop and everything after it, for the stops whose results later stops are built from:
 * Taiwan (4) makes the wafer map, Malaysia (5) the chip, China (6) the TV.
 */
export function resetFrom(stop: 4 | 5 | 6, cargo: CargoState): CargoState {
  const methods = { ...cargo.completionMethod };
  for (let s = stop; s <= 7; s++) methods[s as StopId] = null;
  return {
    ...cargo,
    currentStopId: Math.min(cargo.currentStopId, stop) as StopId,
    completedStops: cargo.completedStops.filter(s => s < stop),
    ...(stop <= 4 ? { diesOnWaferCount: 0, goodDiesCount: 0, waferMap: null } : {}),
    ...(stop <= 5 ? { selectedChipSerial: null } : {}),
    tvChipSerial: null,
    tvSerial: null,
    isTvOperational: false,
    completionMethod: methods,
  };
}
export const resetFromTaiwan = (cargo: CargoState) => resetFrom(4, cargo);

/** Set when loading had to send an old save back to an earlier stop; read once by the app. */
let migrationNotice: string | null = null;
export const takeMigrationNotice = () => { const notice = migrationNotice; migrationNotice = null; return notice; };

/**
 * Turns parsed save data into a current-format state, or null if it can't be used.
 * Earlier progress is kept; any result that isn't backed by the one before it is cleared,
 * and an old phone is never treated as a finished TV.
 */
export function normalizeCargo(parsed: unknown): { cargo: CargoState; notice: string | null } | null {
  const data = parsed as Omit<Partial<CargoState>, 'saveVersion'> & { saveVersion?: number };
  if (!data || typeof data !== 'object' || typeof data.lotId !== 'string' || typeof data.currentStopId !== 'number') return null;
  const version = data.saveVersion ?? 1;
  if (version !== 1 && version !== 2 && version !== 3) return null;
  const pick = <K extends keyof CargoState>(key: K) => (data[key] === undefined ? INITIAL_CARGO_STATE[key] : data[key]) as CargoState[K];
  let cargo: CargoState = {
    saveVersion: SAVE_VERSION,
    lotId: data.lotId,
    currentStopId: Math.min(7, Math.max(1, Math.round(data.currentStopId))) as StopId,
    completedStops: Array.isArray(data.completedStops) ? data.completedStops : [],
    siliconMetalBatchKg: pick('siliconMetalBatchKg'),
    polysiliconBatchKg: pick('polysiliconBatchKg'),
    wafersProducedCount: pick('wafersProducedCount'),
    diesOnWaferCount: pick('diesOnWaferCount'),
    goodDiesCount: pick('goodDiesCount'),
    waferMap: isValidWaferMap(data.waferMap, data.lotId) ? data.waferMap : null,
    selectedChipSerial: pick('selectedChipSerial'),
    tvChipSerial: version === 3 ? pick('tvChipSerial') : null,
    tvSerial: version === 3 ? pick('tvSerial') : null,
    isTvOperational: version === 3 ? pick('isTvOperational') : false,
    completionMethod: { ...INITIAL_CARGO_STATE.completionMethod, ...data.completionMethod },
    lastSavedAt: pick('lastSavedAt'),
  };
  const reached = (stop: number) => cargo.completedStops.includes(stop as StopId) || cargo.currentStopId > stop;
  let notice: string | null = null;
  if (reached(4) && !cargo.waferMap) {
    cargo = resetFrom(4, cargo);
    notice = "Your save is from an older version. Taiwan's wafer map is now saved, so Taiwan starts again.";
  } else if (reached(5) && !(cargo.waferMap && dieForSerial(cargo.waferMap, cargo.selectedChipSerial))) {
    cargo = resetFrom(5, cargo);
    notice = 'Your chip from Malaysia couldn\'t be matched to the wafer map, so Malaysia starts again.';
  } else if (reached(6)) {
    const chip = cargo.selectedChipSerial;
    const tvValid = version === 3 && cargo.completedStops.includes(6) && chip !== null
      && cargo.tvChipSerial === chip && cargo.tvSerial === tvSerialFor(chip) && cargo.isTvOperational;
    if (!tvValid) {
      cargo = resetFrom(6, cargo);
      notice = version < 3 ? 'The final product is now a TV. Your chip is saved; assembly starts in China.' : 'Your TV couldn\'t be matched to its chip, so China starts again.';
    }
  }
  return { cargo, notice };
}

export const loadSavedCargo = (): CargoState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CARGO_STATE;
    const parsed = JSON.parse(raw);
    const version = typeof parsed?.saveVersion === 'number' ? parsed.saveVersion : 1;
    if (version !== SAVE_VERSION && !localStorage.getItem(backupKey(version))) localStorage.setItem(backupKey(version), raw);
    const result = normalizeCargo(parsed);
    if (result) {
      migrationNotice = result.notice;
      return result.cargo;
    }
    console.warn('Saved game is from an unsupported format; starting fresh. A backup was kept.');
  } catch (err) {
    console.warn('Failed to load saved state, falling back to initial', err);
  }
  return INITIAL_CARGO_STATE;
};

export const saveCargoState = (state: CargoState): void => {
  try {
    const toSave: CargoState = {
      ...state,
      lastSavedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.error('Failed to save state to localStorage', err);
  }
};

export const clearCargoState = (): CargoState => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear state', err);
  }
  // Return fresh new state with new lot id
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return {
    ...INITIAL_CARGO_STATE,
    lotId: `LOT-2026-${randomSuffix}`,
    lastSavedAt: new Date().toISOString()
  };
};
