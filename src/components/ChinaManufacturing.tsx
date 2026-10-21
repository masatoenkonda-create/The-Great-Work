import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChinaTvScene, CHINA_PHASES, ChinaPhase, ChinaTarget } from './ChinaTvScene';
import { sound } from '../services/audio';
import { CargoState } from '../types/route';
import { dieForSerial, tvSerialFor } from '../content/waferMap';
import { ReflowState, reflowState, predictProfile, XIAO_LIN_REFLOW, LEVELS, LIQUIDUS, PEAK_BAND, TAL_BAND } from '../content/chinaControls';
import { CHINA_PANEL, ChinaControlId, ChinaGaugeId, ChinaLampId } from '../content/chinaPanel';
import { CockpitPanel, GaugeReading, LampColor, Led } from './workshop/CockpitPanel';
import { GuideBox, GuideLine } from './workshop/GuideBox';
import { WorkshopLayout, useActKey, useTimedPhase } from './workshop/WorkshopLayout';

interface Props {
  cargo: CargoState;
  onReturnToMap: () => void;
  onComplete: (isPlaceholder: boolean, updates: Partial<CargoState>) => void;
}

const order = (phase: ChinaPhase) => CHINA_PHASES.indexOf(phase);

/** Each waiting phase: the station (or panel button) to use, and the phase it starts. */
const ACTIONS: Partial<Record<ChinaPhase, { target: ChinaTarget; control: ChinaControlId; next: ChinaPhase }>> = {
  print: { target: 'printer', control: 'print', next: 'printing' },
  place: { target: 'placer', control: 'place', next: 'placing' },
  feed: { target: 'oven', control: 'feed', next: 'reflowing' },
  xray: { target: 'xray', control: 'xray', next: 'xraying' },
  assemble: { target: 'fixture', control: 'assemble', next: 'assembling' },
  check: { target: 'fixture', control: 'check', next: 'checking' },
  ship: { target: 'fixture', control: 'ship', next: 'shipping' },
};

const TIMED: Partial<Record<ChinaPhase, { duration: number; next: ChinaPhase }>> = {
  printing: { duration: 3200, next: 'place' },
  placing: { duration: 3800, next: 'feed' },
  reflowing: { duration: 6000, next: 'xray' },
  xraying: { duration: 4200, next: 'assemble' },
  assembling: { duration: 4500, next: 'check' },
  checking: { duration: 5000, next: 'ship' },
  shipping: { duration: 2000, next: 'done' },
};

/** Xiao Lin's line when each step begins. */
const XIAO_LIN_STEP: Partial<Record<ChinaPhase, string>> = {
  print: 'Welcome to the TV line! First, solder paste through the stencil. It puts solder only where the connections go.',
  printing: 'Squeegee across, stencil up: a little grey dot on every pad.',
  place: 'Now your chip. The camera finds its solder balls and sets it right on those dots. The small parts go on after it.',
  placing: 'Same chip as in Malaysia: balls down, mark up.',
  reflowing: 'Preheat, melt, cool. Watch the joint: ball and paste melt into one, and the chip pulls itself straight.',
  xray: "The joints are under the chip. You can't see them. So: X-ray.",
  xraying: 'Dark circles: the solder joints. And those thin lines... your gold wires from Malaysia!',
  assemble: 'Now build it into a TV.',
  assembling: 'Screen face-down, boards on the back, cables for picture, power, backlight and speakers, then the cover.',
  check: 'Moment of truth. Power it on.',
  checking: 'Warm-up, test colours, picture adjustment... and sound! (A bit more useful than a loose chip.)',
  ship: 'Your TV works. Pack it up: it goes home with you!',
  shipping: 'Yi lu shun feng! Safe travels.',
};

const SOUND: Partial<Record<ChinaPhase, () => void>> = {
  printing: () => sound.playSelect(), placing: () => sound.playClink(), reflowing: () => sound.playCrystalHum(),
  xraying: () => sound.playExposure(), assembling: () => sound.playClink(), checking: () => sound.playBootChime(), shipping: () => sound.playConfirm(),
};

/** China work screen: Malaysia's chip onto a TV main board, then into a working TV. The caller owns the arrival dialogue. */
export function ChinaManufacturing({ cargo, onReturnToMap, onComplete }: Props) {
  const chip = cargo.waferMap && dieForSerial(cargo.waferMap, cargo.selectedChipSerial) ? cargo.selectedChipSerial : null;
  const missing = "No packaged chip from Malaysia yet. Go back and finish Malaysia first.";
  const [phase, setPhase] = useState<ChinaPhase>('print');
  const [progress, setProgress] = useState(0);
  const [heat, setHeat] = useState(1);
  const [belt, setBelt] = useState(5);
  const [chat, setChat] = useState<GuideLine>(chip ? { text: XIAO_LIN_STEP.print!, warning: false } : { text: missing, warning: true });
  const completed = useRef(false);
  const waiting = ACTIONS[phase];
  const state: ReflowState = reflowState(heat, belt);
  const { peak, timeAboveMelt } = predictProfile(heat, belt);
  // Settings are frozen when the board enters the oven; the run follows the accepted profile.
  const [run, setRun] = useState({ peak, timeAboveMelt });
  const say = useCallback((text: string, warning = false) => { if (text) setChat({ text, warning }); }, []);

  const spoken = useRef({ phase: 'print', reflow: '' });
  useEffect(() => {
    if (spoken.current.phase === phase) return;
    spoken.current.phase = phase;
    if (phase === 'feed') {
      spoken.current.reflow = state;
      say(`Into the reflow oven. Set the heat and the belt speed; I'll read the profile. ${XIAO_LIN_REFLOW[state]}`, state !== 'ok');
    } else say(XIAO_LIN_STEP[phase] ?? '');
  }, [phase, state, say]);
  useEffect(() => {
    if (phase !== 'feed' || spoken.current.reflow === state) return;
    spoken.current.reflow = state;
    say(XIAO_LIN_REFLOW[state], state !== 'ok');
  }, [state, phase, say]);

  useEffect(() => { SOUND[phase]?.(); }, [phase]);
  useTimedPhase(phase, TIMED[phase]?.duration, setProgress, () => {
    const next = TIMED[phase]!.next;
    setPhase(next);
    if (next === 'done' && chip && !completed.current) {
      completed.current = true;
      onComplete(false, { tvChipSerial: chip, tvSerial: tvSerialFor(chip), isTvOperational: true });
    }
  });

  /** Returns false when the action does not apply right now. */
  const act = useCallback((target: ChinaTarget): boolean => {
    if (!chip) {
      say(missing, true);
      sound.playError();
      return true;
    }
    if (!waiting || target !== waiting.target) return false;
    if (phase === 'feed') {
      if (state !== 'ok') {
        say(XIAO_LIN_REFLOW[state], true);
        sound.playError();
        return true;
      }
      setRun({ peak, timeAboveMelt });
    }
    setPhase(waiting.next);
    return true;
  }, [chip, waiting, phase, state, peak, timeAboveMelt, say]);

  const press = (id: ChinaControlId) => {
    let handled = true;
    switch (id) {
      case 'print': handled = act('printer'); break;
      case 'place': handled = act('placer'); break;
      case 'feed': handled = act('oven'); break;
      case 'xray': handled = act('xray'); break;
      case 'assemble': handled = phase === 'assemble' ? act('fixture') : false; break;
      case 'check': handled = phase === 'check' ? act('fixture') : false; break;
      case 'ship': handled = phase === 'ship' ? act('fixture') : false; break;
      case 'heatDown': case 'heatUp': case 'beltDown': case 'beltUp':
        if (phase !== 'feed') { handled = false; break; }
        if (id === 'heatDown') setHeat(v => Math.max(1, v - 1));
        if (id === 'heatUp') setHeat(v => Math.min(LEVELS, v + 1));
        if (id === 'beltDown') setBelt(v => Math.max(1, v - 1));
        if (id === 'beltUp') setBelt(v => Math.min(LEVELS, v + 1));
        sound.playSelect();
        break;
    }
    if (!handled) {
      say(`Not now. ${XIAO_LIN_STEP[phase] ?? 'Wait for this step to finish.'}`, true);
      sound.playError();
    }
  };

  useActKey(waiting?.target, target => act(target as ChinaTarget));

  // Readings.
  const from = (other: ChinaPhase) => order(phase) >= order(other);
  const shown = from('reflowing') ? run : { peak, timeAboveMelt };
  const lampOn: Record<ChinaLampId, boolean> = {
    pasted: from('place'), placed: from('feed'), soldered: from('xray'), inspected: from('assemble'),
    assembled: from('check'), powered: from('ship'), packed: phase === 'shipping' || phase === 'done',
  };
  const lamp = (id: ChinaLampId): LampColor => (!lampOn[id] ? 'off' : id === 'powered' || id === 'inspected' ? 'green' : 'amber');
  const peakMin = 180, peakMax = 290;
  const gauge = (id: ChinaGaugeId): GaugeReading => {
    switch (id) {
      case 'peak': {
        const inBand = shown.peak >= PEAK_BAND[0] && shown.peak <= PEAK_BAND[1];
        return {
          kind: 'bar', fill: (shown.peak - peakMin) / (peakMax - peakMin), value: shown.peak, max: peakMax,
          band: [(PEAK_BAND[0] - peakMin) / (peakMax - peakMin), (PEAK_BAND[1] - peakMin) / (peakMax - peakMin)],
          color: inBand ? 'bg-emerald-400' : shown.peak > PEAK_BAND[1] ? 'bg-red-500' : 'bg-sky-400',
          text: `${shown.peak} °C`, title: 'Predicted peak board temperature (solder melts at 217 °C)',
        };
      }
      case 'time': {
        const inBand = shown.timeAboveMelt >= TAL_BAND[0] && shown.timeAboveMelt <= TAL_BAND[1];
        return {
          kind: 'bar', fill: shown.timeAboveMelt / 120, value: shown.timeAboveMelt, max: 120,
          band: [TAL_BAND[0] / 120, TAL_BAND[1] / 120], color: inBand ? 'bg-emerald-400' : 'bg-amber-300',
          text: `${shown.timeAboveMelt} s`, title: 'Predicted time the solder stays molten',
        };
      }
      case 'board': {
        const label = from('xray') ? 'SOLDERED' : from('feed') ? 'PLACED' : from('place') ? 'PASTED' : 'BARE';
        return { kind: 'bar', fill: from('xray') ? 1 : from('feed') ? 0.66 : from('place') ? 0.33 : 0, value: 0, max: 1, color: 'bg-amber-300', text: label };
      }
      case 'tv': {
        const label = phase === 'shipping' || phase === 'done' ? 'PACKED' : from('ship') ? 'WORKS' : from('check') ? 'BUILT' : '—';
        return { kind: 'bar', fill: from('ship') ? 1 : from('check') ? 0.6 : 0, value: 0, max: 1, color: from('ship') ? 'bg-emerald-400' : 'bg-amber-300', text: label };
      }
      case 'heat': return { kind: 'bars', value: heat, max: LEVELS, label: `HEAT ${heat}/${LEVELS}` };
      case 'belt': return { kind: 'bars', value: belt, max: LEVELS, label: `BELT ${belt}/${LEVELS}` };
    }
  };
  const led = (id: ChinaControlId): Led => {
    if (waiting?.control === id && chip) return 'next';
    if ((id === 'heatDown' || id === 'heatUp' || id === 'beltDown' || id === 'beltUp') && phase === 'feed') return 'on';
    return 'off';
  };

  return (
    <WorkshopLayout
      ariaLabel="China TV workshop" kicker="China · TV factory, Huizhou" title="From packaged chip to working TV" onReturnToMap={onReturnToMap}
      scene={<>
        <ChinaTvScene phase={phase} progress={progress} target={chip ? waiting?.target ?? null : null} onAct={act} />
        {(phase === 'feed' || phase === 'reflowing') && <ProfileInset peak={shown.peak} timeAboveMelt={shown.timeAboveMelt} running={phase === 'reflowing'} progress={progress} />}
        {(phase === 'xraying' || phase === 'assemble') && <XrayInset progress={phase === 'xraying' ? progress : 1} />}
      </>}
      panel={<CockpitPanel layout={CHINA_PANEL} label="TV line control panel" asset="china-control-panel" lamp={lamp} gauge={gauge} led={led} onPress={press} />}
      guide={<GuideBox name="Xiao Lin" line={chat} asset="china-chat-box" />}
    />
  );
}

/**
 * Predicted board-temperature curve: preheat, soak, a peak above the melting line, then cooling.
 * A schematic prediction, not a measured profile (research C11, C18). While running, a side view
 * shows ball and paste melting into one joint and setting.
 */
function ProfileInset({ peak, timeAboveMelt, running, progress }: { peak: number; timeAboveMelt: number; running: boolean; progress: number }) {
  const W = 200, H = 92, tMax = 300, yMin = 20, yMax = 290;
  const x = (t: number) => 10 + (t / tMax) * (W - 20);
  const y = (temp: number) => H - 8 - ((temp - yMin) / (yMax - yMin)) * (H - 16);
  const rise = 150, half = timeAboveMelt / 2, top = rise + Math.max(10, half);
  const points: [number, number][] = [[0, 25], [70, 150], [rise, 185], [rise + Math.max(5, half * 0.6), LIQUIDUS], [top, peak], [top + Math.max(5, half * 0.8), LIQUIDUS], [top + 70, 90], [tMax, 50]];
  const d = points.map(([t, temp], i) => `${i ? 'L' : 'M'}${x(t).toFixed(1)} ${y(temp).toFixed(1)}`).join(' ');
  const marker = running ? Math.min(points.length - 1.001, progress * (points.length - 1)) : -1;
  const mi = Math.floor(marker);
  const mk = marker - mi;
  const mp = marker >= 0 ? [points[mi][0] + (points[mi + 1][0] - points[mi][0]) * mk, points[mi][1] + (points[mi + 1][1] - points[mi][1]) * mk] : null;
  const molten = running && mp !== null && mp[1] >= LIQUIDUS;
  const joined = running && progress > 0.5;
  return (
    <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-white/15 bg-[#0c1821]/90 p-2 text-[9px] font-mono text-amber-100 shadow-lg" aria-hidden="true">
      <div className="mb-1 tracking-widest">{running ? 'BOARD IN THE OVEN' : 'PREDICTED PROFILE'}</div>
      <div className="flex items-end gap-2">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <rect x="10" y={y(PEAK_BAND[1])} width={W - 20} height={y(PEAK_BAND[0]) - y(PEAK_BAND[1])} fill="#34d399" opacity="0.15" />
          <line x1="10" x2={W - 10} y1={y(LIQUIDUS)} y2={y(LIQUIDUS)} stroke="#fca5a5" strokeDasharray="3 2" />
          <text x={W - 12} y={y(LIQUIDUS) - 2} textAnchor="end" fill="#fca5a5" fontSize="7">melts 217 °C</text>
          <path d={d} fill="none" stroke="#fcd34d" strokeWidth="1.8" />
          {mp && <circle cx={x(mp[0])} cy={y(mp[1])} r="3.5" fill="#fff" />}
        </svg>
        <svg width="56" height="56" viewBox="0 0 56 56">
          <rect x="6" y="40" width="44" height="6" fill="#c9a24a" />
          <rect x="6" y="8" width="44" height="8" fill="#161618" />
          {joined
            ? <path d="M14 16 Q12 28 16 40 H40 Q44 28 42 16 Z" fill={molten ? '#fde68a' : '#cfd4d8'} />
            : <><circle cx="28" cy="25" r="9" fill={molten ? '#fde68a' : '#cfd4d8'} /><rect x="17" y="35" width="22" height="5" fill={molten ? '#fde68a' : '#8f9499'} /></>}
        </svg>
      </div>
      <div className="mt-1 text-[8px] text-amber-100/70">{joined ? 'ball + paste = one joint' : 'ball on paste'} · green band = target peak</div>
    </div>
  );
}

/** Schematic X-ray of the soldered package after research C13 Fig. 7: dark solder balls, vias, fine bond wires. */
function XrayInset({ progress }: { progress: number }) {
  const balls = Array.from({ length: 36 }, (_, i) => [24 + (i % 6) * 26, 16 + Math.floor(i / 6) * 13] as const);
  const wires = Array.from({ length: 8 }, (_, i) => {
    const side = i < 4 ? -1 : 1;
    const yy = 34 + (i % 4) * 8;
    return [100 + side * 14, yy, 100 + side * 70, yy + (i % 2 ? 10 : -6)] as const;
  });
  const scan = 10 + progress * 180;
  return (
    <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-white/15 bg-[#0c1821]/90 p-2 text-[9px] font-mono text-amber-100 shadow-lg" aria-hidden="true">
      <div className="mb-1 tracking-widest">X-RAY · UNDER THE CHIP</div>
      <svg width="200" height="96" viewBox="0 0 200 96">
        <rect width="200" height="96" fill="#b9bdc0" />
        <rect x="80" y="26" width="40" height="42" fill="#a6aaad" />
        {balls.map(([bx, by], i) => <circle key={i} cx={bx} cy={by} r="5.2" fill="#1d1f21" opacity={bx < scan ? 0.92 : 0.15} />)}
        {balls.filter((_, i) => i % 3 === 1).map(([bx, by], i) => <circle key={`v${i}`} cx={bx + 13} cy={by + 6} r="1.8" fill="none" stroke="#5a5e61" opacity={bx < scan ? 1 : 0.2} />)}
        {wires.map(([x1, y1, x2, y2], i) => <line key={`w${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3c3f42" strokeWidth="1" opacity={x2 < scan || x1 < scan ? 0.9 : 0.15} />)}
        {progress < 1 && <rect x={scan} y="0" width="3" height="96" fill="#9fe8ff" opacity="0.8" />}
      </svg>
      <div className="mt-1 text-[8px] text-amber-100/70">● solder joints · ─ your bond wires · ○ vias</div>
    </div>
  );
}
