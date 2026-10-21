/**
 * Japan control panel layout, on the same fixed 480 x 400 canvas as Norway and Germany.
 * Final pixel art is drawn on this canvas; hotspots stay at these rectangles.
 */
import type { PanelLayout, PanelRect } from '../components/workshop/CockpitPanel';

export type JapanControlId =
  | 'main' | 'heatDown' | 'heatUp' | 'rotate' | 'pullDown' | 'pullUp'
  | 'load' | 'seed' | 'cool' | 'saw' | 'polish' | 'pack' | 'ship';
export type JapanGaugeId = 'meltTemp' | 'body' | 'diameter' | 'chamber' | 'heatLevel' | 'pullLevel';
export type JapanLampId = 'crucible' | 'charge' | 'melted' | 'rotating' | 'steady' | 'finished' | 'packed';

const lamps: [JapanLampId, string][] = [
  ['crucible', 'CRUCIBLE'], ['charge', 'CHARGE'], ['melted', 'MELTED'], ['rotating', 'ROTATING'],
  ['steady', 'STEADY'], ['finished', 'MIRROR'], ['packed', 'BOXED'],
];
const actions: [JapanControlId, string][] = [
  ['load', 'LOAD'], ['seed', 'DIP SEED'], ['cool', 'COOL & MOVE'], ['saw', 'WIRE SAW'],
  ['polish', 'POLISH'], ['pack', 'INSPECT & BOX'], ['ship', 'SHIP'],
];

export const JAPAN_PANEL: PanelLayout<JapanControlId, JapanGaugeId, JapanLampId> = {
  size: { width: 480, height: 400 },
  sections: [
    { id: 'status', label: 'STATUS', x: 6, y: 6, w: 468, h: 62 },
    { id: 'gauges', label: 'READINGS', x: 6, y: 74, w: 468, h: 118 },
    { id: 'puller', label: 'CRYSTAL PULLER', x: 6, y: 198, w: 468, h: 94 },
    { id: 'line', label: 'WAFER LINE', x: 6, y: 298, w: 468, h: 96 },
  ],
  lamps: lamps.map(([id, label], i): PanelRect & { id: JapanLampId } => ({ id, label, x: 14 + i * 66, y: 20, w: 56, h: 44 })),
  gauges: [
    { id: 'meltTemp', label: 'MELT TEMP', x: 14, y: 88, w: 150, h: 100 },
    { id: 'body', label: 'CRYSTAL LENGTH', x: 174, y: 88, w: 90, h: 100 },
    { id: 'diameter', label: 'DIAMETER', x: 274, y: 88, w: 90, h: 100 },
    { id: 'chamber', label: 'CHAMBER', x: 374, y: 88, w: 92, h: 100 },
    { id: 'heatLevel', label: 'HEAT', x: 120, y: 214, w: 62, h: 72 },
    { id: 'pullLevel', label: 'PULL', x: 352, y: 214, w: 62, h: 72 },
  ],
  controls: [
    { id: 'main', label: 'HEATER', x: 14, y: 214, w: 56, h: 72, red: true },
    { id: 'heatDown', label: 'HEAT −', x: 74, y: 214, w: 44, h: 72 },
    { id: 'heatUp', label: 'HEAT +', x: 184, y: 214, w: 44, h: 72 },
    { id: 'rotate', label: 'ROTATE', x: 246, y: 214, w: 56, h: 72 },
    { id: 'pullDown', label: 'PULL −', x: 306, y: 214, w: 44, h: 72 },
    { id: 'pullUp', label: 'PULL +', x: 416, y: 214, w: 44, h: 72 },
    ...actions.map(([id, label], i) => ({ id, label, x: 14 + i * 66, y: 314, w: 58, h: 74 })),
  ],
};
