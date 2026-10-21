import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NorwaySmelterScene, SMELTER_PHASES, SmelterPhase, SmelterTarget } from './NorwaySmelterScene';
import { sound } from '../services/audio';
import { ASSETS } from '../content/assets';
import {
  ElectrodePosition, FurnaceZone, furnaceZone, targetTemperature, SIGURD_FURNACE,
  POWER_LEVELS, ROOM_TEMPERATURE, WORKING_TEMPERATURE, GAUGE_MAX,
} from '../content/norwayControls';
import { NORWAY_PANEL, PanelControlId, PanelLampId, PanelGaugeId } from '../content/norwayPanel';
import { CockpitPanel, GaugeReading, LampColor, Led } from './workshop/CockpitPanel';
import { GuideBox, GuideLine } from './workshop/GuideBox';
import { WorkshopLayout, useActKey } from './workshop/WorkshopLayout';

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


/** Norway work screen: 3D workcell, fixed control panel, and Sigurd's chat below it. The caller owns the arrival dialogue. */
export function NorwayManufacturing({ onReturnToMap, onComplete }: Props) {
  const [phase, setPhase] = useState<SmelterPhase>('mine');
  const [progress, setProgress] = useState(0);
  const [mainOn, setMainOn] = useState(false);
  const [power, setPower] = useState(1);
  const [electrodes, setElectrodes] = useState<ElectrodePosition>('raised');
  const [temperature, setTemperature] = useState(ROOM_TEMPERATURE);
  const [chat, setChat] = useState<GuideLine>({ text: SIGURD_STEP.mine!, warning: false });
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

  useActKey(waiting?.target, target => act(target as SmelterTarget));

  // Panel readings.
  const from = (other: SmelterPhase) => order(phase) >= order(other);
  const smelted = phase === 'smelting' ? progress : from('tap') ? 1 : 0;
  const liquid = phase === 'smelting' ? progress : phase === 'tap' ? 1 : phase === 'pouring' ? 1 - progress : 0;
  const mouldTemperature = phase === 'pouring' ? 1400 * progress : phase === 'cooling' ? 1400 - 1380 * progress : from('breakCast') ? ROOM_TEMPERATURE : null;
  const lampOn: Record<PanelLampId, boolean> = {
    quartzIn: from('loadCarbon'), carbonIn: from('power'), mainOn,
    heatOk: zone === 'ok', molten: phase === 'tap' || phase === 'pouring', cool: from('breakCast'), bagged: from('ship'),
  };
  const lamp = (id: PanelLampId): LampColor =>
    !lampOn[id] ? 'off' : id === 'heatOk' || id === 'cool' || id === 'bagged' ? 'green' : id === 'molten' ? 'orange' : 'amber';
  const gauge = (id: PanelGaugeId): GaugeReading => {
    switch (id) {
      case 'temperature': return {
        kind: 'bar', fill: temperature / GAUGE_MAX, text: `${Math.round(temperature / 10) * 10} °C`, value: temperature, max: GAUGE_MAX,
        band: [WORKING_TEMPERATURE[0] / GAUGE_MAX, WORKING_TEMPERATURE[1] / GAUGE_MAX],
        color: temperature > WORKING_TEMPERATURE[1] ? 'bg-red-500' : temperature >= WORKING_TEMPERATURE[0] ? 'bg-emerald-400' : 'bg-sky-400',
        title: 'Furnace temperature · green band marks the working range',
      };
      case 'reaction': return { kind: 'bar', fill: smelted, text: `${Math.round(smelted * 100)} %`, value: smelted * 100, max: 100, color: 'bg-amber-300' };
      case 'liquid': return { kind: 'bar', fill: liquid, text: liquid > 0.01 ? 'POOLING' : 'EMPTY', value: liquid * 100, max: 100, color: 'bg-orange-400' };
      case 'mould': return {
        kind: 'bar', fill: (mouldTemperature ?? 0) / 1400, value: mouldTemperature ?? 0, max: 1400, color: 'bg-orange-400',
        text: mouldTemperature === null ? 'EMPTY' : `${Math.round(mouldTemperature / 10) * 10} °C`,
      };
      case 'powerLevel': return { kind: 'bars', value: power, max: POWER_LEVELS, label: `POWER ${power}/${POWER_LEVELS}` };
    }
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
  const pressed = (id: PanelControlId) =>
    id === 'main' ? mainOn : id === 'electrodesUp' ? electrodes === 'raised' : id === 'electrodesDown' ? electrodes === 'inCharge' : undefined;

  return (
    <WorkshopLayout
      ariaLabel="Norway silicon workshop" kicker="Norway · Silicon workshop" title="From quartz to silicon" onReturnToMap={onReturnToMap}
      scene={<NorwaySmelterScene
        phase={phase} progress={progress} target={waiting?.target ?? null} onAct={act}
        heat={mainOn ? Math.min(1.3, Math.max(0, (temperature - 600) / 1300)) : 0}
        electrodesRaised={electrodes === 'raised' && order(phase) <= order('smelting')}
      />}
      panel={<CockpitPanel layout={NORWAY_PANEL} label="Furnace control panel" asset="norway-control-panel" lamp={lamp} gauge={gauge} led={led} pressed={pressed} onPress={press} />}
      guide={<GuideBox name="Sigurd" portrait={ASSETS.norwayGuide.image} line={chat} asset="norway-chat-box" />}
    />
  );
}
