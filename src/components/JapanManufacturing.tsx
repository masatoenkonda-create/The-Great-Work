import React, { useCallback, useEffect, useRef, useState } from 'react';
import { JapanPullerScene, JAPAN_PHASES, JapanPhase, JapanTarget } from './JapanPullerScene';
import { sound } from '../services/audio';
import { CargoState } from '../types/route';
import {
  GrowthZone, MeltZone, growthZone, meltZone, meltTarget, AIKO_GROWTH, AIKO_MELT, isGrowthWarning,
  HEAT_LEVELS, PULL_LEVELS, ROOM_TEMPERATURE, GROWTH_BAND, TEMP_GAUGE_MIN, TEMP_GAUGE_MAX,
} from '../content/japanControls';
import { JAPAN_PANEL, JapanControlId, JapanGaugeId, JapanLampId } from '../content/japanPanel';
import { CockpitPanel, GaugeReading, LampColor, Led } from './workshop/CockpitPanel';
import { GuideBox, GuideLine } from './workshop/GuideBox';
import { WorkshopLayout, useActKey, useTimedPhase } from './workshop/WorkshopLayout';

interface Props {
  onReturnToMap: () => void;
  onComplete: (isPlaceholder: boolean, updates: Partial<CargoState>) => void;
}

const order = (phase: JapanPhase) => JAPAN_PHASES.indexOf(phase);

/** Each waiting phase: the object (or panel button) to use, and the phase it starts. */
const ACTIONS: Partial<Record<JapanPhase, { target: JapanTarget; control: JapanControlId; next: JapanPhase }>> = {
  load: { target: 'bag', control: 'load', next: 'loading' },
  melt: { target: 'switch', control: 'main', next: 'melting' },
  seed: { target: 'puller', control: 'seed', next: 'dipping' },
  cool: { target: 'puller', control: 'cool', next: 'cooling' },
  cut: { target: 'saw', control: 'saw', next: 'cutting' },
  polish: { target: 'polisher', control: 'polish', next: 'polishing' },
  pack: { target: 'box', control: 'pack', next: 'packing' },
  ship: { target: 'box', control: 'ship', next: 'shipping' },
};

/** Melting and body growth are not timed: they advance only under the right panel settings. */
const TIMED: Partial<Record<JapanPhase, { duration: number; next: JapanPhase }>> = {
  loading: { duration: 2600, next: 'melt' },
  dipping: { duration: 3400, next: 'growing' },
  tailing: { duration: 1800, next: 'cool' },
  cooling: { duration: 4000, next: 'cut' },
  cutting: { duration: 3400, next: 'polish' },
  polishing: { duration: 3400, next: 'pack' },
  packing: { duration: 3200, next: 'ship' },
  shipping: { duration: 1600, next: 'done' },
};
const MELT_SECONDS = 3;
const BODY_SECONDS = 8;

/** Aiko's line when each step begins. */
const AIKO_STEP: Partial<Record<JapanPhase, string>> = {
  load: 'Pure silicon from Germany! Crucible first, then the chunks.',
  melt: 'Now melt it. Switch on the heater and bring it past 1,414 °C, where silicon melts.',
  seed: 'All liquid! Dip the seed. It gives the whole crystal its direction. (Small seed, big job.)',
  dipping: 'First a thin neck, then the shoulder widens. That part runs by itself.',
  growing: 'Now the body. Turn it, and balance the heat and the pull.',
  tailing: 'Full length! Narrowing the tail so it lets go of the melt cleanly.',
  cool: 'One single crystal! Let it cool before we cut it.',
  cooling: "The pointy ends don't become wafers. Off they go; the body is ground perfectly round.",
  cut: 'Wire saw time. One wire, wound into many lanes: a whole batch of slices at once!',
  polish: 'Sawing leaves the surface rough. Lap, etch, polish: flat and mirror-smooth.',
  pack: 'Check them under the light, then into the box. They travel standing on their edges.',
  ship: 'Blank wafers, ready for circuits. Off to Taiwan! (The shiny side is not a coaster.)',
  done: 'Sayonara! Next stop: Taiwan.',
};

const SOUND: Partial<Record<JapanPhase, () => void>> = {
  loading: () => sound.playClink(), melting: () => sound.playCrystalHum(), dipping: () => sound.playSelect(),
  cooling: () => sound.playSelect(), cutting: () => sound.playClink(), polishing: () => sound.playBubble(),
  packing: () => sound.playClink(), shipping: () => sound.playConfirm(),
};

/** Japan work screen: polysilicon to boxed mirror wafers. The caller owns the arrival dialogue. */
export function JapanManufacturing({ onReturnToMap, onComplete }: Props) {
  const [phase, setPhase] = useState<JapanPhase>('load');
  const [progress, setProgress] = useState(0);
  const [melted, setMelted] = useState(0);
  const [body, setBody] = useState(0);
  const [mainOn, setMainOn] = useState(false);
  const [heat, setHeat] = useState(1);
  const [pull, setPull] = useState(1);
  const [rotating, setRotating] = useState(false);
  const [temperature, setTemperature] = useState(ROOM_TEMPERATURE);
  const [chat, setChat] = useState<GuideLine>({ text: AIKO_STEP.load!, warning: false });
  const completed = useRef(false);
  const waiting = ACTIONS[phase];
  const mZone: MeltZone = meltZone(mainOn, heat, temperature);
  const gZone: GrowthZone = growthZone(mainOn, rotating, heat, pull, temperature);
  const say = useCallback((text: string, warning = false) => { if (text) setChat({ text, warning }); }, []);

  // Speak once per step and once per machine change.
  const spoken = useRef({ phase: '', melt: '', growth: '' });
  useEffect(() => {
    if (spoken.current.phase === phase) return;
    spoken.current.phase = phase;
    say(AIKO_STEP[phase] ?? '');
  }, [phase, say]);
  useEffect(() => {
    if (phase !== 'melting' || spoken.current.melt === mZone) return;
    spoken.current.melt = mZone;
    say(AIKO_MELT[mZone], mZone === 'cold' || mZone === 'off');
  }, [mZone, phase, say]);
  useEffect(() => {
    if (phase !== 'growing' || spoken.current.growth === gZone) return;
    spoken.current.growth = gZone;
    say(AIKO_GROWTH[gZone], isGrowthWarning(gZone));
  }, [gZone, phase, say]);

  useEffect(() => { SOUND[phase]?.(); }, [phase]);
  useTimedPhase(phase, TIMED[phase]?.duration, setProgress, () => {
    const next = TIMED[phase]!.next;
    setPhase(next);
    if (next === 'done' && !completed.current) {
      completed.current = true;
      // Compatibility count for Taiwan's existing code; not shown to the player.
      onComplete(false, { wafersProducedCount: 25 });
    }
  });

  // Melt temperature follows the panel; melting and body growth advance only under the right settings.
  const puller = useRef({ mainOn, heat, pull, rotating, phase, temperature, melted, body });
  puller.current = { mainOn, heat, pull, rotating, phase, temperature, melted, body };
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const s = puller.current;
      const target = meltTarget(s.mainOn, s.heat);
      const next = s.temperature + (target - s.temperature) * (1 - Math.exp(-dt / 1.1));
      if (Math.abs(next - s.temperature) > 0.5) setTemperature(next);
      if (s.phase === 'melting' && meltZone(s.mainOn, s.heat, next) === 'ok') {
        const m = Math.min(1, s.melted + dt / MELT_SECONDS);
        setMelted(m);
        if (m >= 1) setPhase('seed');
      }
      if (s.phase === 'growing' && growthZone(s.mainOn, s.rotating, s.heat, s.pull, next) === 'ok') {
        const b = Math.min(1, s.body + dt / BODY_SECONDS);
        setBody(b);
        if (b >= 1) setPhase('tailing');
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const heaterPhase = order(phase) >= order('melt') && order(phase) <= order('tailing');

  /** Returns false when the action does not apply right now. */
  const act = useCallback((target: JapanTarget): boolean => {
    if (target === 'switch') {
      if (phase === 'load' || phase === 'loading') {
        say('Load the crucible and the chunks first.', true);
        sound.playError();
        return true;
      }
      if (heaterPhase) {
        setMainOn(on => !on);
        if (phase === 'melt') setPhase('melting');
        sound.playSelect();
        return true;
      }
    }
    if (target === 'puller' && phase === 'melting') {
      say('Still melting. The seed needs a liquid surface.', true);
      sound.playError();
      return true;
    }
    if (target === 'puller' && phase === 'growing') {
      say('The crystal is still growing. Let it reach full length!', true);
      sound.playError();
      return true;
    }
    if (!waiting || target !== waiting.target) return false;
    if (phase === 'cool') setMainOn(false);
    setPhase(waiting.next);
    return true;
  }, [phase, waiting, heaterPhase, say]);

  const press = (id: JapanControlId) => {
    let handled = true;
    switch (id) {
      case 'load': handled = act('bag'); break;
      case 'main': handled = act('switch'); break;
      case 'seed': handled = phase === 'seed' || phase === 'melting' ? act('puller') : false; break;
      case 'cool': handled = phase === 'cool' || phase === 'growing' ? act('puller') : false; break;
      case 'saw': handled = act('saw'); break;
      case 'polish': handled = act('polisher'); break;
      case 'pack': handled = phase === 'pack' ? act('box') : false; break;
      case 'ship': handled = phase === 'ship' ? act('box') : false; break;
      case 'rotate': case 'heatDown': case 'heatUp': case 'pullDown': case 'pullUp':
        if (!heaterPhase) { handled = false; break; }
        if (id === 'rotate') setRotating(on => !on);
        if (id === 'heatDown') setHeat(v => Math.max(1, v - 1));
        if (id === 'heatUp') setHeat(v => Math.min(HEAT_LEVELS, v + 1));
        if (id === 'pullDown') setPull(v => Math.max(1, v - 1));
        if (id === 'pullUp') setPull(v => Math.min(PULL_LEVELS, v + 1));
        sound.playSelect();
        break;
    }
    if (!handled) {
      say(`Not now. ${AIKO_STEP[phase] ?? 'Wait for this step to finish.'}`, true);
      sound.playError();
    }
  };

  useActKey(waiting?.target, target => act(target as JapanTarget));

  // Panel readings.
  const from = (other: JapanPhase) => order(phase) >= order(other);
  const trend = phase === 'growing' && gZone === 'fast' ? 'thin' : phase === 'growing' && gZone === 'slow' ? 'wide' : null;
  const lampOn: Record<JapanLampId, boolean> = {
    crucible: from('melt'), charge: from('melt'), melted: melted >= 1 && !from('cool'), rotating: rotating && heaterPhase,
    steady: phase === 'growing' && gZone === 'ok', finished: from('pack'), packed: from('ship'),
  };
  const lamp = (id: JapanLampId): LampColor =>
    !lampOn[id] ? 'off' : id === 'steady' || id === 'finished' || id === 'packed' ? 'green' : id === 'melted' ? 'orange' : 'amber';
  const gauge = (id: JapanGaugeId): GaugeReading => {
    const range = TEMP_GAUGE_MAX - TEMP_GAUGE_MIN;
    switch (id) {
      case 'meltTemp': return {
        kind: 'bar', fill: (temperature - TEMP_GAUGE_MIN) / range, text: `${Math.round(temperature / 5) * 5} °C`, value: temperature, max: TEMP_GAUGE_MAX,
        band: [(GROWTH_BAND[0] - TEMP_GAUGE_MIN) / range, (GROWTH_BAND[1] - TEMP_GAUGE_MIN) / range],
        color: temperature > GROWTH_BAND[1] ? 'bg-red-500' : temperature >= GROWTH_BAND[0] ? 'bg-emerald-400' : 'bg-sky-400',
        title: 'Melt temperature · green band marks the growing range',
      };
      case 'body': return { kind: 'bar', fill: body, text: `${Math.round(body * 100)} %`, value: body * 100, max: 100, color: 'bg-amber-300' };
      case 'diameter': return {
        kind: 'bar', fill: trend === 'thin' ? 0.6 : trend === 'wide' ? 1 : from('growing') ? 0.8 : 0, value: 300, max: 400,
        color: trend ? 'bg-red-500' : 'bg-emerald-400',
        text: trend === 'thin' ? 'THINNER' : trend === 'wide' ? 'WIDER' : from('growing') ? '300 mm' : '—',
      };
      case 'chamber': return {
        kind: 'bar', fill: temperature / TEMP_GAUGE_MAX, value: temperature, max: TEMP_GAUGE_MAX, color: 'bg-orange-400',
        text: temperature > 600 ? 'HOT' : 'COOL',
      };
      case 'heatLevel': return { kind: 'bars', value: heat, max: HEAT_LEVELS, label: `HEAT ${heat}/${HEAT_LEVELS}` };
      case 'pullLevel': return { kind: 'bars', value: pull, max: PULL_LEVELS, label: `PULL ${pull}/${PULL_LEVELS}` };
    }
  };
  const led = (id: JapanControlId): Led => {
    if (waiting?.control === id) return 'next';
    if (id === 'main') return mainOn ? 'on' : 'off';
    if (id === 'rotate') return rotating ? 'on' : 'off';
    if (id === 'heatDown' || id === 'heatUp' || id === 'pullDown' || id === 'pullUp') return heaterPhase ? 'on' : 'off';
    return 'off';
  };
  const pressed = (id: JapanControlId) => (id === 'main' ? mainOn : id === 'rotate' ? rotating : undefined);

  return (
    <WorkshopLayout
      ariaLabel="Japan wafer workshop" kicker="Japan · Wafer workshop" title="From pure silicon to mirror wafers" onReturnToMap={onReturnToMap}
      scene={<JapanPullerScene
        phase={phase} progress={progress} melted={melted} body={body} rotating={rotating} trend={trend}
        heat={Math.min(1, Math.max(0, (temperature - 600) / 900))}
        target={waiting?.target ?? null} onAct={act}
      />}
      panel={<CockpitPanel layout={JAPAN_PANEL} label="Crystal puller control panel" asset="japan-control-panel" lamp={lamp} gauge={gauge} led={led} pressed={pressed} onPress={press} />}
      guide={<GuideBox name="Aiko" line={chat} asset="japan-chat-box" />}
    />
  );
}
