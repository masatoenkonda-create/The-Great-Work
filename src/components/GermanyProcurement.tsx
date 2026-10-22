import React from 'react';
import { ASSETS } from '../content/assets';
import { GermanyManufacturing } from './GermanyManufacturing';
import { GERMANY_MARKET } from '../content/germanyMarket';
import { TradeState, TradeAction } from '../content/tradeEngine';
import { DeskConfig, ProcurementDesk } from './procurement/ProcurementDesk';

interface Props {
  state: TradeState;
  dispatch: (action: TradeAction) => void;
  onReturnToMap: () => void;
  onDone: () => void;
}

/** Code-drawn stand-in for germany/map.jpg: river valley, chemical park, town, hills and dams. */
function MapPlaceholder() {
  return (
    <g aria-hidden="true">
      <rect width="1376" height="768" fill="#6d8f5a" />
      <path d="M0 0 H1376 V110 L1240 70 L1100 120 L960 60 L820 110 L680 50 L540 100 L400 40 L260 90 L120 50 L0 90 Z" fill="#8e9a8f" />
      <path d="M820 0 C800 120 760 220 700 300 C640 380 600 470 640 560 C680 650 640 720 600 768" stroke="#3f7fb3" strokeWidth="26" fill="none" />
      <rect x="560" y="330" width="300" height="190" rx="10" fill="#8b8f86" opacity="0.65" />
      <rect x="180" y="540" width="240" height="140" rx="10" fill="#b39d7a" opacity="0.7" />
      {[[1030, 560], [1110, 620], [1180, 540], [1060, 680], [1250, 640]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="36" fill="#3c6b3a" />)}
    </g>
  );
}

const DIR = '/assets/supply/germany';
/** Germany's art lives in its own folder; shared stock art (power, invoice, truck) comes from Norway's. */
const SHARED_ICONS = ['power', 'silicon', 'invoice', 'fines'];
const PRODUCT: Record<string, string> = { rhine: 'hcl_cylinders', discount: 'hcl_acid', park: 'h2_pipeline', depot: 'h2_bundles', grid: 'power', alpine: 'power' };

const GERMANY: DeskConfig = {
  market: GERMANY_MARKET,
  art: {
    map: `${DIR}/map.jpg`, truck: ASSETS.supply.truck,
    product: id => id === 'power' ? ASSETS.supply.product('power') : `${DIR}/product_${id}.png`,
    icon: id => SHARED_ICONS.includes(id) ? ASSETS.supply.icon(id) : `${DIR}/icon_${id}.png`,
    pin: id => `${DIR}/pin_${id}.png`,
    rep: id => `${DIR}/rep_${id}.png`,
  },
  MapPlaceholder,
  pins: {
    factory: { x: 710, y: 420, label: 'Your purification plant' },
    rhine: { x: 330, y: 300, label: 'Rhine Gases' },
    discount: { x: 300, y: 610, label: 'Discount Chemicals' },
    park: { x: 960, y: 330, label: 'Chemical Park Hydrogen' },
    depot: { x: 470, y: 470, label: 'Town Gas Depot' },
    grid: { x: 1130, y: 200, label: 'Regional Grid' },
    alpine: { x: 880, y: 130, label: 'Alpine Hydro' },
    customer: { x: 720, y: 700, label: 'To Japan · customer' },
    solar: { x: 1180, y: 470, label: 'Solar Wafer Co.' },
    chipwafer: { x: 1060, y: 640, label: 'Chip Wafer Works' },
  },
  sources: {
    'source-h2': { x: 1080, y: 400, label: 'Park hydrogen plant', sellers: ['park'], detail: 'The chemical park makes hydrogen in its own plant and pipes it to the factories around it. A plant built for big, steady customers is why the pipeline asks for a minimum.' },
    'source-dams': { x: 760, y: 60, label: 'Hydro dams', sellers: ['alpine'], detail: 'Alpine Hydro sells power from dams up the river, in fixed blocks. It comes through the same grid as everyone else’s power.' },
  },
  routes: {
    rhine: 'M330,300 L480,360 L600,400 L710,420',
    discount: 'M300,610 L430,560 L580,480 L710,420',
    park: 'M960,330 L860,380 L710,420',
    depot: 'M470,470 L600,440 L710,420',
    grid: 'M1130,200 L980,280 L840,360 L710,420',
    alpine: 'M880,130 L820,250 L760,340 L710,420',
    customer: 'M710,420 L700,520 L720,620 L720,700',
    solar: 'M710,420 L880,440 L1040,460 L1180,470',
    chipwafer: 'M710,420 L820,520 L940,600 L1060,640',
  },
  pinArt: { factory: 'factory', rhine: 'gas_dealer', discount: 'discount', park: 'park', depot: 'depot', grid: 'grid', alpine: 'hydro', customer: 'customer', solar: 'buyer', chipwafer: 'buyer' },
  competitors: ['solar', 'chipwafer'],
  icons: {
    hcl: { art: 'hcl', emoji: '🧪' }, hydrogen: { art: 'hydrogen', emoji: '💨' }, power: { art: 'power', emoji: '⚡' },
    silicon: { art: 'silicon', emoji: '🥈' }, polysilicon: { art: 'polysilicon', emoji: '💎' },
  },
  productOf: sup => PRODUCT[sup.id] ?? 'hcl_cylinders',
  productBg: id => id === 'power' ? 'bg-white' : 'bg-black/30',
  productEmoji: id => id.startsWith('hcl') ? (id === 'hcl_acid' ? '🛢' : '🧪') : id.startsWith('h2') ? '💨' : id === 'power' ? '⚡' : '💎',
  noTruck: ['park', 'grid', 'alpine'],
  factory: { label: 'Your purification plant', go: 'Go to the plant →', start: 'Start the reactor', done: 'The reactor is done for this loop.' },
  wasteLabel: 'unusable',
  output: { id: 'polysilicon', icon: 'polysilicon', label: 'Polysilicon', ready: '1 batch of polysilicon · ready to sell', sold: 'Polysilicon batch sold to Japan' },
  carriedIcon: 'silicon',
  customerShort: 'Japan',
  guide: { name: 'Greta', asset: 'germany-chat-box' },
  ariaLabel: 'Germany supplier map',
  competitorNote: "Your chip's route goes through Japan, so use this quote as leverage with Aiko's plant.",
  chainNote: price => <><b>The chain:</b> Aiko’s plant agreed to pay ${price.toLocaleString('en-US')} for your polysilicon. In Japan, that is the starting cost of their main input.
    Norway’s price is inside it, and every stop adds its own costs on top.</>,
  // The workshop stays exactly as in loop 1 (L12).
  Workshop: ({ onReturnToMap, onComplete }) => <GermanyManufacturing onReturnToMap={onReturnToMap} onComplete={onComplete} />,
};

/** Loop 2, Germany: silicon arrives from Norway; buy HCl, hydrogen and power, make polysilicon, sell it to Japan. */
export function GermanyProcurement(props: Props) {
  return <ProcurementDesk config={GERMANY} {...props} />;
}
