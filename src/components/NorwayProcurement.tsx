import React from 'react';
import { ASSETS } from '../content/assets';
import { NorwayManufacturing } from './NorwayManufacturing';
import { NORWAY_MARKET } from '../content/norwayMarket';
import { TradeState, TradeAction, usableOf } from '../content/tradeEngine';
import { DeskConfig, ProcurementDesk, ProductView } from './procurement/ProcurementDesk';

interface Props {
  state: TradeState;
  dispatch: (action: TradeAction) => void;
  onReturnToMap: () => void;
  onDone: () => void;
}

/** Code-drawn stand-in for norway_map.jpg: fjord, mountains, river, plateau, forest, sea. */
function MapPlaceholder() {
  return (
    <g aria-hidden="true">
      <rect width="1376" height="768" fill="#5f8f4e" />
      <path d="M0 0 H1376 V90 L1200 60 L1050 110 L900 50 L760 120 L620 40 L480 110 L330 50 L200 100 L0 60 Z" fill="#8c9a9e" />
      <path d="M330 50 L360 20 L390 50 M620 40 L650 10 L680 40 M900 50 L930 20 L960 50" fill="#f8fafc" />
      <path d="M0 120 C120 140 200 200 280 230 C200 240 90 220 0 260 Z" fill="#2b6a99" />
      <path d="M560 0 C540 120 600 220 560 330 C540 380 520 400 510 420" stroke="#3b82c4" strokeWidth="18" fill="none" />
      <path d="M940 0 C900 200 960 400 900 768 H1376 V0 Z" fill="#2b6a99" />
      <ellipse cx="170" cy="560" rx="160" ry="110" fill="#c8c39a" />
      {[[700, 560], [740, 640], [830, 700], [680, 680], [880, 560], [760, 520]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="34" fill="#2f5d34" />)}
    </g>
  );
}

const PRODUCT: Record<string, string> = { nordic: 'quartz_screened', harbour: 'coal_bags', bulk: 'coal_bulk', sawmill: 'woodchips', hydro: 'power' };

/** Norway on the shared loop 2 desk. Coordinates on the supplied map (2752×1536, shown in a 1376×768 viewBox). */
const NORWAY: DeskConfig = {
  market: NORWAY_MARKET,
  art: { map: ASSETS.supply.norwayMap, truck: ASSETS.supply.truck, product: ASSETS.supply.product, icon: ASSETS.supply.icon, pin: ASSETS.supply.pin, rep: ASSETS.supply.rep },
  MapPlaceholder,
  pins: {
    factory: { x: 690, y: 390, label: 'Your smelter' },
    fjord: { x: 220, y: 250, label: 'Fjord Quarry' },
    nordic: { x: 395, y: 350, label: 'Nordic Minerals' },
    hydro: { x: 735, y: 225, label: 'River Power' },
    bulk: { x: 995, y: 340, label: 'Bulk Importer' },
    harbour: { x: 990, y: 472, label: 'Harbour Coal' },
    sawmill: { x: 870, y: 645, label: 'Valley Sawmill' },
    customer: { x: 625, y: 705, label: 'To Germany · customer' },
    alloy: { x: 330, y: 690, label: 'Alloy Foundry' },
    silicones: { x: 1100, y: 545, label: 'Silicone Works' },
  },
  sources: {
    'source-plateau': { x: 235, y: 565, label: 'Plateau quarry', sellers: ['nordic'], detail: 'Nordic Minerals buys screened quartz here and stocks it at its depot. The depot is the seller; this quarry is the original source.' },
    'source-overseas': { x: 1200, y: 220, label: 'Overseas coal supply', sellers: ['bulk', 'harbour'], detail: 'Coal is mined abroad and brought to the port. Harbour Coal sells from its stockyard; Bulk Importer sells larger lots at the terminal. This is an overseas connection, not a claimed mine location.' },
  },
  routes: {
    fjord: 'M220,250 L350,325 L500,365 L690,390',
    nordic: 'M395,350 L560,370 L690,390',
    hydro: 'M735,225 L715,300 L690,390',
    bulk: 'M995,340 L920,385 L830,390 L690,390',
    harbour: 'M990,472 L920,385 L830,390 L690,390',
    sawmill: 'M870,645 L800,560 L755,490 L720,430 L690,390',
    customer: 'M690,390 L680,490 L640,580 L625,705',
    alloy: 'M690,390 L600,520 L450,640 L330,690',
    silicones: 'M690,390 L830,390 L920,385 L1020,470 L1100,545',
  },
  pinArt: { factory: 'smelter', fjord: 'quarry', nordic: 'trader', hydro: 'power', bulk: 'bulk', harbour: 'harbour', sawmill: 'sawmill', customer: 'customer', alloy: 'alloy', silicones: 'silicones' },
  competitors: ['alloy', 'silicones'],
  icons: {
    silicon: { art: 'silicon', emoji: '🥈' }, quartz: { art: 'quartz', emoji: '🪨' }, carbon: { art: 'carbon', emoji: '⚫' }, chips: { art: 'woodchips', emoji: '🪵' }, power: { art: 'power', emoji: '⚡' },
  },
  productOf: (sup, s) => sup.id === 'fjord' ? (s.terms.fjord.usable < 1 ? 'quartz_crushed' : 'quartz_screened') : PRODUCT[sup.id] ?? 'quartz_screened',
  productBg: id => id === 'woodchips' || id === 'power' ? 'bg-white' : id === 'coal_bulk' ? 'bg-[#83929c]' : 'bg-black/30',
  productEmoji: id => id.startsWith('quartz') ? (id === 'quartz_sieve' ? '🪨⛏' : '🪨') : id.startsWith('coal') ? '⚫' : id === 'woodchips' ? '🪵' : id === 'power' ? '⚡' : '🥈',
  noTruck: ['hydro'],
  factory: { label: 'Your smelter', go: 'Go to the smelter →', start: 'Start the furnace', done: 'The furnace is done for this loop.' },
  wasteLabel: 'fines',
  output: { id: 'silicon', icon: 'silicon', label: 'Silicon metal', ready: '1 batch of silicon metal · ready to sell', sold: 'Silicon batch sold to Germany' },
  customerShort: 'Germany',
  guide: { name: 'Sigurd', portrait: ASSETS.norwayGuide.image, asset: 'norway-chat-box' },
  ariaLabel: 'Norway supplier map',
  competitorNote: "Your chip's route goes through Germany, so use this quote as leverage with Greta's plant.",
  chainNote: price => <><b>The chain:</b> Greta’s plant agreed to pay ${price.toLocaleString('en-US')} for your silicon. In Germany, that is the starting cost of their main input.
    Every stop adds its costs, and the TV’s price at home is the sum of the whole chain.</>,
  sampleExtra: (sup, t) => sup.item !== 'quartz' ? null : <div className="rounded-lg border border-sky-300/25 bg-sky-300/5 p-3" aria-label="Quartz sample result">
    <div className="mb-2 flex flex-wrap items-end gap-1 border-b-4 border-slate-500 pb-1" aria-hidden="true">
      {Array.from({ length: Math.min(t.lot, 25) }, (_, i) => <span key={i} className={i < Math.floor(Math.min(t.lot, 25) * t.usable)
        ? 'h-4 w-4 rotate-12 rounded-sm bg-slate-200' : 'h-1.5 w-1.5 rounded-full bg-amber-500'} />)}
    </div>
    <p className="text-xs text-sky-100">{Math.floor(t.lot * t.usable)} usable chunks · {t.lot - Math.floor(t.lot * t.usable)} fines per lot.</p>
    <p className="mt-1 text-xs text-slate-300">{t.usable < 1 ? 'The small pieces fall through the feed screen. They do not count toward the furnace charge.' : 'Screened chunks meet this charge’s size requirement.'}</p>
  </div>,
  gateExtra: o => o.item === 'quartz' && usableOf(o) < o.terms.lot * o.lots ? <div className="mt-1 w-32"><ProductView c={NORWAY} id="quartz_sieve" label="Sieve" /></div> : null,
  // The workshop stays exactly as in loop 1 (user decision, 22 October 2026).
  Workshop: ({ onReturnToMap, onComplete }) => <NorwayManufacturing onReturnToMap={onReturnToMap} onComplete={onComplete} />,
};

/** Loop 2, Norway: buy quartz, carbon, chips and power, make silicon, sell it to Germany. */
export function NorwayProcurement(props: Props) {
  return <ProcurementDesk config={NORWAY} {...props} />;
}
