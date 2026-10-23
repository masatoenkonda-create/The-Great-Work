/**
 * Loop 2 economic engine, shared by every stop: buy the inputs, make the product, sell it on.
 * Buying follows the real purchase-to-pay steps (layers/LAYER_2_BRAINSTORM.md K2, P01/P03):
 * quote → negotiate → order → delivery check → invoice check → pay. No clock and no dice:
 * every outcome follows from the player's choices. All numbers live in each stop's market file.
 *
 * A market with an `enquiry` runs demand first (L27, brainstorm K30): the customer asks for a quote,
 * suppliers show terms only once asked, the customer orders at the agreed price, and only then does
 * the player buy. Its scenarios (L31) fix the run's one paperwork error and any damaged cargo at the
 * start; nothing random happens after a choice. Markets without an enquiry keep the original flow.
 */

export interface Need { id: string; name: string; unit: string; need: number; /** Price a merchant pays back per spare unit. */ resale: number }

export interface Terms {
  lot: number;
  unitPrice: number;
  /** One-off fee per order (e.g. repacking). */
  fee: number;
  /** Share of each lot the workcell can actually use (fines, rejects). */
  usable: number;
  /** Agreement minimum: you pay for at least this many units, even if fewer are delivered (GP01, GP14). */
  minimum?: number;
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
  /** The first invoice bills this many units more than delivered (a real, common error). Markets with scenarios set this per run instead. */
  invoiceExtraUnits?: number;
  /** What the spec sheet says; replaces the sample message where goods are checked on paper (gases). */
  spec?: string;
  /** Demand-first markets: the supplier's answer to a request for quotation, with its own condition. */
  quoteReply?: string;
  /** Payment before loading: the player pays at order, so a bad delivery can only be fixed with a claim. */
  prepay?: boolean;
  /** How damaged goods from this supplier look, e.g. "wet and caked". */
  damage?: string;
  /** Reply when a claim is refused because the goods were sold as they are. */
  claimRefusal?: string;
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

/** One run's fixed conditions (L31): chosen when the run starts, never rerolled. */
export interface Scenario {
  id: string;
  name: string;
  /** The run's one paperwork error, on that supplier's first order: a changed confirmation or extra units on the invoice. */
  paper: { supplierId: string; doc: 'confirmation' | 'invoice'; units?: number; priceAdd?: number };
  /** Units per lot that arrive damaged. A sample doesn't show them; the delivery check does, and a claim gets them credited. */
  damaged?: Record<string, number>;
  /** What the customer says it can pay before any leverage. */
  offer: number;
}

export interface Market {
  needs: Need[]; suppliers: Supplier[]; buyer: Buyer; cash: number;
  /** The guide's first line. */
  intro: string;
  /** Stop name for the result line, e.g. "Norway". */
  place: string;
  /** Guide lines when the factory starts and when the product is made. */
  makeLine: string;
  madeLine: string;
  /** What would have warned the player about unusable goods, e.g. "A sample". */
  checkHint: string;
  /** The previous stop's product, already in the store at the price agreed there (chain model, L17). */
  carried?: { name: string; unit: string; from: string };
  /** Demand first: the customer's opening message. Without it, the stop buys first and sells after. */
  enquiry?: string;
  /** Who checks deliveries at the factory, e.g. "Sigurd · engineer". */
  engineer?: string;
  scenarios?: Scenario[];
}

export type Claim = 'none' | 'credited' | 'refused' | 'kept';

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
  /** What the purchase order said, before any accepted change. */
  ordered: number;
  /** The supplier's order confirmation; until it is settled the goods don't ship. */
  confirmation: number;
  confirmed: boolean;
  /** What the player did with a confirmation that differed from the order. */
  changed?: 'accepted' | 'rejected';
  /** Paid at order, before the delivery check. */
  prepaid: boolean;
  /** Units that arrived damaged (not fines: these were not sold as they are). */
  damaged: number;
  claim: Claim;
  /** Credit note from an accepted claim. */
  credit: number;
}

export interface TradeState {
  phase: 'enquiry' | 'buy' | 'make' | 'sell' | 'payment' | 'done';
  /** What this stop paid the previous stop for its main input (0 at the first stop). */
  carriedCost: number;
  /** The run's scenario id (demand-first markets), else null. */
  scenario: string | null;
  /** Current terms per supplier, after negotiation. */
  terms: Record<string, Terms>;
  asked: Record<string, string[]>;
  sampled: string[];
  /** Suppliers who have answered a request for quotation. */
  quoted: string[];
  orders: Order[];
  sale: {
    offer: number; asked: string[]; sparesSold: boolean; price: number | null;
    /** Competitors who gave a quote. */
    quotes: string[];
    /** What actually arrived in the bank; null until the buyer pays. */
    received: number | null;
    chased: boolean;
    /** Demand first: the customer turned a quote down and named what it can pay. */
    countered: boolean;
    /** The price the customer ordered at; buying opens only once it exists. */
    ordered: number | null;
    /** The player quoted the customer before asking any supplier. */
    quotedBlind: boolean;
  };
  message: string;
  /** Who is talking in the chat box; null is the stop's guide. */
  speaker: string | null;
}

export type TradeAction =
  | { type: 'rfq'; supplierId: string }
  | { type: 'sample'; supplierId: string }
  | { type: 'ask'; supplierId: string; leverId: string }
  | { type: 'order'; supplierId: string; lots: number }
  | { type: 'acceptConfirmation'; orderId: string }
  | { type: 'rejectConfirmation'; orderId: string }
  | { type: 'check'; orderId: string }
  | { type: 'claim'; orderId: string }
  | { type: 'keep'; orderId: string }
  | { type: 'pay'; orderId: string }
  | { type: 'dispute'; orderId: string }
  | { type: 'quoteCustomer'; price: number }
  | { type: 'acceptOffer' }
  | { type: 'make' } | { type: 'made' }
  | { type: 'getQuote'; competitorId: string }
  | { type: 'askBuyer'; leverId: string }
  | { type: 'sellSpares' }
  | { type: 'accept' }
  | { type: 'takePayment' } | { type: 'chasePayment' }
  | { type: 'retry' };

export const demandFirst = (m: Market) => !!m.enquiry;
export const scenarioOf = (m: Market, s: TradeState) => m.scenarios?.find(x => x.id === s.scenario);

export function createTrade(m: Market, message = m.intro, carriedCost = 0, scenario = m.scenarios?.[0]?.id): TradeState {
  const sc = m.scenarios?.find(x => x.id === scenario);
  const first = demandFirst(m);
  return {
    phase: first ? 'enquiry' : 'buy', carriedCost, scenario: sc?.id ?? null,
    terms: Object.fromEntries(m.suppliers.map(s => [s.id, { ...s.terms }])),
    asked: {}, sampled: [], quoted: [], orders: [],
    sale: {
      offer: sc?.offer ?? m.buyer.offer, asked: [], sparesSold: false, price: null, quotes: [], received: null, chased: false,
      countered: false, ordered: null, quotedBlind: false,
    },
    message: first ? m.enquiry! : message,
    speaker: first ? m.buyer.name : null,
  };
}

/** A new run with a scenario picked at random (L31); the engine itself stays deterministic. */
export function newRun(m: Market, carriedCost = 0) {
  const list = m.scenarios ?? [];
  return createTrade(m, m.intro, carriedCost, list.length ? list[Math.floor(Math.random() * list.length)].id : undefined);
}

const supplier = (m: Market, id: string) => m.suppliers.find(s => s.id === id);
export const needOf = (m: Market, item: string) => m.needs.find(n => n.id === item)!;
/** Demand first: a supplier's terms are unknown until it has quoted. */
export const knowsTerms = (m: Market, s: TradeState, id: string) => !demandFirst(m) || s.quoted.includes(id);
/** Billed units: what is delivered, or the agreement's minimum if that is more. */
export const billedUnits = (t: Terms, lots: number) => Math.max(t.lot * lots, t.minimum ?? 0);
export const orderCost = (t: Terms, lots: number) => billedUnits(t, lots) * t.unitPrice + t.fee;
/** Units paid for under a minimum but never delivered: money owed, not stock. */
export const unusedMinimum = (o: Order) => billedUnits(o.terms, o.lots) - o.terms.lot * o.lots;
/** Usable units as sold (fines excluded), before any damage on the way. */
const usableAsSold = (o: Order) => Math.floor(o.terms.lot * o.terms.usable) * o.lots;
export const usableOf = (o: Order) => usableAsSold(o) - o.damaged;
/** Delivered units that were never usable as sold, e.g. fines in crushed rock. */
export const finesOf = (o: Order) => o.terms.lot * o.lots - usableAsSold(o);
/** An order still needs the player: confirmation, delivery check, invoice, or a decision on damaged goods. */
export const isOpen = (o: Order) => !o.confirmed || !o.checked || o.paid === null || (o.damaged > 0 && o.claim === 'none');
/** Usable units that passed the delivery check. */
export const accepted = (s: TradeState, item: string) => s.orders.filter(o => o.item === item && o.checked).reduce((n, o) => n + usableOf(o), 0);
/** Purchase evidence stays unchanged; the store shows only what is physically still there. */
export const stockOnHand = (m: Market, s: TradeState, item: string) => {
  const received = accepted(s, item);
  if (s.phase === 'buy' || s.phase === 'enquiry') return received;
  const unused = Math.max(0, received - needOf(m, item).need);
  return s.sale.sparesSold && needOf(m, item).resale > 0 ? 0 : unused;
};
export const siliconInStore = (s: TradeState) => s.phase === 'sell' && s.sale.price === null;
export const onOrder = (s: TradeState, item: string) => s.orders.filter(o => o.item === item && !o.checked).reduce((n, o) => n + usableOf(o), 0);
export const missing = (m: Market, s: TradeState, item: string) => Math.max(0, needOf(m, item).need - accepted(s, item));
/** Money paid to suppliers, less credit notes. */
export const paidTotal = (s: TradeState) => s.orders.reduce((n, o) => n + (o.paid ?? 0) - o.credit, 0);
export const cashLeft = (m: Market, s: TradeState) => m.cash - s.carriedCost - paidTotal(s) + (s.sale.received ?? 0) + (s.sale.sparesSold ? sparesValue(m, s) : 0);
export const readyToMake = (m: Market, s: TradeState) => s.phase === 'buy' && !s.orders.some(isOpen) && m.needs.every(n => missing(m, s, n.id) === 0);
/** Best competing quote the player has collected (0 if none). */
export const bestQuote = (m: Market, s: TradeState) => Math.max(0, ...m.buyer.competitors.filter(c => s.sale.quotes.includes(c.id)).map(c => c.quote));
export const spares = (m: Market, s: TradeState) => m.needs.map(n => ({ need: n, units: Math.max(0, accepted(s, n.id) - n.need) })).filter(x => x.units > 0);
export const sparesValue = (m: Market, s: TradeState) => spares(m, s).reduce((v, x) => v + x.units * x.need.resale, 0);
/** Revenue minus everything paid, including the carried input. Positive is profit; the loop's goal is at least zero. */
export const profit = (m: Market, s: TradeState) => cashLeft(m, s) - m.cash;
const $ = (n: number) => `$${n.toLocaleString('en-US')}`;

export function tradeReducer(m: Market, s: TradeState, a: TradeAction): TradeState {
  const say = (message: string, next: Partial<TradeState> = {}, speaker: string | null = null) => ({ ...s, ...next, message, speaker });
  if (a.type === 'retry') {
    if (s.phase !== 'done') return s;
    // Another try is another run: the next scenario in the list, so a replay isn't a memorised answer.
    const list = m.scenarios ?? [];
    const i = list.findIndex(x => x.id === s.scenario);
    return createTrade(m, m.intro, s.carriedCost, list.length ? list[(i + 1) % list.length].id : undefined);
  }
  const engineer = m.engineer ?? null;

  // Talking to suppliers: before the customer's order (demand first) and while buying.
  if ((s.phase === 'enquiry' || s.phase === 'buy') && (a.type === 'rfq' || a.type === 'sample' || a.type === 'ask')) {
    const sup = supplier(m, a.supplierId);
    if (!sup) return s;
    const t = s.terms[sup.id];
    const rep = `${sup.name} · sales`;
    if (a.type === 'rfq') {
      if (s.quoted.includes(sup.id)) return s;
      const unit = needOf(m, sup.item).unit;
      return say(`“${sup.quoteReply ?? `${t.lot} ${unit} at ${$(t.unitPrice)}.`}”`, { quoted: [...s.quoted, sup.id] }, rep);
    }
    if (!knowsTerms(m, s, sup.id)) return say(`Ask ${sup.name} for a quote first.`);
    if (a.type === 'sample') {
      const usable = Math.floor(t.lot * t.usable);
      return say(sup.spec ? `${sup.name}, spec sheet: ${sup.spec}` : `${sup.name} sample: ${usable} of every ${t.lot} ${needOf(m, sup.item).unit} are usable.`, { sampled: [...new Set([...s.sampled, sup.id])] });
    }
    const asked = s.asked[sup.id] ?? [];
    const lever = sup.levers.find(l => l.id === a.leverId);
    if (!lever || asked.includes(lever.id)) return s;
    if (asked.length >= sup.patience) return say(`${sup.name}: "That's our best offer."`);
    const c = lever.change;
    const terms = c ? {
      ...t,
      lot: c.lot ?? t.lot, unitPrice: t.unitPrice + (c.priceAdd ?? 0),
      fee: t.fee + (c.feeAdd ?? 0), usable: c.usable ?? t.usable,
    } : t;
    return say(`${sup.name}: "${lever.reply}"`, {
      terms: { ...s.terms, [sup.id]: terms }, asked: { ...s.asked, [sup.id]: [...asked, lever.id] },
      // A change to material preparation needs a fresh sample, not a stale approval.
      sampled: terms.usable !== t.usable ? s.sampled.filter(id => id !== sup.id) : s.sampled,
    });
  }

  if (s.phase === 'enquiry') {
    const buyer = m.buyer.name;
    if (a.type === 'getQuote') {
      const c = m.buyer.competitors.find(x => x.id === a.competitorId);
      if (!c) return s;
      return say(`${c.name}: "${c.reply}"`, { sale: { ...s.sale, quotes: [...new Set([...s.sale.quotes, c.id])] } });
    }
    if (a.type === 'quoteCustomer') {
      if (!Number.isInteger(a.price) || a.price <= 0) return s;
      const blind = s.sale.quotedBlind || s.quoted.length === 0;
      if (a.price > s.sale.offer) {
        return say(`“${$(a.price)} is too high for us. We can pay ${$(s.sale.offer)}.”`, { sale: { ...s.sale, countered: true, quotedBlind: blind } }, buyer);
      }
      return say(`“${$(a.price)} works for us. Our order: one batch at ${$(a.price)}.” Now buy what you need.`,
        { phase: 'buy', sale: { ...s.sale, ordered: a.price, quotedBlind: blind } }, buyer);
    }
    if (a.type === 'acceptOffer' && s.sale.countered) {
      return say(`“Agreed. Our order: one batch at ${$(s.sale.offer)}.” Now buy what you need.`, { phase: 'buy', sale: { ...s.sale, ordered: s.sale.offer } }, buyer);
    }
    if (a.type === 'askBuyer' && s.sale.countered) {
      const lever = m.buyer.levers.find(l => l.id === a.leverId);
      if (!lever || s.sale.asked.includes(lever.id)) return s;
      if (s.sale.asked.length >= m.buyer.patience) return say(`“That is as far as we go.”`, {}, buyer);
      const quote = bestQuote(m, s);
      if (lever.match && quote <= s.sale.offer) return say(`“Other buyers? Show me a better quote, then we can talk.”`, {}, buyer);
      const offer = Math.min(m.buyer.cap, lever.match ? quote : s.sale.offer + (lever.add ?? 0));
      return say(`“${lever.reply.replace('{offer}', $(offer))}”`, { sale: { ...s.sale, offer, asked: [...s.sale.asked, lever.id] } }, buyer);
    }
    return s;
  }

  if (s.phase === 'buy') {
    if (a.type === 'make') return readyToMake(m, s) ? say(m.makeLine, { phase: 'make' }) : say('Not yet: something is missing, unchecked or unpaid.');
    if (a.type === 'order') {
      const sup = supplier(m, a.supplierId);
      if (!sup || !knowsTerms(m, s, sup.id)) return s;
      if (!Number.isInteger(a.lots) || a.lots < 1 || a.lots > 3) return s;
      const t = s.terms[sup.id];
      const id = `PO-${s.orders.length + 1}`;
      const expected = orderCost(t, a.lots);
      const first = !s.orders.some(o => o.supplierId === sup.id);
      const sc = scenarioOf(m, s);
      // The run's one paperwork error sits on that supplier's first order; later ones are correct.
      const paper = sc && first && sc.paper.supplierId === sup.id ? sc.paper : undefined;
      const extraUnits = sc ? (paper?.doc === 'invoice' ? paper.units ?? 1 : 0) : first ? sup.invoiceExtraUnits ?? 0 : 0;
      const confirmation = paper?.doc === 'confirmation' ? expected + (paper.priceAdd ?? 0) * billedUnits(t, a.lots) : expected;
      const confirmed = confirmation === expected;
      const prepaid = !!sup.prepay;
      const order: Order = {
        id, supplierId: sup.id, item: sup.item, terms: { ...t }, lots: a.lots, checked: false, expected, invoice: expected + extraUnits * t.unitPrice,
        paid: prepaid && confirmed ? expected : null, ordered: expected, confirmation, confirmed, prepaid,
        damaged: Math.min((sc?.damaged?.[sup.id] ?? 0) * a.lots, Math.floor(t.lot * t.usable) * a.lots), claim: 'none', credit: 0,
      };
      const next = { orders: [...s.orders, order] };
      if (!confirmed) return say(`${id} sent. Order confirmation: ${$(confirmation)}. Compare it with your order before they ship.`, next, `${sup.name} · sales`);
      if (prepaid) return say(`${id}: paid ${$(expected)} in advance, as they asked. The truck is coming: check the delivery.`, next);
      return say(`${id} sent to ${sup.name}, confirmed at ${$(expected)}. The truck is at the gate: check the delivery.`, next);
    }
    const o = s.orders.find(x => x.id === (a as { orderId?: string }).orderId);
    if (!o) return s;
    const sup = supplier(m, o.supplierId)!;
    const name = sup.name;
    const unit = needOf(m, o.item).unit;
    const set = (patch: Partial<Order>) => s.orders.map(x => (x.id === o.id ? { ...x, ...patch } : x));
    if (!o.confirmed) {
      if (a.type === 'acceptConfirmation') {
        return say(`You accepted ${$(o.confirmation)}: ${$(o.confirmation - o.expected)} more than your own order said.`,
          { orders: set({ confirmed: true, changed: 'accepted', expected: o.confirmation, invoice: o.invoice - o.expected + o.confirmation, paid: o.prepaid ? o.confirmation : null }) });
      }
      if (a.type === 'rejectConfirmation') {
        return say(`“You're right: ${$(o.expected)}, as on your purchase order. Corrected, and the truck is on its way.”`,
          { orders: set({ confirmed: true, changed: 'rejected', confirmation: o.expected, paid: o.prepaid ? o.expected : null }) }, `${name} · sales`);
      }
      return s;
    }
    if (a.type === 'check' && !o.checked) {
      const bought = o.terms.lot * o.lots;
      if (o.damaged > 0) {
        return say(`${bought} ${unit} came in, and ${o.damaged} are ${sup.damage ?? 'damaged'}. Those aren't going in my furnace. ${o.prepaid ? `You've already paid, so claim them back from ${name}.` : `Claim them from ${name}, or keep them.`}`,
          { orders: set({ checked: true }) }, engineer);
      }
      const ok = usableOf(o);
      return say(ok < bought ? `${bought} ${unit} delivered, but only ${ok} are usable. The rest is waste you paid for.` : `${bought} ${unit} delivered and all usable.${o.paid === null ? ' Now the invoice.' : ''}`,
        { orders: set({ checked: true }) }, ok < bought ? engineer : null);
    }
    if (a.type === 'claim' && o.checked && o.claim === 'none' && usableOf(o) < o.terms.lot * o.lots) {
      if (o.damaged > 0) {
        const credit = o.damaged * o.terms.unitPrice;
        return say(`“Sorry about that. Credit note for ${o.damaged} ${unit}: ${$(credit)}.”`, { orders: set({ claim: 'credited', credit }) }, `${name} · sales`);
      }
      return say(`“${sup.claimRefusal ?? 'You ordered it as we sell it.'}”`, { orders: set({ claim: 'refused' }) }, `${name} · sales`);
    }
    if (a.type === 'keep' && o.checked && o.claim === 'none' && o.damaged > 0) return say(`You kept the ${o.damaged} damaged ${unit} without a claim.`, { orders: set({ claim: 'kept' }) });
    if (a.type === 'pay' && o.checked && o.paid === null) {
      return say(o.invoice > o.expected ? `Paid ${$(o.invoice)}. That was ${$(o.invoice - o.expected)} more than the order said.` : `Paid ${$(o.invoice)} to ${name}.`, { orders: set({ paid: o.invoice }) });
    }
    if (a.type === 'dispute' && o.checked && o.paid === null) {
      if (o.invoice === o.expected && unusedMinimum(o) > 0) return say(`${name}: "The minimum of ${billedUnits(o.terms, o.lots)} ${unit} is in the agreement you signed." (It is.)`);
      return o.invoice > o.expected
        ? say(`${name}: "You're right, we billed one ${unit.replace(/s$/, '')} too many. Corrected to ${$(o.expected)}."`, { orders: set({ invoice: o.expected, corrected: true }) })
        : say(`${name}: "We checked: the invoice matches your order." (Fair enough.)`);
    }
    return s;
  }

  if (s.phase === 'make' && a.type === 'made') return say(m.madeLine, { phase: 'sell' });

  if (s.phase === 'sell') {
    if (a.type === 'sellSpares' && !s.sale.sparesSold && sparesValue(m, s) > 0) {
      return say(`Spares sold back for ${$(sparesValue(m, s))}: less than you paid, better than nothing.`, { sale: { ...s.sale, sparesSold: true } });
    }
    if (a.type === 'accept') {
      const price = s.sale.ordered ?? s.sale.offer;
      return say(`${demandFirst(m) ? `Delivered, and your invoice for ${$(price)} sent.` : `Deal at ${$(price)}. You sent your invoice.`} ${m.buyer.name} has paid ${$(price - m.buyer.shortPay)}. Check it.`,
        { phase: 'payment', sale: { ...s.sale, price, received: price - m.buyer.shortPay } });
    }
    // The original flow negotiates the sale after making; demand first agreed it before buying.
    if (demandFirst(m)) return s;
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
  }

  if (s.phase === 'payment' && (a.type === 'takePayment' || a.type === 'chasePayment')) {
    const chase = a.type === 'chasePayment';
    const next: TradeState = { ...s, phase: 'done', sale: { ...s.sale, received: chase ? s.sale.price : s.sale.received, chased: chase } };
    const p = profit(m, next);
    const head = chase ? `${m.buyer.name}: "You're right, that deduction wasn't in our deal. Paid in full." ` : '';
    return { ...next, speaker: null, message: head + (p >= 0 ? `You made $${p} on ${m.place}.` : `${m.place} cost you $${-p} more than it earned.`) };
  }
  return s;
}

/** One short lesson per thing the player did or missed. */
export function lessons(m: Market, s: TradeState): string[] {
  const out: string[] = [];
  const first = demandFirst(m);
  const name = (o: Order) => supplier(m, o.supplierId)!.name;
  if (first && s.sale.ordered !== null) {
    if (s.sale.quotedBlind) out.push(`You quoted ${m.buyer.name} before any supplier had given you a price: a promise made without knowing your costs.`);
    if (s.sale.ordered < m.buyer.cap) out.push(`${m.buyer.name} ordered at ${$(s.sale.ordered)}. With a competing quote and one more ask, it would have paid up to ${$(m.buyer.cap)}.`);
    else out.push(`You got ${m.buyer.name}'s best price, ${$(s.sale.ordered)}, before buying a single input: your costs had to fit under it.`);
  }
  for (const o of s.orders.filter(x => x.changed)) {
    out.push(o.changed === 'accepted'
      ? `${name(o)}'s confirmation said more than your order, and you accepted it: ${$(o.confirmation - o.ordered)} gone. Your purchase order is the contract.`
      : `You caught ${name(o)}'s changed confirmation before it shipped. Your purchase order is the contract.`);
  }
  const overpaid = s.orders.filter(o => o.paid !== null && o.paid > o.expected);
  if (overpaid.length) out.push(`You paid an invoice without comparing it with the order: $${overpaid.reduce((n, o) => n + o.paid! - o.expected, 0)} lost.`);
  else if (s.orders.some(o => o.corrected)) out.push('You caught a wrong invoice. Checking paperwork is real money.');
  const wasted = s.orders.reduce((n, o) => n + finesOf(o) * o.terms.unitPrice, 0);
  if (wasted) out.push(`$${wasted} went on material you couldn't use. ${m.checkHint} would have warned you.`);
  for (const o of s.orders.filter(x => x.claim === 'refused')) out.push(`${name(o)} refused your claim: you ordered the goods as they sell them. A claim is only as good as what the order said.`);
  for (const o of s.orders.filter(x => x.damaged > 0)) {
    const value = o.damaged * o.terms.unitPrice;
    out.push(o.claim === 'credited'
      ? `${o.damaged} damaged ${needOf(m, o.item).unit} from ${name(o)}: you claimed them and got ${$(value)} back.${o.prepaid ? ' Paying in advance meant a claim was the only way to get it.' : ''}`
      : `${o.damaged} damaged ${needOf(m, o.item).unit} from ${name(o)} kept without a claim: ${$(value)} lost.`);
  }
  // A contract mostly used is a good deal; one mostly unused is money for nothing.
  for (const o of s.orders.filter(x => x.terms.minimum && x.paid !== null)) {
    const owed = unusedMinimum(o) * o.terms.unitPrice;
    const unused = unusedMinimum(o) / billedUnits(o.terms, o.lots);
    out.push(unused > 0.25
      ? `${name(o)}: you paid $${owed} under the contract minimum for supply you never took. A low rate is only cheaper if you need what you commit to.`
      : `${name(o)}: you used ${owed ? 'almost ' : ''}all of the contract minimum, so the lower rate really was cheaper.`);
  }
  const asks = Object.values(s.asked).flat().length;
  out.push(asks ? `You negotiated ${asks} time${asks > 1 ? 's' : ''}. Some suppliers moved, some didn't: a small buyer has little power.` : 'You never negotiated. Every first price was accepted.');
  if (!first && s.sale.asked.length === 0) out.push('You took the buyer’s first offer.');
  if (s.sale.quotes.length === 0) out.push('You never asked other customers what they would pay. A competing quote is the strongest card in a negotiation.');
  if (s.sale.price !== null && !s.sale.chased) out.push(`You accepted a payment $${m.buyer.shortPay} short of your invoice (${m.buyer.shortReason}).`);
  else if (s.sale.chased) out.push('You checked the payment against your invoice and got the missing money: same paperwork, other side.');
  if (spares(m, s).length && !s.sale.sparesSold) out.push('Your spare stock is still in the shed: money sitting still.');
  return out;
}
