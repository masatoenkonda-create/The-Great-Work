import { CargoState, StopId } from '../types/route';
import { isValidWaferMap } from '../content/waferMap';

const STORAGE_KEY = 'chip_journey_state_v1';
/** Untouched copy of a save from before the current format, kept when it is migrated or rejected. */
const BACKUP_KEY = 'chip_journey_state_backup';
export const SAVE_VERSION = 2;

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
  phoneSerial: null,
  isPhoneOperational: false,
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

/** Clears Taiwan and everything after it, so Taiwan is replayed and produces a real map. */
export function resetFromTaiwan(cargo: CargoState): CargoState {
  return {
    ...cargo,
    currentStopId: Math.min(cargo.currentStopId, 4) as StopId,
    completedStops: cargo.completedStops.filter(stop => stop < 4),
    diesOnWaferCount: 0,
    goodDiesCount: 0,
    waferMap: null,
    selectedChipSerial: null,
    phoneSerial: null,
    isPhoneOperational: false,
    completionMethod: { ...cargo.completionMethod, 4: null, 5: null, 6: null, 7: null },
  };
}

/**
 * Turns parsed save data into a current-format state, or null if it can't be used.
 * Earlier progress is kept; a Taiwan completion without a valid map is not trusted.
 */
export function normalizeCargo(parsed: unknown): CargoState | null {
  const data = parsed as Partial<CargoState> & { saveVersion?: number };
  if (!data || typeof data !== 'object' || typeof data.lotId !== 'string' || typeof data.currentStopId !== 'number') return null;
  if (data.saveVersion !== undefined && data.saveVersion !== SAVE_VERSION) return null;
  const cargo: CargoState = {
    ...INITIAL_CARGO_STATE,
    ...data,
    saveVersion: SAVE_VERSION,
    completedStops: Array.isArray(data.completedStops) ? data.completedStops : [],
    completionMethod: { ...INITIAL_CARGO_STATE.completionMethod, ...data.completionMethod },
    waferMap: isValidWaferMap(data.waferMap, data.lotId) ? data.waferMap : null,
  };
  const pastTaiwan = cargo.completedStops.includes(4) || cargo.currentStopId > 4;
  return pastTaiwan && !cargo.waferMap ? resetFromTaiwan(cargo) : cargo;
}

export const loadSavedCargo = (): CargoState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CARGO_STATE;
    const parsed = JSON.parse(raw);
    if (parsed?.saveVersion !== SAVE_VERSION && !localStorage.getItem(BACKUP_KEY)) localStorage.setItem(BACKUP_KEY, raw);
    const cargo = normalizeCargo(parsed);
    if (cargo) return cargo;
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
