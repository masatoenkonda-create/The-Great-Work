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

export interface Buyer { name: string; offer: number; levers: { id: string; label: string; reply: string; add: number }[] }

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
  phase: 'buy' | 'make' | 'sell' | 'done';
  /** Current terms per supplier, after negotiation. */
  terms: Record<string, Terms>;
  asked: Record<string, string[]>;
  sampled: string[];
  orders: Order[];
  sale: { offer: number; asked: string[]; sparesSold: boolean; price: number | null };
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
  | { type: 'askBuyer'; leverId: string }
  | { type: 'sellSpares' }
  | { type: 'accept' }
  | { type: 'retry' };

export function createTrade(m: Market, message = m.intro): TradeState {
  return {
    phase: 'buy',
    terms: Object.fromEntries(m.suppliers.map(s => [s.id, { ...s.terms }])),
    asked: {}, sampled: [], orders: [],
    sale: { offer: m.buyer.offer, asked: [], sparesSold: false, price: null },
    message,
  };
}

const supplier = (m: Market, id: string) => m.suppliers.find(s => s.id === id);
export const needOf = (m: Market, item: string) => m.needs.find(n => n.id === item)!;
export const orderCost = (t: Terms, lots: number) => t.lot * t.unitPrice * lots + t.fee;
export const usableOf = (o: Order) => Math.floor(o.terms.lot * o.terms.usable) * o.lots;
/** Usable units that passed the delivery check. */
export const accepted = (s: TradeState, item: string) => s.orders.filter(o => o.item === item && o.checked).reduce((n, o) => n + usableOf(o), 0);
export const onOrder = (s: TradeState, item: string) => s.orders.filter(o => o.item === item && !o.checked).reduce((n, o) => n + usableOf(o), 0);
export const missing = (m: Market, s: TradeState, item: string) => Math.max(0, needOf(m, item).need - accepted(s, item));
export const paidTotal = (s: TradeState) => s.orders.reduce((n, o) => n + (o.paid ?? 0), 0);
export const cashLeft = (m: Market, s: TradeState) => m.cash - paidTotal(s) + (s.sale.price ?? 0) + (s.sale.sparesSold ? sparesValue(m, s) : 0);
export const readyToMake = (m: Market, s: TradeState) => s.orders.every(o => o.paid !== null) && m.needs.every(n => missing(m, s, n.id) === 0);
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
        return say(`${sup.name}: "${lever.reply}"`, { terms: { ...s.terms, [sup.id]: terms }, asked: { ...s.asked, [sup.id]: [...asked, lever.id] } });
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
    if (a.type === 'askBuyer') {
      const lever = m.buyer.levers.find(l => l.id === a.leverId);
      if (!lever || s.sale.asked.includes(lever.id)) return s;
      return say(`${m.buyer.name}: "${lever.reply}"`, { sale: { ...s.sale, offer: s.sale.offer + lever.add, asked: [...s.sale.asked, lever.id] } });
    }
    if (a.type === 'sellSpares' && !s.sale.sparesSold && sparesValue(m, s) > 0) {
      return say(`Spares sold back for $${sparesValue(m, s)}: less than you paid, better than nothing.`, { sale: { ...s.sale, sparesSold: true } });
    }
    if (a.type === 'accept') {
      const next = { ...s, sale: { ...s.sale, price: s.sale.offer } };
      const p = profit(m, next);
      return { ...next, phase: 'done', message: p >= 0 ? `Sold! You made $${p} on Norway.` : `Sold, but Norway cost you $${-p} more than it earned.` };
    }
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
  if (spares(m, s).length && !s.sale.sparesSold) out.push('Your spare stock is still in the shed: money sitting still.');
  return out;
}
