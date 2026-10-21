/**
 * Norway control panel layout, in a fixed 480 x 400 canvas. The future pixel-art panel
 * (see research/norway/CONTROL_PANEL_SPEC.md) is drawn on the same canvas; every control
 * keeps its rectangle so the art can replace the placeholder without moving hotspots.
 */
import type { PanelLayout, PanelRect } from '../components/workshop/CockpitPanel';

export const PANEL_SIZE = { width: 480, height: 400 };

export type PanelControlId =
  | 'pickaxe' | 'hammer' | 'quartz' | 'carbon' | 'bag' | 'ship'
  | 'main' | 'powerDown' | 'powerUp' | 'electrodesUp' | 'electrodesDown' | 'tap';
export type PanelGaugeId = 'temperature' | 'reaction' | 'liquid' | 'mould' | 'powerLevel';
export type PanelLampId = 'quartzIn' | 'carbonIn' | 'mainOn' | 'heatOk' | 'molten' | 'cool' | 'bagged';

export const PANEL_SECTIONS: (PanelRect & { id: string })[] = [
  { id: 'status', label: 'STATUS', x: 6, y: 6, w: 468, h: 62 },
  { id: 'gauges', label: 'READINGS', x: 6, y: 74, w: 468, h: 118 },
  { id: 'furnace', label: 'FURNACE', x: 6, y: 198, w: 468, h: 94 },
  { id: 'work', label: 'MATERIALS', x: 6, y: 298, w: 468, h: 96 },
];

export const PANEL_LAMPS: (PanelRect & { id: PanelLampId })[] = [
  { id: 'quartzIn', label: 'QUARTZ IN' }, { id: 'carbonIn', label: 'CARBON IN' }, { id: 'mainOn', label: 'MAIN ON' },
  { id: 'heatOk', label: 'HEAT OK' }, { id: 'molten', label: 'MOLTEN' }, { id: 'cool', label: 'COOL' }, { id: 'bagged', label: 'BAGGED' },
].map((lamp, i) => ({ ...lamp, id: lamp.id as PanelLampId, x: 14 + i * 66, y: 20, w: 56, h: 44 }));

export const PANEL_GAUGES: (PanelRect & { id: PanelGaugeId })[] = [
  { id: 'temperature', label: 'FURNACE TEMP', x: 14, y: 88, w: 150, h: 100 },
  { id: 'reaction', label: 'REACTION', x: 174, y: 88, w: 90, h: 100 },
  { id: 'liquid', label: 'LIQUID Si', x: 274, y: 88, w: 90, h: 100 },
  { id: 'mould', label: 'MOULD TEMP', x: 374, y: 88, w: 92, h: 100 },
  { id: 'powerLevel', label: 'POWER LEVEL', x: 150, y: 214, w: 90, h: 72 },
];

export const PANEL_CONTROLS: (PanelRect & { id: PanelControlId; red?: boolean })[] = [
  { id: 'main', label: 'MAIN POWER', x: 14, y: 214, w: 70, h: 72, red: true },
  { id: 'powerDown', label: 'POWER −', x: 92, y: 214, w: 52, h: 72 },
  { id: 'powerUp', label: 'POWER +', x: 246, y: 214, w: 52, h: 72 },
  { id: 'electrodesUp', label: 'ELEC ▲', x: 306, y: 214, w: 52, h: 72 },
  { id: 'electrodesDown', label: 'ELEC ▼', x: 364, y: 214, w: 52, h: 72 },
  { id: 'tap', label: 'TAPHOLE', x: 422, y: 214, w: 46, h: 72, red: true },
  ...(['pickaxe', 'hammer', 'quartz', 'carbon', 'bag', 'ship'] as const).map((id, i) => ({
    id, label: ['PICKAXE', 'HAMMER', 'LOAD QUARTZ', 'LOAD CARBON', 'BAG', 'SHIP'][i], x: 14 + i * 77, y: 314, w: 68, h: 74,
  })),
];

export const NORWAY_PANEL: PanelLayout<PanelControlId, PanelGaugeId, PanelLampId> = {
  size: PANEL_SIZE, sections: PANEL_SECTIONS, lamps: PANEL_LAMPS, gauges: PANEL_GAUGES, controls: PANEL_CONTROLS,
};
