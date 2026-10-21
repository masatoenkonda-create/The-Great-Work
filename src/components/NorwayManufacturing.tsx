import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NorwaySmelterScene, SMELTER_PHASES, SmelterPhase, SmelterTarget } from './NorwaySmelterScene';
import { sound } from '../services/audio';
import { checkFurnace, FurnacePower, ElectrodePosition } from '../content/norwayControls';
import { Pickaxe, Hammer, ArrowDownToLine, Power, Truck, Package, Check, LoaderCircle, ChevronUp, ChevronDown, MessageSquare, SlidersHorizontal } from 'lucide-react';

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

const GUIDANCE: { phases: SmelterPhase[]; text: string }[] = [
  { phases: ['mine', 'mining'], text: 'Quartz contains silicon bound to oxygen. Free a piece with the pickaxe.' },
  { phases: ['break', 'breaking'], text: 'Break the quartz into small chunks for the furnace.' },
  { phases: ['loadQuartz', 'loadingQuartz'], text: 'Tip the quartz into the furnace’s top opening.' },
  { phases: ['loadCarbon', 'loadingCarbon'], text: 'Add carbon. It helps remove the oxygen from quartz.' },
  { phases: ['power'], text: 'Set the power and lower the electrodes into the charge, then start the furnace.' },
  { phases: ['smelting'], text: 'Electricity supplies heat. Carbon removes oxygen; liquid silicon collects below.' },
  { phases: ['tap', 'pouring'], text: 'Liquid silicon is ready. Open the taphole to fill the mould.' },
  { phases: ['cooling'], text: 'Wait for the glow to fade. The silicon must cool before breaking.' },
  { phases: ['breakCast', 'breakingCast'], text: 'The casting is solid. Break it into silicon metal lumps.' },
  { phases: ['bag', 'bagging'], text: 'Bag the silicon lumps for shipping.' },
  { phases: ['ship', 'shipping', 'done'], text: 'Send the bag to Germany for further purification.' },
];

const TOOL = {
  mine: Pickaxe, mining: Pickaxe, break: Hammer, breaking: Hammer,
  loadQuartz: ArrowDownToLine, loadingQuartz: ArrowDownToLine,
  loadCarbon: ArrowDownToLine, loadingCarbon: ArrowDownToLine,
  power: Power, smelting: Power, tap: ChevronDown, pouring: ChevronDown,
  cooling: LoaderCircle, breakCast: Hammer, breakingCast: Hammer,
  bag: Package, bagging: Package, ship: Truck, shipping: Truck, done: Check,
};

const BUTTON_LABEL: Partial<Record<SmelterPhase, string>> = {
  mine: 'Mine', break: 'Break', loadQuartz: 'Load quartz', loadCarbon: 'Load carbon',
  power: 'Start', tap: 'Pour', breakCast: 'Break', bag: 'Bag', ship: 'Ship',
};

type WorkshopMessage = { id: number; text: string; warning: boolean };

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
  const [power, setPower] = useState<FurnacePower>('low');
  const [electrodes, setElectrodes] = useState<ElectrodePosition>('raised');
  const [messages, setMessages] = useState<WorkshopMessage[]>([]);
  const messageId = useRef(0);
  const lastGuidance = useRef('');
  const chat = useRef<HTMLDivElement>(null);
  const completed = useRef(false);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const waiting = ACTIONS[phase];
  const guidance = GUIDANCE.find(p => p.phases.includes(phase))!.text;
  const ToolIcon = TOOL[phase];
  const furnaceControls = phase === 'power' || phase === 'smelting';

  // Keep a short, persistent history without repeating a tip when its animation starts.
  useEffect(() => {
    if (lastGuidance.current === guidance) return;
    lastGuidance.current = guidance;
    const entry = { id: ++messageId.current, text: guidance, warning: false };
    setMessages(previous => [...previous.slice(-29), entry]);
  }, [guidance]);

  useEffect(() => {
    if (!message) return;
    const entry = { id: ++messageId.current, text: message, warning: true };
    setMessages(previous => [...previous.slice(-29), entry]);
  }, [message]);

  useEffect(() => {
    if (chat.current) chat.current.scrollTop = chat.current.scrollHeight;
  }, [messages]);

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
      if (phase === 'power') {
        const problem = checkFurnace(power, electrodes);
        if (problem) {
          setMessage(problem);
          sound.playError();
          return;
        }
      }
      setPhase(waiting.next);
      return;
    }
    if (target === 'switch' && order(phase) < order('power')) {
      setMessage(phase === 'loadCarbon' ? 'Add carbon first.' : 'Load quartz and carbon first.');
      sound.playError();
    }
  }, [phase, waiting, power, electrodes]);

  // Space or Enter uses the highlighted object, the same as clicking it.
  const actRef = useRef(act);
  actRef.current = act;
  const targetRef = useRef(waiting?.target);
  targetRef.current = waiting?.target;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      if (event.repeat || (event.target instanceof HTMLElement && event.target.closest('button, input, select, textarea, [contenteditable="true"]'))) return;
      event.preventDefault();
      if (targetRef.current) actRef.current(targetRef.current);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section className="h-full overflow-hidden bg-[#0c1821] text-slate-100 font-sans" aria-label="Norway silicon workshop">
      <div className="mx-auto flex h-full min-h-0 max-w-[1800px] flex-col p-3 sm:p-5 gap-4">
        <header className="flex shrink-0 items-center justify-between gap-3">
          <div><p className="text-sm font-medium text-amber-300">Norway · Silicon workshop</p><h1 className="text-xl sm:text-2xl font-bold">From quartz to silicon</h1></div>
          <button onClick={onReturnToMap} className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10">← Map</button>
        </header>
        <div className="grid flex-1 min-h-0 gap-4 overflow-y-auto lg:overflow-visible lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_260px]">
          <div className="relative h-[48svh] min-h-[300px] lg:h-full lg:min-h-0" data-testid="norway-viewport">
            <NorwaySmelterScene phase={phase} progress={progress} target={waiting?.target ?? null} onAct={act} />
          </div>
          <aside className="flex min-h-[340px] flex-col gap-5 rounded-2xl border border-white/10 bg-[#152732] p-4 lg:min-h-0 lg:overflow-y-auto" aria-label="Workshop control panel">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-300"><SlidersHorizontal size={18} aria-hidden="true" />Controls</h2>
            {furnaceControls && <div className="space-y-5">
              <fieldset disabled={phase !== 'power'}>
                <legend className="mb-3 text-sm font-semibold">Power</legend>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'working', 'high'] as const).map((value, index) => <button key={value} type="button" aria-label={`${value === 'working' ? 'Medium' : value === 'low' ? 'Low' : 'High'} power`} title={`${value === 'working' ? 'Medium' : value === 'low' ? 'Low' : 'High'} power`} aria-pressed={power === value} onClick={() => { setPower(value); setMessage(''); }} className={`flex h-20 flex-col items-center justify-center gap-2 rounded-lg border shadow-inner disabled:opacity-60 ${power === value ? 'border-amber-300 bg-amber-300/15 text-amber-200' : 'border-white/20 bg-black/20 text-slate-400 hover:bg-white/5'}`}><span className="flex h-7 items-end gap-1" aria-hidden="true">{[0, 1, 2].map(bar => <span key={bar} className={`w-2 rounded-sm ${bar <= index ? 'bg-current' : 'bg-white/10'}`} style={{ height: `${12 + bar * 7}px` }} />)}</span><span className="text-xs">{['Low', 'Med', 'High'][index]}</span></button>)}
                </div>
              </fieldset>
              <fieldset disabled={phase !== 'power'}>
                <legend className="mb-3 text-sm font-semibold">Electrodes</legend>
                <div className="flex items-center justify-center gap-5 rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="relative h-24 w-8 rounded-full border border-white/15 bg-black/40" aria-hidden="true"><span className={`absolute left-1 right-1 h-9 rounded-lg border border-slate-300/40 bg-gradient-to-b from-slate-400 to-slate-700 shadow-lg transition-transform ${electrodes === 'raised' ? 'translate-y-1' : 'translate-y-13'}`} /></div>
                  <div className="grid gap-2">
                    {(['raised', 'inCharge'] as const).map(value => <button key={value} type="button" aria-label={value === 'raised' ? 'Raise electrodes' : 'Lower electrodes into charge'} aria-pressed={electrodes === value} onClick={() => { setElectrodes(value); setMessage(''); }} className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold disabled:opacity-60 ${electrodes === value ? 'border-amber-300 bg-amber-300/15 text-amber-200' : 'border-white/20 hover:bg-white/5'}`}>{value === 'raised' ? <ChevronUp size={20} aria-hidden="true" /> : <ChevronDown size={20} aria-hidden="true" />}{value === 'raised' ? 'Up' : 'Down'}</button>)}
                  </div>
                </div>
              </fieldset>
            </div>}
            <div className={`flex flex-1 flex-col items-center justify-center gap-4 ${furnaceControls ? 'pt-2' : ''}`}>
              <button disabled={!waiting} aria-label={waiting?.action ?? INSTRUCTION[phase]} title={waiting?.action ?? INSTRUCTION[phase]} onClick={() => waiting && act(waiting.target)} className="flex min-h-28 w-full flex-col items-center justify-center gap-3 rounded-xl border border-amber-200/40 bg-gradient-to-b from-amber-200 to-amber-400 p-4 font-bold text-slate-950 shadow-[0_5px_0_#926021] hover:brightness-110 active:translate-y-1 active:shadow-none disabled:translate-y-0 disabled:border-white/10 disabled:bg-none disabled:bg-white/5 disabled:text-slate-400 disabled:shadow-none disabled:cursor-wait">
                {!waiting && phase !== 'done' ? <LoaderCircle size={34} className="animate-spin" aria-hidden="true" /> : <ToolIcon size={38} strokeWidth={1.6} aria-hidden="true" />}
                <span className="text-sm">{waiting ? BUTTON_LABEL[phase] : phase === 'done' ? 'Sent' : phase === 'cooling' ? 'Cooling' : 'Running'}</span>
              </button>
              <div role="progressbar" aria-label={INSTRUCTION[phase]} aria-valuemin={0} aria-valuemax={100} aria-valuenow={waiting ? 0 : Math.round(progress * 100)} className={`h-1.5 w-full overflow-hidden rounded-full bg-white/10 ${waiting ? 'invisible' : ''}`}><div className="h-full bg-amber-400" style={{ width: `${progress * 100}%` }} /></div>
            </div>
          </aside>
        </div>
        <section className="flex h-36 shrink-0 flex-col rounded-2xl border border-white/10 bg-[#101d27]" aria-label="Workshop messages">
          <h2 className="flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-2 text-sm font-semibold text-slate-300"><MessageSquare size={16} aria-hidden="true" />Workshop log</h2>
          <div ref={chat} role="log" aria-live="polite" aria-relevant="additions" tabIndex={0} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm leading-relaxed focus-visible:outline-2 focus-visible:outline-amber-300">
            {messages.map(entry => <p key={entry.id} className={`flex items-start gap-3 ${entry.warning ? 'text-amber-200' : 'text-slate-300'}`}><span aria-hidden="true" className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${entry.warning ? 'bg-amber-300' : 'bg-slate-500'}`} />{entry.text}</p>)}
          </div>
        </section>
      </div>
    </section>
  );
}
