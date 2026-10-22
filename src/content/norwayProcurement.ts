/**
 * Loop 2 (procurement) prototype for Norway: what the smelter must buy, who sells it, and what can go wrong.
 * All prices, lot sizes and odds are teaching values, not market data (layers/LAYER_2_BRAINSTORM.md, K7).
 */

export type ItemId = 'quartz' | 'coal' | 'woodchips' | 'power';

export interface Risk {
  /** Shown on the offer before buying: the risk is visible, never hidden. */
  sign: string;
  /** Chance it strikes, shown to the player as "1 in N". */
  oneIn: number;
  /** Sigurd's news when it strikes. */
  news: string;
  /** Delivery shortfall: only this much arrives. */
  delivered?: number;
  /** Price change: the bill for this item is multiplied. */
  priceFactor?: number;
}

export interface Offer {
  id: string;
  supplier: string;
  blurb: string;
  /** Smallest amount the supplier sells; you pay for the whole lot. */
  lot: number;
  unitPrice: number;
  risk?: Risk;
}

export interface Item {
  id: ItemId;
  name: string;
  unit: string;
  need: number;
  why: string;
  /** Teaching tag: how big a part of the bill this item usually is. */
  billShare: 'big' | 'small';
  offers: Offer[];
  /** Last resort when a delivery falls short: exactly what's missing, at a steep price. */
  brokerUnitPrice?: number;
}

export const BUDGET = 1000;

export const NORWAY_ITEMS: Item[] = [
  {
    id: 'quartz', name: 'Quartz', unit: 't', need: 10, billShare: 'big',
    why: 'The silicon is inside it. No quartz, no chip.',
    brokerUnitPrice: 40,
    offers: [
      {
        id: 'fjord', supplier: 'Fjord Quarry', blurb: 'Local. Sells exactly what you need.', lot: 10, unitPrice: 20,
        risk: { sign: 'One quarry, one mountain road', oneIn: 3, delivered: 4, news: 'Rockslide on the quarry road! Only 4 t of quartz got through.' },
      },
      { id: 'nordic', supplier: 'Nordic Minerals', blurb: 'Big trader, three quarries. Sells 25 t minimum.', lot: 25, unitPrice: 14 },
    ],
  },
  {
    id: 'coal', name: 'Coal', unit: 't', need: 4, billShare: 'small',
    why: 'Carbon pulls the oxygen out of the quartz.',
    offers: [
      { id: 'harbour', supplier: 'Harbour Coal', blurb: 'Local merchant. Small lots.', lot: 5, unitPrice: 12 },
      { id: 'bulk', supplier: 'Bulk importer', blurb: 'Cheaper per tonne. Sells 20 t minimum.', lot: 20, unitPrice: 6 },
    ],
  },
  {
    id: 'woodchips', name: 'Wood chips', unit: 't', need: 3, billShare: 'small',
    why: 'Keeps the furnace mix loose so gas can flow.',
    brokerUnitPrice: 25,
    offers: [
      {
        id: 'sawmill', supplier: 'Valley Sawmill', blurb: 'Cheap and close. Sells exactly 3 t.', lot: 3, unitPrice: 10,
        risk: { sign: 'The only sawmill in the valley', oneIn: 4, delivered: 0, news: 'The sawmill’s saw broke down. No wood chips this month.' },
      },
      { id: 'timber', supplier: 'Timber trader', blurb: 'Several sawmills behind it. Sells 10 t minimum.', lot: 10, unitPrice: 6 },
    ],
  },
  {
    id: 'power', name: 'Electricity', unit: 'MWh', need: 100, billShare: 'big',
    why: 'The furnace runs on a huge electric current. Remember that bill?',
    offers: [
      {
        id: 'spot', supplier: 'Spot price', blurb: 'Pay today’s market price for what you use.', lot: 100, unitPrice: 2,
        risk: { sign: 'Price follows the rain: a dry year can triple it', oneIn: 3, priceFactor: 3, news: 'Dry autumn, low reservoirs: the spot price just tripled.' },
      },
      { id: 'fixed', supplier: 'Fixed contract', blurb: 'Price locked. You must commit to at least 200 MWh.', lot: 200, unitPrice: 2.5 },
    ],
  },
];

export type Choices = Partial<Record<ItemId, string>>;

export const offerFor = (item: Item, choices: Choices) => item.offers.find(o => o.id === choices[item.id]);
export const lotCost = (offer: Offer) => offer.lot * offer.unitPrice;
export const plannedTotal = (choices: Choices) =>
  NORWAY_ITEMS.reduce((sum, item) => { const o = offerFor(item, choices); return sum + (o ? lotCost(o) : 0); }, 0);

/** What happened to one item after the orders went out. */
export interface Outcome {
  item: Item;
  offer: Offer;
  struck: boolean;
  delivered: number;
  /** Paid for the main order (after any price change). */
  paid: number;
  /** Missing quantity the player still has to cover. */
  shortfall: number;
}

/** Rolls each chosen offer's visible risk once. `rng` returns [0, 1). */
export function resolveOrders(choices: Choices, rng: () => number = Math.random): Outcome[] {
  return NORWAY_ITEMS.map(item => {
    const offer = offerFor(item, choices);
    if (!offer) throw new Error(`No offer chosen for ${item.id}`);
    const struck = !!offer.risk && rng() < 1 / offer.risk.oneIn;
    const delivered = struck && offer.risk?.delivered !== undefined ? offer.risk.delivered : offer.lot;
    // A short delivery is only paid for what arrived; a price change applies to the whole lot.
    const base = (struck && offer.risk?.delivered !== undefined ? delivered : offer.lot) * offer.unitPrice;
    const paid = base * (struck && offer.risk?.priceFactor ? offer.risk.priceFactor : 1);
    return { item, offer, struck, delivered, paid, shortfall: Math.max(0, item.need - delivered) };
  });
}

/** Ways to cover a shortfall: another supplier's full lot, or the broker for exactly what's missing. */
export interface Fix { id: string; label: string; quantity: number; cost: number }

export function fixesFor(outcome: Outcome): Fix[] {
  if (outcome.shortfall === 0) return [];
  const others = outcome.item.offers
    .filter(o => o.id !== outcome.offer.id && o.lot >= outcome.shortfall)
    .map(o => ({ id: o.id, label: `${o.supplier}: ${o.lot} ${outcome.item.unit} lot`, quantity: o.lot, cost: lotCost(o) }));
  const broker = outcome.item.brokerUnitPrice
    ? [{ id: 'broker', label: `Emergency broker: exactly ${outcome.shortfall} ${outcome.item.unit}`, quantity: outcome.shortfall, cost: outcome.shortfall * outcome.item.brokerUnitPrice }]
    : [];
  return [...others, ...broker];
}

/** One line of the final bill. */
export interface BillLine { name: string; unit: string; bought: number; used: number; paid: number }

export function billLines(outcomes: Outcome[], fixes: Partial<Record<ItemId, Fix>>): BillLine[] {
  return outcomes.map(o => {
    const fix = fixes[o.item.id];
    return {
      name: o.item.name, unit: o.item.unit,
      bought: o.delivered + (fix?.quantity ?? 0),
      used: o.item.need,
      paid: o.paid + (fix?.cost ?? 0),
    };
  });
}

/** Sigurd's one-line lesson per item, from what the player chose and what happened. */
export function debrief(o: Outcome, fix?: Fix): string {
  const leftover = o.delivered + (fix?.quantity ?? 0) - o.item.need;
  if (o.struck && fix) return `${o.item.name}: you went with ${o.offer.supplier}. The risk came true and covering it cost $${fix.cost}.`;
  if (o.struck) return `${o.item.name}: the price jumped. A fixed contract would have cost more upfront, but protected you.`;
  if (o.offer.risk) return `${o.item.name}: you took a risk with ${o.offer.supplier}, and it paid off this time.`;
  if (leftover > 0) return `${o.item.name}: safe supplier, but you paid for ${leftover} ${o.item.unit} you didn't need. Small buyers can't choose the lot size.`;
  return `${o.item.name}: no surprises.`;
}
