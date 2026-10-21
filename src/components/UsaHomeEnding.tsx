import React, { useState } from 'react';
import { sound } from '../services/audio';
import { CargoState, ROUTE_STOPS } from '../types/route';
import { dieForSerial, tvSerialFor } from '../content/waferMap';
import { GuideBox } from './workshop/GuideBox';

interface Props {
  cargo: CargoState;
  onReturnToMap: () => void;
  onComplete: (isPlaceholder: boolean, updates: Partial<CargoState>) => void;
}

const STEPS = [
  { id: 'unbox', action: 'UNBOX', line: "Box open. That's your TV, all the way from Huizhou." },
  { id: 'stand', action: 'FIT STAND', line: "Stand on. TVs don't stand up on their own." },
  { id: 'plug', action: 'PLUG IN', line: 'Plugged in. Standby light is on.' },
  { id: 'power', action: 'POWER ON', line: "It... works. It actually works! (Don't tell my customers.)" },
] as const;

/**
 * Minimal home ending for the TV journey (research/china/CODEX_REVIEW.md: no TV shipped into the old
 * phone ending). Unbox, stand, plug in, power on, then a recap of this run's real IDs.
 */
export function UsaHomeEnding({ cargo, onReturnToMap, onComplete }: Props) {
  const chip = cargo.waferMap && dieForSerial(cargo.waferMap, cargo.selectedChipSerial) ? cargo.selectedChipSerial : null;
  const tvOk = chip !== null && cargo.isTvOperational && cargo.tvChipSerial === chip && cargo.tvSerial === tvSerialFor(chip);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const on = step >= STEPS.length;
  const line = !tvOk
    ? { text: "No TV from China yet. Go back and finish China first.", warning: true }
    : { text: step === 0 ? "So that's the TV you built? Let's set it up." : STEPS[step - 1].line, warning: false };

  const next = () => {
    if (!tvOk || on) return;
    sound.playSelect();
    if (step === STEPS.length - 1) sound.playBootChime();
    setStep(s => s + 1);
  };
  const finish = () => {
    if (!on || done) return;
    setDone(true);
    onComplete(false, {});
  };

  return (
    <section className="flex h-full flex-col gap-3 overflow-hidden bg-[#0c1821] p-3 text-slate-100 sm:p-4" aria-label="Home in the USA">
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div><p className="text-sm font-medium text-amber-300">USA · Home</p><h1 className="text-xl font-bold sm:text-2xl">Finally, TV</h1></div>
        <button onClick={onReturnToMap} className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10">← Map</button>
      </header>
      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_420px] lg:overflow-hidden">
        <div className="relative flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-[#3b2f2a] to-[#1c1512]">
          <svg viewBox="0 0 400 260" className="h-full max-h-[480px] w-full" role="img" aria-label={on ? 'The TV is on and showing a picture' : 'The TV being set up'}>
            <rect x="0" y="210" width="400" height="50" fill="#5a4436" />
            {step === 0 && <rect x="110" y="80" width="180" height="130" fill="#b88a55" stroke="#7a5a35" strokeWidth="3" />}
            {step >= 1 && <>
              <rect x="80" y="50" width="240" height="140" rx="4" fill="#111114" />
              <rect x="88" y="58" width="224" height="124" fill={on ? 'url(#show)' : '#050608'} />
              {step >= 2 && <path d="M175 190 L170 210 H230 L225 190 Z" fill="#2b2f36" />}
              {step >= 3 && <><path d="M300 170 Q340 200 360 210" fill="none" stroke="#222" strokeWidth="3" /><circle cx="314" cy="186" r="2.5" fill={on ? '#34d399' : '#ef4444'} /></>}
            </>}
            <defs>
              <linearGradient id="show" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b6cb0" /><stop offset="1" stopColor="#f6ad55" /></linearGradient>
            </defs>
            {on && <>
              <circle cx="150" cy="100" r="14" fill="#fde68a"><animate attributeName="cx" values="120;280;120" dur="8s" repeatCount="indefinite" /></circle>
              <rect x="88" y="150" width="224" height="32" fill="#2f855a" />
              <text x="200" y="174" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="monospace" fontWeight="bold">IT WORKS!</text>
            </>}
          </svg>
        </div>
        <div className="flex min-h-0 flex-col gap-3">
          <div className="rounded-xl border-2 border-[#4b5a63] bg-[#232c31] p-4">
            {!on ? (
              <button onClick={next} disabled={!tvOk} className="title-button title-button--active font-pixel w-full px-4 py-4 text-xs disabled:opacity-50">
                {tvOk ? STEPS[step].action : 'NO TV YET'}
              </button>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                <p className="font-pixel text-[10px] text-amber-300">YOUR CHIP'S ROAD</p>
                <ol className="space-y-1 text-slate-300">
                  {ROUTE_STOPS.map(stop => <li key={stop.id}>{stop.order}. {stop.country.replace(/\./g, '')}: {stop.pitch}</li>)}
                </ol>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-white/10 pt-2 text-[11px]">
                  <dt className="text-slate-400">Lot</dt><dd>{cargo.lotId}</dd>
                  <dt className="text-slate-400">Wafer</dt><dd>{cargo.waferMap?.waferId}</dd>
                  <dt className="text-slate-400">Chip</dt><dd>{chip}</dd>
                  <dt className="text-slate-400">TV</dt><dd>{cargo.tvSerial}</dd>
                </dl>
                <button onClick={finish} disabled={done} className="title-button title-button--active font-pixel w-full px-4 py-3 text-[10px] disabled:opacity-50">
                  {done ? 'ENJOY THE SHOW' : 'SIT DOWN AND WATCH'}
                </button>
              </div>
            )}
          </div>
          <GuideBox name="Sam" line={line} asset="usa-chat-box" />
        </div>
      </div>
    </section>
  );
}
