import React, { useEffect, useState } from 'react';
import { ASSETS } from '../content/assets';
import { sound } from '../services/audio';
import { NorwayManufacturing } from './NorwayManufacturing';
import { GuideBox } from './workshop/GuideBox';
import {
  BUDGET, NEEDS, SUPPLIERS, LOCATIONS, ProcurementState, ProcurementAction, Terms,
  supplierFor, locationFor, needFor, quoteFor, quoteCost, totalPaid, acceptedFor,
  missingFor, readyForFurnace, procurementBill,
} from '../content/norwaySourcing';

interface Props {
  state: ProcurementState;
  dispatch: (action: ProcurementAction) => void;
  onReturnToMap: () => void;
  onDone: () => void;
}
const money = (n: number) => `${n.toLocaleString('en-US')} cr`;
const button = 'rounded-lg border border-white/20 px-3 py-2 text-sm hover:border-amber-300 disabled:cursor-not-allowed disabled:opacity-35';
const primary = `${button} bg-amber-300 font-bold text-slate-950`;

/** Persistent session data comes from App. Source locations, quotes and receipts all use
 * the same origin/supplier/order identities. Local selection is only navigation. */
export function NorwayProcurement({ state, dispatch, onReturnToMap, onDone }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [terms, setTerms] = useState<Terms>('standard');
  const [lots, setLots] = useState(1);
  const [tab, setTab] = useState<'supply' | 'receipts'>('supply');
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.phase !== 'work') { e.preventDefault(); onReturnToMap(); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onReturnToMap, state.phase]);
  const visit = (id: string) => {
    sound.playSelect(); setSelected(id); setTerms('standard'); setLots(1); setTab('supply');
    dispatch({ type: 'visit', supplierId: id });
  };
  const supplier = selected ? supplierFor(selected) : undefined;
  const quote = supplier ? quoteFor(supplier.id, terms) : undefined;
  const sampled = quote ? state.samples.includes(quote.id) : false;
  const paid = totalPaid(state);
  const debt = Math.max(0, paid - BUDGET);
  const ready = readyForFurnace(state);
  const pending = state.orders.filter(o => !o.inspected);
  const bill = procurementBill(state);

  if (state.phase === 'work') return <NorwayManufacturing
    suppliedFeed={state.orders.filter(o => o.quote.item === 'quartz' && o.accepted > 0).map(o => o.lotId).join(', ')}
    onReturnToMap={onReturnToMap} onComplete={() => dispatch({ type: 'finish' })}
  />;

  return (
    <section className="flex h-full flex-col gap-3 overflow-hidden bg-[#0c1821] p-3 text-slate-100 sm:p-4" aria-label="Norway sourcing workshop">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div><p className="text-sm text-amber-300">Loop 2 · Norway · Procurement</p>
          <h1 className="text-xl font-bold">{state.phase === 'bill' ? 'What did this batch actually cost?' : 'Secure the furnace inputs'}</h1></div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className={debt ? 'text-red-300' : 'text-emerald-300'}>
            Budget {money(BUDGET)} · paid {money(paid)} · {debt ? `debt ${money(debt)}` : `left ${money(BUDGET - paid)}`}
          </span><button className={button} onClick={onReturnToMap}>← World map</button>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto xl:grid-cols-[minmax(0,1fr)_360px] xl:overflow-hidden">
        <main className="min-h-0 space-y-3 xl:overflow-y-auto">
          {state.phase === 'source' && <>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Furnace requirements and accepted stock">
              {NEEDS.map(n => <article key={n.id} className={`rounded-lg border p-3 ${missingFor(state, n.id) ? 'border-white/15 bg-white/5' : 'border-emerald-400/50 bg-emerald-400/5'}`}>
                <h2 className="font-bold">{n.name}</h2><p className="font-mono text-sm">{acceptedFor(state, n.id)} / {n.need} {n.unit} ready</p>
                <p className="mt-1 text-xs text-slate-300">{n.why}</p>
              </article>)}
            </div>
            <nav className="flex flex-wrap gap-2" aria-label="Sourcing views">
              <button className={button} aria-pressed={tab === 'supply'} onClick={() => setTab('supply')}>1. Sources & offers</button>
              <button className={button} aria-pressed={tab === 'receipts'} onClick={() => setTab('receipts')}>2. Receiving ({pending.length} unchecked)</button>
            </nav>
            {tab === 'supply' && <>
              <SupplyMap selected={selected} visited={state.visited} onVisit={visit} onReceiving={() => setTab('receipts')} />
              <div className="flex flex-wrap gap-2" aria-label="Visit a supplier">
                {SUPPLIERS.map(s => <button className={button} key={s.id} aria-pressed={selected === s.id} onClick={() => visit(s.id)}>
                  {s.name} · {needFor(s.item).name}{state.visited.includes(s.id) ? ' ✓' : ''}
                </button>)}
              </div>
              {supplier && quote ? <article className="space-y-3 rounded-xl border border-white/15 bg-white/5 p-4">
                <div><h2 className="text-lg font-bold">{supplier.name} · {needFor(supplier.item).name}</h2>
                  <p className="text-sm text-slate-300">{supplier.role}</p>
                  <p className="mt-1 text-sm text-sky-300">Origin: {locationFor(supplier.origin).name} → {supplier.location !== supplier.origin ? `${locationFor(supplier.location).name} → ` : ''}Norway smelter</p></div>
                <p className="rounded-lg bg-sky-300/10 p-2 text-sm"><b>Workcell requirement:</b> {needFor(supplier.item).requirement}</p>
                <div className="flex flex-wrap gap-2" aria-label="Negotiate the offer">
                  <button className={button} aria-pressed={terms === 'standard'} onClick={() => { setTerms('standard'); setLots(1); }}>Original offer</button>
                  {supplier.canNegotiate.map(t => <button key={t} className={button} aria-pressed={terms === t} onClick={() => {
                    dispatch({ type: 'negotiate', supplierId: supplier.id, terms: t }); setTerms(t); setLots(1);
                  }}>{t === 'screened' ? 'Ask quarry to remove the fines' : 'Ask for a smaller pack'}</button>)}
                </div>
                <h3 className="font-semibold">{quote.title}</h3><p className="text-sm">{quote.specification}</p>
                <p className="text-sm font-mono">{quote.lot} {needFor(quote.item).unit} / lot × {money(quote.unitPrice)} / {needFor(quote.item).unit}{quote.setup ? ` + ${money(quote.setup)} repacking / order` : ''}</p>
                <div className="rounded-lg border border-white/10 p-3">
                  {!sampled ? <button className={button} onClick={() => dispatch({ type: 'sample', supplierId: supplier.id, terms })}>
                    {supplier.item === 'quartz' ? 'Put a sample through the feed screen' : supplier.item === 'power' ? 'Verify the supply agreement' : 'Check the material specification'}
                  </button> : <>
                    {supplier.item === 'quartz' && <SampleScreen accepted={quote.usablePerLot} total={quote.lot} />}
                    <p className="text-sm text-emerald-200">{quote.sample}</p>
                    <p className="mt-1 text-xs text-slate-400">{supplier.item === 'quartz' ? 'This checks size for this charge. It does not assay chemical purity.' : 'Approval of this routine input is guide-assisted.'}</p>
                  </>}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">Lots
                    <select className="rounded bg-slate-800 p-2" value={lots} onChange={e => setLots(Number(e.target.value))}>
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                  <p className="text-sm">Pay <b>{money(quoteCost(quote, lots))}</b> for {quote.lot * lots} {needFor(quote.item).unit}.</p>
                </div>
                {sampled && <p className={`text-sm ${quote.usablePerLot * lots < missingFor(state, quote.item) ? 'text-amber-200' : 'text-emerald-200'}`}>
                  Expected usable: <b>{quote.usablePerLot * lots}</b>. Still needed: <b>{missingFor(state, quote.item)}</b>.
                  {quote.usablePerLot * lots < missingFor(state, quote.item) ? ' This order alone will leave a shortage.' : ` After this receipt: ${Math.max(0, acceptedFor(state, quote.item) + quote.usablePerLot * lots - needFor(quote.item).need)} spare.`}
                </p>}
                <button className={primary} disabled={!sampled} onClick={() => {
                  dispatch({ type: 'order', supplierId: supplier.id, terms, lots }); setTab('receipts'); sound.playConfirm();
                }}>{sampled ? `Issue purchase order · ${money(quoteCost(quote, lots))}` : 'Check the supply before committing'}</button>
                {paid + quoteCost(quote, lots) > BUDGET && <p className="text-sm text-red-300">This order would take the project into debt. You can continue; the cost stays on the bill.</p>}
              </article> : <p className="rounded-lg border border-dashed border-white/20 p-4 text-sm text-slate-300">Visit a source on the map. Compare where it is made with who sells it.</p>}
            </>}
            {tab === 'receipts' && <div className="space-y-3">
              {state.orders.length === 0 && <p className="p-4 text-slate-300">No orders yet. The workcell needs actual accepted inputs, not selected supplier cards.</p>}
              {state.orders.map(o => <article key={o.id} className="space-y-2 rounded-xl border border-white/15 bg-white/5 p-4">
                <h2 className="font-bold">{o.id} · {supplierFor(o.quote.supplierId)!.name} · {needFor(o.quote.item).name}</h2>
                <p className="text-sm text-sky-300">{locationFor(supplierFor(o.quote.supplierId)!.origin).name} → Norway smelter · lot {o.lotId}</p>
                <p className="text-sm">Ordered: {o.lots * o.quote.lot} {needFor(o.quote.item).unit}. {o.quote.specification} Paid: {money(o.paid)}.</p>
                {o.inspected ? <>
                  {o.quote.item === 'quartz' && <SampleScreen accepted={o.accepted} total={o.quote.lot * o.lots} />}
                  <p className="text-sm text-emerald-200">{o.accepted} accepted · {o.excluded} excluded from the charge.</p>
                  {o.excluded > 0 && <p className="text-sm text-amber-200">The supplier delivered the agreed mixed rock. Fines are set aside; they are not missing delivery or chemically failed silicon.</p>}
                </> : <button className={primary} onClick={() => dispatch({ type: 'inspect', orderId: o.id })}>
                  {o.quote.item === 'quartz' ? 'Screen delivery & reconcile with order' : o.quote.item === 'power' ? 'Confirm connection & release supply' : 'Match lot, quantity & specification'}
                </button>}
              </article>)}
              <button className={button} onClick={() => setTab('supply')}>← Back to sources / cover a shortage</button>
            </div>}
          </>}

          {state.phase === 'bill' && <>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-sm"><thead className="bg-white/5"><tr>
                {['Input', 'Bought', 'Excluded', 'Used', 'Spare', 'Paid'].map(t => <th className="p-3" key={t}>{t}</th>)}
              </tr></thead><tbody>{bill.map(l => <tr key={l.id} className="border-t border-white/10">
                <th className="p-3">{l.name}<span className="block text-xs font-normal text-slate-400">{l.unit}</span></th>
                {[l.bought, l.excluded, l.used, l.leftover, money(l.paid)].map((v, i) => <td className="p-3 font-mono" key={i}>{v}</td>)}
              </tr>)}</tbody></table>
            </div>
            <p className="rounded-xl bg-white/5 p-4">{debt ? `The material worked, but this batch owes ${money(debt)}. Revisit preparation and pack sizes to reduce the bill.` : `The batch has suitable inputs and ${money(BUDGET - paid)} left. You secured usable supply within the budget.`}</p>
            {state.orders.filter(o => o.quote.item === 'quartz').map(o => <p key={o.id} className="rounded-lg border border-white/10 p-3 text-sm">
              {supplierFor(o.quote.supplierId)!.name} · {o.quote.title}: {o.quote.lot * o.lots} bought → {o.accepted} usable; {money(o.paid)} paid.
            </p>)}
            <p className="text-sm text-slate-300">Buying is not the same as having enough usable feed. The unused material remains stock; it has not been sold or turned into free cash.</p>
            <div className="flex gap-2"><button className={primary} onClick={() => { dispatch({ type: 'retry' }); setSelected(null); setTab('supply'); }}>Try a different sourcing plan</button>
              <button className={button} onClick={onDone}>Return to world map</button></div>
          </>}
        </main>
        <aside className="flex min-h-0 flex-col gap-3">
          <GuideBox name="Sigurd" portrait={ASSETS.norwayGuide.image} line={{ text: state.phase === 'bill' ? 'Trace the bill back to the orders. Did you pay for useful chunks, fines, or spare stock?' : state.message, warning: false }} asset="norway-chat-box" />
          {state.phase === 'source' && <>
            <div className="space-y-2 rounded-xl border border-white/15 p-3 text-sm">
              <h2 className="font-bold">Release to the furnace</h2>
              {NEEDS.map(n => <p key={n.id} className={missingFor(state, n.id) ? 'text-amber-200' : 'text-emerald-200'}>{n.name}: {missingFor(state, n.id) ? `${missingFor(state, n.id)} ${n.unit} still needed` : 'ready'}</p>)}
              <p>{pending.length} receipt(s) unchecked.</p>
            </div>
            <button className={primary} disabled={!ready} onClick={() => dispatch({ type: 'start' })}>{ready ? 'Load accepted inputs → furnace' : 'Secure and check the inputs first'}</button>
          </>}
        </aside>
      </div>
    </section>
  );
}

function SampleScreen({ accepted, total }: { accepted: number; total: number }) {
  const count = Math.min(total, 25);
  const good = Math.round(count * accepted / total);
  return <div className="my-2" role="img" aria-label={`${accepted} of ${total} portions are usable chunks; ${total - accepted} are fines`}>
    <div className="flex flex-wrap items-end gap-1 border-b-4 border-slate-500 pb-1">
      {Array.from({ length: count }, (_, i) => <span key={i} className={i < good ? 'h-5 w-5 rounded-sm bg-slate-200' : 'h-1.5 w-1.5 rounded-full bg-amber-500'} />)}
    </div><p className="mt-1 text-xs text-slate-300">Screen result: {accepted} chunks stay above · {total - accepted} fines fall through.</p>
  </div>;
}

function SupplyMap({ selected, visited, onVisit, onReceiving }: { selected: string | null; visited: string[]; onVisit: (id: string) => void; onReceiving: () => void }) {
  const focused = supplierFor(selected ?? '');
  const smelter = locationFor('smelter');
  const edges = SUPPLIERS.flatMap(s => {
    const from = locationFor(s.origin); const via = locationFor(s.location);
    return [{ key: s.id, supplier: s.id, from: via, to: smelter }, ...(s.origin === s.location ? [] : [{ key: `${s.id}-origin`, supplier: s.id, from, to: via }])];
  });
  return <div className="rounded-xl border border-white/15 bg-[#122b32] p-3">
    <h2 className="font-bold">Norway supply map</h2><p className="text-xs text-slate-300">Source → supplier → your workcell. Follow a branch to obtain an input.</p>
    <div className="relative mt-2 aspect-[760/430] min-w-0">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 760 430" role="img" aria-label="Supply branches linking quarries, overseas coal, the sawmill and power station to Norway's smelter">
        <path d="M275 0 Q330 120 280 180 T320 430" stroke="#24515d" strokeWidth="45" fill="none" />
        {edges.map(e => <path key={e.key} d={`M${e.from.x},${e.from.y} L${e.to.x},${e.to.y}`} stroke={focused?.id === e.supplier ? '#fcd34d' : '#4d7277'} strokeWidth={focused?.id === e.supplier ? 4 : 2} strokeDasharray={focused?.id === e.supplier ? undefined : '7 6'} />)}
        {LOCATIONS.map(l => <g key={l.id}><circle cx={l.x} cy={l.y} r={l.id === 'smelter' ? 16 : 9} fill={l.id === 'smelter' ? '#fcd34d' : focused?.origin === l.id ? '#7dd3fc' : '#9ab6bb'} />
          <text x={l.x} y={l.y + 25} textAnchor="middle" fill="#e2e8f0" fontSize="13">{l.name}</text></g>)}
      </svg>
      {SUPPLIERS.map(s => { const l = locationFor(s.location); return <button key={s.id}
        style={{ left: `${l.x / 760 * 100}%`, top: `${l.y / 430 * 100}%` }}
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 px-2 py-1 text-[10px] sm:text-xs ${selected === s.id ? 'border-amber-200 bg-amber-300 text-slate-950' : 'border-slate-300 bg-slate-800 text-white'}`}
        aria-label={`Visit ${s.name} for ${needFor(s.item).name}`} onClick={() => onVisit(s.id)}>
        {needFor(s.item).name}{visited.includes(s.id) ? ' ✓' : ''}
      </button>; })}
      <button style={{ left: `${smelter.x / 760 * 100}%`, top: `${smelter.y / 430 * 100}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 rounded border border-amber-300 bg-slate-900 px-2 py-1 text-[10px] sm:text-xs" onClick={onReceiving}>Receiving</button>
    </div>
    {focused && <p className="text-sm text-sky-200">{locationFor(focused.origin).kind} → {focused.location !== focused.origin ? `${locationFor(focused.location).name} → ` : ''}Norway smelter</p>}
  </div>;
}
