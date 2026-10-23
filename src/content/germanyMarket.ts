import { Market } from './tradeEngine';

/**
 * Germany's market for loop 2 (plan: layers/GERMANY_PLAN.md). Fictional companies; prices, lots and
 * minimums are teaching values. The new lesson is the contract minimum: the hydrogen pipeline pays off
 * (9 of 10 used), the power block does not (1 of 2 used). Contract terms: GP01, GP14, GP16; acid versus
 * dry gas: GP09; cylinder rent invoiced separately: GP01 (research/germany/PROCUREMENT_RESEARCH.md).
 * The silicon batch arrives from Norway at the price agreed there (carried cost, chain model L17).
 */
export const GERMANY_MARKET: Market = {
  cash: 1200,
  intro: 'Your silicon from Norway is in the store. Buy the gases and the power, make polysilicon, sell it to Japan. Goal: spend no more than you earn.',
  place: 'Germany',
  makeLine: 'Gases connected, power booked, invoices paid. To the reactor!',
  madeLine: 'Polysilicon, sealed in clean bags. Now find out what it is worth.',
  checkHint: 'The spec sheet',
  carried: { name: 'Silicon metal', unit: 'batch', from: 'Norway' },
  needs: [
    { id: 'hcl', name: 'Hydrogen chloride', unit: 'cylinders', need: 4, resale: 8 },
    { id: 'hydrogen', name: 'Hydrogen', unit: 'units', need: 9, resale: 0 },
    { id: 'power', name: 'Electricity', unit: 'batch', need: 1, resale: 0 },
  ],
  suppliers: [
    {
      id: 'rhine', item: 'hcl', name: 'Rhine Gases', origin: 'Gas dealer. Dry hydrogen chloride gas in steel cylinders.',
      terms: { lot: 4, unitPrice: 25, fee: 0, usable: 1 }, patience: 1, invoiceExtraUnits: 1,
      spec: 'hydrogen chloride, dry gas, 99.999 %, in steel cylinders. This is what the reactor needs.',
      levers: [{ id: 'cheaper', label: 'Lower the price', reply: 'For a new customer: $23 a cylinder.', change: { priceAdd: -2 } }],
    },
    {
      id: 'discount', item: 'hcl', name: 'Discount Chemicals', origin: 'Cheap chemicals by the drum. Sells “HCl”.',
      terms: { lot: 4, unitPrice: 10, fee: 0, usable: 0 }, patience: 1,
      spec: 'hydrochloric acid, 37 % in water. That is HCl dissolved in water, not the dry gas: the reactor can’t use it.',
      levers: [{ id: 'gas', label: 'Do you have the dry gas?', reply: 'Only the acid. Same name, isn’t it?' }],
    },
    {
      id: 'park', item: 'hydrogen', name: 'Chemical Park Hydrogen', origin: 'Hydrogen plant in the chemical park. Pipeline straight to your reactor.',
      terms: { lot: 9, unitPrice: 12, fee: 0, usable: 1, minimum: 10 }, patience: 1,
      spec: 'hydrogen, pure, by pipeline. Each order commits you to paying for at least 10 units.',
      levers: [{ id: 'minimum', label: 'Lower the minimum', reply: 'Ten units is the smallest agreement we sign. It pays for the pipe.' }],
    },
    {
      id: 'depot', item: 'hydrogen', name: 'Town Gas Depot', origin: 'Gas depot in town. Hydrogen in bundles of steel cylinders, no contract.',
      terms: { lot: 3, unitPrice: 16, fee: 10, usable: 1 }, patience: 1,
      spec: 'hydrogen, pure, in cylinder bundles of 3 units. Bundle rent $10 per order.',
      levers: [{ id: 'rent', label: 'Drop the bundle rent', reply: 'The rent pays for the steel. Everyone pays it.' }],
    },
    {
      id: 'grid', item: 'power', name: 'Regional Grid', origin: 'The local network’s standard supply. Pay for what you use.',
      terms: { lot: 1, unitPrice: 220, fee: 0, usable: 1 }, patience: 1,
      levers: [{ id: 'cheaper', label: 'Lower the price', reply: 'It is the published tariff. Everyone pays the same.' }],
    },
    {
      id: 'alpine', item: 'power', name: 'Alpine Hydro', origin: 'Hydro dams up the river. Sells power in fixed blocks.',
      terms: { lot: 1, unitPrice: 150, fee: 0, usable: 1, minimum: 2 }, patience: 1,
      levers: [{ id: 'one', label: 'Sell me a block of one', reply: 'Our blocks are two batches. That is how we get this price.' }],
    },
  ],
  buyer: {
    name: 'Aiko’s plant, Japan',
    offer: 1000, cap: 1120, patience: 2,
    levers: [
      { id: 'more', label: 'Ask for a better price', reply: 'We can go to {offer}. No higher.', add: 40 },
      { id: 'match', label: 'Show a competing quote', reply: 'If they pay that, we match: {offer}. We need clean polysilicon.', match: true },
    ],
    competitors: [
      { id: 'solar', name: 'Solar Wafer Co.', use: 'Grows crystals for solar cells.', quote: 1060, reply: 'For that batch: $1,060.' },
      { id: 'chipwafer', name: 'Chip Wafer Works', use: 'Another maker of wafers for chips.', quote: 1100, reply: 'We would pay $1,100.' },
    ],
    shortPay: 30, shortReason: 'bank charges taken off the transfer, never part of the deal',
  },
};
