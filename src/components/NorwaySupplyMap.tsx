import React from 'react';
import { NORWAY_MARKET as M } from '../content/norwayMarket';
import type { Order } from '../content/tradeEngine';

// Illustrative places for this fictional market, not a reconstruction of factory suppliers.
const places = {
  fjord: { x: 100, y: 70, name: 'Fjord quarry' },
  plateau: { x: 95, y: 285, name: 'Plateau quarry' },
  nordic: { x: 235, y: 205, name: 'Minerals depot' },
  mine: { x: 590, y: 55, name: 'Overseas coal mine' },
  harbour: { x: 560, y: 160, name: 'Harbour stockyard' },
  bulk: { x: 660, y: 255, name: 'Import terminal' },
  sawmill: { x: 520, y: 310, name: 'Valley sawmill' },
  hydro: { x: 350, y: 55, name: 'River power station' },
  work: { x: 365, y: 245, name: 'Your furnace' },
};
const origins: Record<string, keyof typeof places> = {
  fjord: 'fjord', nordic: 'plateau', harbour: 'mine', bulk: 'mine', sawmill: 'sawmill', hydro: 'hydro',
};
type SellerId = 'fjord' | 'nordic' | 'harbour' | 'bulk' | 'sawmill' | 'hydro';

export function NorwaySupplyMap({ selected, item, onSelect, orders }: {
  selected: string | null; item: string; onSelect: (id: string) => void; orders: Order[];
}) {
  const sellers = M.suppliers.filter(s => s.item === item);
  const focused = M.suppliers.find(s => s.id === selected);
  const origin = focused ? places[origins[focused.id]] : null;
  const sellerPlace = focused ? places[focused.id as SellerId] : null;
  const latest = orders.filter(o => o.supplierId === selected).at(-1);
  return <div className="rounded-xl border border-white/15 bg-[#122b32] p-3">
    <div className="flex flex-wrap items-baseline justify-between gap-1">
      <h2 className="font-bold">Where does it come from?</h2>
      <span className="text-xs text-slate-300">Source → seller → furnace</span>
    </div>
    <div className="relative mt-2 aspect-[760/365]">
      <svg viewBox="0 0 760 365" className="absolute inset-0 h-full w-full" role="img" aria-label="Supply map: quarries, overseas coal mine, sawmill and hydro station connect to the Norway furnace">
        <path d="M295 0 Q270 95 315 180 T320 365" stroke="#24515d" strokeWidth="35" fill="none" />
        {M.suppliers.map(s => {
          const a = places[origins[s.id]], b = places[s.id as SellerId], w = places.work;
          const active = selected === s.id;
          return <path key={s.id} d={`M${a.x},${a.y} L${b.x},${b.y} L${w.x},${w.y}`} fill="none" stroke={active ? '#fcd34d' : '#3c5961'} strokeWidth={active ? 4 : 2} strokeDasharray={active ? undefined : '6 7'} />;
        })}
        {Object.entries(places).map(([id, p]) => <g key={id}>
          <circle cx={p.x} cy={p.y} r={id === 'work' ? 14 : 8} fill={id === 'work' ? '#fcd34d' : origin === p ? '#7dd3fc' : '#8ba6ad'} />
          <text x={p.x} y={p.y + 27} fill="#e2e8f0" textAnchor="middle" fontSize="13">{p.name}</text>
        </g>)}
        {latest && sellerPlace && <g key={latest.id}>
          {focused?.item === 'power' ? <path d="M2 -12 L-8 2 H0 L-2 12 L9 -3 H1 Z" fill="#fde68a" />
            : <rect x="-7" y="-7" width="14" height="14" rx="2" fill="#fde68a" stroke="#17242c" strokeWidth="2" />}
          <animateMotion dur="1.1s" fill="freeze" path={`M${sellerPlace.x},${sellerPlace.y} L${places.work.x},${places.work.y}`} />
        </g>}
      </svg>
      {sellers.map(s => { const p = places[s.id as SellerId]; return <button key={s.id} onClick={() => onSelect(s.id)}
        style={{ left: `${p.x / 760 * 100}%`, top: `${p.y / 365 * 100}%` }}
        aria-label={`Visit ${s.name}`} aria-pressed={selected === s.id}
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 px-2 py-1 text-[10px] sm:text-xs ${selected === s.id ? 'border-amber-100 bg-amber-300 text-slate-950' : 'border-slate-400 bg-slate-900 text-white'}`}>
        {s.name}
      </button>; })}
    </div>
    <p className="min-h-10 text-sm text-sky-200">{focused && origin && sellerPlace
      ? `${origin.name}${origin !== sellerPlace ? ` → ${sellerPlace.name}` : ''} → your furnace. ${origin !== sellerPlace ? 'The seller stocks material made somewhere else.' : focused.item === 'power' ? 'Power reaches you through the grid.' : 'You are buying from the producer.'}`
      : `Choose a ${M.needs.find(n => n.id === item)!.name.toLowerCase()} supplier on the map or below.`}</p>
  </div>;
}

/** Small representative objects, not a literal industrial pack or calibrated size distribution. */
export function SupplyObjects({ item, bought, usable }: { item: string; bought: number; usable?: number }) {
  const count = Math.min(bought, 20);
  const good = usable === undefined ? count : Math.round(count * usable / bought);
  return <div className="rounded-lg bg-black/15 p-3" role="img" aria-label={`${bought} supplied units${usable !== undefined ? `, ${usable} usable` : ''}`}>
    <div className="flex min-h-9 flex-wrap items-end gap-1.5" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => item === 'power'
        ? <svg key={i} width="24" height="36" viewBox="0 0 24 36"><path d="M14 1 L2 21 H11 L9 35 L23 13 H13 Z" fill="#fcd34d" /></svg>
        : <span key={i} className={item === 'quartz'
          ? i < good ? 'h-7 w-7 rotate-12 rounded-md border-2 border-slate-300 bg-slate-100' : 'h-1.5 w-1.5 rounded-full bg-amber-500'
          : `h-8 w-6 rounded border-2 ${item === 'carbon' ? 'border-slate-500 bg-slate-700' : 'border-amber-600 bg-amber-800'}`} />)}
    </div>
    <p className="mt-2 text-xs text-slate-300">{item === 'power' ? 'Electricity for the furnace batch' : usable !== undefined ? `${bought} delivered → ${usable} usable${bought > usable ? ` · ${bought - usable} fines set aside` : ''}` : `${bought} units in this offer · check a sample to see what is usable`}</p>
  </div>;
}
