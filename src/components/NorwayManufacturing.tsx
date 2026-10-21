import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NorwaySmelterScene, SMELTER_PHASES, SmelterPhase, SmelterTarget } from './NorwaySmelterScene';
import { sound } from '../services/audio';

interface Props {
  onReturnToMap: () => void;
  onComplete: (isPlaceholder: boolean, updates: { siliconMetalBatchKg: number }) => void;
}

const order = (phase: SmelterPhase) => SMELTER_PHASES.indexOf(phase);

/** Each waiting phase: the object to use, its label, the button text, and the animation it starts. */
const ACTIONS: Partial<Record<SmelterPhase, { target: SmelterTarget; label: string; action: string; next: SmelterPhase }>> = {
  mine: { target: 'outcrop', label: 'QUARTZ ROCK', action: 'Swing the pickaxe', next: 'mining' },
  break: { target: 'bigRock', label: 'HAMMER', action: 'Hammer the rock', next: 'breaking' },
  loadQuartz: { target: 'quartzBin', label: 'QUARTZ', action: 'Tip the quartz in', next: 'loadingQuartz' },
  loadCarbon: { target: 'carbonBin', label: 'CARBON', action: 'Tip the carbon in', next: 'loadingCarbon' },
  power: { target: 'switch', label: 'POWER SWITCH', action: 'Switch on', next: 'smelting' },
  tap: { target: 'tap', label: 'TAP CONTROL', action: 'Open the taphole', next: 'pouring' },
  breakCast: { target: 'cast', label: 'SOLID SILICON', action: 'Hammer the casting', next: 'breakingCast' },
  bag: { target: 'lumps', label: 'SILICON LUMPS', action: 'Bag the lumps', next: 'bagging' },
  ship: { target: 'bag', label: 'BAG', action: 'Send to Germany →', next: 'shipping' },
};

const TIMED: Partial<Record<SmelterPhase, { duration: number; next: SmelterPhase }>> = {
  mining: { duration: 1500, next: 'break' },
  breaking: { duration: 1300, next: 'loadQuartz' },
  loadingQuartz: { duration: 1600, next: 'loadCarbon' },
  loadingCarbon: { duration: 1600, next: 'power' },
  smelting: { duration: 6000, next: 'tap' },
  pouring: { duration: 3200, next: 'cooling' },
  cooling: { duration: 3500, next: 'breakCast' },
  breakingCast: { duration: 1300, next: 'bag' },
  bagging: { duration: 1700, next: 'ship' },
  shipping: { duration: 1600, next: 'done' },
};

const INSTRUCTION: Record<SmelterPhase, string> = {
  mine: 'Break a piece of quartz free.', mining: 'Break a piece of quartz free.',
  break: 'Break the quartz into smaller chunks.', breaking: 'Break the quartz into smaller chunks.',
  loadQuartz: 'Load the quartz into the furnace.', loadingQuartz: 'Load the quartz into the furnace.',
  loadCarbon: 'Now load the carbon.', loadingCarbon: 'Now load the carbon.',
  power: 'Switch on the electric furnace.', smelting: 'The furnace is working.',
  tap: 'Release the liquid silicon into the mould.', pouring: 'Release the liquid silicon into the mould.',
  cooling: 'Let it cool.', breakCast: 'Break the solid silicon.', breakingCast: 'Break the solid silicon.',
  bag: 'Bag the silicon for Germany.', bagging: 'Bag the silicon for Germany.',
  ship: 'Send the bag to Germany.', shipping: 'Send the bag to Germany.', done: 'Sent to Germany.',
};

/** Short result lines at the reveals that matter; the animation carries the rest. */
const RESULT: Partial<Record<SmelterPhase, string>> = {
  break: 'Silicon comes from quartz rock.',
  smelting: 'Carbon helps remove oxygen from quartz.',
  tap: 'The quartz has become liquid silicon.',
  bag: 'This is silicon metal.', bagging: 'This is silicon metal.',
  ship: 'Next: purify the silicon in Germany.', shipping: 'Next: purify the silicon in Germany.',
};

const STEPS: { label: string; phases: SmelterPhase[] }[] = [
  { label: 'Mine', phases: ['mine', 'mining'] },
  { label: 'Break', phases: ['break', 'breaking'] },
  { label: 'Load', phases: ['loadQuartz', 'loadingQuartz', 'loadCarbon', 'loadingCarbon'] },
  { label: 'Power', phases: ['power', 'smelting'] },
  { label: 'Pour', phases: ['tap', 'pouring'] },
  { label: 'Cool & break', phases: ['cooling', 'breakCast', 'breakingCast'] },
  { label: 'Ship', phases: ['bag', 'bagging', 'ship', 'shipping', 'done'] },
];

const SOUND: Partial<Record<SmelterPhase, () => void>> = {
  mining: () => sound.playClink(), breaking: () => sound.playClink(), breakingCast: () => sound.playClink(),
  loadingQuartz: () => sound.playSelect(), loadingCarbon: () => sound.playSelect(),
  smelting: () => sound.playCrystalHum(), pouring: () => sound.playBubble(), shipping: () => sound.playConfirm(),
};

/** Norway work screen: quartz rock to bagged silicon metal. The caller owns the arrival dialogue. */
export function NorwayManufacturing({ onReturnToMap, onComplete }: Props) {
  const [phase, setPhase] = useState<SmelterPhase>('mine');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const completed = useRef(false);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const waiting = ACTIONS[phase];
  const step = STEPS.findIndex(s => s.phases.includes(phase));

  useEffect(() => {
    setMessage('');
    SOUND[phase]?.();
    const timed = TIMED[phase];
    if (!timed) return;
    let frame = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const value = Math.min(1, (now - start) / timed.duration);
      setProgress(value);
      if (value < 1) frame = requestAnimationFrame(animate);
      else {
        setProgress(0);
        setPhase(timed.next);
        if (timed.next === 'done' && !completed.current) {
          completed.current = true;
          completeRef.current(false, { siliconMetalBatchKg: 12 });
        }
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  const act = useCallback((target: SmelterTarget) => {
    if ((target === 'cast' || target === 'lumps') && (phase === 'pouring' || phase === 'cooling')) {
      setMessage('Too hot. Let it cool first.');
      sound.playError();
      return;
    }
    if (!waiting) return;
    const loading = phase === 'loadQuartz' || phase === 'loadCarbon';
    if (target === waiting.target || (target === 'furnace' && loading)) {
      setPhase(waiting.next);
      return;
    }
    if (target === 'switch' && order(phase) < order('power')) {
      setMessage(phase === 'loadCarbon' ? 'Add carbon first.' : 'Load quartz and carbon first.');
      sound.playError();
    }
  }, [phase, waiting]);

  // Space or Enter uses the highlighted object, the same as clicking it.
  const actRef = useRef(act);
  actRef.current = act;
  const targetRef = useRef(waiting?.target);
  targetRef.current = waiting?.target;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      if (event.target instanceof HTMLButtonElement) return;
      event.preventDefault();
      if (targetRef.current) actRef.current(targetRef.current);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section className="h-full overflow-y-auto bg-[#0c1821] text-slate-100 font-sans" aria-label="Norway silicon workshop">
      <div className="mx-auto flex min-h-full max-w-[1500px] flex-col p-3 sm:p-5 gap-3">
        <header className="flex items-center justify-between gap-3">
          <div><p className="text-[10px] font-bold tracking-[0.2em] text-amber-300">01 / NORWAY</p><h1 className="text-xl sm:text-2xl font-bold">From quartz to silicon</h1></div>
          <button onClick={onReturnToMap} className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10">← Map</button>
        </header>
        <ol className="grid grid-cols-7 gap-1.5 text-[10px] sm:text-xs" aria-label="Steps">
          {STEPS.map((s, i) => <li key={s.label} aria-current={step === i ? 'step' : undefined} className={`truncate rounded-lg border px-2 py-1.5 text-center ${step === i ? 'border-amber-300/70 bg-amber-300/10 text-amber-200' : i < step ? 'border-emerald-400/30 text-emerald-300' : 'border-white/10 text-slate-400'}`}>{i < step || phase === 'done' ? '✓ ' : ''}{s.label}</li>)}
        </ol>
        <div className="relative flex-1 min-h-[320px] sm:min-h-[420px]">
          <NorwaySmelterScene phase={phase} progress={progress} target={waiting?.target ?? null} targetLabel={waiting?.label ?? ''} onAct={act} />
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#152732] p-4 sm:flex-row sm:items-center">
          <div className="flex-1" aria-live="polite">
            <h2 className="text-lg font-bold text-amber-100">{INSTRUCTION[phase]}</h2>
            {RESULT[phase] && <p className="mt-1 text-sm text-emerald-300">{RESULT[phase]}</p>}
            {message && <p role="alert" className="mt-1 text-sm text-amber-300">{message}</p>}
          </div>
          <div className="flex flex-col gap-1.5 sm:w-72">
            {waiting
              ? <button onClick={() => act(waiting.target)} className="min-h-12 rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-amber-200">{waiting.action}</button>
              : phase !== 'done' && <div role="progressbar" aria-label={INSTRUCTION[phase]} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-amber-400" style={{ width: `${progress * 100}%` }} /></div>}
            {waiting && <p className="text-center text-[10px] text-slate-400">Click the highlighted object or press Space</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
