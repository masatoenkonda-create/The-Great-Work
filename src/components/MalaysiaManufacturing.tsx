import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MalaysiaPackageScene, MALAYSIA_PHASES, MalaysiaPhase, MalaysiaTarget } from './MalaysiaPackageScene';
import { sound } from '../services/audio';
import { CargoState } from '../types/route';
import { WaferMap, chipSerial } from '../content/waferMap';
import { BondState, bondState, FARID_BOND, LEVELS } from '../content/malaysiaControls';
import { MALAYSIA_PANEL, MalaysiaControlId, MalaysiaGaugeId, MalaysiaLampId } from '../content/malaysiaPanel';
import { CockpitPanel, GaugeReading, LampColor, Led } from './workshop/CockpitPanel';
import { GuideBox, GuideLine } from './workshop/GuideBox';
import { WorkshopLayout, useActKey, useTimedPhase } from './workshop/WorkshopLayout';

interface Props {
  waferMap: WaferMap | null;
  onReturnToMap: () => void;
  onComplete: (isPlaceholder: boolean, updates: Partial<CargoState>) => void;
}

const order = (phase: MalaysiaPhase) => MALAYSIA_PHASES.indexOf(phase);

/** Each waiting phase: the station (or panel button) to use, and the phase it starts. */
const ACTIONS: Partial<Record<MalaysiaPhase, { target: MalaysiaTarget; control: MalaysiaControlId; next: MalaysiaPhase }>> = {
  saw: { target: 'saw', control: 'saw', next: 'sawing' },
  pick: { target: 'bonder', control: 'pick', next: 'picking' },
  bond: { target: 'wirebonder', control: 'bond', next: 'bonding' },
  mold: { target: 'press', control: 'mold', next: 'molding' },
  balls: { target: 'baller', control: 'balls', next: 'balling' },
  test: { target: 'socket', control: 'test', next: 'testing' },
  ship: { target: 'tray', control: 'ship', next: 'shipping' },
};

const TIMED: Partial<Record<MalaysiaPhase, { duration: number; next: MalaysiaPhase }>> = {
  sawing: { duration: 4500, next: 'pick' },
  picking: { duration: 4000, next: 'bond' },
  bonding: { duration: 4500, next: 'mold' },
  molding: { duration: 4200, next: 'balls' },
  balling: { duration: 3500, next: 'test' },
  testing: { duration: 3800, next: 'ship' },
  shipping: { duration: 1800, next: 'done' },
};
const WIRES = 8;

/** Farid's line when each step begins. */
const FARID_STEP: Partial<Record<MalaysiaPhase, string>> = {
  saw: 'Selamat datang! First, cut between the chips. The tape keeps them all in place.',
  sawing: 'Diamond blade and water, lane by lane...',
  pick: 'Taiwan tested every chip. Choose a green one on the wafer map, then PICK DIE.',
  picking: 'Pin pushes from below, vacuum lifts from above. Glue on the board, chip on the glue, pads up.',
  bonding: 'Ball on the chip, loop, stitch on the board. Eight times. (Steady hands. Well, a steady machine.)',
  mold: 'Those wires are delicate. Time for a sturdy coat: close the mold.',
  molding: 'Hot resin squeezed in around chip and wires. Not airtight like metal, but tough.',
  balls: "Flip it over: these solder balls will connect it to the board in China.",
  balling: 'Place the balls, melt them on, flip it back.',
  test: 'Now test it again, this time through its package.',
  testing: 'Contacts closed... it works! Laser-marking your serial.',
  shipping: 'Selamat jalan!',
};

const SOUND: Partial<Record<MalaysiaPhase, () => void>> = {
  sawing: () => sound.playDicingSaw(), picking: () => sound.playSelect(), bonding: () => sound.playClink(),
  molding: () => sound.playBubble(), balling: () => sound.playClink(), testing: () => sound.playProbePing(true), shipping: () => sound.playConfirm(),
};

/** Malaysia work screen: tested wafer to one packaged, tested chip. The caller owns the arrival dialogue. */
export function MalaysiaManufacturing({ waferMap: map, onReturnToMap, onComplete }: Props) {
  const [phase, setPhase] = useState<MalaysiaPhase>('saw');
  const [progress, setProgress] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [force, setForce] = useState(1);
  const [ultrasonic, setUltrasonic] = useState(1);
  const [chat, setChat] = useState<GuideLine>(map
    ? { text: FARID_STEP.saw!, warning: false }
    : { text: "No tested wafer from Taiwan yet. Go back and finish Taiwan's probe test first.", warning: true });
  const completed = useRef(false);
  const waiting = ACTIONS[phase];
  const bond: BondState = bondState(force, ultrasonic);
  const die = map?.dies.find(d => d.id === selected) ?? null;
  const serial = map && die ? chipSerial(map, die) : null;
  const say = useCallback((text: string, warning = false) => { if (text) setChat({ text, warning }); }, []);

  // Speak once per step and once per bonder setting change.
  const spoken = useRef({ phase: 'saw', bond: '' });
  useEffect(() => {
    if (spoken.current.phase === phase) return;
    spoken.current.phase = phase;
    if (phase === 'bond') {
      spoken.current.bond = bond;
      say(`Now the wires. Set the force and the vibration, then BOND. ${FARID_BOND[bond]}`, bond !== 'ok');
    } else if (phase === 'ship') say(`Your chip: ${serial}. Off to China!`);
    else say(FARID_STEP[phase] ?? '');
  }, [phase, bond, serial, say]);
  useEffect(() => {
    if (phase !== 'bond' || spoken.current.bond === bond) return;
    spoken.current.bond = bond;
    say(FARID_BOND[bond], bond !== 'ok');
  }, [bond, phase, say]);

  useEffect(() => { SOUND[phase]?.(); }, [phase]);
  useTimedPhase(phase, TIMED[phase]?.duration, setProgress, () => {
    const next = TIMED[phase]!.next;
    setPhase(next);
    if (next === 'done' && serial && !completed.current) {
      completed.current = true;
      onComplete(false, { selectedChipSerial: serial });
    }
  });

  const choose = (id: string) => {
    if (phase !== 'pick' || !map) return;
    const d = map.dies.find(x => x.id === id);
    if (!d || d.status !== 'pass') {
      say(d?.status === 'fail' ? `Die ${id.toUpperCase()} failed Taiwan's probe test. Pick a green one.` : 'No complete chip there.', true);
      sound.playError();
      return;
    }
    setSelected(id);
    say(`Die ${id.toUpperCase()} passed in Taiwan. Good choice. Now PICK DIE.`);
    sound.playSelect();
  };

  /** Returns false when the action does not apply right now. */
  const act = useCallback((target: MalaysiaTarget): boolean => {
    if (!map) {
      say("No tested wafer from Taiwan yet. Go back and finish Taiwan's probe test first.", true);
      sound.playError();
      return true;
    }
    if (!waiting || target !== waiting.target) return false;
    if (phase === 'pick' && !selected) {
      say('Choose a green die on the wafer map first.', true);
      sound.playError();
      return true;
    }
    if (phase === 'bond' && bond !== 'ok') {
      say(FARID_BOND[bond], true);
      sound.playError();
      return true;
    }
    setPhase(waiting.next);
    return true;
  }, [map, waiting, phase, selected, bond, say]);

  const press = (id: MalaysiaControlId) => {
    let handled = true;
    switch (id) {
      case 'saw': handled = act('saw'); break;
      case 'pick': handled = act('bonder'); break;
      case 'bond': handled = act('wirebonder'); break;
      case 'mold': handled = act('press'); break;
      case 'balls': handled = act('baller'); break;
      case 'test': handled = act('socket'); break;
      case 'ship': handled = act('tray'); break;
      case 'forceDown': case 'forceUp': case 'usDown': case 'usUp':
        if (phase !== 'bond') { handled = false; break; }
        if (id === 'forceDown') setForce(v => Math.max(1, v - 1));
        if (id === 'forceUp') setForce(v => Math.min(LEVELS, v + 1));
        if (id === 'usDown') setUltrasonic(v => Math.max(1, v - 1));
        if (id === 'usUp') setUltrasonic(v => Math.min(LEVELS, v + 1));
        sound.playSelect();
        break;
    }
    if (!handled) {
      say(`Not now. ${FARID_STEP[phase] ?? 'Wait for this step to finish.'}`, true);
      sound.playError();
    }
  };

  useActKey(waiting?.target, target => act(target as MalaysiaTarget));

  // Readings.
  const from = (other: MalaysiaPhase) => order(phase) >= order(other);
  const wireCount = phase === 'bonding' ? Math.floor(Math.max(0, (progress - 0.15) / 0.8) * WIRES) : from('mold') ? WIRES : 0;
  const lampOn: Record<MalaysiaLampId, boolean> = {
    diced: from('pick'), picked: from('picking') && !!selected, attached: from('bond'), bonded: from('mold'),
    molded: from('balls'), balls: from('test'), tested: from('ship'),
  };
  const lamp = (id: MalaysiaLampId): LampColor => (!lampOn[id] ? 'off' : id === 'tested' ? 'green' : 'amber');
  const steps = ['saw', 'pick', 'bond', 'mold', 'balls', 'test', 'ship', 'done'] as const;
  const share = Math.max(0, steps.findIndex(s => order(phase) <= order(s))) / (steps.length - 1);
  const gauge = (id: MalaysiaGaugeId): GaugeReading => {
    switch (id) {
      case 'die': return { kind: 'bar', fill: selected ? 1 : 0, value: selected ? 1 : 0, max: 1, color: 'bg-emerald-400', text: selected ? selected.toUpperCase() : '—', title: 'The die picked from Taiwan\'s map' };
      case 'bondReady': {
        const live = phase === 'bond';
        return {
          kind: 'bar', fill: live ? (bond === 'ok' ? 1 : bond === 'weak' ? 0.3 : 0.9) : 0, value: force + ultrasonic, max: LEVELS * 2,
          color: bond === 'ok' ? 'bg-emerald-400' : bond === 'weak' ? 'bg-sky-400' : 'bg-red-500',
          text: !live ? (from('mold') ? 'DONE' : '—') : bond === 'ok' ? 'READY' : bond === 'weak' ? 'TOO WEAK' : 'TOO MUCH',
          title: 'Bond recipe check: force and ultrasonic together (game levels, not real units)',
        };
      }
      case 'wires': return { kind: 'bar', fill: wireCount / WIRES, value: wireCount, max: WIRES, color: 'bg-amber-300', text: `${wireCount}/${WIRES}` };
      case 'progress': return { kind: 'bar', fill: share, value: share * 100, max: 100, color: 'bg-amber-300', text: `${Math.round(share * 100)} %` };
      case 'force': return { kind: 'bars', value: force, max: LEVELS, label: `FORCE ${force}/${LEVELS}` };
      case 'ultrasonic': return { kind: 'bars', value: ultrasonic, max: LEVELS, label: `U/S ${ultrasonic}/${LEVELS}` };
    }
  };
  const led = (id: MalaysiaControlId): Led => {
    if (waiting?.control === id && map && !(phase === 'pick' && !selected)) return 'next';
    if ((id === 'forceDown' || id === 'forceUp' || id === 'usDown' || id === 'usUp') && phase === 'bond') return 'on';
    return 'off';
  };
  const picked = die ? { row: die.row, col: die.col } : null;

  return (
    <WorkshopLayout
      ariaLabel="Malaysia packaging workshop" kicker="Malaysia · Assembly and test" title="From bare die to packaged chip" onReturnToMap={onReturnToMap}
      scene={<>
        <MalaysiaPackageScene phase={phase} progress={progress} picked={from('picking') ? picked : null} target={map && !(phase === 'pick' && !selected) ? waiting?.target ?? null : null} onAct={act} />
        {map && from('pick') && phase !== 'done' && <MapPicker map={map} selected={selected} interactive={phase === 'pick'} taken={from('picking')} onChoose={choose} />}
        {from('picking') && phase !== 'done' && <CrossSection phase={phase} progress={progress} />}
      </>}
      panel={<CockpitPanel layout={MALAYSIA_PANEL} label="Assembly control panel" asset="malaysia-control-panel" lamp={lamp} gauge={gauge} led={led} onPress={press} />}
      guide={<GuideBox name="Farid" line={chat} asset="malaysia-chat-box" />}
    />
  );
}

/** Taiwan's saved map, same coordinates and notch-down orientation. Colors are the electronic map, not paint. */
function MapPicker({ map, selected, interactive, taken, onChoose }: { map: WaferMap; selected: string | null; interactive: boolean; taken: boolean; onChoose: (id: string) => void }) {
  return (
    <div className="absolute right-3 top-3 rounded-lg border border-white/15 bg-[#0c1821]/90 p-2 text-[9px] font-mono text-amber-100 shadow-lg">
      <div className="mb-1 tracking-widest">WAFER MAP · {map.waferId}</div>
      <div className="relative grid grid-cols-8 gap-[2px] rounded-full bg-white/5 p-2" role="group" aria-label={`Wafer map ${map.waferId}, notch down`}>
        {map.dies.map(die => {
          if (die.status === 'excluded') return <span key={die.id} className="h-4 w-4" />;
          const isSelected = die.id === selected;
          const empty = isSelected && taken;
          return <button key={die.id} type="button" disabled={!interactive} onClick={() => onChoose(die.id)}
            aria-label={`Die ${die.id.toUpperCase()}: ${die.status === 'pass' ? 'passed' : 'failed'}${isSelected ? ', selected' : ''}`}
            className={`flex h-4 w-4 items-center justify-center rounded-[2px] text-[8px] font-bold ${empty ? 'bg-transparent ring-1 ring-amber-300' : isSelected ? 'bg-amber-300 text-black ring-2 ring-white' : die.status === 'pass' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'} ${interactive ? 'cursor-pointer hover:brightness-125' : 'cursor-default'}`}>
            {empty ? '' : die.status === 'pass' ? '✓' : '✗'}
          </button>;
        })}
        <span className="absolute -bottom-1 left-1/2 h-1.5 w-3 -translate-x-1/2 rounded-t-full bg-[#0c1821]" />
      </div>
      <div className="mt-1 text-[8px] text-amber-100/70">{interactive ? 'Click a green ✓ die' : '✓ pass · ✗ fail · notch down'}</div>
    </div>
  );
}

/** Package cross-section after research M01: laminate with vias, adhesive, die, wire bonds, mold cap, solder balls. */
function CrossSection({ phase, progress: p }: { phase: MalaysiaPhase; progress: number }) {
  const at = (other: MalaysiaPhase) => MALAYSIA_PHASES.indexOf(phase) >= MALAYSIA_PHASES.indexOf(other);
  const glue = at('bond') || (phase === 'picking' && p > 0.15);
  const dieOn = at('bond') || (phase === 'picking' && p > 0.6);
  const wires = phase === 'bonding' ? Math.floor(Math.max(0, (p - 0.15) / 0.8) * 4) : at('mold') ? 4 : 0;
  const cap = at('balls') || (phase === 'molding' && p > 0.6);
  const balls = at('test') || (phase === 'balling' && p > 0.4);
  const path = at('test');
  const loops = [[86, 52, 38, 66], [80, 54, 28, 66], [114, 52, 162, 66], [120, 54, 172, 66]];
  return (
    <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-white/15 bg-[#0c1821]/90 p-2 text-[9px] font-mono text-amber-100 shadow-lg" aria-hidden="true">
      <div className="mb-1 tracking-widest">PACKAGE CROSS-SECTION</div>
      <svg width="200" height="96" viewBox="0 0 200 96">
        {cap && <path d="M18 66 L30 34 H170 L182 66 Z" fill="#161618" />}
        <rect x="10" y="66" width="180" height="12" fill="#2f8a4a" />
        {[40, 70, 100, 130, 160].map(x => <rect key={x} x={x - 1.5} y="66" width="3" height="12" fill="#c9a43a" opacity="0.8" />)}
        {[28, 172, 38, 162].map(x => <rect key={x} x={x - 4} y="64" width="8" height="2.5" fill="#e6b84a" />)}
        {glue && <rect x="72" y="61" width="56" height="5" fill="#d8d2b0" />}
        {dieOn && <rect x="74" y="52" width="52" height="9" fill="#8f96b8" />}
        {loops.slice(0, wires).map(([x1, y1, x2, y2], i) => <path key={i} d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${y1 - 18} ${x2} ${y2 - 2}`} fill="none" stroke="#e6b84a" strokeWidth="1.4" />)}
        {balls && [40, 70, 100, 130, 160].map(x => <circle key={x} cx={x} cy="83" r="5.5" fill="#d0d4d8" />)}
        {path && <path d="M80 52 Q60 34 38 64 L40 78 L40 83" fill="none" stroke="#fcd34d" strokeWidth="1.6" strokeDasharray="3 2" />}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-2 text-[8px] text-amber-100/70">
        <span style={{ color: '#8f96b8' }}>■ die</span><span style={{ color: '#e6b84a' }}>■ wire</span><span style={{ color: '#2f8a4a' }}>■ board</span><span>■ mold</span><span style={{ color: '#d0d4d8' }}>● solder</span>
        {path && <span style={{ color: '#fcd34d' }}>- - chip → wire → board → ball</span>}
      </div>
    </div>
  );
}
