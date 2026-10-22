import React, { useEffect, useMemo, useState } from 'react';
import { sound } from '../services/audio';
import { ASSETS } from '../content/assets';
import {
  BUDGET, NORWAY_ITEMS, Choices, Outcome, Fix, ItemId,
  lotCost, plannedTotal, resolveOrders, fixesFor, billLines, debrief,
} from '../content/norwayProcurement';
import { NorwayManufacturing } from './NorwayManufacturing';
import { GuideBox, GuideLine } from './workshop/GuideBox';

interface Props {
  onReturnToMap: () => void;
  onDone: () => void;
}

type Phase = 'desk' | 'news' | 'work' | 'bill';

const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

/**
 * Loop 2 prototype, Norway only: choose suppliers at the buying desk, see what actually arrives,
 * run the same furnace as loop 1, then read the bill. No clock: nothing happens until the player clicks.
 */
export function NorwayProcurement({ onReturnToMap, onDone }: Props) {
  const [phase, setPhase] = useState<Phase>('desk');
  const [choices, setChoices] = useState<Choices>({});
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [fixes, setFixes] = useState<Partial<Record<ItemId, Fix>>>({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && phase !== 'work') { e.preventDefault(); onReturnToMap(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onReturnToMap, phase]);

  const allChosen = NORWAY_ITEMS.every(item => choices[item.id]);
  const planned = plannedTotal(choices);
  const lines = useMemo(() => billLines(outcomes, fixes), [outcomes, fixes]);
  const spent = phase === 'desk' ? planned : lines.reduce((s, l) => s + l.paid, 0);
  const left = BUDGET - spent;
  const unfixed = outcomes.filter(o => o.shortfall > 0 && !fixes[o.item.id]);

  const choose = (item: ItemId, offer: string) => { sound.playSelect(); setChoices(c => ({ ...c, [item]: offer })); };
  const sign = () => {
    if (!allChosen) return;
    sound.playConfirm();
    setOutcomes(resolveOrders(choices));
    setPhase('news');
  };
  const fix = (item: ItemId, f: Fix) => { sound.playSelect(); setFixes(x => ({ ...x, [item]: f })); };

  if (phase === 'work') {
    return <NorwayManufacturing onReturnToMap={onReturnToMap} onComplete={() => setPhase('bill')} />;
  }

  const struck = outcomes.filter(o => o.struck);
  const guide: GuideLine =
    phase === 'desk'
      ? { text: allChosen ? 'Happy with that? Sign the orders. Take your time, nothing runs until you do.' : 'This time nothing is free. Pick one supplier for each thing the furnace needs. (Cheapest isn’t always cheapest.)', warning: false }
      : phase === 'news'
        ? struck.length === 0
          ? { text: 'Everything arrived, all of it on time. Off to the furnace!', warning: false }
          : unfixed.length > 0
            ? { text: `${unfixed[0].offer.risk!.news} We still need ${unfixed[0].shortfall} ${unfixed[0].item.unit}. Who do we buy it from?`, warning: true }
            : { text: `${struck.map(o => o.offer.risk!.news).join(' ')} Covered now. Off to the furnace!`, warning: true }
        : { text: left >= 0 ? 'Here is your bill. Every number on it is a choice you made.' : 'Over budget. You can carry on, but that debt comes home with you.', warning: left < 0 };

  return (
    <section className="flex h-full flex-col gap-3 overflow-hidden bg-[#0c1821] p-3 text-slate-100 sm:p-4" aria-label="Norway buying desk">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-amber-300">Loop 2 · Procurement · Norway</p>
          <h1 className="text-xl font-bold sm:text-2xl">{phase === 'desk' ? 'Buying desk' : phase === 'news' ? 'Deliveries' : 'The bill'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className={`rounded-lg border px-3 py-2 font-mono text-sm ${left < 0 ? 'border-red-400 text-red-300' : 'border-white/20'}`}>
            Budget {money(BUDGET)} · {phase === 'desk' ? 'planned' : 'spent'} {money(spent)} · {left < 0 ? `debt ${money(-left)}` : `left ${money(left)}`}
          </div>
          <button onClick={onReturnToMap} className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10">← Map</button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_380px] lg:overflow-hidden">
        <div className="min-h-0 space-y-3 lg:overflow-y-auto">
          {phase === 'desk' && NORWAY_ITEMS.map(item => (
            <article key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-bold">{item.name} <span className="font-normal text-slate-400">· need {item.need} {item.unit}</span></h2>
                <span className={`rounded px-2 py-0.5 text-xs ${item.billShare === 'big' ? 'bg-amber-300/20 text-amber-200' : 'bg-white/10 text-slate-300'}`}>
                  {item.billShare === 'big' ? 'Big part of the bill' : 'Small part of the bill'}
                </span>
              </div>
              <p className="mb-2 text-sm text-slate-400">{item.why}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {item.offers.map(offer => {
                  const selected = choices[item.id] === offer.id;
                  return (
                    <button key={offer.id} onClick={() => choose(item.id, offer.id)} aria-pressed={selected}
                      className={`rounded-lg border-2 p-3 text-left transition ${selected ? 'border-amber-300 bg-amber-300/10' : 'border-white/10 hover:border-white/30'}`}>
                      <p className="font-semibold">{offer.supplier}</p>
                      <p className="text-sm text-slate-300">{offer.blurb}</p>
                      <p className="mt-1 font-mono text-sm">{offer.lot} {item.unit} × {money(offer.unitPrice)} = <b>{money(lotCost(offer))}</b></p>
                      {offer.lot > item.need && <p className="text-xs text-slate-400">{offer.lot - item.need} {item.unit} more than you need</p>}
                      <p className={`mt-1 text-xs ${offer.risk ? 'text-amber-300' : 'text-emerald-300'}`}>
                        {offer.risk ? `⚠ ${offer.risk.sign} (1 in ${offer.risk.oneIn} chance)` : '✓ No known supply risk'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </article>
          ))}

          {phase === 'news' && outcomes.map(o => (
            <article key={o.item.id} className={`rounded-xl border p-3 ${o.struck ? 'border-amber-300/60 bg-amber-300/5' : 'border-white/10 bg-white/5'}`}>
              <h2 className="font-bold">{o.item.name} <span className="font-normal text-slate-400">from {o.offer.supplier}</span></h2>
              <p className="text-sm">{o.struck ? `⚠ ${o.offer.risk!.news}` : `✓ ${o.delivered} ${o.item.unit} arrived.`} <span className="font-mono">Paid {money(o.paid)}.</span></p>
              {o.shortfall > 0 && (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {fixesFor(o).map(f => (
                    <button key={f.id} onClick={() => fix(o.item.id, f)} aria-pressed={fixes[o.item.id]?.id === f.id}
                      className={`rounded-lg border-2 p-2 text-left text-sm ${fixes[o.item.id]?.id === f.id ? 'border-amber-300 bg-amber-300/10' : 'border-white/10 hover:border-white/30'}`}>
                      {f.label} · <b className="font-mono">{money(f.cost)}</b>
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}

          {phase === 'bill' && (
            <>
              <table className="w-full rounded-xl bg-white/5 text-sm">
                <thead className="text-left text-slate-400">
                  <tr><th className="p-2">Item</th><th className="p-2">Bought</th><th className="p-2">Used</th><th className="p-2">Left over</th><th className="p-2 text-right">Paid</th></tr>
                </thead>
                <tbody className="font-mono">
                  {lines.map(l => (
                    <tr key={l.name} className="border-t border-white/10">
                      <td className="p-2 font-sans">{l.name}</td>
                      <td className="p-2">{l.bought} {l.unit}</td>
                      <td className="p-2">{l.used} {l.unit}</td>
                      <td className="p-2">{l.bought - l.used > 0 ? `${l.bought - l.used} ${l.unit}` : '–'}</td>
                      <td className="p-2 text-right">{money(l.paid)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-white/30 font-bold">
                    <td className="p-2 font-sans" colSpan={4}>Total</td><td className="p-2 text-right">{money(spent)}</td>
                  </tr>
                  <tr><td className="p-2 font-sans" colSpan={4}>{left < 0 ? 'Debt' : 'Left in the budget'}</td>
                    <td className={`p-2 text-right ${left < 0 ? 'text-red-300' : 'text-emerald-300'}`}>{money(Math.abs(left))}</td></tr>
                </tbody>
              </table>
              <ul className="space-y-1 rounded-xl border border-white/10 p-3 text-sm">
                {outcomes.map(o => <li key={o.item.id}>• {debrief(o, fixes[o.item.id])}</li>)}
              </ul>
            </>
          )}
        </div>

        <aside className="flex min-h-0 flex-col gap-3">
          <GuideBox name="Sigurd" portrait={ASSETS.norwayGuide.image} line={guide} asset="norway-chat-box" />
          {phase === 'desk' && (
            <button onClick={sign} disabled={!allChosen}
              className="rounded-xl bg-amber-300 px-4 py-3 font-bold text-[#1a0b02] disabled:cursor-not-allowed disabled:opacity-40">
              {allChosen ? `Sign the orders (${money(planned)})` : `Choose a supplier for every item (${Object.keys(choices).length}/${NORWAY_ITEMS.length})`}
            </button>
          )}
          {phase === 'news' && (
            <button onClick={() => { sound.playConfirm(); setPhase('work'); }} disabled={unfixed.length > 0}
              className="rounded-xl bg-amber-300 px-4 py-3 font-bold text-[#1a0b02] disabled:cursor-not-allowed disabled:opacity-40">
              {unfixed.length > 0 ? 'Cover the missing material first' : 'To the furnace →'}
            </button>
          )}
          {phase === 'bill' && (
            <button onClick={() => { sound.playConfirm(); onDone(); }} className="rounded-xl bg-amber-300 px-4 py-3 font-bold text-[#1a0b02]">
              Back to the map
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}
