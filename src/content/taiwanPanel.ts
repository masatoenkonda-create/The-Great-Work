/**
 * Taiwan control panel layout, on the same fixed 480 x 400 canvas as the other workshops.
 * Final pixel art is drawn on this canvas; hotspots stay at these rectangles.
 */
import type { PanelLayout, PanelRect } from '../components/workshop/CockpitPanel';

export type TaiwanControlId =
  | 'xDown' | 'xUp' | 'yDown' | 'yUp' | 'expose'
  | 'load' | 'first' | 'finish' | 'probe' | 'retry' | 'ship';
export type TaiwanGaugeId = 'field' | 'align' | 'progress' | 'good';
export type TaiwanLampId = 'wafer' | 'resist' | 'layer1' | 'aligned' | 'patterned' | 'tested' | 'released';

const lamps: [TaiwanLampId, string][] = [
  ['wafer', 'WAFER IN'], ['resist', 'RESIST'], ['layer1', 'LAYER 1'], ['aligned', 'ALIGNED'],
  ['patterned', 'PATTERNED'], ['tested', 'TESTED'], ['released', 'RELEASED'],
];
const actions: [TaiwanControlId, string][] = [
  ['load', 'LOAD WAFER'], ['first', 'FIRST LAYER'], ['finish', 'FINISH LAYERS'],
  ['probe', 'PROBE TEST'], ['retry', 'NEW WAFER'], ['ship', 'SHIP'],
];

export const TAIWAN_PANEL: PanelLayout<TaiwanControlId, TaiwanGaugeId, TaiwanLampId> = {
  size: { width: 480, height: 400 },
  sections: [
    { id: 'status', label: 'STATUS', x: 6, y: 6, w: 468, h: 62 },
    { id: 'gauges', label: 'READINGS', x: 6, y: 74, w: 468, h: 118 },
    { id: 'scanner', label: 'SCANNER ALIGNMENT', x: 6, y: 198, w: 468, h: 94 },
    { id: 'line', label: 'FAB LINE', x: 6, y: 298, w: 468, h: 96 },
  ],
  lamps: lamps.map(([id, label], i): PanelRect & { id: TaiwanLampId } => ({ id, label, x: 14 + i * 66, y: 20, w: 56, h: 44 })),
  gauges: [
    { id: 'field', label: 'FIELD', x: 14, y: 88, w: 100, h: 100 },
    { id: 'align', label: 'ALIGNMENT', x: 124, y: 88, w: 130, h: 100 },
    { id: 'progress', label: 'PROCESS', x: 264, y: 88, w: 90, h: 100 },
    { id: 'good', label: 'GOOD DIES', x: 364, y: 88, w: 102, h: 100 },
  ],
  controls: [
    { id: 'xDown', label: 'X ◀', x: 14, y: 214, w: 62, h: 72 },
    { id: 'xUp', label: 'X ▶', x: 80, y: 214, w: 62, h: 72 },
    { id: 'yDown', label: 'Y ▼', x: 152, y: 214, w: 62, h: 72 },
    { id: 'yUp', label: 'Y ▲', x: 218, y: 214, w: 62, h: 72 },
    { id: 'expose', label: 'EXPOSE', x: 330, y: 214, w: 120, h: 72, red: true },
    ...actions.map(([id, label], i) => ({ id, label, x: 14 + i * 77, y: 314, w: 68, h: 74 })),
  ],
};
