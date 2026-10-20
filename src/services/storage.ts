import { CargoState, StopId } from '../types/route';

const STORAGE_KEY = 'chip_journey_state_v1';

export const INITIAL_CARGO_STATE: CargoState = {
  lotId: 'LOT-2026-X1',
  currentStopId: 1,
  completedStops: [],
  siliconMetalBatchKg: 0,
  polysiliconBatchKg: 0,
  wafersProducedCount: 0,
  diesOnWaferCount: 0,
  goodDiesCount: 0,
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

export const loadSavedCargo = (): CargoState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_CARGO_STATE;
    const parsed = JSON.parse(raw) as CargoState;
    if (parsed && typeof parsed.currentStopId === 'number' && parsed.lotId) {
      return parsed;
    }
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
