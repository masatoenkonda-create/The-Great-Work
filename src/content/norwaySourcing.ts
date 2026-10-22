/** Norway sourcing slice. Prices, locations, quantities and screening yields are teaching
 * values. Portions represent feed, not tonnes or an industrial recipe. No RNG/clock.
 * Sources and limits: layers/NORWAY_PROCUREMENT_REVIEW.md. */
export type ItemId = 'quartz' | 'coal' | 'woodchips' | 'power';
export type Terms = 'standard' | 'screened' | 'split';
export const BUDGET = 650;
export const NEEDS: { id: ItemId; name: string; need: number; unit: string; why: string; requirement: string }[] = [
  { id: 'quartz', name: 'Quartz', need: 10, unit: 'portions', why: 'Supplies silicon bound to oxygen.', requirement: 'Chunks that stay on the feed screen. Fines stay out of this furnace charge.' },
  { id: 'coal', name: 'Carbon feed', need: 4, unit: 'portions', why: 'Carbon helps remove oxygen from quartz.', requirement: 'Prepared carbon feed approved for this workcell.' },
  { id: 'woodchips', name: 'Wood chips', need: 3, unit: 'portions', why: 'Help keep the charge open for gas flow.', requirement: 'Prepared wood chips for the charge, not sawdust.' },
  { id: 'power', name: 'Electricity', need: 1, unit: 'batch', why: 'Heats the charge through the electrodes.', requirement: 'A connection and supply for one furnace batch.' },
];
export interface SourceLocation { id: string; name: string; kind: string; x: number; y: number }
/** Conceptual supply map, not actual supplier geography. */
export const LOCATIONS: SourceLocation[] = [
  { id: 'fjord-quarry', name: 'Fjord quarry', kind: 'Quartz deposit → crushed rock', x: 100, y: 90 },
  { id: 'plateau-quarry', name: 'Plateau quarry', kind: 'Quartz deposit → screened chunks', x: 105, y: 335 },
  { id: 'coal-mine', name: 'Overseas mine', kind: 'Mined coal → prepared carbon feed', x: 610, y: 65 },
  { id: 'sawmill', name: 'Valley sawmill', kind: 'Timber processing → wood chips', x: 610, y: 340 },
  { id: 'hydro', name: 'River power station', kind: 'Hydropower → electricity', x: 350, y: 65 },
  { id: 'merchant', name: 'Minerals depot', kind: 'Stocks quartz from Plateau quarry', x: 190, y: 210 },
  { id: 'harbour', name: 'Harbour stockyard', kind: 'Stocks prepared feed from overseas', x: 565, y: 195 },
  { id: 'smelter', name: 'Norway smelter', kind: 'Your workcell', x: 360, y: 285 },
];
export interface Supplier {
  id: string; item: ItemId; name: string; location: string; origin: string;
  role: string; canNegotiate: Terms[];
}
export const SUPPLIERS: Supplier[] = [
  { id: 'fjord', item: 'quartz', name: 'Fjord Quarry', location: 'fjord-quarry', origin: 'fjord-quarry', role: 'Producer. Crushing leaves a mixture of chunks and fines.', canNegotiate: ['screened'] },
  { id: 'nordic', item: 'quartz', name: 'Nordic Minerals', location: 'merchant', origin: 'plateau-quarry', role: 'Merchant. Stocks screened rock from Plateau quarry; does not mine it here.', canNegotiate: ['split'] },
  { id: 'harbour', item: 'coal', name: 'Harbour Coal', location: 'harbour', origin: 'coal-mine', role: 'Stockist. Prepared carbon feed arrives from an overseas mine.', canNegotiate: [] },
  { id: 'sawmill', item: 'woodchips', name: 'Valley Sawmill', location: 'sawmill', origin: 'sawmill', role: 'Producer. Wood chips come from timber processing.', canNegotiate: [] },
  { id: 'hydro', item: 'power', name: 'River Power', location: 'hydro', origin: 'hydro', role: 'Utility. Supplies the workcell through the electricity grid.', canNegotiate: [] },
];
export const supplierFor = (id: string) => SUPPLIERS.find(s => s.id === id);
export const needFor = (id: ItemId) => NEEDS.find(n => n.id === id)!;
export const locationFor = (id: string) => LOCATIONS.find(l => l.id === id)!;
export interface Quote {
  id: string; supplierId: string; item: ItemId; terms: Terms; title: string;
  lot: number; usablePerLot: number; unitPrice: number; setup: number;
  specification: string; sample: string;
}
/** Negotiation changes preparation/pack size, rather than rolling for a discount. */
export function quoteFor(supplierId: string, terms: Terms = 'standard'): Quote {
  const supplier = supplierFor(supplierId);
  if (!supplier || (terms !== 'standard' && !supplier.canNegotiate.includes(terms))) throw new Error('Unavailable supplier terms');
  const base = { id: `${supplierId}:${terms}`, supplierId, item: supplier.item, terms, setup: 0 };
  if (supplierId === 'fjord') return terms === 'screened'
    ? { ...base, title: 'Screen at the quarry', lot: 10, usablePerLot: 10, unitPrice: 28,
      specification: '10 portions of screened quartz chunks per lot.', sample: 'All 10 stay on the screen. The quarry removes fines before packing.' }
    : { ...base, title: 'As-crushed rock', lot: 10, usablePerLot: 6, unitPrice: 18,
      specification: '10 portions of mixed crushed quartz per lot; fines included.', sample: '6 stay on the screen; 4 fall through as fines. Ten bought is only six usable here.' };
  if (supplierId === 'nordic') return terms === 'split'
    ? { ...base, title: 'Split a stock lot', lot: 10, usablePerLot: 10, unitPrice: 24, setup: 30,
      specification: '10 portions of screened quartz; repacking fee per order.', sample: 'All 10 stay on the screen. Same screened material, smaller pack; repacking adds a fee.' }
    : { ...base, title: 'Full stock lot', lot: 25, usablePerLot: 25, unitPrice: 14,
      specification: '25 portions of screened quartz per lot.', sample: 'All 25 meet the size requirement. This merchant sells a large stock lot.' };
  if (supplierId === 'harbour') return { ...base, title: 'Prepared carbon lot', lot: 5, usablePerLot: 5, unitPrice: 12,
    specification: '5 portions of approved prepared carbon feed.', sample: 'The labelled feed matches the workcell specification. Its chemical approval is supplied by the guide.' };
  if (supplierId === 'sawmill') return { ...base, title: 'Prepared chip lot', lot: 3, usablePerLot: 3, unitPrice: 20,
    specification: '3 portions of prepared wood chips.', sample: 'Prepared chips match the charge requirement; this is not a bag of sawdust.' };
  return { ...base, title: 'One-batch supply', lot: 1, usablePerLot: 1, unitPrice: 200,
    specification: 'Grid connection and electricity for one batch; energy included.', sample: 'The utility confirms the connection and one-batch supply. Electricity is a service, not a delivered bag.' };
}
export const quoteCost = (q: Quote, lots: number) => q.lot * q.unitPrice * lots + q.setup;
export interface PurchaseOrder {
  id: string; lotId: string; quote: Quote; lots: number; paid: number;
  inspected: boolean; accepted: number; excluded: number;
}
export interface ProcurementState {
  phase: 'source' | 'work' | 'bill'; visited: string[]; samples: string[];
  negotiated: string[]; orders: PurchaseOrder[]; message: string;
}
export const createProcurementState = (): ProcurementState => ({
  phase: 'source', visited: [], samples: [], negotiated: [], orders: [],
  message: 'The furnace needs chunks, not a bag full of fines. Find the quartz sources on the supply map.',
});
export const totalPaid = (s: ProcurementState) => s.orders.reduce((sum, o) => sum + o.paid, 0);
export const acceptedFor = (s: ProcurementState, item: ItemId) => s.orders.filter(o => o.quote.item === item).reduce((sum, o) => sum + o.accepted, 0);
export const missingFor = (s: ProcurementState, item: ItemId) => Math.max(0, needFor(item).need - acceptedFor(s, item));
export const readyForFurnace = (s: ProcurementState) => s.orders.every(o => o.inspected) && NEEDS.every(n => missingFor(s, n.id) === 0);
export type ProcurementAction =
  | { type: 'visit'; supplierId: string }
  | { type: 'sample'; supplierId: string; terms: Terms }
  | { type: 'negotiate'; supplierId: string; terms: Terms }
  | { type: 'order'; supplierId: string; terms: Terms; lots: number }
  | { type: 'inspect'; orderId: string }
  | { type: 'start' } | { type: 'finish' } | { type: 'retry' };
/** The engine enforces readiness/charging; disabled buttons are not the only guard. */
export function procurementReducer(state: ProcurementState, action: ProcurementAction): ProcurementState {
  if (action.type === 'retry') return state.phase === 'bill' ? createProcurementState() : state;
  if (action.type === 'finish') return state.phase === 'work' ? { ...state, phase: 'bill' } : state;
  if (state.phase !== 'source') return state;
  if (action.type === 'start') return readyForFurnace(state)
    ? { ...state, phase: 'work' }
    : { ...state, message: 'Paid is not ready. Check every receipt and cover the missing usable inputs before loading.' };
  if (action.type === 'inspect') {
    const order = state.orders.find(o => o.id === action.orderId);
    if (!order || order.inspected) return state;
    const accepted = order.quote.usablePerLot * order.lots;
    const excluded = order.quote.lot * order.lots - accepted;
    return { ...state, orders: state.orders.map(o => o.id === order.id ? { ...o, inspected: true, accepted, excluded } : o),
      message: excluded > 0
        ? `${order.lotId}: ${accepted} usable; ${excluded} portions of fines set aside. This matches the mixed-rock order. A cheaper bag supplied fewer furnace chunks.`
        : `${order.lotId}: quantity and agreed specification match. ${accepted} ${needFor(order.quote.item).unit} released to the workcell.` };
  }
  const supplier = supplierFor(action.supplierId);
  if (!supplier) return state;
  if (action.type === 'visit') return { ...state, visited: [...new Set([...state.visited, supplier.id])],
    message: `${supplier.name}: ${supplier.role} Trace the line back to ${locationFor(supplier.origin).name}.` };
  if (!state.visited.includes(supplier.id)) return state;
  if (action.terms !== 'standard' && !supplier.canNegotiate.includes(action.terms)) return state;
  const q = quoteFor(supplier.id, action.terms);
  if (action.type === 'negotiate' && action.terms === 'standard') return state;
  if (action.type === 'negotiate') return { ...state, negotiated: [...new Set([...state.negotiated, q.id])],
    message: action.terms === 'screened'
      ? 'Quarry: We can screen before packing. The price rises, but the entire pack meets your size requirement.'
      : 'Merchant: We can split the lot. You lose the bulk unit price and pay for repacking, but need less cash overall.' };
  if (action.terms !== 'standard' && !state.negotiated.includes(q.id)) return state;
  if (action.type === 'sample') return { ...state, samples: [...new Set([...state.samples, q.id])], message: q.sample };
  if (!state.samples.includes(q.id) || !Number.isInteger(action.lots) || action.lots < 1 || action.lots > 5) return state;
  // A second click on the same unreceived order must not create a second liability.
  if (state.orders.some(o => !o.inspected && o.quote.id === q.id)) return state;
  const id = `PO-${String(state.orders.length + 1).padStart(3, '0')}`;
  const order: PurchaseOrder = { id, lotId: `${id}-${supplier.id.toUpperCase()}`, quote: { ...q }, lots: action.lots,
    paid: quoteCost(q, action.lots), inspected: false, accepted: 0, excluded: 0 };
  return { ...state, orders: [...state.orders, order],
    message: `${id} issued. ${order.paid} credits committed and paid. The receipt waits at the smelter; check it before releasing the input.` };
}
export function procurementBill(state: ProcurementState) {
  return NEEDS.map(n => {
    const orders = state.orders.filter(o => o.quote.item === n.id);
    const accepted = acceptedFor(state, n.id);
    return { ...n, bought: orders.reduce((s, o) => s + o.quote.lot * o.lots, 0), accepted,
      excluded: orders.reduce((s, o) => s + o.excluded, 0),
      used: state.phase === 'bill' ? n.need : 0, leftover: accepted - (state.phase === 'bill' ? n.need : 0),
      paid: orders.reduce((s, o) => s + o.paid, 0) };
  });
}
