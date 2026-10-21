import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GermanyReactorScene, GERMANY_PHASES, GermanyPhase, GermanyTarget } from './GermanyReactorScene';
import { sound } from '../services/audio';
import { CargoState } from '../types/route';
import {
  ReactorZone, reactorZone, rodTarget, GRETA_REACTOR, isWarning,
  HEAT_LEVELS, MIX_LEVELS, ROOM_TEMPERATURE, ROD_BAND, ROD_GAUGE_MAX,
} from '../content/germanyControls';
import { GERMANY_PANEL, GermanyControlId, GermanyGaugeId, GermanyLampId } from '../content/germanyPanel';
import { CockpitPanel, GaugeReading, LampColor, Led } from './workshop/CockpitPanel';
import { GuideBox, GuideLine } from './workshop/GuideBox';
import { WorkshopLayout, useActKey, useTimedPhase } from './workshop/WorkshopLayout';

interface Props {
  onReturnToMap: () => void;
  onComplete: (isPlaceholder: boolean, updates: Partial<CargoState>) => void;
}

const order = (phase: GermanyPhase) => GERMANY_PHASES.indexOf(phase);

/** Each waiting phase: the object (or panel button) to use, and the phase it starts. */
const ACTIONS: Partial<Record<GermanyPhase, { target: GermanyTarget; control: GermanyControlId; next: GermanyPhase }>> = {
  mill: { target: 'mill', control: 'mill', next: 'milling' },
  convert: { target: 'converter', control: 'convert', next: 'converting' },
  distill: { target: 'columns', control: 'distill', next: 'distilling' },
  grow: { target: 'switch', control: 'main', next: 'growing' },
  open: { target: 'reactor', control: 'open', next: 'opening' },
  break: { target: 'crusher', control: 'break', next: 'breaking' },
  clean: { target: 'cleaner', control: 'clean', next: 'cleaning' },
  ship: { target: 'pack', control: 'ship', next: 'shipping' },
};

/** Rod growth is not timed: it advances only while the reactor is in its working band. */
const TIMED: Partial<Record<GermanyPhase, { duration: number; next: GermanyPhase }>> = {
  milling: { duration: 1700, next: 'convert' },
  converting: { duration: 2600, next: 'distill' },
  distilling: { duration: 3200, next: 'grow' },
  opening: { duration: 2600, next: 'break' },
  breaking: { duration: 2200, next: 'clean' },
  cleaning: { duration: 3000, next: 'ship' },
  shipping: { duration: 1600, next: 'done' },
};
const GROW_SECONDS = 8;

/** Greta's line when each step begins. */
const GRETA_STEP: Partial<Record<GermanyPhase, string>> = {
  mill: 'Your silicon from Norway! First, smaller pieces. Much smaller. Into the mill.',
  convert: 'Now the powder meets hydrogen chloride. Out comes a liquid compound. (Not melted silicon: a whole new chemical.)',
  distill: 'Boil, condense, separate. The impurities leave in other fractions, top and bottom.',
  grow: "Pure liquid, ready! Switch on the reactor, then set the rod heat and the gas mix. I'll tell you what I see.",
  open: 'Look at those rods! Pure silicon, grown back from the vapour. Cool down and lift the bell.',
  break: 'Solid silicon again! Break the rods into chunks. (Not with your elbows.)',
  clean: 'Acid takes off the surface, then a rinse and a dry. Then two bags, so nothing touches it.',
  ship: 'Clean, sealed, off to Japan. Next comes one giant crystal!',
  done: 'Wunderbar. Gute Reise!',
};

const SOUND: Partial<Record<GermanyPhase, () => void>> = {
  milling: () => sound.playClink(), converting: () => sound.playBubble(), distilling: () => sound.playBubble(),
  growing: () => sound.playCrystalHum(), opening: () => sound.playSelect(), breaking: () => sound.playClink(),
  cleaning: () => sound.playBubble(), shipping: () => sound.playConfirm(),
};

/** Germany work screen: silicon metal to clean-packed polysilicon. The caller owns the arrival dialogue. */
export function GermanyManufacturing({ onReturnToMap, onComplete }: Props) {
  const [phase, setPhase] = useState<GermanyPhase>('mill');
  const [progress, setProgress] = useState(0);
  const [growth, setGrowth] = useState(0);
  const [mainOn, setMainOn] = useState(false);
  const [heat, setHeat] = useState(1);
  const [mix, setMix] = useState(1);
  const [temperature, setTemperature] = useState(ROOM_TEMPERATURE);
  const [chat, setChat] = useState<GuideLine>({ text: GRETA_STEP.mill!, warning: false });
  const completed = useRef(false);
  const waiting = ACTIONS[phase];
  const zone: ReactorZone = reactorZone(mainOn, heat, mix, temperature);
  const say = useCallback((text: string, warning = false) => { if (text) setChat({ text, warning }); }, []);

  // Speak once per step and once per reactor change.
  const spoken = useRef({ phase: '', zone: '' });
  useEffect(() => {
    if (spoken.current.phase === phase) return;
    spoken.current.phase = phase;
    say(GRETA_STEP[phase] ?? '');
  }, [phase, say]);
  useEffect(() => {
    if (spoken.current.zone === zone || phase !== 'growing') return;
    spoken.current.zone = zone;
    say(GRETA_REACTOR[zone], isWarning(zone));
  }, [zone, phase, say]);

  useEffect(() => { SOUND[phase]?.(); }, [phase]);
  useTimedPhase(phase, TIMED[phase]?.duration, setProgress, () => {
    const next = TIMED[phase]!.next;
    setPhase(next);
    if (next === 'done' && !completed.current) {
      completed.current = true;
      // Compatibility quantity for later stops; not shown to the player.
      onComplete(false, { polysiliconBatchKg: 10 });
    }
  });

  // Rod temperature follows the panel; rods only grow inside the working band.
  const reactor = useRef({ mainOn, heat, mix, phase, temperature, growth });
  reactor.current = { mainOn, heat, mix, phase, temperature, growth };
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const r = reactor.current;
      const target = rodTarget(r.mainOn, r.heat);
      const next = r.temperature + (target - r.temperature) * (1 - Math.exp(-dt / 1.1));
      if (Math.abs(next - r.temperature) > 0.5) setTemperature(next);
      if (r.phase === 'growing' && reactorZone(r.mainOn, r.heat, r.mix, next) === 'ok') {
        const grown = Math.min(1, r.growth + dt / GROW_SECONDS);
        setGrowth(grown);
        if (grown >= 1) setPhase('open');
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  /** Returns false when the action does not apply right now. */
  const act = useCallback((target: GermanyTarget): boolean => {
    if (target === 'switch') {
      if (order(phase) < order('grow')) {
        say('First the pure liquid, then the reactor.', true);
        sound.playError();
        return true;
      }
      if (phase === 'grow' || phase === 'growing') {
        setMainOn(on => !on);
        if (phase === 'grow') setPhase('growing');
        sound.playSelect();
        return true;
      }
    }
    if ((target === 'reactor' || target === 'crusher') && phase === 'growing') {
      say("The rods are still growing. Let them finish!", true);
      sound.playError();
      return true;
    }
    if (!waiting || target !== waiting.target) return false;
    if (phase === 'open') setMainOn(false);
    setPhase(waiting.next);
    return true;
  }, [phase, waiting, say]);

  const press = (id: GermanyControlId) => {
    const adjustable = phase === 'grow' || phase === 'growing';
    let handled = true;
    switch (id) {
      case 'mill': handled = act('mill'); break;
      case 'convert': handled = act('converter'); break;
      case 'distill': handled = act('columns'); break;
      case 'main': handled = act('switch'); break;
      case 'open': handled = act('reactor'); break;
      case 'break': handled = act('crusher'); break;
      case 'clean': handled = act('cleaner'); break;
      case 'ship': handled = act('pack'); break;
      case 'heatDown': case 'heatUp': case 'mixDown': case 'mixUp':
        if (!adjustable) { handled = false; break; }
        if (id === 'heatDown') setHeat(v => Math.max(1, v - 1));
        if (id === 'heatUp') setHeat(v => Math.min(HEAT_LEVELS, v + 1));
        if (id === 'mixDown') setMix(v => Math.max(1, v - 1));
        if (id === 'mixUp') setMix(v => Math.min(MIX_LEVELS, v + 1));
        sound.playSelect();
        break;
    }
    if (!handled) {
      say(`Not now. ${GRETA_STEP[phase] ?? 'Wait for this step to finish.'}`, true);
      sound.playError();
    }
  };

  useActKey(waiting?.target, target => act(target as GermanyTarget));

  // Panel readings.
  const from = (other: GermanyPhase) => order(phase) >= order(other);
  const feeding = mainOn && phase === 'growing';
  const pureLiquid = phase === 'distilling' ? Math.max(0, (progress - 0.2) / 0.8) : phase === 'grow' ? 1 : phase === 'growing' ? 1 - 0.7 * growth : from('open') ? 0.3 : 0;
  const lampOn: Record<GermanyLampId, boolean> = {
    silicon: from('convert') && order(phase) <= order('converting'), hcl: phase === 'converting', compound: from('distill'),
    purified: from('grow'), hydrogen: feeding, growing: feeding && zone === 'ok', packed: from('ship'),
  };
  const lamp = (id: GermanyLampId): LampColor =>
    !lampOn[id] ? 'off' : id === 'purified' || id === 'growing' || id === 'packed' ? 'green' : 'amber';
  const gauge = (id: GermanyGaugeId): GaugeReading => {
    switch (id) {
      case 'rodTemp': return {
        kind: 'bar', fill: temperature / ROD_GAUGE_MAX, text: `${Math.round(temperature / 10) * 10} °C`, value: temperature, max: ROD_GAUGE_MAX,
        band: [ROD_BAND[0] / ROD_GAUGE_MAX, ROD_BAND[1] / ROD_GAUGE_MAX],
        color: temperature > ROD_BAND[1] ? 'bg-red-500' : temperature >= ROD_BAND[0] ? 'bg-emerald-400' : 'bg-sky-400',
        title: 'Rod temperature · green band marks the working range',
      };
      case 'growth': return { kind: 'bar', fill: growth, text: `${Math.round(growth * 100)} %`, value: growth * 100, max: 100, color: 'bg-amber-300' };
      case 'compound': return { kind: 'bar', fill: pureLiquid, text: pureLiquid > 0.01 ? `${Math.round(pureLiquid * 100)} %` : 'EMPTY', value: pureLiquid * 100, max: 100, color: 'bg-sky-300' };
      case 'reactor': return {
        kind: 'bar', fill: temperature / ROD_GAUGE_MAX, value: temperature, max: ROD_GAUGE_MAX, color: 'bg-orange-400',
        text: from('break') ? 'OPEN' : temperature > 200 ? 'HOT' : 'COOL',
      };
      case 'heatLevel': return { kind: 'bars', value: heat, max: HEAT_LEVELS, label: `HEAT ${heat}/${HEAT_LEVELS}` };
      case 'mixLevel': return { kind: 'bars', value: mix, max: MIX_LEVELS, label: `MIX ${mix}/${MIX_LEVELS}` };
    }
  };
  const adjustable = phase === 'grow' || phase === 'growing';
  const led = (id: GermanyControlId): Led => {
    if (waiting?.control === id) return 'next';
    if (id === 'main') return mainOn ? 'on' : 'off';
    if (id === 'heatDown' || id === 'heatUp' || id === 'mixDown' || id === 'mixUp') return adjustable ? 'on' : 'off';
    return 'off';
  };
  const pressed = (id: GermanyControlId) => (id === 'main' ? mainOn : undefined);

  return (
    <WorkshopLayout
      ariaLabel="Germany purification workshop" kicker="Germany · Purification workshop" title="From silicon metal to pure polysilicon" onReturnToMap={onReturnToMap}
      scene={<GermanyReactorScene
        phase={phase} progress={progress} growth={growth} target={waiting?.target ?? null} onAct={act}
        heat={mainOn ? Math.min(1, Math.max(0, (temperature - 400) / 800)) : Math.max(0, (temperature - 400) / 800)}
        dust={zone === 'rich'} feeding={feeding}
      />}
      panel={<CockpitPanel layout={GERMANY_PANEL} label="Reactor control panel" asset="germany-control-panel" lamp={lamp} gauge={gauge} led={led} pressed={pressed} onPress={press} />}
      guide={<GuideBox name="Greta" line={chat} asset="germany-chat-box" />}
    />
  );
}
