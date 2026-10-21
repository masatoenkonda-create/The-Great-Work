/**
 * The tested wafer map handed from Taiwan to Malaysia (research/taiwan/WAFER_MAP_CONTRACT.md).
 * Teaching geometry, not a real die-size or yield model: 6 x 8 grid inside a round wafer,
 * notch down, 40 active dies in four exposure fields of ten.
 */
export type DieStatus = 'pass' | 'fail' | 'excluded';
export type FieldId = 'A' | 'B' | 'C' | 'D';
export const FIELDS: FieldId[] = ['A', 'B', 'C', 'D'];

export interface Die { id: string; row: number; col: number; field: FieldId; status: DieStatus }
export interface FieldExposure { field: FieldId; dx: number; dy: number }
export interface WaferMap {
  layoutVersion: 1;
  waferId: string;
  lotId: string;
  attempt: number;
  rows: 6;
  columns: 8;
  notch: 'down';
  exposures: FieldExposure[];
  dies: Die[];
  testComplete: true;
}

export const ROWS = 6;
export const COLUMNS = 8;
const RADIUS = 4.3;

/** A full die is active only if its outer corner fits inside the wafer circle. */
export function isActive(row: number, col: number): boolean {
  const x = Math.abs(col - 3.5) + 0.5;
  const y = Math.abs(row - 2.5) + 0.5;
  return x * x + y * y <= RADIUS * RADIUS;
}

/** Fields are the four quadrants: A top-left, B top-right, C bottom-left, D bottom-right. */
export function fieldOf(row: number, col: number): FieldId {
  return row < 3 ? (col < 4 ? 'A' : 'B') : (col < 4 ? 'C' : 'D');
}

export const dieId = (row: number, col: number) => `r${row}c${col}`;
export const waferIdFor = (lotId: string, attempt: number) => `${lotId}-W${String(attempt).padStart(2, '0')}`;

/** Game rule: a field exposed with any offset misses the layer below, so its active dies fail. */
export function buildWaferMap(lotId: string, attempt: number, exposures: FieldExposure[]): WaferMap {
  const missed = new Set(exposures.filter(e => e.dx !== 0 || e.dy !== 0).map(e => e.field));
  const dies: Die[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      const field = fieldOf(row, col);
      const status: DieStatus = !isActive(row, col) ? 'excluded' : missed.has(field) ? 'fail' : 'pass';
      dies.push({ id: dieId(row, col), row, col, field, status });
    }
  }
  return {
    layoutVersion: 1, waferId: waferIdFor(lotId, attempt), lotId, attempt,
    rows: ROWS, columns: COLUMNS, notch: 'down', exposures, dies, testComplete: true,
  };
}

export function mapCounts(map: WaferMap) {
  const active = map.dies.filter(d => d.status !== 'excluded');
  return { diesOnWaferCount: active.length, goodDiesCount: active.filter(d => d.status === 'pass').length };
}

/** Structural check for saved maps; anything else is treated as missing, never repaired. */
export function isValidWaferMap(value: unknown, lotId: string): value is WaferMap {
  const map = value as WaferMap;
  if (!map || map.layoutVersion !== 1 || map.lotId !== lotId || map.rows !== ROWS || map.columns !== COLUMNS) return false;
  if (map.notch !== 'down' || map.testComplete !== true || map.waferId !== waferIdFor(lotId, map.attempt)) return false;
  if (!Array.isArray(map.dies) || map.dies.length !== ROWS * COLUMNS) return false;
  if (!Array.isArray(map.exposures) || map.exposures.length !== FIELDS.length) return false;
  const seen = new Set<string>();
  for (const die of map.dies) {
    if (!Number.isInteger(die.row) || !Number.isInteger(die.col) || die.row < 0 || die.row >= ROWS || die.col < 0 || die.col >= COLUMNS) return false;
    if (die.id !== dieId(die.row, die.col) || seen.has(die.id) || die.field !== fieldOf(die.row, die.col)) return false;
    if (isActive(die.row, die.col) ? die.status === 'excluded' || (die.status !== 'pass' && die.status !== 'fail') : die.status !== 'excluded') return false;
    seen.add(die.id);
  }
  return true;
}

/** Serial for the chip Malaysia packages, derived from the wafer and die identity. */
export const chipSerial = (map: WaferMap, die: Die) => `${map.waferId}-${die.id.toUpperCase()}`;

/** The passing die a chip serial refers to, or null if the serial doesn't match this map. */
export const dieForSerial = (map: WaferMap, serial: string | null) =>
  serial ? map.dies.find(d => d.status === 'pass' && chipSerial(map, d) === serial) ?? null : null;

/** The TV's ID, derived from the chip installed in it. */
export const tvSerialFor = (chip: string) => `TV-${chip}`;
