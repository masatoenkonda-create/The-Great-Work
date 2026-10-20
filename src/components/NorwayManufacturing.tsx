import React, { useEffect, useRef, useState } from 'react';
import { NorwaySmelterScene, NORWAY_ROCKS, SmelterPhase } from './NorwaySmelterScene';
import { sound } from '../services/audio';

interface Props {
  onReturnToMap: () => void;
  onComplete: (isPlaceholder: boolean, updates: { siliconMetalBatchKg: number }) => void;
}

const COPY: Record<SmelterPhase, { title: string; text: string; action: string }> = {
  sort: { title: 'Start with quartz', text: 'Pick three pale quartz rocks from the tray. Leave the dark waste rock behind.', action: 'Load quartz + carbon' },
  loading: { title: 'Charging the furnace', text: 'Your quartz moves into the furnace. Carbon is added to help remove its oxygen.', action: 'Loading…' },
  loaded: { title: 'Turn rock into silicon', text: 'The white quartz and dark carbon are inside. Switch on the electric furnace and watch the charge change.', action: 'Switch on furnace' },
  smelting: { title: 'The charge is reacting', text: 'Electricity supplies heat. Carbon removes oxygen from the quartz as gas; liquid silicon collects below.', action: 'Smelting…' },
  molten: { title: 'Liquid silicon is ready', text: 'The orange pool is silicon. Open the tap to drain it along the chute into the mold.', action: 'Open tap & pour' },
  pouring: { title: 'Follow the orange stream', text: 'The furnace drains. The casting mold fills with liquid silicon.', action: 'Pouring…' },
  cooling: { title: 'Let the casting cool', text: 'Watch the glow fade as the liquid becomes a solid silicon slab.', action: 'Cooling…' },
  ready: { title: 'A new material, ready to travel', text: 'Quartz has become silicon metal. Germany will purify it further before it can become chip material.', action: 'Send silicon to Germany →' },
};

const TIMED_STEPS: Partial<Record<SmelterPhase, { duration: number; next: SmelterPhase }>> = {
  loading: { duration: 1600, next: 'loaded' },
  smelting: { duration: 5500, next: 'molten' },
  pouring: { duration: 3000, next: 'cooling' },
  cooling: { duration: 4000, next: 'ready' },
};

/** Norway work screen. The caller owns the arrival dialogue and transition into this screen. */
export function NorwayManufacturing({ onReturnToMap, onComplete }: Props) {
  const [phase, setPhase] = useState<SmelterPhase>('sort');
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const completed = useRef(false);
  const running = ['loading', 'smelting', 'pouring', 'cooling'].includes(phase);
  const step = phase === 'sort' ? 0 : ['loading', 'loaded'].includes(phase) ? 1 : ['smelting', 'molten'].includes(phase) ? 2 : 3;

  useEffect(() => {
    const timedStep = TIMED_STEPS[phase];
    if (!timedStep) return;
    const { duration, next } = timedStep;
    let frame = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const value = Math.min(1, (now - start) / duration);
      setProgress(value);
      if (value < 1) frame = requestAnimationFrame(animate);
      else { setPhase(next); setProgress(0); sound.playSelect(); }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  const pick = (index: number) => {
    if (phase !== 'sort') return;
    if (!NORWAY_ROCKS[index].quartz) {
      setMessage('That is waste rock. Choose the pale quartz for this batch.');
      sound.playProbePing(false);
      return;
    }
    setMessage('');
    setSelected(previous => previous.includes(index) ? previous.filter(value => value !== index) : previous.length < 3 ? [...previous, index] : previous);
    sound.playClink();
  };
  const operate = () => {
    if (running || completed.current) return;
    if (phase === 'sort') {
      if (selected.length !== 3) { setMessage('Choose three quartz rocks first.'); return; }
      setPhase('loading');
    } else if (phase === 'loaded') setPhase('smelting');
    else if (phase === 'molten') setPhase('pouring');
    else if (phase === 'ready') {
      completed.current = true;
      onComplete(false, { siliconMetalBatchKg: 12 });
    }
    setMessage('');
    sound.playSelect();
  };

  return (
    <section className="h-full overflow-y-auto bg-[#0c1821] text-slate-100 font-sans" aria-label="Norway silicon workshop">
      <div className="mx-auto flex min-h-full max-w-[1500px] flex-col p-3 sm:p-5 gap-3">
        <header className="flex items-center justify-between gap-3">
          <div><p className="text-[10px] font-bold tracking-[0.2em] text-amber-300">01 / NORWAY</p><h1 className="text-xl sm:text-2xl font-bold">From quartz to silicon</h1></div>
          <button onClick={onReturnToMap} className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10">← Map</button>
        </header>
        <ol className="grid grid-cols-4 gap-2 text-[10px] sm:text-xs" aria-label="Manufacturing steps">
          {['Pick quartz', 'Load furnace', 'Smelt', 'Cast & cool'].map((label, i) => <li key={label} aria-current={step === i ? 'step' : undefined} className={`rounded-lg border px-2 py-2 ${step === i ? 'border-amber-300/70 bg-amber-300/10 text-amber-200' : 'border-white/10 text-slate-400'}`}>{i < step ? '✓' : `0${i + 1}`} · {label}</li>)}
        </ol>
        <div className="relative flex-1 min-h-[300px] sm:min-h-[360px]">
          <NorwaySmelterScene phase={phase} progress={progress} selected={selected} onPick={pick} onOperate={operate} />
        </div>
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-[#152732] p-4 sm:p-5 md:grid-cols-[1fr_340px]">
          <div aria-live="polite">
            <h2 className="text-lg font-bold text-amber-100">{COPY[phase].title}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-300">{COPY[phase].text}</p>
            {phase === 'sort' && <div className="mt-3 flex flex-wrap gap-2" aria-label="Select feed rocks">
              {NORWAY_ROCKS.map((rock, i) => <button key={i} onClick={() => pick(i)} aria-pressed={selected.includes(i)} className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-xs ${selected.includes(i) ? 'border-amber-300 bg-amber-300/10 text-amber-200' : 'border-white/15 hover:bg-white/10'}`}>
                <span aria-hidden="true" className={`h-3 w-3 rotate-12 rounded-sm ${rock.quartz ? 'bg-stone-100' : 'bg-stone-600'}`} />{rock.name}{selected.includes(i) ? ' ✓' : ''}
              </button>)}
            </div>}
            {message && <p role="alert" className="mt-2 text-xs text-amber-300">{message}</p>}
            {phase === 'ready' && <p className="mt-3 text-sm font-bold text-emerald-300">12 kg silicon metal · next stop: purification</p>}
          </div>
          <div className="flex flex-col justify-center gap-2">
            {running && <div role="progressbar" aria-label={COPY[phase].title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-amber-400" style={{ width: `${progress * 100}%` }} /></div>}
            <button onClick={operate} disabled={running || (phase === 'sort' && selected.length !== 3)} className="min-h-12 rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-200 disabled:cursor-default disabled:bg-slate-600 disabled:text-slate-300">{COPY[phase].action}</button>
            <p className="text-center text-[10px] text-slate-400">{phase === 'sort' ? `${selected.length} / 3 quartz selected · click rocks or use the buttons` : 'Quartz + carbon + electricity → silicon metal'}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
