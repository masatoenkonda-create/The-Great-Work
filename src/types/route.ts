import type { WaferMap } from '../content/waferMap';

/**
 * Definitions for the 7-stop worldwide chip journey
 * Exact route: Norway -> Germany -> Japan -> Taiwan -> Malaysia -> China mainland -> User
 * Scope defined in GUIDELINES.md: Supply Chain Gang
 * Coordinates calibrated to the 1376x768 approved map background.
 */

export type StopId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface RouteStop {
  id: StopId;
  order: number;
  label: string;
  name: string;
  country: string;
  location: string;
  purpose: string;
  activity: string;
  /** One friendly line for the map card. */
  pitch: string;
  x: number;
  y: number;
  coordinates: { x: number; y: number };
  callout: {
    dx: number;
    dy: number;
    align: 'left' | 'right' | 'center';
  };
  inputDescription: string;
  outputDescription: string;
  summary: string;
}

export interface CargoState {
  /** Save format version; 2 added the Taiwan wafer map, 3 replaced the phone with a TV. */
  saveVersion: 3;
  lotId: string;
  currentStopId: StopId;
  completedStops: StopId[];
  
  // Transformation stages (toy scales per GUIDELINES §11)
  siliconMetalBatchKg: number;      // Stop 1 output
  polysiliconBatchKg: number;        // Stop 2 output
  wafersProducedCount: number;       // Stop 3 output
  diesOnWaferCount: number;          // Stop 4 total dies
  goodDiesCount: number;             // Stop 4 good dies
  /** Stop 4 tested wafer map; Malaysia picks only its passing dies. Null until Taiwan ships. */
  waferMap: WaferMap | null;
  selectedChipSerial: string | null; // Stop 5 chosen good chip (lot-derived)
  /** Stop 6: the chip installed in the TV (must equal selectedChipSerial), the TV's ID, and whether it passed its checks. */
  tvChipSerial: string | null;
  tvSerial: string | null;
  isTvOperational: boolean;
  
  // Tracking whether a stage was completed via real interaction or skeleton placeholder
  completionMethod: Record<StopId, 'interactive' | 'placeholder' | null>;
  lastSavedAt: string;
}

export const ROUTE_STOPS: RouteStop[] = [
  {
    id: 1,
    order: 1,
    pitch: 'Turn rock into silicon.',
    label: 'Norway · Silicon',
    name: 'Make silicon',
    country: 'NORWAY',
    location: 'Orkanger / Thamshavn',
    purpose: 'Quartz-bearing feed + carbon -> silicon metal',
    activity: 'Smelt raw quartz and carbon in submerged-arc furnace to tap silicon metal.',
    x: 700,
    y: 150,
    coordinates: { x: 700, y: 150 },
    callout: { dx: 0, dy: -46, align: 'center' },
    inputDescription: 'Quartzite rocks + Carbon reducing feed (coal/woodchips)',
    outputDescription: 'Metallurgical-grade Silicon Metal',
    summary: 'Smelt raw quartz and carbon in a submerged-arc electric furnace to tap liquid silicon metal.'
  },
  {
    id: 2,
    order: 2,
    pitch: 'Make the silicon super pure.',
    label: 'Germany · Purify',
    name: 'Purify it',
    country: 'GERMANY',
    location: 'Burghausen',
    purpose: 'Silicon metal -> electronic-grade polysilicon',
    activity: 'Synthesize trichlorosilane, distill impurities, deposit hyper-pure polysilicon.',
    x: 680,
    y: 220,
    coordinates: { x: 680, y: 220 },
    callout: { dx: -90, dy: 16, align: 'right' },
    inputDescription: 'Silicon metal powder + Hydrogen Chloride (HCl)',
    outputDescription: 'Electronic-grade Polysilicon (ultra-pure solid chunks)',
    summary: 'React silicon metal into liquid trichlorosilane, distill out the impurities, then grow hyper-pure polysilicon onto heated rods.'
  },
  {
    id: 3,
    order: 3,
    pitch: 'Grow a crystal and slice it into wafers.',
    label: 'Japan · Wafers',
    name: 'Make wafers',
    country: 'JAPAN',
    location: 'Kyushu / Imari',
    purpose: 'Polysilicon -> crystal ingot -> polished wafers',
    activity: 'Melt polysilicon, pull crystal ingot, slice and mirror-polish silicon wafers.',
    x: 1200,
    y: 280,
    coordinates: { x: 1200, y: 280 },
    callout: { dx: 0, dy: -52, align: 'center' },
    inputDescription: 'Electronic-grade polysilicon chunks + Quartz crucible',
    outputDescription: 'Mirror-polished blank Silicon Wafers',
    summary: 'Melt polysilicon, pull a monocrystal ingot, slice into thin wafers, and chemical-mechanically polish to a mirror finish.'
  },
  {
    id: 4,
    order: 4,
    pitch: 'Print tiny circuits onto the wafer.',
    label: 'Taiwan · Circuits',
    name: 'Build circuits',
    country: 'TAIWAN',
    location: 'Hsinchu Science Park',
    purpose: 'Blank wafers + masks -> patterned wafers with good/bad die map',
    activity: 'Coat resist, expose nanoscale circuitry, plasma etch, and probe-test dies.',
    x: 1120,
    y: 350,
    coordinates: { x: 1120, y: 350 },
    callout: { dx: 65, dy: 14, align: 'left' },
    inputDescription: 'Blank silicon wafers + Photoresist + Pre-made mask designs',
    outputDescription: 'Patterned wafer with microchips + Electrical probe test map',
    summary: 'Deposit film, coat resist, expose pattern through mask, develop, plasma etch, and probe-test each die.'
  },
  {
    id: 5,
    order: 5,
    pitch: 'Cut out the chip and package it.',
    label: 'Malaysia · Package',
    name: 'Cut and package',
    country: 'MALAYSIA',
    location: 'Penang',
    purpose: 'Tested wafer + package materials -> released packaged chips',
    activity: 'Saw wafer into dies, wire-bond verified chip, and seal in molded resin.',
    x: 1040,
    y: 445,
    coordinates: { x: 1040, y: 445 },
    callout: { dx: -75, dy: 35, align: 'right' },
    inputDescription: 'Tested wafer with die map + Substrate carrier + Bond wires + Mold resin',
    outputDescription: 'Packaged microchip protected in molded resin',
    summary: 'Precision-saw the wafer, pick a verified good die, bond microscopic electrical connections, and encapsulate in protective resin.'
  },
  {
    id: 6,
    order: 6,
    pitch: 'Build a TV around the chip.',
    label: 'China · TV',
    name: 'Build the TV',
    country: 'CHINA',
    location: 'Huizhou, Guangdong',
    purpose: 'Packaged chip + main board + display module -> working TV',
    activity: 'Solder the chip onto the main board, X-ray the hidden joints, build and check the TV.',
    x: 1090,
    y: 300,
    coordinates: { x: 1090, y: 300 },
    callout: { dx: -80, dy: -30, align: 'right' },
    inputDescription: 'Packaged chip + main board + display module + power board',
    outputDescription: 'Assembled TV with picture and sound checked',
    summary: 'Print solder paste, place the chip, reflow it, X-ray the hidden joints, then build the board into a TV and check picture and sound.'
  },
  {
    id: 7,
    order: 7,
    pitch: 'Plug in the TV and finally watch.',
    label: 'USA · Home',
    name: 'Home',
    country: 'U.S.A.',
    location: 'San Francisco, CA',
    purpose: 'Finished TV -> watching it at home',
    activity: 'Unbox the TV, fit the stand, plug it in and turn it on.',
    x: 260,
    y: 260,
    coordinates: { x: 260, y: 260 },
    callout: { dx: -70, dy: -40, align: 'right' },
    inputDescription: 'Boxed TV, stand and remote',
    outputDescription: 'A TV working at home',
    summary: 'Unbox the TV, fit the stand, plug it in, turn it on, and look back at the road the chip travelled.'
  }
];
