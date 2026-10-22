import React, { useEffect, useState } from 'react';
import { ASSETS } from '../content/assets';
import { sound } from '../services/audio';
import { NorwayManufacturing } from './NorwayManufacturing';
import { GuideBox } from './workshop/GuideBox';
import { NORWAY_MARKET as M } from '../content/norwayMarket';
import {
  TradeState, TradeAction, Supplier, Terms, accepted, stockOnHand, siliconInStore, needOf, orderCost, usableOf, missing,
  readyToMake, cashLeft, paidTotal, spares, sparesValue, profit, lessons, bestQuote,
} from '../content/tradeEngine';

interface Props {
  state: TradeState;
  dispatch: (action: TradeAction) => void;
  onReturnToMap: () => void;
  onDone: () => void;
}

const $ = (n: number) => `${n < 0 ? '−' : ''}$${Math.abs(n).toLocaleString('en-US')}`;
const btn = 'rounded-lg border border-white/20 px-2.5 py-1.5 text-xs hover:border-amber-300 disabled:cursor-not-allowed disabled:opacity-30';
const primary = 'w-full rounded-xl bg-amber-300 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40';

/** Coordinates on the supplied map (2752×1536, displayed in a 1376×768 viewBox). */
const PINS: Record<string, { x: number; y: number; label: string }> = {
  smelter: { x: 690, y: 390, label: 'Your smelter' },
  fjord: { x: 220, y: 250, label: 'Fjord Quarry' },
  nordic: { x: 395, y: 350, label: 'Nordic Minerals' },
  hydro: { x: 735, y: 225, label: 'River Power' },
  bulk: { x: 995, y: 340, label: 'Bulk Importer' },
  harbour: { x: 975, y: 445, label: 'Harbour Coal' },
  sawmill: { x: 870, y: 645, label: 'Valley Sawmill' },
  customer: { x: 625, y: 705, label: 'To Germany · customer' },
  alloy: { x: 330, y: 690, label: 'Alloy Foundry' },
  silicones: { x: 1180, y: 600, label: 'Silicone Works' },
};
const SOURCES = {
  'source-plateau': { x: 235, y: 565, label: 'Plateau quarry', sellers: ['nordic'], detail: 'Nordic Minerals buys screened quartz here and stocks it at its depot. The depot is the seller; this quarry is the original source.' },
  'source-overseas': { x: 1200, y: 220, label: 'Overseas coal supply', sellers: ['bulk', 'harbour'], detail: 'Coal is mined abroad and brought to the port. Harbour Coal sells from its stockyard; Bulk Importer sells larger lots at the terminal. This is an overseas connection, not a claimed mine location.' },
};
const ROUTES: Record<string, string> = {
  fjord: 'M220,250 L350,325 L500,365 L690,390',
  nordic: 'M395,350 L560,370 L690,390',
  hydro: 'M735,225 L715,300 L690,390',
  bulk: 'M995,340 L920,385 L830,390 L690,390',
  harbour: 'M975,445 L920,385 L830,390 L690,390',
  sawmill: 'M870,645 L800,560 L755,490 L720,430 L690,390',
  customer: 'M690,390 L680,490 L640,580 L625,705',
  alloy: 'M690,390 L600,520 L450,640 L330,690',
  silicones: 'M690,390 L830,390 L920,385 L1060,500 L1180,600',
};
const PIN_ART: Record<string, string> = { smelter: 'smelter', fjord: 'quarry', nordic: 'trader', hydro: 'power', bulk: 'bulk', harbour: 'harbour', sawmill: 'sawmill', customer: 'customer', alloy: 'customer', silicones: 'customer' };
const CUSTOMERS = ['customer', 'alloy', 'silicones'];

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
function nextStep(s: TradeState) {
  if (s.phase === 'buy') {
    const gate = s.orders.find(o => !o.checked);
    if (gate) return 'A truck is at the gate: check the delivery (right panel).';
    if (s.orders.some(o => o.paid === null)) return 'An invoice is waiting: compare it with your order, then pay or dispute.';
    const need = M.needs.find(n => missing(M, s, n.id) > 0);
    if (need) return `Buy ${missing(M, s, need.id)} more ${need.unit} of ${need.name.toLowerCase()}: click a place marked “needed”`;
    return 'Everything is in: click your smelter.';
  }
  if (s.phase === 'sell') return s.sale.quotes.length ? 'Show Germany your best quote, then sell.' : 'Ask the other customers what they pay, then negotiate with Germany.';
  if (s.phase === 'payment') return 'Germany has paid: compare the payment with your invoice.';
  return 'Done. Check your result, or try Norway again.';
}

function Pin({ id, p, s, open, onOpen }: { id: string; p: { x: number; y: number; label: string }; s: TradeState; open: boolean; onOpen: () => void }) {
  const sup = M.suppliers.find(x => x.id === id);
  const customer = CUSTOMERS.includes(id);
  const size = id === 'smelter' ? 92 : 68;
  const art = ASSETS.supply.pin(PIN_ART[id]);
  const hasArt = useLoaded(art);
  const iconSrc = sup ? ASSETS.supply.icon(ICON[sup.item].art) : customer ? ASSETS.supply.icon('silicon') : '';
  const hasIcon = useLoaded(iconSrc);
  // Second line: what the place is for, plus its status in plain words.
  let sub = sup ? needOf(M, sup.item).name.toLowerCase() : customer ? (id === 'customer' ? 'your customer' : 'other buyer') : 'your smelter';
  if (sup && s.phase === 'buy') sub += s.orders.some(o => o.supplierId === id && o.paid === null) ? ' · at the gate' : missing(M, s, sup.item) > 0 ? ' · needed' : ' · done';
  if (id === 'smelter' && s.phase === 'buy' && readyToMake(M, s)) sub += ' · ready';
  if (customer && id !== 'customer' && s.sale.quotes.includes(id)) sub += ` · quoted $${M.buyer.competitors.find(c => c.id === id)!.quote}`;
  const w = Math.max(p.label.length * 8.6, sub.length * 7.2) + 20;
  return (
    <g transform={`translate(${p.x},${p.y})`} onClick={onOpen} className="cursor-pointer" role="button" tabIndex={0} aria-label={`${p.label}, ${sub}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}>
      {open && <circle r={size / 2 + 4} fill="none" stroke="#f8fafc" strokeWidth="3" opacity="0.9" />}
      {hasArt ? <image href={art} x={-size / 2} y={-size / 2} width={size} height={size} style={{ imageRendering: 'pixelated' }} />
        : <>
          <circle r={size / 2 - 10} fill="#e7e5e4" stroke="#334155" strokeWidth="2" opacity="0.92" />
          {hasIcon ? <image href={iconSrc} x={-size * 0.26} y={-size * 0.26} width={size * 0.52} height={size * 0.52} />
            : <circle r="6" fill="#64748b" />}
        </>}
      <rect x={-w / 2} y={size / 2 + 2} width={w} height="38" rx="4" fill="#0f172a" opacity={open ? 0.92 : 0.72} />
      <text y={size / 2 + 19} textAnchor="middle" fill="#f1f5f9" fontSize="15" fontWeight="600">{p.label}</text>
      <text y={size / 2 + 34} textAnchor="middle" fill="#cbd5e1" fontSize="12">{sub}</text>
    </g>
  );
}
const ICON: Record<string, { art: string; emoji: string }> = {
  silicon: { art: 'silicon', emoji: '🥈' }, quartz: { art: 'quartz', emoji: '🪨' }, carbon: { art: 'carbon', emoji: '⚫' }, chips: { art: 'woodchips', emoji: '🪵' }, power: { art: 'power', emoji: '⚡' },
};

/** What the player is looking at when talking to a supplier. */
function productOf(sup: Supplier, s: TradeState) {
  if (sup.id === 'fjord') return s.terms.fjord.usable < 1 ? 'quartz_crushed' : 'quartz_screened';
  return { nordic: 'quartz_screened', harbour: 'coal_bags', bulk: 'coal_bulk', sawmill: 'woodchips', hydro: 'power' }[sup.id] ?? 'quartz_screened';
}

/** An image file that falls back to a placeholder until the art exists. */
function Art({ src, alt, className, fallback }: { src: string; alt: string; className?: string; fallback: React.ReactNode }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return failedSrc === src ? <>{fallback}</> : <img src={src} alt={alt} onError={() => setFailedSrc(src)} className={`[image-rendering:pixelated] ${className ?? ''}`} />;
}

function ProductView({ id, label }: { id: string; label: string }) {
  const emoji = id.startsWith('quartz') ? (id === 'quartz_sieve' ? '🪨⛏' : '🪨') : id.startsWith('coal') ? '⚫' : id === 'woodchips' ? '🪵' : id === 'power' ? '⚡' : '🥈';
  return (
    <div className={`flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 ${id === 'woodchips' || id === 'power' ? 'bg-white' : id === 'coal_bulk' ? 'bg-[#83929c]' : 'bg-black/30'}`}>
      <Art src={ASSETS.supply.product(id)} alt={label} className="h-full w-full object-contain"
        fallback={<div className="text-center"><p className="text-5xl">{emoji}</p><p className="mt-1 text-xs text-slate-400">{label} (placeholder)</p></div>} />
    </div>
  );
}

function Icon({ item, faded }: { item: string; faded?: boolean }) {
  const i = ICON[item] ?? { art: item, emoji: '▪' };
  return <span className={`inline-flex h-9 w-9 items-center justify-center ${faded ? 'opacity-20 grayscale' : ''}`}>
    <Art src={ASSETS.supply.icon(i.art)} alt="" className="h-9 w-9" fallback={<span className="text-lg">{i.emoji}</span>} />
  </span>;
}

/**
 * Loop 2, Norway. The supplier map is the main screen: click a supplier to see the goods and negotiate,
 * check deliveries and invoices in the store panel, click the smelter to make silicon, click the
 * German customer to sell it. Same engine as before (tradeEngine.ts); no clock.
 */
export function NorwayProcurement({ state: s, dispatch, onReturnToMap, onDone }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const truckArt = useLoaded(ASSETS.supply.truck);
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

  // After the furnace, send the player towards the customer.
  useEffect(() => { if (s.phase === 'payment' || s.phase === 'done') setOpen('customer'); }, [s.phase]);

  if (s.phase === 'make') {
    // The workshop stays exactly as in loop 1 (user decision, 22 October 2026).
    return <NorwayManufacturing onReturnToMap={onReturnToMap} onComplete={() => dispatch({ type: 'made' })} />;
  }

  const cash = cashLeft(M, s);
  const lastOrder = s.orders.at(-1);
  const inbox = s.orders.filter(o => o.paid === null);
  const made = s.phase !== 'buy';

  return (
    <section className="flex h-full flex-col overflow-hidden bg-[#0c1821] text-slate-100 lg:flex-row" aria-label="Norway supplier map">
      {/* Supplier map */}
      <div className="relative min-h-[45svh] min-w-0 flex-1 lg:min-h-0">
        <svg viewBox="0 0 1376 768" preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="group" aria-label="Map of the smelter's suppliers, material origins and customer">
          {mapFailed ? <MapPlaceholder /> : <image href={ASSETS.supply.norwayMap} onError={() => setMapFailed(true)} x="0" y="0" width="1376" height="768" preserveAspectRatio="xMidYMid meet" style={{ imageRendering: 'pixelated' }} />}
          {Object.entries(PINS).filter(([id]) => id !== 'smelter').map(([id, p]) => (
            <path key={id} d={ROUTES[id]} fill="none" stroke={open === id ? '#f8fafc' : '#475569'} strokeWidth={open === id ? 3 : 2} strokeDasharray="5 6" opacity={open === id ? 0.95 : 0.45} />
          ))}
          {Object.entries(SOURCES).map(([id, source]) => <g key={id}>
            {source.sellers.map(seller => <path key={seller} d={`M${source.x},${source.y} L${PINS[seller].x},${PINS[seller].y}`} fill="none" stroke={open === seller || open === id ? '#f8fafc' : '#475569'} strokeWidth="2" strokeDasharray="3 6" opacity={open === seller || open === id ? 0.9 : 0.4} />)}
            <g transform={`translate(${source.x},${source.y})`} role="button" tabIndex={0} aria-label={`Material origin: ${source.label}`} className="cursor-pointer"
              onClick={() => setOpen(id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(id); } }}>
              <circle r="6" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
              <text y="24" textAnchor="middle" fontSize="13" fill="#0f172a" stroke="#f8fafc" strokeWidth="3" paintOrder="stroke">{source.label}</text>
            </g>
          </g>)}
          {lastOrder && lastOrder.paid === null && !lastOrder.checked && (
            <g key={lastOrder.id}>
              {lastOrder.item === 'power' ? <circle r="7" fill="#e7e5e4" stroke="#334155" strokeWidth="2" /> : <>
                {truckArt ? <image href={ASSETS.supply.truck} x="-40" y="-20" width="80" height="40" style={{ imageRendering: 'pixelated' }} />
                  : <rect x="-14" y="-9" width="28" height="18" rx="3" fill="#e7e5e4" stroke="#334155" strokeWidth="2" />}
              </>}
              <animateMotion dur="2.4s" fill="freeze" path={ROUTES[lastOrder.supplierId]} />
            </g>
          )}
          {Object.entries(PINS).map(([id, p]) => <Pin key={id} id={id} p={p} s={s} open={open === id} onOpen={() => { sound.playClick(); setOpen(id); }} />)}
        </svg>

        <div className="absolute left-3 top-3 flex gap-2">
          <button onClick={onReturnToMap} className="rounded-lg border border-white/30 bg-[#0c1821]/90 px-3 py-2 text-xs">← World map</button>
          <p className="rounded-lg border border-white/20 bg-[#0c1821]/85 px-3 py-2 text-sm text-slate-200">Next: {nextStep(s)}</p>
        </div>

        {open && (
          <div className="absolute inset-x-3 bottom-3 top-14 mx-auto max-w-md overflow-y-auto rounded-2xl border-4 border-[#1a0b02] bg-[#13232d] p-4 shadow-[6px_6px_0_#1a0b02] sm:inset-x-auto sm:left-6">
            <button onClick={() => setOpen(null)} className="float-right rounded border border-white/20 px-2 text-sm" aria-label="Close">✕</button>
            {open === 'smelter' ? <SmelterPanel s={s} act={act} />
              : open === 'customer' ? <CustomerPanel s={s} act={act} onDone={onDone} />
              : open === 'alloy' || open === 'silicones' ? <CompetitorPanel id={open} s={s} act={act} />
              : open in SOURCES ? <div className="space-y-3"><h2 className="font-bold">{SOURCES[open as keyof typeof SOURCES].label}</h2><p className="text-sm">{SOURCES[open as keyof typeof SOURCES].detail}</p>
                {SOURCES[open as keyof typeof SOURCES].sellers.map(id => <button className={`${btn} mr-2`} key={id} onClick={() => setOpen(id)}>Visit {PINS[id].label}</button>)}</div>
              : <SupplierPanel key={open} sup={M.suppliers.find(x => x.id === open)!} s={s} act={act} />}
          </div>
        )}
      </div>

      {/* Store panel */}
      <aside className="flex max-h-[50svh] w-full shrink-0 flex-col gap-3 overflow-y-auto border-t-4 border-[#1a0b02] bg-[#0f1e27] p-3 lg:max-h-none lg:w-[340px] lg:border-l-4 lg:border-t-0">
        <p className={`rounded-lg border px-3 py-2 text-center font-mono text-lg font-bold ${cash < 0 ? 'border-red-400 text-red-300' : 'border-white/20'}`}>Cash {$(cash)}</p>
        {s.phase === 'buy' && <button className="rounded-lg border border-sky-400/30 bg-sky-400/5 p-3 text-left text-xs" onClick={() => setOpen('customer')}>
          Germany's opening offer: <b>{$(M.buyer.offer)}</b> for the finished batch. Compare input costs with what you can earn. View customer →
        </button>}
        <section className="rounded-xl border border-white/10 p-3">
          <h2 className="mb-2 text-sm font-bold text-amber-300">Your store</h2>
          {M.needs.map(n => {
            const have = stockOnHand(M, s, n.id);
            const fines = s.orders.filter(o => o.item === n.id && o.checked).reduce((t, o) => t + o.terms.lot * o.lots - usableOf(o), 0);
            return (
              <div key={n.id} className="mb-2">
                <p className="text-xs">{n.name} <span className="text-slate-400">{made ? `${have} ${n.unit} left${s.sale.sparesSold && n.resale > 0 ? ' · spares sold' : ''}` : `${Math.min(have, n.need)}/${n.need} ${n.unit}${have > n.need ? ` · ${have - n.need} spare` : ''}`}</span></p>
                <div className="flex flex-wrap">
                  {Array.from({ length: made ? Math.min(have, 12) : n.need }, (_, i) => <Icon key={i} item={n.id} faded={!made && i >= have} />)}
                  {fines > 0 && <span className="ml-1 inline-flex items-center text-[10px] text-amber-400"><Art src={ASSETS.supply.icon('fines')} alt="" className="h-8 w-8" fallback={<span>░</span>} />×{fines} fines</span>}
                </div>
              </div>
            );
          })}
          {made && <div className="mt-2 border-t border-white/15 pt-2 text-sm">{siliconInStore(s) && <Icon item="silicon" />} {siliconInStore(s) ? '1 batch of silicon metal · ready to sell' : 'Silicon batch sold to Germany'}<p className="mt-1 text-xs text-slate-400">The batch used the required inputs. Only unused stock and excluded fines remain.</p></div>}
        </section>
        {inbox.length > 0 && (
          <section className="space-y-2 rounded-xl border border-amber-300/40 p-3 text-xs">
            <h2 className="text-sm font-bold text-amber-300">At the gate</h2>
            {inbox.map(o => {
              const sup = M.suppliers.find(x => x.id === o.supplierId)!;
              const bought = o.terms.lot * o.lots;
              return (
                <div key={o.id} className="rounded border border-white/10 p-2">
                  <p className="flex items-center gap-1">{o.checked ? <Art src={ASSETS.supply.icon('invoice')} alt="" className="h-7 w-7" fallback={<span>📄</span>} /> : '🚚'} <b>{o.id}</b> {sup.name}: {bought} {needOf(M, o.item).unit}</p>
                  {!o.checked
                    ? <button className={`${btn} mt-1`} onClick={() => act({ type: 'check', orderId: o.id })}>Check the delivery</button>
                    : <>
                      {o.item === 'quartz' && usableOf(o) < bought && <div className="mt-1 w-32"><ProductView id="quartz_sieve" label="Sieve" /></div>}
                      <p className="mt-1">Usable {usableOf(o)} · order said <b>{$(o.expected)}</b> · invoice <b>{$(o.invoice)}</b></p>
                      <div className="mt-1 flex gap-1.5">
                        <button className={btn} onClick={() => act({ type: 'pay', orderId: o.id })}>Pay</button>
                        <button className={btn} onClick={() => act({ type: 'dispute', orderId: o.id })}>Dispute</button>
                      </div>
                    </>}
                </div>
              );
            })}
          </section>
        )}
        <GuideBox name="Sigurd" portrait={ASSETS.norwayGuide.image} line={{ text: s.message, warning: s.phase === 'done' && profit(M, s) < 0 }} asset="norway-chat-box" />
        {s.phase === 'buy' && <button className={primary} disabled={!readyToMake(M, s)} onClick={() => setOpen('smelter')}>{readyToMake(M, s) ? 'Go to the smelter →' : 'Click a supplier to buy'}</button>}
      </aside>
    </section>
  );
}

function SupplierPanel({ sup, s, act }: { sup: Supplier; s: TradeState; act: (a: TradeAction) => void }) {
  const [lots, setLots] = useState(1);
  const [previousTerms, setPreviousTerms] = useState<Terms | null>(null);
  const [reply, setReply] = useState('');
  const t = s.terms[sup.id];
  const n = needOf(M, sup.item);
  const asked = s.asked[sup.id] ?? [];
  const tired = asked.length >= sup.patience;
  const sampled = s.sampled.includes(sup.id);
  const pending = s.orders.some(o => o.supplierId === sup.id && o.paid === null);
  const usable = Math.floor(t.lot * t.usable) * lots;
  const needed = missing(M, s, n.id);
  return (
    <div className="space-y-3">
      <ProductView id={productOf(sup, s)} label={n.name} />
      <div className="flex items-center gap-3">
        <Art src={ASSETS.supply.rep(sup.id)} alt="" className="h-14 w-12 object-contain" fallback={<span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-600 font-bold">{sup.name[0]}</span>} />
        <div><p className="font-bold">{sup.name}</p><p className="text-xs text-slate-400">{sup.origin}</p></div>
      </div>
      <p className="text-xs text-slate-300">You need {missing(M, s, n.id)} more {n.unit} of {n.name.toLowerCase()}.</p>
      <p className="font-mono">{t.lot} {n.unit} × {$(t.unitPrice)}{t.fee ? ` + ${$(t.fee)} fee` : ''} = <b>{$(orderCost(t, 1))}</b></p>
      <p className="text-xs">Usable: {sampled ? `${Math.floor(t.lot * t.usable)} of ${t.lot}` : '? (ask for a sample)'}</p>
      {sampled && sup.item === 'quartz' && <div className="rounded-lg border border-sky-300/25 bg-sky-300/5 p-3" aria-label="Quartz sample result">
        <div className="mb-2 flex flex-wrap items-end gap-1 border-b-4 border-slate-500 pb-1" aria-hidden="true">
          {Array.from({ length: Math.min(t.lot, 25) }, (_, i) => <span key={i} className={i < Math.floor(Math.min(t.lot, 25) * t.usable)
            ? 'h-4 w-4 rotate-12 rounded-sm bg-slate-200' : 'h-1.5 w-1.5 rounded-full bg-amber-500'} />)}
        </div>
        <p className="text-xs text-sky-100">{Math.floor(t.lot * t.usable)} usable chunks · {t.lot - Math.floor(t.lot * t.usable)} fines per lot.</p>
        <p className="mt-1 text-xs text-slate-300">{t.usable < 1 ? 'The small pieces fall through the feed screen. They do not count toward the furnace charge.' : 'Screened chunks meet this charge’s size requirement.'}</p>
      </div>}
      <div className="flex flex-wrap gap-1.5">
        <button className={btn} disabled={sampled || s.phase !== 'buy'} onClick={() => act({ type: 'sample', supplierId: sup.id })}>🔍 Sample</button>
        {sup.levers.map(l => <button key={l.id} className={btn} disabled={asked.includes(l.id) || tired || s.phase !== 'buy'} onClick={() => {
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
          {pending ? 'Order at the gate' : `Order ${$(orderCost(t, lots))}`}
        </button>
      </div>
      <p className="text-xs text-slate-300">This order: {t.lot * lots} {n.unit}, {sampled ? `${Math.floor(t.lot * t.usable) * lots} usable` : 'usable amount untested'}, {$(orderCost(t, lots))} total.</p>
      {sampled && <p className={`rounded-lg p-2 text-xs ${usable < needed ? 'bg-amber-300/10 text-amber-200' : 'bg-emerald-300/10 text-emerald-200'}`}>
        {usable < needed ? `This order leaves you ${needed - usable} ${n.unit} short.` : needed === 0 ? `You already have enough. This adds ${usable} spare ${n.unit}.` : `This covers the remaining need${usable > needed ? ` and adds ${usable - needed} spare ${n.unit}` : ' exactly'}.`}
        {' '}Only checked deliveries count in your store.
      </p>}
    </div>
  );
}

function SmelterPanel({ s, act }: { s: TradeState; act: (a: TradeAction) => void }) {
  const short = M.needs.filter(n => missing(M, s, n.id) > 0);
  return (
    <div className="space-y-3">
      <p className="font-bold">Your smelter</p>
      {s.phase !== 'buy' ? <p className="text-sm">The furnace is done for this loop.</p>
        : short.length ? <p className="text-sm">Still missing: {short.map(n => `${missing(M, s, n.id)} ${n.unit} of ${n.name.toLowerCase()}`).join(', ')}.</p>
        : s.orders.some(o => o.paid === null) ? <p className="text-sm">Everything is in. Settle the invoices at the gate first.</p>
        : <p className="text-sm">Store full, invoices paid. Fire it up!</p>}
      <button className={primary} disabled={s.phase !== 'buy' || !readyToMake(M, s)} onClick={() => act({ type: 'make' })}>Start the furnace</button>
    </div>
  );
}

function CustomerPanel({ s, act, onDone }: { s: TradeState; act: (a: TradeAction) => void; onDone: () => void }) {
  const p = profit(M, s);
  return (
    <div className="space-y-3">
      <ProductView id="silicon" label="Silicon metal" />
      <div className="flex items-center gap-3">
        <Art src={ASSETS.supply.rep('buyer')} alt="" className="h-14 w-12 object-contain" fallback={<span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-700 font-bold">G</span>} />
        <p className="font-bold">{M.buyer.name}</p>
      </div>
      {s.phase === 'buy' && <div className="rounded-lg border border-sky-300/30 bg-sky-300/5 p-3 text-sm">
        <p>“Our opening offer is <b>{$(M.buyer.offer)}</b> for the finished silicon batch.”</p>
        <p className="mt-2 text-slate-300">Inputs paid so far: <b>{$(paidTotal(s))}</b>. Aim to cover all your costs from the sale; unused stock may also be sold back. Negotiate the final sale once the silicon is made.</p>
      </div>}
      {s.phase === 'sell' && <>
        <p className="text-2xl font-bold">offers {$(s.sale.offer)}</p>
        <p className="text-xs text-slate-300">Your inputs cost {$(paidTotal(s))}. Asks left: {Math.max(0, M.buyer.patience - s.sale.asked.length)}.{bestQuote(M, s) ? ` Best other quote: ${$(bestQuote(M, s))}.` : ' Other customers on the map can give you a quote.'}</p>
        <div className="flex flex-wrap gap-1.5">
          {M.buyer.levers.map(l => <button key={l.id} className={btn} disabled={s.sale.asked.includes(l.id) || s.sale.asked.length >= M.buyer.patience} onClick={() => act({ type: 'askBuyer', leverId: l.id })}>
            💬 {l.label}{l.match && bestQuote(M, s) ? ` (${$(bestQuote(M, s))})` : ''}</button>)}
          {spares(M, s).length > 0 && <button className={btn} disabled={s.sale.sparesSold} onClick={() => act({ type: 'sellSpares' })}>{s.sale.sparesSold ? 'Spares sold' : `Sell spares for ${$(sparesValue(M, s))}`}</button>}
        </div>
        <button className={primary} onClick={() => act({ type: 'accept' })}>Sell for {$(s.sale.offer)}</button>
      </>}
      {s.phase === 'payment' && <div className="space-y-2 rounded-lg border border-amber-300/50 bg-amber-300/5 p-3 text-sm">
        <p className="flex items-center gap-2 font-bold"><Art src={ASSETS.supply.icon('invoice')} alt="" className="h-8 w-8" fallback={<span>📄</span>} />Payment received</p>
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
          <tr><td className="py-1 font-sans">Spent on inputs</td><td className="text-right">{$(-paidTotal(s))}</td></tr>
          <tr><td className="py-1 font-sans">Silicon sold (paid)</td><td className="text-right">{$(s.sale.received ?? 0)}</td></tr>
          {s.sale.sparesSold && <tr><td className="py-1 font-sans">Spares sold</td><td className="text-right">{$(sparesValue(M, s))}</td></tr>}
          <tr className="border-t border-white/30 text-lg font-bold"><td className="py-2 font-sans">{p >= 0 ? 'Profit' : 'Your bill'}</td><td className={`text-right ${p >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{$(p)}</td></tr>
        </tbody></table>
        <p className="rounded-lg border border-sky-300/40 bg-sky-300/5 p-3 text-sm">
          <b>The chain:</b> Greta’s plant agreed to pay {$(s.sale.price ?? 0)} for your silicon. In Germany, that is the starting cost of their main input.
          Every stop adds its costs, and the TV’s price at home is the sum of the whole chain.
        </p>
        <ul className="space-y-1 text-sm">{lessons(M, s).map(l => <li key={l}>• {l}</li>)}</ul>
        <button className={primary} onClick={() => act({ type: 'retry' })}>Try Norway again</button>
        <button className="w-full rounded-xl border border-white/20 px-4 py-2 text-sm" onClick={onDone}>Back to the world map</button>
      </>}
    </div>
  );
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

/** Another buyer of silicon metal: gives a quote the player can use with Germany. */
function CompetitorPanel({ id, s, act }: { id: string; s: TradeState; act: (a: TradeAction) => void }) {
  const c = M.buyer.competitors.find(x => x.id === id)!;
  const quoted = s.sale.quotes.includes(id);
  return (
    <div className="space-y-3">
      <ProductView id="silicon" label="Silicon metal" />
      <div><p className="font-bold">{c.name}</p><p className="text-xs text-slate-400">{c.use}</p></div>
      {s.phase === 'buy' && <p className="text-sm">"Make your silicon first, then ask us for a quote."</p>}
      {s.phase === 'sell' && (quoted
        ? <p className="rounded-lg bg-sky-300/10 p-3 text-sm">Quote: <b>{$(c.quote)}</b>. Your chip's route goes through Germany, so use this quote as leverage with Greta's plant.</p>
        : <button className={primary} onClick={() => act({ type: 'getQuote', competitorId: id })}>Ask for a quote</button>)}
      {(s.phase === 'payment' || s.phase === 'done') && <p className="text-sm text-slate-400">You sold to Germany.</p>}
    </div>
  );
}
