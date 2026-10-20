/**
 * Definitions for the 7-stop worldwide chip journey
 * Exact route: Norway -> Germany -> Japan -> Taiwan -> Malaysia -> China mainland -> User
 * Scope defined in GUIDELINES.md
 */

export type StopId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface RouteStop {
  id: StopId;
  name: string;
  location: string;
  purpose: string;
  inputDescription: string;
  outputDescription: string;
  coordinates: { x: number; y: number }; // Percentage on 2D fallback map (0-100)
  latLng: [number, number]; // Real geographic latitude, longitude [lat, lng]
  sources: string[]; // Reference IDs from SOURCES.md (e.g. ['R03'])
  summary: string;
}

export interface CargoState {
  lotId: string;
  currentStopId: StopId;
  completedStops: StopId[];
  
  // Transformation stages
  siliconMetalBatchKg: number;      // Stop 1 output
  polysiliconBatchKg: number;        // Stop 2 output
  wafersProducedCount: number;       // Stop 3 output
  diesOnWaferCount: number;          // Stop 4 total dies
  goodDiesCount: number;             // Stop 4 good dies
  selectedChipSerial: string | null; // Stop 5 chosen good chip
  phoneSerial: string | null;        // Stop 6 assembled phone
  isPhoneOperational: boolean;       // Stop 6 & 7 test
  
  // Tracking whether a stage was completed via real interaction or skeleton placeholder
  completionMethod: Record<StopId, 'interactive' | 'placeholder' | null>;
  lastSavedAt: string;
}

export const ROUTE_STOPS: RouteStop[] = [
  {
    id: 1,
    name: 'Make silicon',
    location: 'Norway',
    purpose: 'Quartz-bearing feed + carbon -> silicon metal',
    inputDescription: 'Quartzite rocks + Carbon-reducing feed (coal/woodchips)',
    outputDescription: 'Metallurgical-grade Silicon Metal (approx. 98-99% pure)',
    coordinates: { x: 52, y: 22 },
    latLng: [63.31, 9.87], // Thamshavn / Orkanger, Norway
    sources: ['R03'],
    summary: 'Smelt raw quartz and carbon in a submerged-arc electric furnace at over 1900°C to release oxygen and tap liquid silicon metal.'
  },
  {
    id: 2,
    name: 'Purify it',
    location: 'Germany',
    purpose: 'Silicon metal -> electronic-grade polysilicon',
    inputDescription: 'Silicon metal powder + Hydrogen Chloride (HCl)',
    outputDescription: 'Electronic-grade Polysilicon (hyper-pure solid chunks)',
    coordinates: { x: 51, y: 29 },
    latLng: [48.16, 12.83], // Burghausen, Germany
    sources: ['R04', 'R13'],
    summary: 'React silicon metal into trichlorosilane gas, distill away impurities down to parts-per-billion, then deposit hyper-pure polysilicon.'
  },
  {
    id: 3,
    name: 'Make wafers',
    location: 'Japan',
    purpose: 'Polysilicon -> crystal ingot -> polished wafers',
    inputDescription: 'Electronic-grade polysilicon chunks + Quartz crucible',
    outputDescription: 'Ultra-flat, mirror-polished blank Silicon Wafers',
    coordinates: { x: 86, y: 38 },
    latLng: [33.27, 129.87], // Imari / Kyushu, Japan
    sources: ['R05', 'R06'],
    summary: 'Melt polysilicon, pull a single-crystal cylindrical ingot, slice into thin round discs with diamond wire, and chemical-mechanically polish to atomic flatness.'
  },
  {
    id: 4,
    name: 'Build and test the circuits',
    location: 'Taiwan',
    purpose: 'Blank wafers + prepared design/masks/supplies -> processed wafers with a good/bad die map',
    inputDescription: 'Blank silicon wafers + Photoresist + Pre-made mask designs',
    outputDescription: 'Processed wafer patterned with hundreds of microchips + Electrical probe test map',
    coordinates: { x: 82, y: 46 },
    latLng: [24.78, 120.99], // Hsinchu Science Park, Taiwan
    sources: ['R01', 'R02', 'R07', 'R08', 'R14'],
    summary: 'Execute the microscopic lithography and etch cycle: deposit film, coat resist, expose pattern through mask, develop, plasma etch, and clean. Test each die with electrical probe needles.'
  },
  {
    id: 5,
    name: 'Separate and package',
    location: 'Malaysia',
    purpose: 'Tested wafer + package materials -> released packaged chips',
    inputDescription: 'Tested wafer with die map + Substrate carrier + Bond wires + Mold resin',
    outputDescription: 'Hermetically sealed, individual packaged chip ready for board mounting',
    coordinates: { x: 77, y: 58 },
    latLng: [5.30, 100.28], // Bayan Lepas, Penang, Malaysia
    sources: ['R02', 'R15', 'R18'],
    summary: 'Precision-saw the wafer along scribe lines, pick a verified good die, bond microscopic electrical connections to a package carrier, and encapsulate in protective resin.'
  },
  {
    id: 6,
    name: 'Assemble the phone',
    location: 'China mainland',
    purpose: 'Released chip + board and other ready-made components -> working phone',
    inputDescription: 'Packaged chip + Logic circuit board + Display + Battery + Enclosure',
    outputDescription: 'Fully assembled and factory-tested smartphone',
    coordinates: { x: 79, y: 42 },
    latLng: [34.75, 113.62], // Zhengzhou / Central Assembly Hub, China
    sources: ['R02', 'R11'],
    summary: 'Surface-mount the chip onto the main printed circuit board alongside memory and power management, assemble internal modules into chassis, and run boot diagnosis.'
  },
  {
    id: 7,
    name: 'Deliver and use',
    location: 'User (Final Destination)',
    purpose: 'Finished phone -> someone using it',
    inputDescription: 'Packaged retail phone box',
    outputDescription: 'Operational phone powered on and running daily apps',
    coordinates: { x: 22, y: 35 },
    latLng: [37.77, -122.42], // San Francisco, CA / Consumer Market
    sources: ['Game scenario'],
    summary: 'Unbox the finished phone, press the power button, observe the initial setup screen, launch an app powered by your chip, and reflect on the worldwide supply chain.'
  }
];

export interface SourceCitation {
  id: string;
  title: string;
  publisher: string;
  supportedFacts: string;
  limits: string;
}

export const SOURCES_REGISTER: SourceCitation[] = [
  {
    id: 'R01',
    title: 'Mapping the semiconductor value chain',
    publisher: 'OECD (June 2025)',
    supportedFacts: 'Design, wafer fabrication, and assembly/test/packaging are distinct global activities with specialized regional players.',
    limits: 'Sector-level overview; not a specific commercial supply contract or product traveler.'
  },
  {
    id: 'R02',
    title: 'How are Semiconductors Made?',
    publisher: 'Semiconductor Industry Association (SIA)',
    supportedFacts: 'Establishes the broad design-to-product sequence from raw silicon through fabrication, packaging, and final electronic system assembly.',
    limits: 'High-level educational overview, not an operating manufacturing recipe.'
  },
  {
    id: 'R03',
    title: 'Quartz extraction and silicon smelting in Norway',
    publisher: 'Elkem (2023)',
    supportedFacts: 'Elkem operates quartz quarrying and electric-arc smelting facilities in Norway, combining quartz with carbon to make metallurgical-grade silicon.',
    limits: 'Does not establish direct shipping ties between Norway and German polysilicon facilities.'
  },
  {
    id: 'R04',
    title: 'Semiconductor-grade polysilicon production',
    publisher: 'WACKER Annual Report (2025)',
    supportedFacts: 'WACKER produces hyper-pure semiconductor-grade polysilicon at its Burghausen, Germany chemical facilities.',
    limits: 'Does not disclose proprietary supplier contracts or customer destinations.'
  },
  {
    id: 'R05',
    title: 'Crystal growth and wafer production processes',
    publisher: 'SUMCO Corporation',
    supportedFacts: 'Describes the Czochralski monocrystalline ingot pulling process, wire sawing, CMP polishing, cleaning, and wafer surface inspection.',
    limits: 'Simplified summary of dozens of sub-operations.'
  },
  {
    id: 'R06',
    title: 'Wafer manufacturing facilities',
    publisher: 'SUMCO Corporate Profile',
    supportedFacts: 'Verifies wafer production plants in Imari and Saga, Japan.',
    limits: 'Facility presence does not mean all operations occur under one roof.'
  },
  {
    id: 'R07',
    title: 'Dedicated IC Foundry manufacturing',
    publisher: 'TSMC Corporate Overview',
    supportedFacts: 'Foundry business model manufacturing customer-designed ICs in advanced fabrication cleanrooms in Taiwan.',
    limits: 'Does not identify specific customer part numbers or confidential mask sets.'
  },
  {
    id: 'R08',
    title: 'Lithography and patterning cycle',
    publisher: 'ASML Reports',
    supportedFacts: 'Confirms the multi-step patterning loop: deposition, resist coating, optical exposure, bake/develop, etching, and chemical strip/clean.',
    limits: 'Our displayed loop is a representative educational model, not a complete 80-mask process traveler.'
  },
  {
    id: 'R11',
    title: 'Consumer electronics assembly',
    publisher: 'Industry manufacturing literature',
    supportedFacts: 'Final system assembly of smartphones takes place in large-scale contract assembly plants in mainland China.',
    limits: 'Board placement is shown in simplified schematic form.'
  },
  {
    id: 'R13',
    title: 'Siemens and fluid bed polysilicon purification',
    publisher: 'Chemical engineering references',
    supportedFacts: 'Fluidized bed reactors and Siemens deposition bells convert crude silicon metal into trichlorsilane and deposit high-purity polysilicon.',
    limits: 'Educational simplification of hazardous closed-loop chlorosilane chemistry.'
  },
  {
    id: 'R14',
    title: 'Wafer probe testing and electronic die sorting',
    publisher: 'Semiconductor test engineering standards',
    supportedFacts: 'Wafer probe cards test each die on the wafer for electrical continuity and logic function prior to slicing.',
    limits: 'Probe needle mechanics are simplified for clarity.'
  },
  {
    id: 'R15',
    title: 'Semiconductor back-end assembly and test',
    publisher: 'OSAT industry documentation',
    supportedFacts: 'Malaysia hosts major outsourced semiconductor assembly and test (OSAT) facilities conducting dicing, die attach, wire bonding, and encapsulation.',
    limits: 'Illustrative package construction; specific iPhone packaging architectures vary.'
  },
  {
    id: 'R18',
    title: 'Final IC testing and burn-in',
    publisher: 'Automated test equipment references',
    supportedFacts: 'Packaged chips undergo high-frequency electrical tests to verify functionality before board assembly.',
    limits: 'Testing reveals pre-existing defects; it does not repair defective silicon.'
  }
];
