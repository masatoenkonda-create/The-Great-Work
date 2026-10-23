import React, { useEffect, useState } from 'react';
import { sound } from '../../services/audio';
import { GuideBox } from '../workshop/GuideBox';
import {
  Market, TradeState, TradeAction, Supplier, Terms, Order, accepted, stockOnHand, siliconInStore, needOf, orderCost, billedUnits, usableOf, missing,
  readyToMake, cashLeft, paidTotal, spares, sparesValue, profit, lessons, bestQuote, unusedMinimum, knowsTerms, demandFirst, isOpen, finesOf, scenarioOf,
} from '../../content/tradeEngine';

/**
 * Loop 2 desk shared by every stop: the supplier map is the main screen, the store panel sits on the
 * right, the factory pin opens the unchanged loop-1 workshop and the customer pin sells the product.
 * Each stop supplies a DeskConfig (map, pins, art, words); the economics stay in tradeEngine.ts.
 */
export interface Place { x: number; y: number; label: string }
export interface DeskConfig {
  market: Market;
  /** Art paths; missing files fall back to placeholders. */
  art: { map: string; truck: string; product: (id: string) => string; icon: (id: string) => string; pin: (id: string) => string; rep: (id: string) => string };
  MapPlaceholder: () => React.ReactElement;
  /** Coordinates in a 1376×768 viewBox. Must include `factory` and `customer`. */
  pins: Record<string, Place>;
  routes: Record<string, string>;
  sources: Record<string, Place & { sellers: string[]; detail: string }>;
  pinArt: Record<string, string>;
  /** Other buyers on the map (competitor ids). */
  competitors: string[];
  icons: Record<string, { art: string; emoji: string }>;
  productOf: (sup: Supplier, s: TradeState) => string;
  productBg: (id: string) => string;
  productEmoji: (id: string) => string;
  /** Suppliers whose delivery comes by wire or pipe: no truck on the road. */
  noTruck: string[];
  factory: { label: string; go: string; start: string; done: string };
  /** Store label for delivered goods that can't be used, e.g. "fines". */
  wasteLabel: string;
  output: { id: string; icon: string; label: string; ready: string; sold: string };
  customerShort: string;
  guide: { name: string; portrait?: string; asset: string };
  ariaLabel: string;
  competitorNote: string;
  chainNote: (price: number) => React.ReactNode;
  carriedIcon?: string;
  /** Optional extras: a picture of the sample, and of the delivery check. */
  sampleExtra?: (sup: Supplier, t: Terms) => React.ReactNode;
  gateExtra?: (o: Order) => React.ReactNode;
  Workshop: (props: { onReturnToMap: () => void; onComplete: () => void }) => React.ReactElement;
}

interface Props {
  config: DeskConfig;
  state: TradeState;
  dispatch: (action: TradeAction) => void;
  onReturnToMap: () => void;
  onDone: () => void;
}

export const $ = (n: number) => `${n < 0 ? '−' : ''}$${Math.abs(n).toLocaleString('en-US')}`;
export const btn = 'rounded-lg border border-white/20 px-2.5 py-1.5 text-xs hover:border-amber-300 disabled:cursor-not-allowed disabled:opacity-30';
const primary = 'w-full rounded-xl bg-amber-300 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40';

/** True once the image has loaded; SVG <image> shows a broken icon otherwise, so it is only drawn when present. */
function useLoaded(src: string) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let live = true; const img = new Image();
    img.onload = () => live && setOk(true); img.onerror = () => live && setOk(false); img.src = src;
    return () => { live = false; };
  }, [src]);
  return ok;
}

/** One line telling the player what to do next. */
function nextStep(c: DeskConfig, s: TradeState) {
  const M = c.market;
  if (s.phase === 'enquiry') {
    if (!s.quoted.length) return `${c.customerShort} wants a price. First ask the suppliers what your inputs cost: click a place marked “no quote yet”.`;
    const unquoted = M.needs.find(n => !M.suppliers.some(x => x.item === n.id && s.quoted.includes(x.id)));
    if (unquoted) return `Ask for a quote on ${unquoted.name.toLowerCase()} too, so you know all your costs.`;
    return s.sale.countered ? `${c.customerShort} named what it can pay: push it with a competing quote, or accept.` : `You know your costs. Quote ${c.customerShort} a price: click ${c.customerShort}.`;
  }
  if (s.phase === 'buy') {
    if (s.orders.some(o => !o.confirmed)) return 'An order confirmation came back: compare it with your order (right panel).';
    const gate = s.orders.find(o => !o.checked);
    if (gate) return c.noTruck.includes(gate.supplierId) ? 'A delivery has come in: check it (right panel).' : 'A truck is at the gate: check the delivery (right panel).';
    if (s.orders.some(o => o.damaged > 0 && o.claim === 'none')) return 'Damaged goods at the gate: claim them or keep them (right panel).';
    if (s.orders.some(o => o.paid === null)) return 'An invoice is waiting: compare it with your order, then pay or dispute.';
    const need = M.needs.find(n => missing(M, s, n.id) > 0);
    if (need) return `Buy ${missing(M, s, need.id)} more ${need.unit} of ${need.name.toLowerCase()}: click a place marked “needed”`;
    return `Everything is in: click ${c.factory.label.toLowerCase()}.`;
  }
  if (s.phase === 'sell' && demandFirst(M)) return `Deliver the batch to ${c.customerShort}: click ${c.customerShort}.`;
  if (s.phase === 'sell') return s.sale.quotes.length ? `Show ${c.customerShort} your best quote, then sell.` : `Ask the other customers what they pay, then negotiate with ${c.customerShort}.`;
  if (s.phase === 'payment') return `${c.customerShort} has paid: compare the payment with your invoice.`;
  return `Done. Check your result, or try ${M.place} again.`;
}

/** An image file that falls back to a placeholder until the art exists. */
export function Art({ src, alt, className, fallback }: { src: string; alt: string; className?: string; fallback: React.ReactNode }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return failedSrc === src ? <>{fallback}</> : <img src={src} alt={alt} onError={() => setFailedSrc(src)} className={`[image-rendering:pixelated] ${className ?? ''}`} />;
}

export function ProductView({ c, id, label }: { c: DeskConfig; id: string; label: string }) {
  return (
    <div className={`flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 ${c.productBg(id)}`}>
      <Art src={c.art.product(id)} alt={label} className="h-full w-full object-contain"
        fallback={<div className="text-center"><p className="text-5xl">{c.productEmoji(id)}</p><p className="mt-1 text-xs text-slate-400">{label} (placeholder)</p></div>} />
    </div>
  );
}

function Icon({ c, item, faded }: { c: DeskConfig; item: string; faded?: boolean }) {
  const i = c.icons[item] ?? { art: item, emoji: '▪' };
  return <span className={`inline-flex h-9 w-9 items-center justify-center ${faded ? 'opacity-20 grayscale' : ''}`}>
    <Art src={c.art.icon(i.art)} alt="" className="h-9 w-9" fallback={<span className="text-lg">{i.emoji}</span>} />
  </span>;
}

function Pin({ c, id, p, s, open, onOpen }: { c: DeskConfig; id: string; p: Place; s: TradeState; open: boolean; onOpen: () => void }) {
  const M = c.market;
  const sup = M.suppliers.find(x => x.id === id);
  const customer = id === 'customer' || c.competitors.includes(id);
  const art = c.art.pin(c.pinArt[id] ?? id);
  const hasArt = useLoaded(art);
  const iconSrc = sup ? c.art.icon(c.icons[sup.item].art) : customer ? c.art.icon(c.output.icon) : '';
  const hasIcon = useLoaded(iconSrc);
  // Second line: what the place is for, plus its status in plain words.
  let sub = sup ? needOf(M, sup.item).name.toLowerCase() : customer ? (id === 'customer' ? 'your customer' : 'other buyer') : c.factory.label.toLowerCase();
  if (sup && !knowsTerms(M, s, id)) sub += ' · no quote yet';
  else if (sup && s.phase === 'enquiry') sub += ' · quoted';
  else if (sup && s.phase === 'buy') sub += s.orders.some(o => o.supplierId === id && isOpen(o)) ? ' · at the gate' : missing(M, s, sup.item) > 0 ? ' · needed' : ' · done';
  if (id === 'customer' && s.phase === 'enquiry') sub += ' · wants a price';
  if (id === 'customer' && s.phase === 'buy' && s.sale.ordered !== null) sub += ` · ordered $${s.sale.ordered}`;
  if (sup?.terms.minimum) sub += ' · contract';
  if (id === 'factory' && s.phase === 'buy' && readyToMake(M, s)) sub += ' · ready';
  if (customer && id !== 'customer' && s.sale.quotes.includes(id)) sub += ` · quoted $${M.buyer.competitors.find(x => x.id === id)!.quote}`;
  const art2 = hasArt ? art : hasIcon ? iconSrc : '';
  const r = id === 'factory' ? 52 : 43;
  const img = hasArt ? r * 1.7 : r * 1.15; // a product marker sits smaller inside its plate
  const labelSize = 18;
  const subSize = 14;
  const w = Math.max(p.label.length * labelSize * 0.62, sub.length * subSize * 0.58) + 30;
  const labelH = 54;
  const edge = open ? '#fde68a' : '#e2e8f0';
  return (
    <g transform={`translate(${p.x},${p.y})`} onClick={onOpen} className="cursor-pointer" role="button" tabIndex={0} aria-label={`${p.label}, ${sub}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}>
      <circle r={r} fill="#09111f" fillOpacity="0.93" stroke="#07101c" strokeWidth={open ? 7 : 6} />
      <circle r={r} fill="#0f172a" fillOpacity="0.35" stroke={edge} strokeWidth={open ? 4 : 3} />
      {art2 ? <image href={art2} x={-img / 2} y={-img / 2} width={img} height={img} style={{ imageRendering: 'pixelated' }} />
        : <circle r="7" fill="#e2e8f0" />}
      <rect x={-w / 2} y={r - 3} width={w} height={labelH} rx={9} fill="#09111f" fillOpacity="0.97" stroke="#07101c" strokeWidth={7} />
      <rect x={-w / 2} y={r - 3} width={w} height={labelH} rx={9} fill="#101d2d" stroke={edge} strokeWidth={open ? 4 : 3} />
      <text y={r + 19} textAnchor="middle" fill="#ffffff" fontSize={labelSize} fontWeight="700" paintOrder="stroke" stroke="#07101c" strokeWidth={1.5}>{p.label}</text>
      <text y={r + 41} textAnchor="middle" fill={/needed|no quote|wants/.test(sub) ? '#fde68a' : '#dbeafe'} fontSize={subSize} fontWeight="600">{sub}</text>
    </g>
  );
}

export function ProcurementDesk({ config: c, state: s, dispatch, onReturnToMap, onDone }: Props) {
  const M = c.market;
  const [open, setOpen] = useState<string | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const truckArt = useLoaded(c.art.truck);
  const act = (a: TradeAction) => { sound.playSelect(); dispatch(a); };

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || s.phase === 'make') return;
      e.preventDefault();
      if (open) setOpen(null); else onReturnToMap();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onReturnToMap, s.phase, open]);

  // After the workshop, send the player towards the customer.
  useEffect(() => { if (s.phase === 'payment' || s.phase === 'done') setOpen('customer'); }, [s.phase]);

  if (s.phase === 'make') {
    // The workshop stays exactly as in loop 1 (user decision L12).
    return <c.Workshop onReturnToMap={onReturnToMap} onComplete={() => dispatch({ type: 'made' })} />;
  }

  const cash = cashLeft(M, s);
  const lastOrder = s.orders.at(-1);
  const inbox = s.orders.filter(isOpen);
  const made = s.phase !== 'buy' && s.phase !== 'enquiry';
  const source = open ? c.sources[open] : undefined;

  return (
    <section className="flex h-full flex-col overflow-hidden bg-slate-900 text-slate-100 lg:flex-row" aria-label={c.ariaLabel}>
      {/* Supplier map */}
      <div className="relative min-h-[45svh] min-w-0 flex-1 lg:min-h-0">
        <svg viewBox="0 0 1376 768" preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="group" aria-label="Map of the factory's suppliers, material origins and customer">
          <g transform={`translate(${(1 - mapZoom) * 688} ${(1 - mapZoom) * 384}) scale(${mapZoom})`}>
          {mapFailed ? <c.MapPlaceholder /> : <image href={c.art.map} onError={() => setMapFailed(true)} x="0" y="0" width="1376" height="768" preserveAspectRatio="xMidYMid meet" style={{ imageRendering: 'pixelated' }} />}
          {Object.keys(c.pins).filter(id => id !== 'factory').map(id => (
            <path key={id} d={c.routes[id]} fill="none" stroke={open === id ? '#f8fafc' : '#475569'} strokeWidth={open === id ? 3 : 2} strokeDasharray="5 6" opacity={open === id ? 0.95 : 0.45} />
          ))}
          {Object.entries(c.sources).map(([id, src]) => <g key={id}>
            {src.sellers.map(seller => <path key={seller} d={`M${src.x},${src.y} L${c.pins[seller].x},${c.pins[seller].y}`} fill="none" stroke={open === seller || open === id ? '#f8fafc' : '#475569'} strokeWidth="2" strokeDasharray="3 6" opacity={open === seller || open === id ? 0.9 : 0.4} />)}
            <g transform={`translate(${src.x},${src.y})`} role="button" tabIndex={0} aria-label={`Material origin: ${src.label}`} className="cursor-pointer"
              onClick={() => setOpen(id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(id); } }}>
              <circle r="9" fill="#0f172a" fillOpacity="0.62" stroke="#e2e8f0" strokeWidth="2" />
              <circle r="3" fill="#e2e8f0" />
              <rect x={-(src.label.length * 3.6 + 10)} y="7" width={src.label.length * 7.2 + 20} height="22" rx="6" fill="#0f172a" fillOpacity="0.8" stroke="#e2e8f0" strokeWidth="1.5" />
              <text y="22" textAnchor="middle" fontSize="12" fontStyle="italic" fill="#e2e8f0">{src.label}</text>
            </g>
          </g>)}
          {lastOrder && lastOrder.confirmed && !lastOrder.checked && (
            <g key={lastOrder.id}>
              {c.noTruck.includes(lastOrder.supplierId) ? <circle r="7" fill="#e7e5e4" stroke="#334155" strokeWidth="2" /> : <>
                {truckArt ? <image href={c.art.truck} x="-40" y="-20" width="80" height="40" style={{ imageRendering: 'pixelated' }} />
                  : <rect x="-14" y="-9" width="28" height="18" rx="3" fill="#e7e5e4" stroke="#334155" strokeWidth="2" />}
              </>}
              <animateMotion dur="2.4s" fill="freeze" path={c.routes[lastOrder.supplierId]} />
            </g>
          )}
          {Object.entries(c.pins).map(([id, p]) => <Pin key={id} c={c} id={id} p={p} s={s} open={open === id} onOpen={() => { sound.playClick(); setOpen(id); }} />)}
          </g>
        </svg>

        <div className="absolute left-3 top-3 flex gap-2">
          <button onClick={onReturnToMap} className="rounded-md border border-white/15 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-200 backdrop-blur-sm hover:bg-slate-900/85">← World map</button>
          <p className="max-w-[min(56vw,700px)] rounded-md border border-white/20 bg-slate-900/90 px-3 py-1.5 text-base font-medium text-white shadow-lg backdrop-blur-sm"><span className="text-amber-200">Next ·</span> {nextStep(c, s)}</p>
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg border border-white/25 bg-slate-950/90 p-1.5 shadow-lg" aria-label="Map zoom controls">
          <button aria-label="Zoom map out" title="Zoom out" onClick={() => setMapZoom(z => Math.max(1, +(z - 0.15).toFixed(2)))} disabled={mapZoom <= 1} className="h-10 w-10 rounded border border-white/20 text-2xl font-semibold leading-none hover:bg-white/10 disabled:opacity-40">−</button>
          <span className="min-w-14 text-center font-mono text-sm font-semibold">{Math.round(mapZoom * 100)}%</span>
          <button aria-label="Zoom map in" title="Zoom in" onClick={() => setMapZoom(z => Math.min(1.6, +(z + 0.15).toFixed(2)))} disabled={mapZoom >= 1.6} className="h-10 w-10 rounded border border-white/20 text-2xl font-semibold leading-none hover:bg-white/10 disabled:opacity-40">+</button>
          <button aria-label="Reset map zoom" title="Reset zoom" onClick={() => setMapZoom(1)} disabled={mapZoom === 1} className="h-10 rounded border border-white/20 px-2 text-xs hover:bg-white/10 disabled:opacity-40">Reset</button>
        </div>

        {open && (
          <div className="absolute inset-x-3 bottom-3 top-14 mx-auto max-w-md overflow-y-auto rounded-xl border border-white/15 bg-slate-900/85 p-4 shadow-2xl backdrop-blur-md sm:inset-x-auto sm:left-6">
            <button onClick={() => setOpen(null)} className="float-right rounded border border-white/20 px-2 text-sm" aria-label="Close">✕</button>
            {open === 'factory' ? <FactoryPanel c={c} s={s} act={act} />
              : open === 'customer' ? <CustomerPanel c={c} s={s} act={act} onDone={onDone} />
              : c.competitors.includes(open) ? <CompetitorPanel c={c} id={open} s={s} act={act} />
              : source ? <div className="space-y-3"><h2 className="font-bold">{source.label}</h2><p className="text-sm">{source.detail}</p>
                {source.sellers.map(id => <button className={`${btn} mr-2`} key={id} onClick={() => setOpen(id)}>Visit {c.pins[id].label}</button>)}</div>
              : <SupplierPanel key={open} c={c} sup={M.suppliers.find(x => x.id === open)!} s={s} act={act} />}
          </div>
        )}
      </div>

      {/* Store panel */}
      <aside className="flex max-h-[50svh] w-full shrink-0 flex-col gap-3 overflow-y-auto border-t border-white/10 bg-slate-900 p-3 lg:max-h-none lg:w-[340px] lg:border-l lg:border-t-0">
        <p className={`rounded-lg border px-3 py-2 text-center font-mono text-lg font-bold ${cash < 0 ? 'border-red-400 text-red-300' : 'border-white/20'}`}>Cash {$(cash)}</p>
        {s.phase === 'enquiry' && <button className="rounded-lg border border-sky-400/30 bg-sky-400/5 p-3 text-left text-xs" onClick={() => setOpen('customer')}>
          {c.customerShort} asks: what would you charge for one batch of {c.output.label.toLowerCase()}? Ask your suppliers first, then quote. Open {c.customerShort} →
        </button>}
        {s.phase === 'buy' && s.sale.ordered !== null && <p className="rounded-lg border border-sky-400/30 bg-sky-400/5 p-3 text-xs">
          {c.customerShort}'s order: <b>1 batch at {$(s.sale.ordered)}</b>. Paid out so far: <b>{$(paidTotal(s) + s.carriedCost)}</b>. Everything you buy has to fit under that price.
        </p>}
        {s.phase === 'buy' && !demandFirst(M) && <button className="rounded-lg border border-sky-400/30 bg-sky-400/5 p-3 text-left text-xs" onClick={() => setOpen('customer')}>
          {c.customerShort}'s opening offer: <b>{$(M.buyer.offer)}</b> for the finished batch. Compare input costs with what you can earn. View customer →
        </button>}
        <section className="rounded-xl border border-white/10 p-3">
          <h2 className="mb-2 text-sm font-bold text-amber-300">Your store</h2>
          {M.carried && !made && <div className="mb-2">
            <p className="text-xs">{M.carried.name} <span className="text-slate-400">1 {M.carried.unit} · from {M.carried.from}, {$(s.carriedCost)}</span></p>
            <Icon c={c} item={c.carriedIcon ?? 'silicon'} />
          </div>}
          {M.needs.map(n => {
            const have = stockOnHand(M, s, n.id);
            const fines = s.orders.filter(o => o.item === n.id && o.checked).reduce((t, o) => t + finesOf(o), 0);
            const damaged = s.orders.filter(o => o.item === n.id && o.checked).reduce((t, o) => t + o.damaged, 0);
            return (
              <div key={n.id} className="mb-2">
                <p className="text-xs">{n.name} <span className="text-slate-400">{made ? `${have} ${n.unit} left${s.sale.sparesSold && n.resale > 0 ? ' · spares sold' : ''}` : `${Math.min(have, n.need)}/${n.need} ${n.unit}${have > n.need ? ` · ${have - n.need} spare` : ''}`}</span></p>
                <div className="flex flex-wrap">
                  {Array.from({ length: made ? Math.min(have, 12) : Math.min(n.need, 12) }, (_, i) => <Icon key={i} c={c} item={n.id} faded={!made && i >= have} />)}
                  {fines > 0 && <span className="ml-1 inline-flex items-center text-[10px] text-amber-400"><Art src={c.art.icon('fines')} alt="" className="h-8 w-8" fallback={<span>░</span>} />×{fines} {c.wasteLabel}</span>}
                  {damaged > 0 && <span className="ml-1 inline-flex items-center text-[10px] text-amber-400">×{damaged} damaged</span>}
                </div>
              </div>
            );
          })}
          {made && <div className="mt-2 border-t border-white/15 pt-2 text-sm">{siliconInStore(s) && <Icon c={c} item={c.output.icon} />} {siliconInStore(s) ? c.output.ready : c.output.sold}<p className="mt-1 text-xs text-slate-400">The batch used the required inputs. Only unused stock and unusable goods remain.</p></div>}
        </section>
        {inbox.length > 0 && (
          <section className="space-y-2 rounded-xl border border-amber-300/40 p-3 text-xs">
            <h2 className="text-sm font-bold text-amber-300">At the gate</h2>
            {inbox.map(o => {
              const sup = M.suppliers.find(x => x.id === o.supplierId)!;
              const bought = o.terms.lot * o.lots;
              const unit = needOf(M, o.item).unit;
              return (
                <div key={o.id} className="rounded border border-white/10 p-2">
                  <p className="flex items-center gap-1">{o.checked ? <Art src={c.art.icon('invoice')} alt="" className="h-7 w-7" fallback={<span>📄</span>} /> : c.noTruck.includes(o.supplierId) ? '🔌' : '🚚'} <b>{o.id}</b> {sup.name}: {bought} {unit}</p>
                  {!o.confirmed ? <>
                    <p className="mt-1">Order confirmation · your order said <b>{$(o.expected)}</b> · confirmation <b>{$(o.confirmation)}</b></p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <button className={btn} onClick={() => act({ type: 'acceptConfirmation', orderId: o.id })}>Accept</button>
                      <button className={btn} onClick={() => act({ type: 'rejectConfirmation', orderId: o.id })}>Reject: hold them to the order</button>
                    </div>
                  </> : !o.checked ? <>
                    {o.prepaid && <p className="mt-1 text-slate-300">Paid in advance: {$(o.paid ?? 0)}.</p>}
                    <button className={`${btn} mt-1`} onClick={() => act({ type: 'check', orderId: o.id })}>Check the delivery</button>
                  </> : <>
                    {c.gateExtra?.(o)}
                    {o.damaged > 0 && o.claim === 'none' && <>
                      <p className="mt-1">Usable {usableOf(o)} · <b>{o.damaged} damaged</b>{o.prepaid ? ` · paid in advance ${$(o.paid ?? 0)}` : ''}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <button className={btn} onClick={() => act({ type: 'claim', orderId: o.id })}>Claim the damaged {unit}</button>
                        <button className={btn} onClick={() => act({ type: 'keep', orderId: o.id })}>Keep them</button>
                      </div>
                    </>}
                    {o.paid === null && <>
                      <p className="mt-1">{unusedMinimum(o) > 0 ? `Taken ${o.terms.lot * o.lots} · minimum ${o.terms.minimum} · billed ${billedUnits(o.terms, o.lots)}` : `Usable ${usableOf(o)}`} · order said <b>{$(o.expected)}</b> · invoice <b>{$(o.invoice)}</b></p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <button className={btn} onClick={() => act({ type: 'pay', orderId: o.id })}>Pay</button>
                        <button className={btn} onClick={() => act({ type: 'dispute', orderId: o.id })}>Dispute</button>
                        {demandFirst(M) && finesOf(o) > 0 && o.claim === 'none' && <button className={btn} onClick={() => act({ type: 'claim', orderId: o.id })}>Claim the unusable {unit}</button>}
                      </div>
                    </>}
                  </>}
                </div>
              );
            })}
          </section>
        )}
        <GuideBox name={c.guide.name} portrait={c.guide.portrait} line={{ text: s.message, warning: s.phase === 'done' && profit(M, s) < 0, speaker: s.speaker }} asset={c.guide.asset} />
        {s.phase === 'buy' && <button className={primary} disabled={!readyToMake(M, s)} onClick={() => setOpen('factory')}>{readyToMake(M, s) ? c.factory.go : 'Click a supplier to buy'}</button>}
        {import.meta.env.DEV && s.scenario && <p className="text-[10px] text-slate-500">dev · scenario: {scenarioOf(M, s)?.name}</p>}
      </aside>
    </section>
  );
}

function SupplierPanel({ c, sup, s, act }: { c: DeskConfig; sup: Supplier; s: TradeState; act: (a: TradeAction) => void }) {
  const M = c.market;
  const [lots, setLots] = useState(1);
  const [previousTerms, setPreviousTerms] = useState<Terms | null>(null);
  const [reply, setReply] = useState('');
  const t = s.terms[sup.id];
  const n = needOf(M, sup.item);
  const asked = s.asked[sup.id] ?? [];
  const tired = asked.length >= sup.patience;
  const sampled = s.sampled.includes(sup.id);
  const mine = s.orders.filter(o => o.supplierId === sup.id);
  const pending = mine.some(isOpen);
  const talking = s.phase === 'buy' || s.phase === 'enquiry';
  const usable = Math.floor(t.lot * t.usable) * lots;
  const needed = missing(M, s, n.id);
  const check = sup.spec ? 'read the spec sheet' : 'ask for a sample';
  const contract = !!t.minimum;
  const billed = billedUnits(t, lots);
  const header = <>
    <ProductView c={c} id={c.productOf(sup, s)} label={n.name} />
    <div className="flex items-center gap-3">
      <Art src={c.art.rep(sup.id)} alt="" className="h-14 w-12 object-contain" fallback={<span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-600 font-bold">{sup.name[0]}</span>} />
      <div><p className="font-bold">{sup.name}</p><p className="text-xs text-slate-400">{sup.origin}</p></div>
    </div>
  </>;
  if (!knowsTerms(M, s, sup.id)) return (
    <div className="space-y-3">
      {header}
      <p className="text-sm">No quote yet. Ask what they charge, in what lots, and on what terms.</p>
      <button className={primary} disabled={!talking} onClick={() => act({ type: 'rfq', supplierId: sup.id })}>Ask for a quote</button>
    </div>
  );
  return (
    <div className="space-y-3">
      {header}
      {demandFirst(M) && sup.quoteReply && <p className="rounded-lg border border-white/10 bg-white/5 p-2 text-xs italic text-slate-200">Their quote: “{sup.quoteReply}”</p>}
      {mine.length > 0 && <ul className="space-y-0.5 text-xs text-slate-300" aria-label={`Your paperwork with ${sup.name}`}>{mine.map(o => <li key={o.id}>📄 {threadLine(o)}</li>)}</ul>}
      <p className="text-xs text-slate-300">You need {missing(M, s, n.id)} more {n.unit} of {n.name.toLowerCase()}.</p>
      <p className="font-mono">{billedUnits(t, 1)} {n.unit}{contract ? ' billed' : ''} × {$(t.unitPrice)}{t.fee ? ` + ${$(t.fee)} fee` : ''} = <b>{$(orderCost(t, 1))}</b></p>
      {contract && <p className="rounded-lg border border-amber-300/40 bg-amber-300/5 p-2 text-xs text-amber-100">
        Contract: each order bills at least <b>{t.minimum} {n.unit}</b> at {$(t.unitPrice)}, even if you take fewer. What you don't take is never delivered and can't be sold back.
      </p>}
      {sup.prepay && <p className="rounded-lg border border-amber-300/40 bg-amber-300/5 p-2 text-xs text-amber-100">Payment before loading: you pay when you order, before you can check the goods.</p>}
      <p className="text-xs">{sup.spec ? `Spec sheet: ${sampled ? sup.spec : '? (read it before you buy)'}` : `Usable: ${sampled ? `${Math.floor(t.lot * t.usable)} of ${t.lot}` : '? (ask for a sample)'}`}</p>
      {sampled && c.sampleExtra?.(sup, t)}
      <div className="flex flex-wrap gap-1.5">
        <button className={btn} disabled={sampled || !talking} onClick={() => act({ type: 'sample', supplierId: sup.id })}>{sup.spec ? '📄 Read the spec sheet' : '🔍 Sample'}</button>
        {sup.levers.map(l => <button key={l.id} className={btn} disabled={asked.includes(l.id) || tired || !talking} onClick={() => {
          setPreviousTerms({ ...t }); setReply(l.reply); act({ type: 'ask', supplierId: sup.id, leverId: l.id });
        }}>💬 {l.label}</button>)}
      </div>
      {previousTerms && <div className="rounded-lg border border-amber-300/40 bg-amber-300/5 p-3 text-xs" aria-live="polite">
        <p className="mb-2 font-medium text-amber-200">“{reply}”</p>
        <table className="w-full text-left"><thead><tr><th>Per lot / order</th><th>Before</th><th>Now</th></tr></thead><tbody>
          <tr><td>Lot size</td><td>{previousTerms.lot} {n.unit}</td><td>{t.lot} {n.unit}</td></tr>
          <tr><td>Unit price</td><td>{$(previousTerms.unitPrice)}</td><td>{$(t.unitPrice)}</td></tr>
          <tr><td>Order fee</td><td>{$(previousTerms.fee)}</td><td>{$(t.fee)}</td></tr>
          <tr className="border-t border-white/20 font-bold"><td>One-lot total</td><td>{$(orderCost(previousTerms, 1))}</td><td>{$(orderCost(t, 1))}</td></tr>
        </tbody></table>
      </div>}
      <div className="flex items-center gap-1.5">
        <button className={btn} disabled={lots <= 1} onClick={() => setLots(lots - 1)}>−</button>
        <span className="w-14 text-center text-xs">{lots} lot{lots > 1 ? 's' : ''}</span>
        <button className={btn} disabled={lots >= 3} onClick={() => setLots(lots + 1)}>+</button>
        <button className={`${btn} ml-auto bg-amber-300 font-bold text-slate-950`} disabled={pending || s.phase !== 'buy'} onClick={() => act({ type: 'order', supplierId: sup.id, lots })}>
          {pending ? 'Order at the gate' : `${contract ? 'Sign and order' : sup.prepay ? 'Pay and order' : 'Order'} ${$(orderCost(t, lots))}`}
        </button>
      </div>
      {s.phase === 'enquiry' && <p className="text-xs text-amber-200">You can order once {c.customerShort} has ordered from you.</p>}
      <p className="text-xs text-slate-300">This order: {t.lot * lots} {n.unit}{billed > t.lot * lots ? ` delivered, ${billed} billed (the minimum)` : ''}, {sampled ? `${usable} usable` : `usable amount untested (${check})`}, {$(orderCost(t, lots))} total.</p>
      {sampled && <p className={`rounded-lg p-2 text-xs ${usable < needed ? 'bg-amber-300/10 text-amber-200' : 'bg-emerald-300/10 text-emerald-200'}`}>
        {usable < needed ? `This order leaves you ${needed - usable} ${n.unit} short.` : needed === 0 ? `You already have enough. This adds ${usable} spare ${n.unit}.` : `This covers the remaining need${usable > needed ? ` and adds ${usable - needed} spare ${n.unit}` : ' exactly'}.`}
        {' '}Only checked deliveries count in your store.
      </p>}
    </div>
  );
}

/** One line per purchase order with this supplier: what was ordered, confirmed, delivered, claimed and paid. */
function threadLine(o: Order) {
  const parts = [`${o.id}: ordered ${$(o.ordered)}`];
  if (!o.confirmed) parts.push(`confirmation says ${$(o.confirmation)}, to check`);
  else if (o.changed) parts.push(o.changed === 'accepted' ? `higher confirmation accepted (${$(o.confirmation)})` : 'higher confirmation rejected');
  if (o.prepaid && o.paid !== null) parts.push(`paid in advance ${$(o.paid)}`);
  if (o.checked) parts.push(`${usableOf(o)} usable${o.damaged ? `, ${o.damaged} damaged` : ''}`);
  if (o.claim === 'credited') parts.push(`credit note ${$(o.credit)}`);
  if (o.claim === 'refused') parts.push('claim refused');
  if (!o.prepaid && o.paid !== null) parts.push(`paid ${$(o.paid)}`);
  return parts.join(' · ');
}

function FactoryPanel({ c, s, act }: { c: DeskConfig; s: TradeState; act: (a: TradeAction) => void }) {
  const M = c.market;
  const short = M.needs.filter(n => missing(M, s, n.id) > 0);
  return (
    <div className="space-y-3">
      <p className="font-bold">{c.factory.label}</p>
      {s.phase === 'enquiry' ? <p className="text-sm">First agree a price with {c.customerShort}, then buy what the furnace needs.</p>
        : s.phase !== 'buy' ? <p className="text-sm">{c.factory.done}</p>
        : short.length ? <p className="text-sm">Still missing: {short.map(n => `${missing(M, s, n.id)} ${n.unit} of ${n.name.toLowerCase()}`).join(', ')}.</p>
        : s.orders.some(o => o.paid === null) ? <p className="text-sm">Everything is in. Settle the invoices at the gate first.</p>
        : <p className="text-sm">Store full, invoices paid. Fire it up!</p>}
      <button className={primary} disabled={s.phase !== 'buy' || !readyToMake(M, s)} onClick={() => act({ type: 'make' })}>{c.factory.start}</button>
    </div>
  );
}

function CustomerPanel({ c, s, act, onDone }: { c: DeskConfig; s: TradeState; act: (a: TradeAction) => void; onDone: () => void }) {
  const M = c.market;
  const p = profit(M, s);
  const costs = paidTotal(s) + s.carriedCost;
  const carried = M.carried ? `${M.carried.name.toLowerCase()} ${$(s.carriedCost)} + ` : '';
  const [quote, setQuote] = useState(600);
  const first = demandFirst(M);
  // The cheapest one-lot offer quoted so far for each input: a rough cost before samples and haggling.
  const cheapest = M.needs.map(n => {
    const offers = M.suppliers.filter(x => x.item === n.id && s.quoted.includes(x.id)).map(x => ({ x, cost: orderCost(s.terms[x.id], 1) }));
    return { n, best: offers.sort((a, b) => a.cost - b.cost)[0] };
  });
  return (
    <div className="space-y-3">
      <ProductView c={c} id={c.output.id} label={c.output.label} />
      <div className="flex items-center gap-3">
        <Art src={c.art.rep('buyer')} alt="" className="h-14 w-12 object-contain" fallback={<span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-700 font-bold">{M.buyer.name[0]}</span>} />
        <p className="font-bold">{M.buyer.name}</p>
      </div>
      {s.phase === 'enquiry' && <div className="space-y-3 text-sm">
        <p className="rounded-lg border border-sky-300/30 bg-sky-300/5 p-3">“We need one batch of {c.output.label.toLowerCase()}. What would you charge?”</p>
        <div className="rounded-lg border border-white/10 p-3 text-xs">
          <p className="mb-1 font-bold text-slate-200">Your costs, from the quotes you have (one lot each, before samples and haggling)</p>
          <ul className="space-y-0.5 font-mono">{cheapest.map(({ n, best }) => <li key={n.id}>{n.name}: {best ? `${$(best.cost)} · ${best.x.name}` : 'no quote yet'}</li>)}</ul>
          {M.carried && <p className="font-mono">{M.carried.name}: {$(s.carriedCost)}</p>}
          <p className="mt-1 font-mono font-bold">Total so far: {$(s.carriedCost + cheapest.reduce((t, x) => t + (x.best?.cost ?? 0), 0))}{cheapest.some(x => !x.best) ? ' + inputs not quoted yet' : ''}</p>
        </div>
        {s.sale.countered && <>
          <p className="rounded-lg border border-sky-300/30 bg-sky-300/5 p-3">“We can pay <b>{$(s.sale.offer)}</b>.” <span className="text-xs text-slate-300">Asks left: {Math.max(0, M.buyer.patience - s.sale.asked.length)}.{bestQuote(M, s) ? ` Best other quote: ${$(bestQuote(M, s))}.` : ' Other buyers on the map can give you a quote.'}</span></p>
          <div className="flex flex-wrap gap-1.5">
            {M.buyer.levers.map(l => <button key={l.id} className={btn} disabled={s.sale.asked.includes(l.id) || s.sale.asked.length >= M.buyer.patience} onClick={() => act({ type: 'askBuyer', leverId: l.id })}>
              💬 {l.label}{l.match && bestQuote(M, s) ? ` (${$(bestQuote(M, s))})` : ''}</button>)}
            <button className={btn} onClick={() => act({ type: 'acceptOffer' })}>Accept {$(s.sale.offer)}</button>
          </div>
        </>}
        <div className="flex items-center gap-1.5">
          <button className={btn} disabled={quote <= 300} onClick={() => setQuote(quote - 10)} aria-label="Lower your price">−</button>
          <span className="w-20 text-center font-mono text-lg font-bold">{$(quote)}</span>
          <button className={btn} disabled={quote >= 900} onClick={() => setQuote(quote + 10)} aria-label="Raise your price">+</button>
          <button className={`${btn} ml-auto bg-amber-300 font-bold text-slate-950`} onClick={() => act({ type: 'quoteCustomer', price: quote })}>Send quote {$(quote)}</button>
        </div>
        <p className="text-xs text-slate-400">Once {c.customerShort} orders, the price is fixed. Then you buy, make and deliver.</p>
      </div>}
      {s.phase === 'buy' && first && <p className="rounded-lg border border-sky-300/30 bg-sky-300/5 p-3 text-sm">Order: one batch at <b>{$(s.sale.ordered ?? 0)}</b>. Deliver it after the furnace. Costs so far: {carried}inputs {$(paidTotal(s))} = <b>{$(costs)}</b>.</p>}
      {s.phase === 'sell' && first && <>
        <p className="text-sm">Ordered at <b>{$(s.sale.ordered ?? 0)}</b>. Your costs: {$(costs)}.</p>
        {spares(M, s).length > 0 && <button className={btn} disabled={s.sale.sparesSold} onClick={() => act({ type: 'sellSpares' })}>{s.sale.sparesSold ? 'Spares sold' : `Sell spares for ${$(sparesValue(M, s))}`}</button>}
        <button className={primary} onClick={() => act({ type: 'accept' })}>Deliver and send your invoice ({$(s.sale.ordered ?? 0)})</button>
      </>}
      {s.phase === 'buy' && !first && <div className="rounded-lg border border-sky-300/30 bg-sky-300/5 p-3 text-sm">
        <p>“Our opening offer is <b>{$(M.buyer.offer)}</b> for the finished batch.”</p>
        <p className="mt-2 text-slate-300">{M.carried ? <>Costs so far: {carried}inputs {$(paidTotal(s))} = <b>{$(costs)}</b>.</> : <>Inputs paid so far: <b>{$(paidTotal(s))}</b>.</>} Aim to cover all your costs from the sale; unused stock may also be sold back. Negotiate the final sale once the batch is made.</p>
      </div>}
      {s.phase === 'sell' && !first && <>
        <p className="text-2xl font-bold">offers {$(s.sale.offer)}</p>
        <p className="text-xs text-slate-300">Your costs: {$(costs)}. Asks left: {Math.max(0, M.buyer.patience - s.sale.asked.length)}.{bestQuote(M, s) ? ` Best other quote: ${$(bestQuote(M, s))}.` : ' Other customers on the map can give you a quote.'}</p>
        <div className="flex flex-wrap gap-1.5">
          {M.buyer.levers.map(l => <button key={l.id} className={btn} disabled={s.sale.asked.includes(l.id) || s.sale.asked.length >= M.buyer.patience} onClick={() => act({ type: 'askBuyer', leverId: l.id })}>
            💬 {l.label}{l.match && bestQuote(M, s) ? ` (${$(bestQuote(M, s))})` : ''}</button>)}
          {spares(M, s).length > 0 && <button className={btn} disabled={s.sale.sparesSold} onClick={() => act({ type: 'sellSpares' })}>{s.sale.sparesSold ? 'Spares sold' : `Sell spares for ${$(sparesValue(M, s))}`}</button>}
        </div>
        <button className={primary} onClick={() => act({ type: 'accept' })}>Sell for {$(s.sale.offer)}</button>
      </>}
      {s.phase === 'payment' && <div className="space-y-2 rounded-lg border border-amber-300/50 bg-amber-300/5 p-3 text-sm">
        <p className="flex items-center gap-2 font-bold"><Art src={c.art.icon('invoice')} alt="" className="h-8 w-8" fallback={<span>📄</span>} />Payment received</p>
        <table className="w-full font-mono"><tbody>
          <tr><td className="font-sans">Your invoice</td><td className="text-right">{$(s.sale.price ?? 0)}</td></tr>
          <tr><td className="font-sans">Money in your bank</td><td className="text-right">{$(s.sale.received ?? 0)}</td></tr>
        </tbody></table>
        <div className="flex gap-2">
          <button className={btn} onClick={() => act({ type: 'takePayment' })}>Accept the payment</button>
          <button className={btn} onClick={() => act({ type: 'chasePayment' })}>Chase the difference</button>
        </div>
      </div>}
      {s.phase === 'done' && <>
        <table className="w-full font-mono text-sm"><tbody>
          {M.carried && <tr><td className="py-1 font-sans">{M.carried.name} from {M.carried.from}</td><td className="text-right">{$(-s.carriedCost)}</td></tr>}
          <tr><td className="py-1 font-sans">Spent on {M.carried ? 'other ' : ''}inputs</td><td className="text-right">{$(-paidTotal(s))}</td></tr>
          <tr><td className="py-1 font-sans">{c.output.label} sold (paid)</td><td className="text-right">{$(s.sale.received ?? 0)}</td></tr>
          {s.sale.sparesSold && <tr><td className="py-1 font-sans">Spares sold</td><td className="text-right">{$(sparesValue(M, s))}</td></tr>}
          <tr className="border-t border-white/30 text-lg font-bold"><td className="py-2 font-sans">{p >= 0 ? 'Profit' : 'Your bill'}</td><td className={`text-right ${p >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{$(p)}</td></tr>
        </tbody></table>
        <p className="rounded-lg border border-sky-300/40 bg-sky-300/5 p-3 text-sm">{c.chainNote(s.sale.price ?? 0)}</p>
        <ul className="space-y-1 text-sm">{lessons(M, s).map(l => <li key={l}>• {l}</li>)}</ul>
        <button className={primary} onClick={() => act({ type: 'retry' })}>Try {M.place} again</button>
        <button className="w-full rounded-xl border border-white/20 px-4 py-2 text-sm" onClick={onDone}>Back to the world map</button>
      </>}
    </div>
  );
}

/** Another possible buyer: gives a quote the player can use with the real customer. */
function CompetitorPanel({ c, id, s, act }: { c: DeskConfig; id: string; s: TradeState; act: (a: TradeAction) => void }) {
  const x = c.market.buyer.competitors.find(y => y.id === id)!;
  const quoted = s.sale.quotes.includes(id);
  const quoting = demandFirst(c.market) ? s.phase === 'enquiry' : s.phase === 'sell';
  return (
    <div className="space-y-3">
      <ProductView c={c} id={c.output.id} label={c.output.label} />
      <div><p className="font-bold">{x.name}</p><p className="text-xs text-slate-400">{x.use}</p></div>
      {s.phase === 'buy' && !demandFirst(c.market) && <p className="text-sm">"Make your batch first, then ask us for a quote."</p>}
      {quoted && !quoting && s.phase !== 'payment' && s.phase !== 'done' && <p className="text-sm text-slate-400">Their quote was {$(x.quote)}. You are selling to {c.customerShort}.</p>}
      {quoting && (quoted
        ? <p className="rounded-lg bg-sky-300/10 p-3 text-sm">Quote: <b>{$(x.quote)}</b>. {c.competitorNote}</p>
        : <button className={primary} onClick={() => act({ type: 'getQuote', competitorId: id })}>Ask for a quote</button>)}
      {(s.phase === 'payment' || s.phase === 'done') && <p className="text-sm text-slate-400">You sold to {c.customerShort}.</p>}
    </div>
  );
}
