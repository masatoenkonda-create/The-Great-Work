import { Market } from './tradeEngine';

/**
 * Norway's market for the loop 2 prototype. Fictional suppliers; prices, lots and shares are
 * teaching values chosen so careful play can just break even (best plans: about +$20).
 * Fines in crushed quartz and the furnace's need for chunks: P09 (layers/sources/README.md).
 */
export const NORWAY_MARKET: Market = {
  cash: 600,
  intro: 'Buy what the furnace needs, make silicon, sell it to Germany. Goal: spend no more than you earn.',
  place: 'Norway',
  makeLine: 'Everything is in and paid for. Load the furnace!',
  madeLine: 'Silicon metal, bagged. Now find out what it is worth.',
  checkHint: 'A sample',
  needs: [
    { id: 'quartz', name: 'Quartz', unit: 'chunks', need: 10, resale: 5 },
    { id: 'carbon', name: 'Carbon', unit: 'bags', need: 4, resale: 3 },
    { id: 'chips', name: 'Wood chips', unit: 'bags', need: 3, resale: 2 },
    { id: 'power', name: 'Electricity', unit: 'batch', need: 1, resale: 0 },
  ],
  suppliers: [
    {
      id: 'fjord', item: 'quartz', name: 'Fjord Quarry', origin: 'Quarry up the fjord. Sells rock as it comes out of the crusher.',
      terms: { lot: 10, unitPrice: 18, fee: 0, usable: 0.6 }, patience: 2,
      levers: [
        { id: 'screen', label: 'Screen out the fines', reply: 'We can sieve it before loading. That costs more.', change: { priceAdd: 10, usable: 1 } },
        { id: 'cheaper', label: 'Lower the price', reply: 'Only if you take 20.', change: { lot: 20, priceAdd: -3 } },
      ],
    },
    {
      id: 'nordic', item: 'quartz', name: 'Nordic Minerals', origin: 'Trader. Clean, sieved rock from a quarry on the plateau.',
      terms: { lot: 25, unitPrice: 14, fee: 0, usable: 1 }, patience: 2,
      levers: [
        { id: 'smaller', label: 'Sell me a smaller lot', reply: 'We can split a lot: 10 chunks, a higher price and a repacking fee.', change: { lot: 10, priceAdd: 10, feeAdd: 30 } },
        { id: 'cheaper', label: 'Lower the price', reply: '$14 is already our bulk price. You are a very small customer.' },
      ],
    },
    {
      id: 'harbour', item: 'carbon', name: 'Harbour Coal', origin: 'Stockyard at the harbour. The coal is shipped in from abroad.',
      terms: { lot: 5, unitPrice: 12, fee: 0, usable: 1 }, patience: 1, invoiceExtraUnits: 1,
      levers: [{ id: 'cheaper', label: 'Lower the price', reply: 'Fine, $11. Don’t tell the others.', change: { priceAdd: -1 } }],
    },
    {
      id: 'bulk', item: 'carbon', name: 'Bulk Importer', origin: 'Port terminal. Sells straight off the ship.',
      terms: { lot: 20, unitPrice: 6, fee: 0, usable: 1 }, patience: 1,
      levers: [{ id: 'smaller', label: 'Sell me a smaller lot', reply: 'We sell by the 20. Take it or leave it.' }],
    },
    {
      id: 'sawmill', item: 'chips', name: 'Valley Sawmill', origin: 'The only sawmill in the valley. Chips are what is left from cutting planks.',
      terms: { lot: 3, unitPrice: 20, fee: 0, usable: 1 }, patience: 1,
      levers: [{ id: 'cheaper', label: 'Lower the price', reply: '$18, and that’s it.', change: { priceAdd: -2 } }],
    },
    {
      id: 'hydro', item: 'power', name: 'River Power', origin: 'Hydro station up the river, through the grid.',
      terms: { lot: 1, unitPrice: 200, fee: 0, usable: 1 }, patience: 1,
      levers: [{ id: 'cheaper', label: 'Lower the price', reply: 'It is the regulated tariff. Everyone pays the same.' }],
    },
  ],
  buyer: {
    name: 'Greta’s plant, Germany',
    offer: 560, cap: 620, patience: 2,
    levers: [
      { id: 'more', label: 'Ask for a better price', reply: 'Fine, {offer}. That is a stretch for us.', add: 20 },
      { id: 'match', label: 'Show a competing quote', reply: 'They pay that much? We need your silicon. We match: {offer}.', match: true },
    ],
    // Silicon metal also goes into aluminium alloys and silicones (Lead: not yet in the source register).
    competitors: [
      { id: 'alloy', name: 'Alloy Foundry', use: 'Mixes silicon into aluminium for car parts.', quote: 540, reply: 'For a batch like that? $540.' },
      { id: 'silicones', name: 'Silicone Works', use: 'Turns silicon into silicones: sealants, oils and rubber.', quote: 610, reply: 'We would pay $610 for it.' },
    ],
    shortPay: 25, shortReason: 'a “handling fee” that was never in the deal',
  },
};
