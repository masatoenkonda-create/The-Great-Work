import React, { useEffect, useState } from 'react';
import { ASSETS } from '../content/assets';
import { sound } from '../services/audio';
import { NorwayManufacturing } from './NorwayManufacturing';
import { GuideBox } from './workshop/GuideBox';
import { NORWAY_MARKET as M } from '../content/norwayMarket';
import {
  TradeState, TradeAction, Order, Supplier, accepted, onOrder, needOf, orderCost, usableOf,
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
const primary = 'rounded-xl bg-amber-300 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40';
const STEPS = [['buy', 'Buy'], ['make', 'Make'], ['sell', 'Sell'], ['done', 'Result']] as const;

/** Loop 2, Norway: buy the inputs (quote, negotiate, order, check, pay), run the furnace, sell to Germany. */
export function NorwayProcurement({ state: s, dispatch, onReturnToMap, onDone }: Props) {
  const act = (a: TradeAction) => { sound.playSelect(); dispatch(a); };

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && s.phase !== 'make') { e.preventDefault(); onReturnToMap(); } };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onReturnToMap, s.phase]);

  if (s.phase === 'make') {
    const lots = s.orders.filter(o => o.item === 'quartz').map(o => o.id).join(', ');
    return <NorwayManufacturing suppliedFeed={lots} onReturnToMap={onReturnToMap} onComplete={() => dispatch({ type: 'made' })} />;
  }

  const cash = cashLeft(M, s);
  return (
    <section className="flex h-full flex-col gap-3 overflow-hidden bg-[#0c1821] p-3 text-slate-100 sm:p-4" aria-label="Norway, loop 2">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-amber-300">Loop 2 · Norway</p>
          <ol className="mt-1 flex gap-1 text-xs">
            {STEPS.map(([id, label], i) => (
              <li key={id} className={`rounded px-2 py-1 ${s.phase === id ? 'bg-amber-300 font-bold text-slate-950' : 'bg-white/10 text-slate-400'}`}>{i + 1}. {label}</li>
            ))}
          </ol>
        </div>
        <div className="flex items-center gap-2">
          <p className={`rounded-lg border px-3 py-2 font-mono text-sm ${cash < 0 ? 'border-red-400 text-red-300' : 'border-white/20'}`}>Cash {$(cash)}</p>
          <button onClick={onReturnToMap} className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10">← Map</button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_340px] lg:overflow-hidden">
        <div className="min-h-0 space-y-3 lg:overflow-y-auto lg:pr-1">
          {s.phase === 'buy' && M.needs.map(n => {
            const have = accepted(s, n.id);
            return (
              <article key={n.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <h2 className="mb-2 flex flex-wrap items-baseline justify-between gap-2 font-bold">
                  <span>{n.name} <span className="font-normal text-slate-400">· need {n.need} {n.unit}</span></span>
                  <span className={`text-sm ${have >= n.need ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {have >= n.need ? '✓ ' : ''}{have}/{n.need} in{onOrder(s, n.id) ? ` · ${onOrder(s, n.id)} at the gate` : ''}
                  </span>
                </h2>
                <div className="grid gap-2 md:grid-cols-2">
                  {M.suppliers.filter(x => x.item === n.id).map(sup => <SupplierCard key={sup.id} sup={sup} s={s} act={act} />)}
                </div>
              </article>
            );
          })}

          {s.phase === 'sell' && (
            <article className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <h2 className="font-bold">{M.buyer.name}</h2>
              <p className="text-2xl font-bold">offers {$(s.sale.offer)} <span className="text-base font-normal text-slate-400">for your silicon</span></p>
              <div className="flex flex-wrap gap-2">
                {M.buyer.levers.map(l => (
                  <button key={l.id} className={btn} disabled={s.sale.asked.includes(l.id)} onClick={() => act({ type: 'askBuyer', leverId: l.id })}>💬 {l.label}</button>
                ))}
              </div>
              {spares(M, s).length > 0 && (
                <div className="rounded-lg border border-white/10 p-3 text-sm">
                  <p className="text-slate-300">Left over: {spares(M, s).map(x => `${x.units} ${x.need.unit} of ${x.need.name.toLowerCase()}`).join(', ')}</p>
                  <button className={`${btn} mt-2`} disabled={s.sale.sparesSold} onClick={() => act({ type: 'sellSpares' })}>
                    {s.sale.sparesSold ? 'Spares sold' : `Sell spares back for ${$(sparesValue(M, s))}`}
                  </button>
                </div>
              )}
            </article>
          )}

          {s.phase === 'done' && (
            <article className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <table className="w-full font-mono text-sm">
                <tbody>
                  <tr><td className="py-1 font-sans">Spent on inputs</td><td className="text-right">{$(-paidTotal(s))}</td></tr>
                  <tr><td className="py-1 font-sans">Silicon sold</td><td className="text-right">{$(s.sale.price ?? 0)}</td></tr>
                  {s.sale.sparesSold && <tr><td className="py-1 font-sans">Spares sold</td><td className="text-right">{$(sparesValue(M, s))}</td></tr>}
                  <tr className="border-t border-white/30 text-lg font-bold">
                    <td className="py-2 font-sans">{profit(M, s) >= 0 ? 'Profit' : 'Your bill'}</td>
                    <td className={`text-right ${profit(M, s) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{$(profit(M, s))}</td>
                  </tr>
                </tbody>
              </table>
              <ul className="space-y-1 text-sm">{lessons(M, s).map(l => <li key={l}>• {l}</li>)}</ul>
            </article>
          )}
        </div>

        <aside className="flex min-h-0 flex-col gap-3">
          <GuideBox name="Sigurd" portrait={ASSETS.norwayGuide.image} line={{ text: s.message, warning: s.phase === 'done' && profit(M, s) < 0 }} asset="norway-chat-box" />
          {s.phase === 'buy' && <button className={primary} disabled={!readyToMake(M, s)} onClick={() => act({ type: 'make' })}>{readyToMake(M, s) ? 'To the furnace →' : 'Get everything in and paid first'}</button>}
          {s.phase === 'sell' && <button className={primary} onClick={() => act({ type: 'accept' })}>Sell for {$(s.sale.offer)}</button>}
          {s.phase === 'done' && <>
            <button className={primary} onClick={() => act({ type: 'retry' })}>Try Norway again</button>
            <button className="rounded-xl border border-white/20 px-4 py-3 text-sm" onClick={onDone}>Back to the map</button>
          </>}
        </aside>
      </div>
    </section>
  );
}

function SupplierCard({ sup, s, act }: { sup: Supplier; s: TradeState; act: (a: TradeAction) => void }) {
  const [lots, setLots] = useState(1);
  const t = s.terms[sup.id];
  const unit = needOf(M, sup.item).unit;
  const asked = s.asked[sup.id] ?? [];
  const tired = asked.length >= sup.patience;
  const sampled = s.sampled.includes(sup.id);
  const orders = s.orders.filter(o => o.supplierId === sup.id);
  const open = orders.some(o => o.paid === null);
  return (
    <div className="rounded-lg border border-white/10 bg-[#0c1821] p-3">
      <p className="font-semibold">{sup.name}</p>
      <p className="text-xs text-slate-400">{sup.origin}</p>
      <p className="mt-2 font-mono text-sm">{t.lot} {unit} × {$(t.unitPrice)}{t.fee ? ` + ${$(t.fee)} fee` : ''} = <b>{$(orderCost(t, 1))}</b></p>
      <p className="text-xs text-slate-300">Usable: {sampled ? `${Math.floor(t.lot * t.usable)} of ${t.lot}` : '?'}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button className={btn} disabled={sampled} onClick={() => act({ type: 'sample', supplierId: sup.id })}>🔍 Sample</button>
        {sup.levers.map(l => (
          <button key={l.id} className={btn} disabled={asked.includes(l.id) || tired} onClick={() => act({ type: 'ask', supplierId: sup.id, leverId: l.id })}>💬 {l.label}</button>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <button className={btn} disabled={lots <= 1} onClick={() => setLots(lots - 1)}>−</button>
        <span className="w-14 text-center text-xs">{lots} lot{lots > 1 ? 's' : ''}</span>
        <button className={btn} disabled={lots >= 3} onClick={() => setLots(lots + 1)}>+</button>
        <button className={`${btn} ml-auto bg-white/10 font-bold`} disabled={open} onClick={() => act({ type: 'order', supplierId: sup.id, lots })}>Order {$(orderCost(t, lots))}</button>
      </div>
      {orders.map(o => <OrderRow key={o.id} o={o} unit={unit} act={act} />)}
    </div>
  );
}

function OrderRow({ o, unit, act }: { o: Order; unit: string; act: (a: TradeAction) => void }) {
  const bought = o.terms.lot * o.lots;
  return (
    <div className="mt-2 rounded border border-white/10 p-2 text-xs">
      <p className="font-mono">{o.id} · {bought} {unit} · order says {$(o.expected)}</p>
      {!o.checked && <button className={`${btn} mt-1`} onClick={() => act({ type: 'check', orderId: o.id })}>🚚 Check the delivery</button>}
      {o.checked && <p className="mt-1">Delivered {bought}, usable <b>{usableOf(o)}</b></p>}
      {o.checked && o.paid === null && (
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span>Invoice: <b className="font-mono">{$(o.invoice)}</b></span>
          <button className={btn} onClick={() => act({ type: 'pay', orderId: o.id })}>Pay</button>
          <button className={btn} onClick={() => act({ type: 'dispute', orderId: o.id })}>Dispute</button>
        </div>
      )}
      {o.paid !== null && <p className="mt-1 text-emerald-300">✓ Paid {$(o.paid)}</p>}
    </div>
  );
}
