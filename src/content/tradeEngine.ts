/**
 * Loop 2 economic engine, shared by every stop: buy the inputs, make the product, sell it on.
 * Buying follows the real purchase-to-pay steps (layers/LAYER_2_BRAINSTORM.md K2, P01/P03):
 * quote → negotiate → order → delivery check → invoice check → pay. No clock and no dice:
 * every outcome follows from the player's choices. All numbers live in each stop's market file.
 */

export interface Need { id: string; name: string; unit: string; need: number; /** Price a merchant pays back per spare unit. */ resale: number }

export interface Terms {
  lot: number;
  unitPrice: number;
  /** One-off fee per order (e.g. repacking). */
  fee: number;
  /** Share of each lot the workcell can actually use (fines, rejects). */
  usable: number;
}

export interface Lever {
  id: string;
  label: string;
  reply: string;
  /** What the supplier changes if they agree; none means a polite no. */
  change?: { lot?: number; priceAdd?: number; feeAdd?: number; usable?: number };
}

export interface Supplier {
  id: string;
  item: string;
  name: string;
  origin: string;
  terms: Terms;
  levers: Lever[];
  /** How many asks before the supplier stops negotiating. */
  patience: number;
  /** The first invoice bills this many units more than delivered (a real, common error). */
  invoiceExtraUnits?: number;
}

/** Another possible customer: visiting gives a quote the player can show the main buyer. */
export interface Competitor { id: string; name: string; use: string; quote: number; reply: string }

export interface Buyer {
  name: string;
  offer: number;
  /** Highest price the buyer will ever pay, and how many asks before the offer is final. */
  cap: number;
  patience: number;
  /** `add` raises the offer; `match` meets the best competing quote the player has seen. */
  levers: { id: string; label: string; reply: string; add?: number; match?: boolean }[];
  competitors: Competitor[];
  /** The buyer's payment arrives short by this much, an unagreed deduction (the invoice lesson, other side). */
  shortPay: number;
  shortReason: string;
}

export interface Market { needs: Need[]; suppliers: Supplier[]; buyer: Buyer; cash: number; /** The guide's first line. */ intro: string }

export interface Order {
  id: string;
  supplierId: string;
  item: string;
  terms: Terms;
  lots: number;
  checked: boolean;
  /** What the order says you owe. */
  expected: number;
  /** What the supplier's invoice asks for. */
  invoice: number;
  paid: number | null;
  /** The player caught a wrong invoice. */
  corrected?: boolean;
}

export interface TradeState {
  phase: 'buy' | 'make' | 'sell' | 'payment' | 'done';
  /** Current terms per supplier, after negotiation. */
  terms: Record<string, Terms>;
  asked: Record<string, string[]>;
  sampled: string[];
  orders: Order[];
  sale: {
    offer: number; asked: string[]; sparesSold: boolean; price: number | null;
    /** Competitors who gave a quote. */
    quotes: string[];
    /** What actually arrived in the bank; null until the buyer pays. */
    received: number | null;
    chased: boolean;
  };
  message: string;
}

export type TradeAction =
  | { type: 'sample'; supplierId: string }
  | { type: 'ask'; supplierId: string; leverId: string }
  | { type: 'order'; supplierId: string; lots: number }
  | { type: 'check'; orderId: string }
  | { type: 'pay'; orderId: string }
  | { type: 'dispute'; orderId: string }
  | { type: 'make' } | { type: 'made' }
  | { type: 'getQuote'; competitorId: string }
  | { type: 'askBuyer'; leverId: string }
  | { type: 'sellSpares' }
  | { type: 'accept' }
  | { type: 'takePayment' } | { type: 'chasePayment' }
  | { type: 'retry' };

export function createTrade(m: Market, message = m.intro): TradeState {
  return {
    phase: 'buy',
    terms: Object.fromEntries(m.suppliers.map(s => [s.id, { ...s.terms }])),
    asked: {}, sampled: [], orders: [],
    sale: { offer: m.buyer.offer, asked: [], sparesSold: false, price: null, quotes: [], received: null, chased: false },
    message,
  };
}

const supplier = (m: Market, id: string) => m.suppliers.find(s => s.id === id);
export const needOf = (m: Market, item: string) => m.needs.find(n => n.id === item)!;
export const orderCost = (t: Terms, lots: number) => t.lot * t.unitPrice * lots + t.fee;
export const usableOf = (o: Order) => Math.floor(o.terms.lot * o.terms.usable) * o.lots;
/** Usable units that passed the delivery check. */
export const accepted = (s: TradeState, item: string) => s.orders.filter(o => o.item === item && o.checked).reduce((n, o) => n + usableOf(o), 0);
/** Purchase evidence stays unchanged; the store shows only what is physically still there. */
export const stockOnHand = (m: Market, s: TradeState, item: string) => {
  const received = accepted(s, item);
  if (s.phase === 'buy') return received;
  const unused = Math.max(0, received - needOf(m, item).need);
  return s.sale.sparesSold && needOf(m, item).resale > 0 ? 0 : unused;
};
export const siliconInStore = (s: TradeState) => s.phase === 'sell' && s.sale.price === null;
export const onOrder = (s: TradeState, item: string) => s.orders.filter(o => o.item === item && !o.checked).reduce((n, o) => n + usableOf(o), 0);
export const missing = (m: Market, s: TradeState, item: string) => Math.max(0, needOf(m, item).need - accepted(s, item));
export const paidTotal = (s: TradeState) => s.orders.reduce((n, o) => n + (o.paid ?? 0), 0);
export const cashLeft = (m: Market, s: TradeState) => m.cash - paidTotal(s) + (s.sale.received ?? 0) + (s.sale.sparesSold ? sparesValue(m, s) : 0);
export const readyToMake = (m: Market, s: TradeState) => s.orders.every(o => o.paid !== null) && m.needs.every(n => missing(m, s, n.id) === 0);
/** Best competing quote the player has collected (0 if none). */
export const bestQuote = (m: Market, s: TradeState) => Math.max(0, ...m.buyer.competitors.filter(c => s.sale.quotes.includes(c.id)).map(c => c.quote));
export const spares = (m: Market, s: TradeState) => m.needs.map(n => ({ need: n, units: Math.max(0, accepted(s, n.id) - n.need) })).filter(x => x.units > 0);
export const sparesValue = (m: Market, s: TradeState) => spares(m, s).reduce((v, x) => v + x.units * x.need.resale, 0);
/** Revenue minus everything paid. Positive is profit; the loop's goal is at least zero. */
export const profit = (m: Market, s: TradeState) => cashLeft(m, s) - m.cash;

export function tradeReducer(m: Market, s: TradeState, a: TradeAction): TradeState {
  const say = (message: string, next: Partial<TradeState> = {}) => ({ ...s, ...next, message });
  if (a.type === 'retry') return s.phase === 'done' ? createTrade(m) : s;

  if (s.phase === 'buy') {
    if (a.type === 'make') return readyToMake(m, s) ? say('Everything is in and paid for. Load the furnace!', { phase: 'make' }) : say('Not yet: something is missing, unchecked or unpaid.');
    if (a.type === 'sample' || a.type === 'ask' || a.type === 'order') {
      const sup = supplier(m, a.supplierId);
      if (!sup) return s;
      const t = s.terms[sup.id];
      if (a.type === 'sample') {
        const usable = Math.floor(t.lot * t.usable);
        return say(`${sup.name} sample: ${usable} of every ${t.lot} ${needOf(m, sup.item).unit} are usable.`, { sampled: [...new Set([...s.sampled, sup.id])] });
      }
      if (a.type === 'ask') {
        const asked = s.asked[sup.id] ?? [];
        const lever = sup.levers.find(l => l.id === a.leverId);
        if (!lever || asked.includes(lever.id)) return s;
        if (asked.length >= sup.patience) return say(`${sup.name}: "That's our best offer."`);
        const c = lever.change;
        const terms = c ? {
          lot: c.lot ?? t.lot, unitPrice: t.unitPrice + (c.priceAdd ?? 0),
          fee: t.fee + (c.feeAdd ?? 0), usable: c.usable ?? t.usable,
        } : t;
        return say(`${sup.name}: "${lever.reply}"`, {
          terms: { ...s.terms, [sup.id]: terms }, asked: { ...s.asked, [sup.id]: [...asked, lever.id] },
          // A change to material preparation needs a fresh sample, not a stale approval.
          sampled: terms.usable !== t.usable ? s.sampled.filter(id => id !== sup.id) : s.sampled,
        });
      }
      if (!Number.isInteger(a.lots) || a.lots < 1 || a.lots > 3) return s;
      const id = `PO-${s.orders.length + 1}`;
      const expected = orderCost(t, a.lots);
      // The supplier's first invoice carries their known error; later ones are correct.
      const extra = sup.invoiceExtraUnits && !s.orders.some(o => o.supplierId === sup.id) ? sup.invoiceExtraUnits * t.unitPrice : 0;
      const order: Order = { id, supplierId: sup.id, item: sup.item, terms: { ...t }, lots: a.lots, checked: false, expected, invoice: expected + extra, paid: null };
      return say(`${id} sent to ${sup.name}. The truck is at the gate: check the delivery.`, { orders: [...s.orders, order] });
    }
    const o = s.orders.find(x => x.id === (a as { orderId?: string }).orderId);
    if (!o) return s;
    const name = supplier(m, o.supplierId)!.name;
    const unit = needOf(m, o.item).unit;
    const set = (patch: Partial<Order>) => s.orders.map(x => (x.id === o.id ? { ...x, ...patch } : x));
    if (a.type === 'check' && !o.checked) {
      const bought = o.terms.lot * o.lots;
      const ok = usableOf(o);
      return say(ok < bought ? `${bought} ${unit} delivered, but only ${ok} are usable. The rest is waste you paid for.` : `${bought} ${unit} delivered and all usable. Now the invoice.`, { orders: set({ checked: true }) });
    }
    if (a.type === 'pay' && o.checked && o.paid === null) {
      return say(o.invoice > o.expected ? `Paid $${o.invoice}. That was $${o.invoice - o.expected} more than the order said.` : `Paid $${o.invoice} to ${name}.`, { orders: set({ paid: o.invoice }) });
    }
    if (a.type === 'dispute' && o.checked && o.paid === null) {
      return o.invoice > o.expected
        ? say(`${name}: "You're right, we billed one ${unit.replace(/s$/, '')} too many. Corrected to $${o.expected}."`, { orders: set({ invoice: o.expected, corrected: true }) })
        : say(`${name}: "We checked: the invoice matches your order." (Fair enough.)`);
    }
    return s;
  }

  if (s.phase === 'make' && a.type === 'made') return say('Silicon metal, bagged. Now find out what it is worth.', { phase: 'sell' });

  if (s.phase === 'sell') {
    if (a.type === 'getQuote') {
      const c = m.buyer.competitors.find(x => x.id === a.competitorId);
      if (!c) return s;
      return say(`${c.name}: "${c.reply}"`, { sale: { ...s.sale, quotes: [...new Set([...s.sale.quotes, c.id])] } });
    }
    if (a.type === 'askBuyer') {
      const lever = m.buyer.levers.find(l => l.id === a.leverId);
      if (!lever || s.sale.asked.includes(lever.id)) return s;
      if (s.sale.asked.length >= m.buyer.patience) return say(`${m.buyer.name}: "That is our final offer."`);
      const quote = bestQuote(m, s);
      if (lever.match && quote <= s.sale.offer) return say(`${m.buyer.name}: "Other buyers? Show me a better quote, then we can talk."`);
      const offer = Math.min(m.buyer.cap, lever.match ? quote : s.sale.offer + (lever.add ?? 0));
      return say(`${m.buyer.name}: "${lever.reply.replace('{offer}', `$${offer}`)}"`, { sale: { ...s.sale, offer, asked: [...s.sale.asked, lever.id] } });
    }
    if (a.type === 'sellSpares' && !s.sale.sparesSold && sparesValue(m, s) > 0) {
      return say(`Spares sold back for $${sparesValue(m, s)}: less than you paid, better than nothing.`, { sale: { ...s.sale, sparesSold: true } });
    }
    if (a.type === 'accept') {
      const price = s.sale.offer;
      return say(`Deal at $${price}. You sent your invoice, and ${m.buyer.name} has paid $${price - m.buyer.shortPay}. Check it.`,
        { phase: 'payment', sale: { ...s.sale, price, received: price - m.buyer.shortPay } });
    }
  }

  if (s.phase === 'payment' && (a.type === 'takePayment' || a.type === 'chasePayment')) {
    const chase = a.type === 'chasePayment';
    const next: TradeState = { ...s, phase: 'done', sale: { ...s.sale, received: chase ? s.sale.price : s.sale.received, chased: chase } };
    const p = profit(m, next);
    const head = chase ? `${m.buyer.name}: "You're right, that deduction wasn't in our deal. Paid in full." ` : '';
    return { ...next, message: head + (p >= 0 ? `You made $${p} on Norway.` : `Norway cost you $${-p} more than it earned.`) };
  }
  return s;
}

/** One short lesson per thing the player did or missed. */
export function lessons(m: Market, s: TradeState): string[] {
  const out: string[] = [];
  const overpaid = s.orders.filter(o => o.paid !== null && o.paid > o.expected);
  if (overpaid.length) out.push(`You paid an invoice without comparing it with the order: $${overpaid.reduce((n, o) => n + o.paid! - o.expected, 0)} lost.`);
  else if (s.orders.some(o => o.corrected)) out.push('You caught a wrong invoice. Checking paperwork is real money.');
  const wasted = s.orders.reduce((n, o) => n + (o.terms.lot * o.lots - usableOf(o)) * o.terms.unitPrice, 0);
  if (wasted) out.push(`$${wasted} went on material you couldn't use. A sample would have warned you.`);
  const asks = Object.values(s.asked).flat().length;
  out.push(asks ? `You negotiated ${asks} time${asks > 1 ? 's' : ''}. Some suppliers moved, some didn't: a small buyer has little power.` : 'You never negotiated. Every first price was accepted.');
  if (s.sale.asked.length === 0) out.push('You took the buyer’s first offer.');
  if (s.sale.quotes.length === 0) out.push('You never asked other customers what they would pay. A competing quote is the strongest card in a negotiation.');
  if (s.sale.price !== null && !s.sale.chased) out.push(`You accepted a payment $${m.buyer.shortPay} short of your invoice (${m.buyer.shortReason}).`);
  else if (s.sale.chased) out.push('You checked the payment against your invoice and got the missing money: same paperwork, other side.');
  if (spares(m, s).length && !s.sale.sparesSold) out.push('Your spare stock is still in the shed: money sitting still.');
  return out;
}
