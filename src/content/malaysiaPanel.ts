/**
 * Malaysia control panel layout, on the same fixed 480 x 400 canvas as the other workshops.
 * Final pixel art is drawn on this canvas; hotspots stay at these rectangles.
 */
import type { PanelLayout, PanelRect } from '../components/workshop/CockpitPanel';

export type MalaysiaControlId =
  | 'forceDown' | 'forceUp' | 'usDown' | 'usUp' | 'bond'
  | 'saw' | 'pick' | 'mold' | 'balls' | 'test' | 'ship';
export type MalaysiaGaugeId = 'die' | 'bondReady' | 'wires' | 'progress' | 'force' | 'ultrasonic';
export type MalaysiaLampId = 'diced' | 'picked' | 'attached' | 'bonded' | 'molded' | 'balls' | 'tested';

const lamps: [MalaysiaLampId, string][] = [
  ['diced', 'DICED'], ['picked', 'DIE PICKED'], ['attached', 'ATTACHED'], ['bonded', 'BONDED'],
  ['molded', 'MOLDED'], ['balls', 'BALLS ON'], ['tested', 'TESTED'],
];
const actions: [MalaysiaControlId, string][] = [
  ['saw', 'SAW'], ['pick', 'PICK DIE'], ['mold', 'MOLD'], ['balls', 'BALL ATTACH'], ['test', 'TEST'], ['ship', 'SHIP'],
];

export const MALAYSIA_PANEL: PanelLayout<MalaysiaControlId, MalaysiaGaugeId, MalaysiaLampId> = {
  size: { width: 480, height: 400 },
  sections: [
    { id: 'status', label: 'STATUS', x: 6, y: 6, w: 468, h: 62 },
    { id: 'gauges', label: 'READINGS', x: 6, y: 74, w: 468, h: 118 },
    { id: 'bonder', label: 'WIRE BONDER', x: 6, y: 198, w: 468, h: 94 },
    { id: 'line', label: 'ASSEMBLY LINE', x: 6, y: 298, w: 468, h: 96 },
  ],
  lamps: lamps.map(([id, label], i): PanelRect & { id: MalaysiaLampId } => ({ id, label, x: 14 + i * 66, y: 20, w: 56, h: 44 })),
  gauges: [
    { id: 'die', label: 'DIE', x: 14, y: 88, w: 120, h: 100 },
    { id: 'bondReady', label: 'BOND', x: 144, y: 88, w: 110, h: 100 },
    { id: 'wires', label: 'WIRES', x: 264, y: 88, w: 90, h: 100 },
    { id: 'progress', label: 'PACKAGE', x: 364, y: 88, w: 102, h: 100 },
    { id: 'force', label: 'FORCE', x: 62, y: 214, w: 62, h: 72 },
    { id: 'ultrasonic', label: 'ULTRASONIC', x: 222, y: 214, w: 62, h: 72 },
  ],
  controls: [
    { id: 'forceDown', label: 'FORCE −', x: 14, y: 214, w: 46, h: 72 },
    { id: 'forceUp', label: 'FORCE +', x: 126, y: 214, w: 46, h: 72 },
    { id: 'usDown', label: 'U/S −', x: 174, y: 214, w: 46, h: 72 },
    { id: 'usUp', label: 'U/S +', x: 286, y: 214, w: 46, h: 72 },
    { id: 'bond', label: 'BOND', x: 352, y: 214, w: 108, h: 72, red: true },
    ...actions.map(([id, label], i) => ({ id, label, x: 14 + i * 77, y: 314, w: 68, h: 74 })),
  ],
};
