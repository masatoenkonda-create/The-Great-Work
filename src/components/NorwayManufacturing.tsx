import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NorwaySmelterScene, SMELTER_PHASES, SmelterPhase, SmelterTarget } from './NorwaySmelterScene';
import { sound } from '../services/audio';
import { ASSETS } from '../content/assets';
import {
  ElectrodePosition, FurnaceZone, furnaceZone, targetTemperature, SIGURD_FURNACE,
  POWER_LEVELS, ROOM_TEMPERATURE, WORKING_TEMPERATURE, GAUGE_MAX,
} from '../content/norwayControls';
import { PANEL_SIZE, PANEL_SECTIONS, PANEL_LAMPS, PANEL_GAUGES, PANEL_CONTROLS, PanelControlId, PanelLampId, PanelGaugeId, PanelRect } from '../content/norwayPanel';

interface Props {
  onReturnToMap: () => void;
  onComplete: (isPlaceholder: boolean, updates: { siliconMetalBatchKg: number }) => void;
}

const order = (phase: SmelterPhase) => SMELTER_PHASES.indexOf(phase);

/** Each waiting phase: the object (or panel button) to use, and the animation it starts. */
const ACTIONS: Partial<Record<SmelterPhase, { target: SmelterTarget; control: PanelControlId; next: SmelterPhase }>> = {
  mine: { target: 'outcrop', control: 'pickaxe', next: 'mining' },
  break: { target: 'bigRock', control: 'hammer', next: 'breaking' },
  loadQuartz: { target: 'quartzBin', control: 'quartz', next: 'loadingQuartz' },
  loadCarbon: { target: 'carbonBin', control: 'carbon', next: 'loadingCarbon' },
  power: { target: 'switch', control: 'main', next: 'smelting' },
  tap: { target: 'tap', control: 'tap', next: 'pouring' },
  breakCast: { target: 'cast', control: 'hammer', next: 'breakingCast' },
  bag: { target: 'lumps', control: 'bag', next: 'bagging' },
  ship: { target: 'bag', control: 'ship', next: 'shipping' },
};

/** Smelting is not timed: it advances only while the furnace is in its working band. */
const TIMED: Partial<Record<SmelterPhase, { duration: number; next: SmelterPhase }>> = {
  mining: { duration: 1500, next: 'break' },
  breaking: { duration: 1300, next: 'loadQuartz' },
  loadingQuartz: { duration: 1600, next: 'loadCarbon' },
  loadingCarbon: { duration: 1600, next: 'power' },
  pouring: { duration: 3200, next: 'cooling' },
  cooling: { duration: 3500, next: 'breakCast' },
  breakingCast: { duration: 1300, next: 'bag' },
  bagging: { duration: 1700, next: 'ship' },
  shipping: { duration: 1600, next: 'done' },
};
const SMELT_SECONDS = 6;

/** Sigurd's line when each step begins. */
const SIGURD_STEP: Partial<Record<SmelterPhase, string>> = {
  mine: 'Quartz first! Use the pickaxe to free a piece. (A piece, not the whole mountain.)',
  break: 'Nice! Hammer that piece into smaller chunks. Think chunks, not powder.',
  loadQuartz: 'Into the top opening it goes. Load the quartz!',
  loadCarbon: 'Quartz contains silicon bound to oxygen. Add carbon to help remove the oxygen.',
  power: "All loaded! Switch on, adjust the power and electrodes, and watch the heat. I'll keep an eye on it.",
  tap: 'There it is: liquid silicon! Open the taphole and fill the mould.',
  pouring: 'Look at it flow! Quartz and carbon went in; liquid silicon comes out.',
  cooling: 'Let the glow fade before touching it. (Admire it. Don’t hug it.)',
  breakCast: 'Solid at last! Use the hammer to break the casting into lumps.',
  bag: 'That silver-grey shine? Silicon metal! Bag the lumps.',
  ship: 'Next stop: Germany for purification. (A spa day for silicon.)',
  done: 'Good work. On to Germany!',
};

const SOUND: Partial<Record<SmelterPhase, () => void>> = {
  mining: () => sound.playClink(), breaking: () => sound.playClink(), breakingCast: () => sound.playClink(),
  loadingQuartz: () => sound.playSelect(), loadingCarbon: () => sound.playSelect(),
  smelting: () => sound.playCrystalHum(), pouring: () => sound.playBubble(), shipping: () => sound.playConfirm(),
};

type ChatLine = { text: string; warning: boolean };
type Led = 'off' | 'on' | 'next';

/** Norway work screen: 3D workcell, fixed control panel, and Sigurd's chat below it. The caller owns the arrival dialogue. */
export function NorwayManufacturing({ onReturnToMap, onComplete }: Props) {
  const [phase, setPhase] = useState<SmelterPhase>('mine');
  const [progress, setProgress] = useState(0);
  const [mainOn, setMainOn] = useState(false);
  const [power, setPower] = useState(1);
  const [electrodes, setElectrodes] = useState<ElectrodePosition>('raised');
  const [temperature, setTemperature] = useState(ROOM_TEMPERATURE);
  const [chat, setChat] = useState<ChatLine>({ text: SIGURD_STEP.mine!, warning: false });
  const completed = useRef(false);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const waiting = ACTIONS[phase];
  const zone: FurnaceZone = furnaceZone(mainOn, power, electrodes, temperature);

  const say = useCallback((text: string, warning = false) => {
    if (!text) return;
    setChat({ text, warning });
  }, []);

  // Speak once per step and once per furnace change (refs keep dev double-renders from repeating lines).
  const spoken = useRef({ phase: '', zone: '' });
  useEffect(() => {
    if (spoken.current.phase === phase) return;
    spoken.current.phase = phase;
    say(SIGURD_STEP[phase] ?? '');
  }, [phase, say]);
  useEffect(() => {
    if (spoken.current.zone === zone || (phase !== 'power' && phase !== 'smelting')) return;
    spoken.current.zone = zone;
    say(SIGURD_FURNACE[zone], zone === 'cold' || zone === 'hot' || zone === 'escaping');
  }, [zone, phase, say]);

  // Timed animations between player actions.
  useEffect(() => {
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

  // Furnace temperature follows the panel settings; smelting only advances inside the working band.
  const furnace = useRef({ mainOn, power, electrodes, phase, temperature, progress });
  furnace.current = { mainOn, power, electrodes, phase, temperature, progress };
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const f = furnace.current;
      const target = targetTemperature(f.mainOn, f.power, f.electrodes);
      const next = f.temperature + (target - f.temperature) * (1 - Math.exp(-dt / 1.1));
      if (Math.abs(next - f.temperature) > 0.5) setTemperature(next);
      if (f.phase === 'smelting' && furnaceZone(f.mainOn, f.power, f.electrodes, next) === 'ok') {
        const done = f.progress + dt / SMELT_SECONDS;
        if (done >= 1) { setProgress(0); setPhase('tap'); } else setProgress(done);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  /** Returns false when the action does not apply right now. */
  const act = useCallback((target: SmelterTarget): boolean => {
    if ((target === 'cast' || target === 'lumps') && (phase === 'pouring' || phase === 'cooling')) {
      say("Careful! It's still glowing hot. Wait for it to cool.", true);
      sound.playError();
      return true;
    }
    if (target === 'switch') {
      if (order(phase) < order('power')) {
        say(phase === 'loadCarbon' ? 'Carbon first, then power.' : 'Load the quartz and carbon before switching on.', true);
        sound.playError();
        return true;
      }
      if (phase === 'power' || phase === 'smelting') {
        setMainOn(on => !on);
        if (phase === 'power') setPhase('smelting');
        sound.playSelect();
        return true;
      }
    }
    if (!waiting) return false;
    if (target === waiting.target || (target === 'furnace' && (phase === 'loadQuartz' || phase === 'loadCarbon'))) {
      setPhase(waiting.next);
      return true;
    }
    return false;
  }, [phase, waiting, say]);

  const press = (id: PanelControlId) => {
    const furnaceAdjustable = phase === 'power' || phase === 'smelting';
    let handled = true;
    switch (id) {
      case 'pickaxe': handled = act('outcrop'); break;
      case 'hammer': handled = act(phase === 'break' ? 'bigRock' : 'cast'); break;
      case 'quartz': handled = act('quartzBin'); break;
      case 'carbon': handled = act('carbonBin'); break;
      case 'main': handled = act('switch'); break;
      case 'tap': handled = act('tap'); break;
      case 'bag': handled = act('lumps'); break;
      case 'ship': handled = act('bag'); break;
      case 'powerDown': case 'powerUp': case 'electrodesUp': case 'electrodesDown':
        if (!furnaceAdjustable) { handled = false; break; }
        if (id === 'powerDown') setPower(p => Math.max(1, p - 1));
        if (id === 'powerUp') setPower(p => Math.min(POWER_LEVELS, p + 1));
        if (id === 'electrodesUp') setElectrodes('raised');
        if (id === 'electrodesDown') setElectrodes('inCharge');
        sound.playSelect();
        break;
    }
    if (!handled) {
      say(`Not now. ${SIGURD_STEP[phase] ?? 'Wait for this step to finish.'}`, true);
      sound.playError();
    }
  };

  // Space or Enter uses the highlighted object, the same as clicking it.
  const actRef = useRef(act);
  actRef.current = act;
  const targetRef = useRef(waiting?.target);
  targetRef.current = waiting?.target;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      if (event.repeat || (event.target instanceof HTMLElement && event.target.closest('button, input, select, textarea, [contenteditable="true"], [data-asset="norway-chat-box"]'))) return;
      event.preventDefault();
      if (targetRef.current) actRef.current(targetRef.current);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Panel readings.
  const from = (other: SmelterPhase) => order(phase) >= order(other);
  const smelted = phase === 'smelting' ? progress : from('tap') ? 1 : 0;
  const liquid = phase === 'smelting' ? progress : phase === 'tap' ? 1 : phase === 'pouring' ? 1 - progress : 0;
  const mouldTemperature = phase === 'pouring' ? 1400 * progress : phase === 'cooling' ? 1400 - 1380 * progress : from('breakCast') ? ROOM_TEMPERATURE : null;
  const lamps: Record<PanelLampId, boolean> = {
    quartzIn: from('loadCarbon'), carbonIn: from('power'), mainOn,
    heatOk: zone === 'ok', molten: phase === 'tap' || phase === 'pouring', cool: from('breakCast'), bagged: from('ship'),
  };
  const furnaceAdjustable = phase === 'power' || phase === 'smelting';
  const led = (id: PanelControlId): Led => {
    if (waiting?.control === id) return 'next';
    if (id === 'main') return mainOn ? 'on' : 'off';
    if (id === 'electrodesUp') return electrodes === 'raised' ? 'on' : 'off';
    if (id === 'electrodesDown') return electrodes === 'inCharge' ? 'on' : 'off';
    if (id === 'powerUp' || id === 'powerDown') return furnaceAdjustable ? 'on' : 'off';
    return 'off';
  };

  return (
    <section className="h-full overflow-hidden bg-[#0c1821] text-slate-100 font-sans" aria-label="Norway silicon workshop">
      <div className="mx-auto flex h-full min-h-0 max-w-[1800px] flex-col gap-3 p-3 sm:p-4">
        <header className="flex shrink-0 items-center justify-between gap-3">
          <div><p className="text-sm font-medium text-amber-300">Norway · Silicon workshop</p><h1 className="text-xl font-bold sm:text-2xl">From quartz to silicon</h1></div>
          <button onClick={onReturnToMap} className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10">← Map</button>
        </header>
        <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_420px] lg:overflow-hidden">
          <div className="relative h-[48svh] min-h-[300px] lg:h-full lg:min-h-0">
            <NorwaySmelterScene
              phase={phase} progress={progress} target={waiting?.target ?? null} onAct={act}
              heat={mainOn ? Math.min(1.3, Math.max(0, (temperature - 600) / 1300)) : 0}
              electrodesRaised={electrodes === 'raised' && order(phase) <= order('smelting')}
            />
          </div>
          <div className="flex min-h-0 flex-col gap-3">
            <ControlPanel lamps={lamps} led={led} onPress={press} readings={{ temperature, smelted, liquid, mouldTemperature, power }} />
            <SigurdChat line={chat} />
          </div>
        </div>
      </div>
    </section>
  );
}

const pct = (rect: PanelRect) => ({
  left: `${rect.x / PANEL_SIZE.width * 100}%`, top: `${rect.y / PANEL_SIZE.height * 100}%`,
  width: `${rect.w / PANEL_SIZE.width * 100}%`, height: `${rect.h / PANEL_SIZE.height * 100}%`,
});
const LABEL = 'absolute inset-x-0 bottom-0 truncate text-center font-mono text-[8px] leading-none tracking-wide text-slate-300 sm:text-[9px]';

interface Readings { temperature: number; smelted: number; liquid: number; mouldTemperature: number | null; power: number }

/**
 * Placeholder cockpit panel. Fixed: nothing on it moves or reflows, only lights and needles change.
 * Final pixel art replaces the drawn shapes; hotspots stay at the rectangles in norwayPanel.ts.
 */
function ControlPanel({ lamps, led, onPress, readings }: { lamps: Record<PanelLampId, boolean>; led: (id: PanelControlId) => Led; onPress: (id: PanelControlId) => void; readings: Readings }) {
  return (
    <div className="relative w-full shrink-0 select-none overflow-hidden rounded-xl border-2 border-[#4b5a63] bg-[#232c31] shadow-[inset_0_0_0_3px_#151b1f]" style={{ aspectRatio: `${PANEL_SIZE.width} / ${PANEL_SIZE.height}` }} role="group" aria-label="Furnace control panel" data-asset="norway-control-panel">
      {[[1.5, 1.5], [98.5, 1.5], [1.5, 98.5], [98.5, 98.5]].map(([x, y]) => <span key={`${x}${y}`} aria-hidden="true" className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5f6e77]" style={{ left: `${x}%`, top: `${y}%` }} />)}
      {PANEL_SECTIONS.map(section => <div key={section.id} aria-hidden="true" className="absolute rounded-md border border-[#3a464d] bg-[#1b2226]" style={pct(section)}>
        <span className="absolute -top-px left-2 bg-[#1b2226] px-1 font-mono text-[7px] font-bold tracking-[0.2em] text-amber-200/70 sm:text-[8px]">{section.label}</span>
      </div>)}
      {PANEL_LAMPS.map(lamp => <div key={lamp.id} className="absolute" style={pct(lamp)} role="status" aria-label={`${lamp.label}: ${lamps[lamp.id] ? 'on' : 'off'}`}>
        <span className={`absolute left-1/2 top-[18%] h-[38%] aspect-square -translate-x-1/2 rounded-full border border-black/60 ${lamps[lamp.id] ? (lamp.id === 'heatOk' || lamp.id === 'cool' || lamp.id === 'bagged' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : lamp.id === 'molten' ? 'bg-orange-400 shadow-[0_0_8px_#fb923c]' : 'bg-amber-300 shadow-[0_0_8px_#fcd34d]') : 'bg-[#2c3439]'}`} />
        <span className={LABEL}>{lamp.label}</span>
      </div>)}
      {PANEL_GAUGES.map(gauge => <Gauge key={gauge.id} id={gauge.id} rect={gauge} readings={readings} />)}
      {PANEL_CONTROLS.map(control => {
        const state = led(control.id);
        const toggle = control.id === 'main' || control.id === 'electrodesUp' || control.id === 'electrodesDown';
        const selected = control.id === 'main' ? lamps.mainOn : state === 'on';
        const description = toggle ? `${control.label}: ${selected ? 'on' : 'off'}` : control.label;
        return <button key={control.id} type="button" onClick={() => onPress(control.id)} aria-label={control.label} aria-pressed={toggle ? selected : undefined} title={description} className="group absolute focus-visible:outline-2 focus-visible:outline-amber-300" style={pct(control)}>
          <span aria-hidden="true" className={`absolute left-1/2 top-[4%] h-[11%] aspect-square -translate-x-1/2 rounded-full ${state === 'next' ? 'animate-pulse bg-amber-300 shadow-[0_0_8px_#fcd34d]' : state === 'on' ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-[#2c3439]'}`} />
          <span aria-hidden="true" className={`absolute inset-x-[12%] top-[20%] bottom-[24%] rounded-md border-b-4 transition-transform group-active:translate-y-0.5 group-active:border-b-2 ${control.id === 'main' || control.id === 'tap' ? 'border-[#7a1d18] bg-[#c8332b]' : 'border-[#20282c] bg-[#56656e] group-hover:bg-[#64757f]'}`} />
          <span className={LABEL}>{control.label}</span>
        </button>;
      })}
    </div>
  );
}

function Gauge({ id, rect, readings }: { id: PanelGaugeId; rect: PanelRect; readings: Readings }) {
  let fill = 0;
  let text = '';
  let color = 'bg-amber-300';
  let band: [number, number] | null = null;
  if (id === 'temperature') {
    fill = readings.temperature / GAUGE_MAX;
    text = `${Math.round(readings.temperature / 10) * 10} °C`;
    band = [WORKING_TEMPERATURE[0] / GAUGE_MAX, WORKING_TEMPERATURE[1] / GAUGE_MAX];
    color = readings.temperature > WORKING_TEMPERATURE[1] ? 'bg-red-500' : readings.temperature >= WORKING_TEMPERATURE[0] ? 'bg-emerald-400' : 'bg-sky-400';
  } else if (id === 'reaction') {
    fill = readings.smelted;
    text = `${Math.round(readings.smelted * 100)} %`;
  } else if (id === 'liquid') {
    fill = readings.liquid;
    text = readings.liquid > 0.01 ? 'POOLING' : 'EMPTY';
    color = 'bg-orange-400';
  } else if (id === 'mould') {
    fill = (readings.mouldTemperature ?? 0) / 1400;
    text = readings.mouldTemperature === null ? 'EMPTY' : `${Math.round(readings.mouldTemperature / 10) * 10} °C`;
    color = 'bg-orange-400';
  }
  if (id === 'powerLevel') {
    return <div className="absolute" style={pct(rect)} role="meter" aria-label="Power level" aria-valuemin={1} aria-valuemax={POWER_LEVELS} aria-valuenow={readings.power}>
      <div className="absolute inset-x-[6%] top-[14%] bottom-[24%] flex items-end gap-[6%] rounded border border-black/60 bg-black/50 p-[5%]">
        {Array.from({ length: POWER_LEVELS }, (_, i) => <span key={i} className={`flex-1 rounded-sm ${i < readings.power ? 'bg-amber-300' : 'bg-[#2c3439]'}`} style={{ height: `${30 + i * 17}%` }} />)}
      </div>
      <span className={LABEL}>POWER {readings.power}/{POWER_LEVELS}</span>
    </div>;
  }
  return <div className="absolute" style={pct(rect)} role="meter" aria-label={rect.label} aria-valuemin={0} aria-valuemax={id === 'temperature' ? GAUGE_MAX : id === 'mould' ? 1400 : 100} aria-valuenow={id === 'temperature' ? Math.round(readings.temperature) : id === 'mould' ? Math.round(readings.mouldTemperature ?? 0) : Math.round(fill * 100)} aria-valuetext={text} title={id === 'temperature' ? 'Furnace temperature · green band marks the working range' : `${rect.label}: ${text}`}>
    <div className="absolute inset-x-[6%] top-[10%] bottom-[34%] overflow-hidden rounded border border-black/60 bg-black/60">
      {band && <span aria-hidden="true" className="absolute inset-x-0 border-y border-emerald-400/70 bg-emerald-400/15" style={{ bottom: `${band[0] * 100}%`, height: `${(band[1] - band[0]) * 100}%` }} />}
      <span aria-hidden="true" className={`absolute bottom-0 left-[30%] right-[30%] ${color}`} style={{ height: `${Math.min(1, Math.max(0, fill)) * 100}%` }} />
    </div>
    <span className="absolute inset-x-0 bottom-[14%] text-center font-mono text-[9px] font-bold text-amber-100 sm:text-[11px]">{text}</span>
    <span className={LABEL}>{rect.label}</span>
  </div>;
}

/** One current-step message; new guidance replaces old guidance without moving the frame. */
function SigurdChat({ line }: { line: ChatLine }) {
  return (
    <section className="flex min-h-[170px] flex-1 flex-col overflow-hidden rounded-xl border-2 border-[#528b89] bg-[#142d35] shadow-[inset_0_0_0_2px_#0b2029]" aria-label="Sigurd" data-asset="norway-chat-box">
      <div className="flex shrink-0 items-center gap-3 border-b border-[#73b5ad]/25 bg-gradient-to-r from-[#24565a] via-[#234650] to-[#18323d] px-3 py-2">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border-2 border-amber-300/70 bg-[#476a67] shadow-[2px_2px_0_#10252c]">
          <img src={ASSETS.norwayGuide.image} alt="" className="h-full w-full object-cover object-top [image-rendering:pixelated]" />
        </div>
        <p className="font-mono text-sm font-bold tracking-widest text-amber-200">SIGURD</p>
        <span aria-hidden="true" className={`ml-auto h-2.5 w-2.5 rounded-sm ${line.warning ? 'bg-amber-300 shadow-[0_0_8px_#fcd34d66]' : 'bg-[#84dac5] shadow-[0_0_8px_#84dac555]'}`} />
      </div>
      <div tabIndex={0} className="min-h-0 flex-1 overflow-y-auto p-3 focus-visible:outline-2 focus-visible:outline-amber-300">
        <div role="status" aria-live="polite" aria-atomic="true" className={`rounded-lg border-l-[3px] px-3 py-2.5 text-sm leading-relaxed ${line.warning ? 'border-amber-300 bg-[#463a25] text-amber-100' : 'border-[#83cabc] bg-[#203f49] text-[#edf5eb]'}`}>
          <p>{line.text.split(/(\([^)]*\))/g).map((part, i) => part.startsWith('(') ? <span key={i} className="italic text-[#f0cc88]">{part}</span> : part)}</p>
        </div>
      </div>
    </section>
  );
}
