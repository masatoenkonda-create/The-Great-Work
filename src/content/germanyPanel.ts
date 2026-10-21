/**
 * Germany control panel layout, on the same fixed 480 x 400 canvas as Norway.
 * Final pixel art is drawn on this canvas; hotspots stay at these rectangles.
 */
import type { PanelLayout, PanelRect } from '../components/workshop/CockpitPanel';

export type GermanyControlId =
  | 'main' | 'heatDown' | 'heatUp' | 'mixDown' | 'mixUp'
  | 'mill' | 'convert' | 'distill' | 'open' | 'break' | 'clean' | 'ship';
export type GermanyGaugeId = 'rodTemp' | 'growth' | 'compound' | 'reactor' | 'heatLevel' | 'mixLevel';
export type GermanyLampId = 'silicon' | 'hcl' | 'compound' | 'purified' | 'hydrogen' | 'growing' | 'packed';

const lamps: [GermanyLampId, string][] = [
  ['silicon', 'POWDER'], ['hcl', 'HCl ON'], ['compound', 'COMPOUND'], ['purified', 'PURIFIED'],
  ['hydrogen', 'H₂ ON'], ['growing', 'GROWING'], ['packed', 'PACKED'],
];
const actions: [GermanyControlId, string][] = [
  ['mill', 'MILL'], ['convert', 'CONVERT'], ['distill', 'DISTILL'], ['open', 'COOL & OPEN'],
  ['break', 'BREAK'], ['clean', 'CLEAN & PACK'], ['ship', 'SHIP'],
];

export const GERMANY_PANEL: PanelLayout<GermanyControlId, GermanyGaugeId, GermanyLampId> = {
  size: { width: 480, height: 400 },
  sections: [
    { id: 'status', label: 'STATUS', x: 6, y: 6, w: 468, h: 62 },
    { id: 'gauges', label: 'READINGS', x: 6, y: 74, w: 468, h: 118 },
    { id: 'reactor', label: 'DEPOSITION REACTOR', x: 6, y: 198, w: 468, h: 94 },
    { id: 'line', label: 'PROCESS LINE', x: 6, y: 298, w: 468, h: 96 },
  ],
  lamps: lamps.map(([id, label], i): PanelRect & { id: GermanyLampId } => ({ id, label, x: 14 + i * 66, y: 20, w: 56, h: 44 })),
  gauges: [
    { id: 'rodTemp', label: 'ROD TEMP', x: 14, y: 88, w: 150, h: 100 },
    { id: 'growth', label: 'ROD GROWTH', x: 174, y: 88, w: 90, h: 100 },
    { id: 'compound', label: 'PURE LIQUID', x: 274, y: 88, w: 90, h: 100 },
    { id: 'reactor', label: 'REACTOR', x: 374, y: 88, w: 92, h: 100 },
    { id: 'heatLevel', label: 'ROD HEAT', x: 126, y: 214, w: 70, h: 72 },
    { id: 'mixLevel', label: 'GAS MIX', x: 330, y: 214, w: 70, h: 72 },
  ],
  controls: [
    { id: 'main', label: 'MAIN POWER', x: 14, y: 214, w: 60, h: 72, red: true },
    { id: 'heatDown', label: 'HEAT −', x: 78, y: 214, w: 46, h: 72 },
    { id: 'heatUp', label: 'HEAT +', x: 198, y: 214, w: 46, h: 72 },
    { id: 'mixDown', label: 'MIX −', x: 282, y: 214, w: 46, h: 72 },
    { id: 'mixUp', label: 'MIX +', x: 402, y: 214, w: 46, h: 72 },
    ...actions.map(([id, label], i) => ({ id, label, x: 14 + i * 66, y: 314, w: 58, h: 74 })),
  ],
};
