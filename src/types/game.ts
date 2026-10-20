export type StageId = 
  | 'wafers_chemistry'
  | 'front_end_fab'
  | 'probe_die_prep'
  | 'package_assemble'
  | 'final_test_systems';

export interface StageInfo {
  id: StageId;
  stepNumber: string;
  title: string;
  japaneseTitle: string;
  subtitle: string;
  companies: string[];
  equipment: string[];
  keyMaterials: string[];
  globalInterdependence?: string;
  description: string;
  insight: string;
}

export interface CompanyDetail {
  name: string;
  role: string;
  locations: string;
  specialty: string;
  strategicNote: string;
  isKyushuHub?: boolean;
}

export interface ChipSpec {
  name: string;
  node: string;
  purity: number; // e.g. 99.9999999
  layersCompleted: number;
  totalLayers: number;
  yieldRate: number; // percentage
  testedGoodDies: number;
  totalDies: number;
  dicedDies: number;
  packagedUnits: number;
  finalBinnedCount: {
    servers: number;
    phones: number;
    vehicles: number;
  };
}

export type GameView = 'title' | 'playing' | 'map_modal' | 'strategy_modal' | 'victory';

export const STAGES: StageInfo[] = [
  {
    id: 'wafers_chemistry',
    stepNumber: '01',
    title: 'WAFERS & CHEMISTRY',
    japaneseTitle: 'ウェーハと高純度化学材料',
    subtitle: 'SUMCO silicon wafers · JSR / Shin-Etsu photoresists',
    companies: ['SUMCO', 'JSR', 'Shin-Etsu Chemical'],
    equipment: ['Czochralski Ingot Puller', 'Wire Slicing Arbor', 'CMP Polisher'],
    keyMaterials: ['Electronic-grade Polysilicon (11N)', 'EUV Light-Sensitive Photoresist', 'Quartz Crucibles'],
    description: 'Grow a hyper-pure cylindrical silicon ingot at 1420°C, slice into 300mm mirror-finished wafers, and formulate nanometer-sensitive EUV photoresist.',
    insight: 'Japan produces over 50% of global silicon wafers and over 80% of advanced photoresists. Their chemical qualification is nearly impossible to substitute without months of fab recalibration.'
  },
  {
    id: 'front_end_fab',
    stepNumber: '02',
    title: 'FRONT-END FAB',
    japaneseTitle: '前工程・極微細加工サイクル',
    subtitle: 'Tokyo Electron deposition/etch · SCREEN cleaning · ASML lithography',
    companies: ['Tokyo Electron (TEL)', 'SCREEN Holdings', 'ASML (Netherlands)'],
    equipment: ['TEL Clean Track ACT12', 'ASML Twinscan NXE EUV Scanner', 'TEL Plasma Etcher', 'SCREEN Single-Wafer Megasonic Cleaner'],
    keyMaterials: ['Silicon Dioxide (SiO2)', 'Fluorine Plasma', 'Supercritical CO2 / Deionized Water', 'EUV 13.5nm Extreme Ultraviolet Photons'],
    globalInterdependence: 'ASML EUV scanners from the Netherlands and customer fabless designs (Apple, Nvidia, Qualcomm) feed this stage.',
    description: 'Execute the high-stakes repeated manufacturing cycle: Deposit film → Pattern nanometer circuits with EUV light → Plasma Etch trench paths → Megasonic Clean residue, repeated across dozens of layers.',
    insight: 'Tokyo Electron and SCREEN dominate coater/developers and cleaning. However, no advanced fab can operate without ASML EUV optics from the Netherlands and Zeiss mirrors from Germany.'
  },
  {
    id: 'probe_die_prep',
    stepNumber: '03',
    title: 'PROBE & DIE PREP',
    japaneseTitle: 'ウェーハ検査と薄厚ダイ分離',
    subtitle: 'Advantest wafer test · DISCO grinding / dicing',
    companies: ['Advantest', 'DISCO Corporation'],
    equipment: ['Advantest Wafer Prober & Probe Card', 'DISCO Ultra-Precision Backgrinder', 'DISCO Dicing Saw & Stealth Laser'],
    keyMaterials: ['Diamond Blade Resinoid Wheels', 'Dicing UV Tape', 'Micro-Cantilever Tungsten Probe Needles'],
    description: 'Test thousands of microscopic dies on the wafer surface with Advantest probe pins to map good dies, backgrind the wafer from 775µm down to paper-thin 30µm, and slice with DISCO diamond blades.',
    insight: 'DISCO commands an estimated 70-80% global market share in silicon grinding and dicing equipment. Advantest is the world leader in ATE (automated test equipment).'
  },
  {
    id: 'package_assemble',
    stepNumber: '04',
    title: 'PACKAGE & ASSEMBLE',
    japaneseTitle: '先端パッケージングと基板接合',
    subtitle: 'Ajinomoto ABF insulating film · IBIDEN package substrates',
    companies: ['Ajinomoto Fine-Techno', 'IBIDEN', 'Kyocera'],
    equipment: ['Vacuum Sheet Laminator', 'Flip-Chip Bonder', 'Solder Reflow Convection Oven', 'Epoxy Transfer Mold'],
    keyMaterials: ['Ajinomoto Build-up Film (ABF)', 'IBIDEN High-Density Package Substrate', 'Solder Micro-Bumps', 'Epoxy Molding Compound'],
    globalInterdependence: 'Overseas packaging capacity (OSAT in Taiwan, Southeast Asia) complements domestic Japanese advanced lines.',
    description: 'Stack ultra-dense micro-vias using Ajinomoto ABF thermoset insulating film, mount the die onto IBIDEN multi-layer high-speed substrates, and reflow solder balls (BGA) with protective ceramic/resin encapsulation.',
    insight: 'Ajinomoto invented ABF from amino acid polymer research originally explored for food flavoring; today, almost every high-performance CPU and GPU in the world requires ABF dielectric layers.'
  },
  {
    id: 'final_test_systems',
    stepNumber: '05',
    title: 'FINAL TEST → SYSTEMS',
    japaneseTitle: '最終選別と次世代システム実装',
    subtitle: 'Advantest electrical test · Deployment to Servers, Phones, Vehicles',
    companies: ['Advantest', 'Sony (Kumamoto)', 'JASM (Kumamoto)', 'Global Systems OEMs'],
    equipment: ['Advantest High-Speed ATE Tester', 'Burn-in Chamber (-40°C to +125°C)', 'Robotic Pick-and-Place Tray Sorter'],
    keyMaterials: ['Thermal Interface Material (TIM)', 'Gold / Copper Leadframe Contacts', 'Protective Tape & Reel'],
    description: 'Put finished packaged semiconductors through electrical voltage, clock frequency speed binning, and extreme thermal cycling, then deliver qualified chips to AI servers, smartphones, and autonomous vehicles.',
    insight: 'Qualification is everything: automotive chips require zero-defect tolerances (DPPM < 1), whereas AI servers demand maximum thermal conductivity and multi-gigahertz clock bins.'
  }
];

export const JAPAN_COMPANIES: Record<string, CompanyDetail> = {
  SUMCO: {
    name: 'SUMCO Corporation',
    role: 'Monocrystalline Silicon Wafers (300mm)',
    locations: 'Tokyo HQ / Imari, Saga (Kyushu) & Nagasaki',
    specialty: 'Electronic-grade silicon ingots pulled from quartz crucibles, sliced and polished to atomic flatness.',
    strategicNote: 'One of the top two wafer suppliers in the world alongside Shin-Etsu. Together, Japanese firms provide over half of global wafer supply.',
    isKyushuHub: true,
  },
  JSR: {
    name: 'JSR Corporation',
    role: 'Advanced EUV & ArFi Photoresists',
    locations: 'Tokyo HQ / Yokkaichi Plant',
    specialty: 'Ultra-pure light-sensitive polymers that react to 13.5nm EUV photons to print nanometer circuits.',
    strategicNote: 'Acquired by state-backed JIC to safeguard strategic autonomy. Photoresist switching requires months of fab re-qualification.',
  },
  ShinEtsu: {
    name: 'Shin-Etsu Chemical',
    role: 'Silicon Wafers & Photoresists',
    locations: 'Tokyo HQ / Gunma, Niigata',
    specialty: 'Global leader in silicon chemistry, photoresists, synthetic quartz, and high-purity silane gas.',
    strategicNote: 'Virtually every semiconductor fabricator relies on Shin-Etsu chemicals at multiple stages.',
  },
  TEL: {
    name: 'Tokyo Electron (TEL)',
    role: 'Deposition, Etch, Coater/Developer Systems',
    locations: 'Tokyo HQ / Koshi, Kumamoto (TEL Kyushu)',
    specialty: 'World monopoly on coater/developer tracks coupled to ASML EUV lithography systems.',
    strategicNote: 'TEL Kyushu in Koshi, Kumamoto is one of the world’s most advanced development hubs for next-generation 3D wafer packaging and track systems.',
    isKyushuHub: true,
  },
  SCREEN: {
    name: 'SCREEN Holdings',
    role: 'Wafer Cleaning & Surface Processing',
    locations: 'Kyoto HQ / Shiga Plants',
    specialty: 'Single-wafer wet cleaners removing microscopic particles down to single-digit nanometers.',
    strategicNote: 'Cleaning occurs after almost every processing layer—over 100 cleaning steps per finished chip.',
  },
  ASML: {
    name: 'ASML (Netherlands)',
    role: 'EUV Extreme Ultraviolet Lithography Scanners',
    locations: 'Veldhoven, Netherlands',
    specialty: 'The sole global manufacturer of EUV lithography machines utilizing 13.5nm laser-produced tin plasma.',
    strategicNote: 'Global Interdependence: No nation, including Japan, can manufacture leading-edge 3nm/2nm chips without ASML scanners.',
  },
  Advantest: {
    name: 'Advantest Corporation',
    role: 'Automated Test Equipment (ATE) & Wafer Probers',
    locations: 'Tokyo HQ / Gunma R&D Center',
    specialty: 'High-speed electrical test systems verifying gigahertz clock signals, memory, and SOC integrity.',
    strategicNote: 'Global leader in ATE testing alongside Teradyne. Essential for determining chip yields and market binning.',
  },
  DISCO: {
    name: 'DISCO Corporation',
    role: 'Precision Wafer Grinding & Dicing Saws',
    locations: 'Tokyo HQ / Hiroshima Plants / Kyushu Support',
    specialty: 'Kiru (slitting/dicing), Kezuru (grinding), Migaku (polishing) technologies down to micrometer thicknesses.',
    strategicNote: 'Holds ~75% global market share in wafer dicing equipment. Essential for all advanced multi-chip packaging.',
  },
  Ajinomoto: {
    name: 'Ajinomoto Fine-Techno',
    role: 'Ajinomoto Build-up Film (ABF) Insulating Material',
    locations: 'Kawasaki, Kanagawa HQ / Gunma',
    specialty: 'Thermoset insulating dielectric film laminated into multi-layer package substrates.',
    strategicNote: 'Born from amino acid bioscience research. Essential material for every advanced CPU, GPU, and AI accelerator in existence.',
  },
  IBIDEN: {
    name: 'IBIDEN Co., Ltd.',
    role: 'High-Density IC Package Substrates',
    locations: 'Ogaki, Gifu HQ',
    specialty: 'Multi-layer flip-chip BGA substrates enabling thousands of high-speed interconnect traces.',
    strategicNote: 'Premier substrate partner for top global chip designers; works in tandem with Ajinomoto ABF dielectric films.',
  },
  JASM: {
    name: 'JASM (Japan Advanced Semiconductor Manufacturing)',
    role: 'Kumamoto Advanced Foundry (TSMC / Sony / Denso JV)',
    locations: 'Kikuyo, Kumamoto Prefecture (Kyushu)',
    specialty: 'Fab 1 (12/16nm & 22/28nm logic) & Fab 2 (3nm production target announced for 2028).',
    strategicNote: 'The anchor of Kyushu’s revitalization as "Silicon Island", supported by Japanese government subsidies.',
    isKyushuHub: true,
  },
  Sony: {
    name: 'Sony Semiconductor Solutions',
    role: 'CMOS Image Sensors & Foundry Partner',
    locations: 'Kumamoto Fab / Kagoshima',
    specialty: 'Global #1 in stacked CMOS image sensors powering flagship smartphones and automotive camera sensors.',
    strategicNote: 'Major equity and operational partner in Kumamoto JASM fab alongside TSMC and Denso.',
    isKyushuHub: true,
  },
  Kyocera: {
    name: 'Kyocera Corporation',
    role: 'Fine Ceramics & Semiconductor Components',
    locations: 'Kyoto HQ / Kagoshima Kirishima Plant',
    specialty: 'Advanced ceramic packages, electrostatic wafer chucks, and chemical-resistant chambers.',
    strategicNote: 'Kagoshima Kirishima plant expands capacity for semiconductor tool components and ceramic packages.',
    isKyushuHub: true,
  }
};
