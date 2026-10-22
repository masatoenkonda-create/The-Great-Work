import React, { useEffect, useState } from 'react';
import { ASSETS } from '../content/assets';
import { sound } from '../services/audio';
import { NorwayManufacturing } from './NorwayManufacturing';
import { GuideBox } from './workshop/GuideBox';
import { NORWAY_MARKET as M } from '../content/norwayMarket';
import {
  TradeState, TradeAction, Supplier, accepted, needOf, orderCost, usableOf, missing,
  readyToMake, cashLeft, paidTotal, spares, sparesValue, profit, lessons,
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

/** Pin positions on the 1376×768 supplier map; x stays under 1000 because the store panel covers the right. */
const PINS: Record<string, { x: number; y: number; label: string }> = {
  smelter: { x: 500, y: 410, label: 'Your smelter' },
  fjord: { x: 170, y: 150, label: 'Fjord Quarry' },
  nordic: { x: 190, y: 420, label: 'Nordic Minerals' },
  hydro: { x: 520, y: 120, label: 'River Power' },
  bulk: { x: 880, y: 170, label: 'Bulk Importer' },
  harbour: { x: 860, y: 380, label: 'Harbour Coal' },
  sawmill: { x: 790, y: 620, label: 'Valley Sawmill' },
  customer: { x: 470, y: 690, label: 'Germany · customer' },
};
const PIN_ART: Record<string, string> = { smelter: 'smelter', fjord: 'quarry', nordic: 'trader', hydro: 'power', bulk: 'bulk', harbour: 'harbour', sawmill: 'sawmill', customer: 'customer' };
const ICON: Record<string, { art: string; emoji: string }> = {
  quartz: { art: 'quartz', emoji: '🪨' }, carbon: { art: 'carbon', emoji: '⚫' }, chips: { art: 'woodchips', emoji: '🪵' }, power: { art: 'power', emoji: '⚡' },
};

/** What the player is looking at when talking to a supplier. */
function productOf(sup: Supplier, s: TradeState) {
  if (sup.id === 'fjord') return s.terms.fjord.usable < 1 ? 'quartz_crushed' : 'quartz_screened';
  return { nordic: 'quartz_screened', harbour: 'coal_bags', bulk: 'coal_bulk', sawmill: 'woodchips', hydro: 'power' }[sup.id] ?? 'quartz_screened';
}

/** An image file that falls back to a placeholder until the art exists. */
function Art({ src, alt, className, fallback }: { src: string; alt: string; className?: string; fallback: React.ReactNode }) {
  const [failed, setFailed] = useState(false);
  return failed ? <>{fallback}</> : <img src={src} alt={alt} onError={() => setFailed(true)} className={`[image-rendering:pixelated] ${className ?? ''}`} />;
}

function ProductView({ id, label }: { id: string; label: string }) {
  const emoji = id.startsWith('quartz') ? (id === 'quartz_sieve' ? '🪨⛏' : '🪨') : id.startsWith('coal') ? '⚫' : id === 'woodchips' ? '🪵' : id === 'power' ? '⚡' : '🥈';
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/30">
      <Art src={ASSETS.supply.product(id)} alt={label} className="h-full w-full object-contain"
        fallback={<div className="text-center"><p className="text-5xl">{emoji}</p><p className="mt-1 text-xs text-slate-400">{label} (placeholder)</p></div>} />
    </div>
  );
}

function Icon({ item, faded }: { item: string; faded?: boolean }) {
  const i = ICON[item] ?? { art: item, emoji: '▪' };
  return <span className={`inline-flex h-6 w-6 items-center justify-center ${faded ? 'opacity-25 grayscale' : ''}`}>
    <Art src={ASSETS.supply.icon(i.art)} alt="" className="h-6 w-6" fallback={<span className="text-sm">{i.emoji}</span>} />
  </span>;
}

/**
 * Loop 2, Norway. The supplier map is the main screen: click a supplier to see the goods and negotiate,
 * check deliveries and invoices in the store panel, click the smelter to make silicon, click the
 * German customer to sell it. Same engine as before (tradeEngine.ts); no clock.
 */
export function NorwayProcurement({ state: s, dispatch, onReturnToMap, onDone }: Props) {
  const [open, setOpen] = useState<string | null>(null);
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
  useEffect(() => { if (s.phase === 'sell' || s.phase === 'done') setOpen('customer'); }, [s.phase]);

  if (s.phase === 'make') {
    // The workshop stays exactly as in loop 1 (user decision, 22 October 2026).
    return <NorwayManufacturing onReturnToMap={onReturnToMap} onComplete={() => dispatch({ type: 'made' })} />;
  }

  const cash = cashLeft(M, s);
  const lastOrder = s.orders.at(-1);
  const inbox = s.orders.filter(o => o.paid === null);

  return (
    <section className="flex h-full overflow-hidden bg-[#0c1821] text-slate-100" aria-label="Norway supplier map">
      {/* Supplier map */}
      <div className="relative min-w-0 flex-1">
        <svg viewBox="0 0 1000 768" preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="img" aria-label="Map of the smelter's suppliers and its customer">
          <MapPlaceholder />
          <image href={ASSETS.supply.norwayMap} x="0" y="0" width="1376" height="768" preserveAspectRatio="none" style={{ imageRendering: 'pixelated' }} />
          {Object.entries(PINS).filter(([id]) => id !== 'smelter').map(([id, p]) => (
            <line key={id} x1={p.x} y1={p.y} x2={PINS.smelter.x} y2={PINS.smelter.y} stroke={open === id ? '#fcd34d' : '#7c5a3a'} strokeWidth={open === id ? 6 : 4} strokeDasharray="10 8" />
          ))}
          {lastOrder && lastOrder.paid === null && !lastOrder.checked && (
            <g key={lastOrder.id}>
              <rect x="-18" y="-10" width="36" height="20" rx="3" fill="#f59e0b" stroke="#1a0b02" strokeWidth="3" />
              <image href={ASSETS.supply.truck} x="-32" y="-16" width="64" height="32" style={{ imageRendering: 'pixelated' }} />
              <animateMotion dur="1.6s" fill="freeze" path={`M${PINS[lastOrder.supplierId].x},${PINS[lastOrder.supplierId].y} L${PINS.smelter.x},${PINS.smelter.y + 40}`} />
            </g>
          )}
          {Object.entries(PINS).map(([id, p]) => {
            const size = id === 'smelter' ? 96 : 64;
            return (
              <g key={id} transform={`translate(${p.x},${p.y})`} onClick={() => { sound.playClick(); setOpen(id); }} className="cursor-pointer" role="button" aria-label={p.label}>
                <circle r={size / 2} fill={open === id ? '#fcd34d' : id === 'smelter' ? '#f97316' : id === 'customer' ? '#60a5fa' : '#e7e5e4'} stroke="#1a0b02" strokeWidth="4" />
                <image href={ASSETS.supply.pin(PIN_ART[id])} x={-size / 2} y={-size / 2} width={size} height={size} style={{ imageRendering: 'pixelated' }} />
                <rect x={-p.label.length * 5.2 - 8} y={size / 2 + 6} width={p.label.length * 10.4 + 16} height="28" rx="4" fill="#0c1821" opacity="0.85" />
                <text y={size / 2 + 26} textAnchor="middle" fill="#fef3c7" fontSize="18" fontFamily="monospace" fontWeight="bold">{p.label}</text>
              </g>
            );
          })}
        </svg>

        <div className="absolute left-3 top-3 flex gap-2">
          <button onClick={onReturnToMap} className="rounded-lg border border-white/30 bg-[#0c1821]/90 px-3 py-2 text-xs">← World map</button>
          <p className="rounded-lg bg-[#0c1821]/90 px-3 py-2 text-xs text-amber-300">Loop 2 · Norway · {s.phase === 'buy' ? 'buy what the furnace needs' : s.phase === 'sell' ? 'sell your silicon' : 'result'}</p>
        </div>

        {open && (
          <div className="absolute inset-x-3 bottom-3 top-14 mx-auto max-w-md overflow-y-auto rounded-2xl border-4 border-[#1a0b02] bg-[#13232d] p-4 shadow-[6px_6px_0_#1a0b02] sm:inset-x-auto sm:left-6">
            <button onClick={() => setOpen(null)} className="float-right rounded border border-white/20 px-2 text-sm" aria-label="Close">✕</button>
            {open === 'smelter' ? <SmelterPanel s={s} act={act} />
              : open === 'customer' ? <CustomerPanel s={s} act={act} onDone={onDone} />
              : <SupplierPanel sup={M.suppliers.find(x => x.id === open)!} s={s} act={act} />}
          </div>
        )}
      </div>

      {/* Store panel */}
      <aside className="flex w-[340px] shrink-0 flex-col gap-3 overflow-y-auto border-l-4 border-[#1a0b02] bg-[#0f1e27] p-3">
        <p className={`rounded-lg border px-3 py-2 text-center font-mono text-lg font-bold ${cash < 0 ? 'border-red-400 text-red-300' : 'border-white/20'}`}>Cash {$(cash)}</p>
        <section className="rounded-xl border border-white/10 p-3">
          <h2 className="mb-2 text-sm font-bold text-amber-300">Your store</h2>
          {M.needs.map(n => {
            const have = accepted(s, n.id);
            const fines = s.orders.filter(o => o.item === n.id && o.checked).reduce((t, o) => t + o.terms.lot * o.lots - usableOf(o), 0);
            return (
              <div key={n.id} className="mb-2">
                <p className="text-xs">{n.name} <span className="text-slate-400">{Math.min(have, n.need)}/{n.need} {n.unit}{have > n.need ? ` · ${have - n.need} spare` : ''}</span></p>
                <div className="flex flex-wrap">
                  {Array.from({ length: n.need }, (_, i) => <Icon key={i} item={n.id} faded={i >= have} />)}
                  {fines > 0 && <span className="ml-1 inline-flex items-center text-[10px] text-amber-400"><Art src={ASSETS.supply.icon('fines')} alt="" className="h-6 w-6" fallback={<span>░</span>} />×{fines} fines</span>}
                </div>
              </div>
            );
          })}
        </section>
        {inbox.length > 0 && (
          <section className="space-y-2 rounded-xl border border-amber-300/40 p-3 text-xs">
            <h2 className="text-sm font-bold text-amber-300">At the gate</h2>
            {inbox.map(o => {
              const sup = M.suppliers.find(x => x.id === o.supplierId)!;
              const bought = o.terms.lot * o.lots;
              return (
                <div key={o.id} className="rounded border border-white/10 p-2">
                  <p>{o.checked ? '📄' : '🚚'} <b>{o.id}</b> {sup.name}: {bought} {needOf(M, o.item).unit}</p>
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
  const t = s.terms[sup.id];
  const n = needOf(M, sup.item);
  const asked = s.asked[sup.id] ?? [];
  const tired = asked.length >= sup.patience;
  const sampled = s.sampled.includes(sup.id);
  const pending = s.orders.some(o => o.supplierId === sup.id && o.paid === null);
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
      <div className="flex flex-wrap gap-1.5">
        <button className={btn} disabled={sampled} onClick={() => act({ type: 'sample', supplierId: sup.id })}>🔍 Sample</button>
        {sup.levers.map(l => <button key={l.id} className={btn} disabled={asked.includes(l.id) || tired} onClick={() => act({ type: 'ask', supplierId: sup.id, leverId: l.id })}>💬 {l.label}</button>)}
      </div>
      <div className="flex items-center gap-1.5">
        <button className={btn} disabled={lots <= 1} onClick={() => setLots(lots - 1)}>−</button>
        <span className="w-14 text-center text-xs">{lots} lot{lots > 1 ? 's' : ''}</span>
        <button className={btn} disabled={lots >= 3} onClick={() => setLots(lots + 1)}>+</button>
        <button className={`${btn} ml-auto bg-amber-300 font-bold text-slate-950`} disabled={pending || s.phase !== 'buy'} onClick={() => act({ type: 'order', supplierId: sup.id, lots })}>
          {pending ? 'Order at the gate' : `Order ${$(orderCost(t, lots))}`}
        </button>
      </div>
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
      <button className={primary} disabled={!readyToMake(M, s)} onClick={() => act({ type: 'make' })}>Start the furnace</button>
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
      {s.phase === 'buy' && <p className="text-sm">"Bring us silicon metal and we'll make you an offer." (Make it first.)</p>}
      {s.phase === 'sell' && <>
        <p className="text-2xl font-bold">offers {$(s.sale.offer)}</p>
        <div className="flex flex-wrap gap-1.5">
          {M.buyer.levers.map(l => <button key={l.id} className={btn} disabled={s.sale.asked.includes(l.id)} onClick={() => act({ type: 'askBuyer', leverId: l.id })}>💬 {l.label}</button>)}
          {spares(M, s).length > 0 && <button className={btn} disabled={s.sale.sparesSold} onClick={() => act({ type: 'sellSpares' })}>{s.sale.sparesSold ? 'Spares sold' : `Sell spares for ${$(sparesValue(M, s))}`}</button>}
        </div>
        <button className={primary} onClick={() => act({ type: 'accept' })}>Sell for {$(s.sale.offer)}</button>
      </>}
      {s.phase === 'done' && <>
        <table className="w-full font-mono text-sm"><tbody>
          <tr><td className="py-1 font-sans">Spent on inputs</td><td className="text-right">{$(-paidTotal(s))}</td></tr>
          <tr><td className="py-1 font-sans">Silicon sold</td><td className="text-right">{$(s.sale.price ?? 0)}</td></tr>
          {s.sale.sparesSold && <tr><td className="py-1 font-sans">Spares sold</td><td className="text-right">{$(sparesValue(M, s))}</td></tr>}
          <tr className="border-t border-white/30 text-lg font-bold"><td className="py-2 font-sans">{p >= 0 ? 'Profit' : 'Your bill'}</td><td className={`text-right ${p >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{$(p)}</td></tr>
        </tbody></table>
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
