/**
 * Sourced facts and stop definitions for the 7-stop worldwide chip journey
 * As required by GUIDELINES.md §11, stop facts carry hidden sourceIds pointing to SOURCES.md.
 * No sources or disclaimers are rendered in the visible UI.
 */

export interface StopContent {
  id: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  name: string;
  country: string;
  hub: string;
  objective: string;
  inputName: string;
  outputName: string;
  sourceIds: string[];
}

export const STOPS_CONTENT: Record<number, StopContent> = {
  1: {
    id: 1,
    name: 'Make silicon',
    country: 'Norway',
    hub: 'Orkanger / Thamshavn',
    objective: 'Fill the furnace with quartz chunks and carbon.',
    inputName: 'Quartzite rocks + Carbon reducing feed',
    outputName: 'Silicon metal batch',
    sourceIds: ['R03']
  },
  2: {
    id: 2,
    name: 'Purify it',
    country: 'Germany',
    hub: 'Burghausen',
    objective: 'Load reactants and distill to electronic purity.',
    inputName: 'Silicon metal powder + Hydrogen Chloride',
    outputName: 'Polysilicon batch',
    sourceIds: ['R04', 'R13']
  },
  3: {
    id: 3,
    name: 'Make wafers',
    country: 'Japan',
    hub: 'Kyushu / Imari',
    objective: 'Grow crystal ingot, slice, polish, and clean.',
    inputName: 'Polysilicon chunks + Quartz crucible',
    outputName: 'Mirror-polished silicon wafers',
    sourceIds: ['R05', 'R06']
  },
  4: {
    id: 4,
    name: 'Build circuits',
    country: 'Taiwan',
    hub: 'Hsinchu Science Park',
    objective: 'Pattern microscopic circuits and probe test dies.',
    inputName: 'Blank silicon wafers + Photoresist + Masks',
    outputName: 'Patterned wafer with good/bad die map',
    sourceIds: ['R01', 'R02', 'R07', 'R08', 'R14']
  },
  5: {
    id: 5,
    name: 'Cut and package',
    country: 'Malaysia',
    hub: 'Penang',
    objective: 'Saw wafer, pick a good die, wire bond, and resin seal.',
    inputName: 'Tested wafer with die map + Lead frame + Resin',
    outputName: 'Packaged microchip',
    sourceIds: ['R02', 'R15', 'R18']
  },
  6: {
    id: 6,
    name: 'Assemble phone',
    country: 'China',
    hub: 'Zhengzhou',
    objective: 'Mount chip to circuit board and assemble smartphone.',
    inputName: 'Packaged chip + Logic board + Display + Battery',
    outputName: 'Working smartphone',
    sourceIds: ['R02', 'R11']
  },
  7: {
    id: 7,
    name: 'The user',
    country: 'USA',
    hub: 'San Francisco',
    objective: 'Deliver, power on, and reflect on the global road.',
    inputName: 'Packaged retail phone box',
    outputName: 'Operational smartphone in user hands',
    sourceIds: ['Game scenario']
  }
};
