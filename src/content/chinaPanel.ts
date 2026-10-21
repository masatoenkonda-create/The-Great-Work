/**
 * China control panel layout, on the same fixed 480 x 400 canvas as the other workshops.
 * Final pixel art is drawn on this canvas; hotspots stay at these rectangles.
 */
import type { PanelLayout, PanelRect } from '../components/workshop/CockpitPanel';

export type ChinaControlId =
  | 'heatDown' | 'heatUp' | 'beltDown' | 'beltUp' | 'feed'
  | 'print' | 'place' | 'xray' | 'assemble' | 'check' | 'ship';
export type ChinaGaugeId = 'peak' | 'time' | 'board' | 'tv' | 'heat' | 'belt';
export type ChinaLampId = 'pasted' | 'placed' | 'soldered' | 'inspected' | 'assembled' | 'powered' | 'packed';

const lamps: [ChinaLampId, string][] = [
  ['pasted', 'PASTE'], ['placed', 'CHIP PLACED'], ['soldered', 'SOLDERED'], ['inspected', 'X-RAYED'],
  ['assembled', 'ASSEMBLED'], ['powered', 'PICTURE OK'], ['packed', 'PACKED'],
];
const actions: [ChinaControlId, string][] = [
  ['print', 'PRINT PASTE'], ['place', 'PLACE'], ['xray', 'X-RAY'], ['assemble', 'ASSEMBLE TV'], ['check', 'POWER & CHECK'], ['ship', 'PACK & SHIP'],
];

export const CHINA_PANEL: PanelLayout<ChinaControlId, ChinaGaugeId, ChinaLampId> = {
  size: { width: 480, height: 400 },
  sections: [
    { id: 'status', label: 'STATUS', x: 6, y: 6, w: 468, h: 62 },
    { id: 'gauges', label: 'PREDICTED PROFILE', x: 6, y: 74, w: 468, h: 118 },
    { id: 'oven', label: 'REFLOW OVEN', x: 6, y: 198, w: 468, h: 94 },
    { id: 'line', label: 'TV LINE', x: 6, y: 298, w: 468, h: 96 },
  ],
  lamps: lamps.map(([id, label], i): PanelRect & { id: ChinaLampId } => ({ id, label, x: 14 + i * 66, y: 20, w: 56, h: 44 })),
  gauges: [
    { id: 'peak', label: 'PEAK', x: 14, y: 88, w: 130, h: 100 },
    { id: 'time', label: 'TIME MOLTEN', x: 154, y: 88, w: 110, h: 100 },
    { id: 'board', label: 'BOARD', x: 274, y: 88, w: 90, h: 100 },
    { id: 'tv', label: 'TV', x: 374, y: 88, w: 92, h: 100 },
    { id: 'heat', label: 'HEAT', x: 62, y: 214, w: 62, h: 72 },
    { id: 'belt', label: 'BELT', x: 222, y: 214, w: 62, h: 72 },
  ],
  controls: [
    { id: 'heatDown', label: 'HEAT −', x: 14, y: 214, w: 46, h: 72 },
    { id: 'heatUp', label: 'HEAT +', x: 126, y: 214, w: 46, h: 72 },
    { id: 'beltDown', label: 'SLOWER', x: 174, y: 214, w: 46, h: 72 },
    { id: 'beltUp', label: 'FASTER', x: 286, y: 214, w: 46, h: 72 },
    { id: 'feed', label: 'FEED BOARD', x: 352, y: 214, w: 108, h: 72, red: true },
    ...actions.map(([id, label], i) => ({ id, label, x: 14 + i * 77, y: 314, w: 68, h: 74 })),
  ],
};
