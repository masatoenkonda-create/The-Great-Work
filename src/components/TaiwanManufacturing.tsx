import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TaiwanFabScene, TAIWAN_PHASES, TaiwanPhase, TaiwanTarget, ACTIVE_DIES } from './TaiwanFabScene';
import { sound } from '../services/audio';
import { CargoState } from '../types/route';
import { FIELDS, FieldExposure, FieldId, WaferMap, buildWaferMap, mapCounts, dieId } from '../content/waferMap';
import { AlignState, START_OFFSETS, alignState, canExpose, nudge, MEI_ALIGN } from '../content/taiwanControls';
import { TAIWAN_PANEL, TaiwanControlId, TaiwanGaugeId, TaiwanLampId } from '../content/taiwanPanel';
import { CockpitPanel, GaugeReading, LampColor, Led } from './workshop/CockpitPanel';
import { GuideBox, GuideLine } from './workshop/GuideBox';
import { WorkshopLayout, useActKey, useTimedPhase } from './workshop/WorkshopLayout';

interface Props {
  lotId: string;
  onReturnToMap: () => void;
  onComplete: (isPlaceholder: boolean, updates: Partial<CargoState>) => void;
}

const order = (phase: TaiwanPhase) => TAIWAN_PHASES.indexOf(phase);

/** Each waiting phase: the object (or panel button) to use, and the phase it starts. */
const ACTIONS: Partial<Record<TaiwanPhase, { target: TaiwanTarget; control: TaiwanControlId; next: TaiwanPhase }>> = {
  load: { target: 'carrier', control: 'load', next: 'loading' },
  first: { target: 'track', control: 'first', next: 'firstLayer' },
  align: { target: 'scanner', control: 'expose', next: 'exposing' },
  finish: { target: 'etcher', control: 'finish', next: 'finishing' },
  probe: { target: 'prober', control: 'probe', next: 'probing' },
  release: { target: 'output', control: 'ship', next: 'shipping' },
};

const DURATION: Partial<Record<TaiwanPhase, number>> = {
  loading: 1600, firstLayer: 7000, exposing: 900, finishing: 6500, probing: 5000, retrying: 2200, shipping: 1800,
};

/** Mei's line when each step begins (release has its own, built from the result). */
const MEI_STEP: Partial<Record<TaiwanPhase, string>> = {
  load: "Japan's wafers, fresh from the box. Load one. Edges only, please!",
  first: "First layer. Coat it, print it with light, develop, etch. I'll run this one: watch the wafer, and the detail view.",
  firstLayer: 'Light changes the coating. The developer opens the pattern; etching copies it into the film.',
  finish: 'All four fields printed. Now develop, etch, and build the rest of the layers.',
  finishing: 'Develop, etch, strip... then repeat, many times, for the transistors and their wiring. (We skip a few weeks here.)',
  probe: 'Built! But looking shiny proves nothing. Time to test every chip.',
  probing: 'Needles on the pads, one chip at a time...',
  retrying: 'Into the scrap bin. Fresh wafer, fresh start.',
  shipping: 'Off to Malaysia, map and all!',
};

const SOUND: Partial<Record<TaiwanPhase, () => void>> = {
  loading: () => sound.playSelect(), firstLayer: () => sound.playSpinCoat(), exposing: () => sound.playExposure(),
  finishing: () => sound.playPlasmaEtch(), probing: () => sound.playProbePing(true), retrying: () => sound.playClink(),
  shipping: () => sound.playConfirm(),
};

function releaseLine(map: WaferMap): GuideLine {
  const { goodDiesCount: good, diesOnWaferCount: total } = mapCounts(map);
  if (good === 0) return { text: 'Not one chip works. That wafer goes in the bin: try a new one.', warning: true };
  if (good === total) return { text: `All ${total} chips work! Malaysia gets this exact map. (Show-off.)`, warning: false };
  return { text: `${good} of ${total} chips work. The red ones missed the layer below. Ship this map, or try a new wafer.`, warning: true };
}

/** Taiwan work screen: blank wafer to a tested wafer and its saved map. The caller owns the arrival dialogue. */
export function TaiwanManufacturing({ lotId, onReturnToMap, onComplete }: Props) {
  const [phase, setPhase] = useState<TaiwanPhase>('load');
  const [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const [fieldIndex, setFieldIndex] = useState(0);
  const [offsets, setOffsets] = useState(START_OFFSETS);
  const [exposures, setExposures] = useState<FieldExposure[]>([]);
  const [map, setMap] = useState<WaferMap | null>(null);
  const [chat, setChat] = useState<GuideLine>({ text: MEI_STEP.load!, warning: false });
  const completed = useRef(false);
  const field: FieldId = FIELDS[fieldIndex];
  const { dx, dy } = offsets[field];
  const align: AlignState = alignState(dx, dy);
  const waiting = ACTIONS[phase];
  const say = useCallback((text: string, warning = false) => { if (text) setChat({ text, warning }); }, []);

  // Speak once per step, per field, and per alignment change.
  const spoken = useRef({ step: '', align: '' });
  useEffect(() => {
    const key = phase === 'align' ? `align-${attempt}-${field}` : `${phase}-${attempt}`;
    if (spoken.current.step === key) return;
    spoken.current.step = key;
    spoken.current.align = '';
    if (phase === 'align') say(`New layer, new mask. Line up the marks for field ${field}, then expose. ${MEI_ALIGN[align]}`, align !== 'aligned');
    else if (phase === 'exposing') say(`Flash! Field ${field} printed.`);
    else if (phase === 'release' && map) setChat(releaseLine(map));
    else say(MEI_STEP[phase] ?? '');
  }, [phase, field, attempt, align, map, say]);
  useEffect(() => {
    if (phase !== 'align' || spoken.current.align === align) return;
    if (spoken.current.align) say(MEI_ALIGN[align], align !== 'aligned');
    spoken.current.align = align;
  }, [align, phase, say]);

  useEffect(() => { SOUND[phase]?.(); }, [phase]);
  useTimedPhase(`${phase}-${attempt}-${fieldIndex}`, DURATION[phase], setProgress, () => {
    switch (phase) {
      case 'loading': setPhase('first'); break;
      case 'firstLayer': setPhase('align'); break;
      case 'exposing':
        if (fieldIndex < FIELDS.length - 1) { setFieldIndex(i => i + 1); setPhase('align'); } else setPhase('finish');
        break;
      case 'finishing': setPhase('probe'); break;
      case 'probing': setPhase('release'); break;
      case 'retrying': setPhase('first'); break;
      case 'shipping':
        setPhase('done');
        if (map && !completed.current) {
          completed.current = true;
          onComplete(false, { waferMap: map, ...mapCounts(map) });
        }
        break;
    }
  });

  const startRetry = () => {
    setAttempt(a => a + 1);
    setFieldIndex(0);
    setOffsets(START_OFFSETS);
    setExposures([]);
    setMap(null);
    setPhase('retrying');
  };

  /** Returns false when the action does not apply right now. */
  const act = useCallback((target: TaiwanTarget): boolean => {
    if (!waiting || target !== waiting.target) return false;
    if (phase === 'align') {
      if (!canExpose(dx, dy)) {
        say(MEI_ALIGN.far, true);
        sound.playError();
        return true;
      }
      // The offset is frozen at the moment of exposure; moving the controls later can't repair it.
      setExposures(list => [...list.filter(e => e.field !== field), { field, dx, dy }]);
    }
    if (phase === 'probe') setMap(buildWaferMap(lotId, attempt, exposures));
    if (phase === 'release' && map && mapCounts(map).goodDiesCount === 0) {
      say('No working chips to ship. Try a new wafer.', true);
      sound.playError();
      return true;
    }
    setPhase(waiting.next);
    return true;
  }, [phase, waiting, dx, dy, field, lotId, attempt, exposures, map, say]);

  const press = (id: TaiwanControlId) => {
    let handled = true;
    switch (id) {
      case 'load': handled = act('carrier'); break;
      case 'first': handled = act('track'); break;
      case 'expose': handled = act('scanner'); break;
      case 'finish': handled = act('etcher'); break;
      case 'probe': handled = act('prober'); break;
      case 'ship': handled = act('output'); break;
      case 'retry':
        if (phase === 'release') startRetry(); else handled = false;
        break;
      case 'xDown': case 'xUp': case 'yDown': case 'yUp':
        if (phase !== 'align') { handled = false; break; }
        setOffsets(all => {
          const o = all[field];
          const next = id === 'xDown' ? { ...o, dx: nudge(o.dx, -1) } : id === 'xUp' ? { ...o, dx: nudge(o.dx, 1) }
            : id === 'yDown' ? { ...o, dy: nudge(o.dy, -1) } : { ...o, dy: nudge(o.dy, 1) };
          return { ...all, [field]: next };
        });
        sound.playSelect();
        break;
    }
    if (!handled) {
      say(`Not now. ${phase === 'release' && map ? releaseLine(map).text : MEI_STEP[phase] ?? 'Wait for this step to finish.'}`, true);
      sound.playError();
    }
  };

  useActKey(waiting?.target, target => act(target as TaiwanTarget));

  // Readings.
  const from = (other: TaiwanPhase) => order(phase) >= order(other);
  const revealed = phase === 'probing' ? Math.min(ACTIVE_DIES.length, Math.floor(Math.max(0, (progress - 0.12) / 0.86) * ACTIVE_DIES.length)) : from('release') ? ACTIVE_DIES.length : 0;
  const probeIndex = phase === 'probing' && progress > 0.12 ? Math.min(ACTIVE_DIES.length - 1, revealed) : -1;
  const shownDies = map ? ACTIVE_DIES.slice(0, revealed).map(({ row, col }) => map.dies.find(d => d.id === dieId(row, col))!) : [];
  const good = shownDies.filter(d => d.status === 'pass').length;
  const detail = phase === 'retrying' ? 0 : from('finishing') && !(phase === 'finishing' && progress < 0.6) ? 2 : (phase === 'firstLayer' && progress > 0.72) || from('align') ? 1 : 0;
  const coated = phase === 'align' || phase === 'exposing' || phase === 'finish';
  const lampOn: Record<TaiwanLampId, boolean> = {
    wafer: from('first') && phase !== 'retrying' && phase !== 'done', resist: coated, layer1: from('align') && phase !== 'retrying',
    aligned: phase === 'align' && align === 'aligned', patterned: from('probe') && phase !== 'retrying', tested: from('release') && phase !== 'retrying',
    released: phase === 'shipping' || phase === 'done',
  };
  const lamp = (id: TaiwanLampId): LampColor =>
    !lampOn[id] ? 'off' : id === 'aligned' || id === 'tested' || id === 'released' ? 'green' : 'amber';
  const processShare = phase === 'firstLayer' ? progress * 0.35 : phase === 'finishing' ? 0.55 + progress * 0.45
    : from('probe') && phase !== 'retrying' ? 1 : from('align') && phase !== 'retrying' ? 0.35 + (exposures.length / 4) * 0.2 : 0;
  const gauge = (id: TaiwanGaugeId): GaugeReading => {
    switch (id) {
      case 'field': return {
        kind: 'bar', fill: phase === 'align' || phase === 'exposing' ? (fieldIndex + 1) / 4 : from('finish') && phase !== 'retrying' ? 1 : 0,
        value: fieldIndex + 1, max: 4, color: 'bg-sky-300',
        text: phase === 'align' || phase === 'exposing' ? `${field} · ${fieldIndex + 1}/4` : from('finish') && phase !== 'retrying' ? 'ALL 4' : '—',
      };
      case 'align': {
        const live = phase === 'align' || phase === 'exposing';
        return {
          kind: 'bar', fill: live ? (align === 'aligned' ? 1 : align === 'near' ? 0.55 : 0.2) : 0, value: live ? Math.abs(dx) + Math.abs(dy) : 0, max: 6,
          color: align === 'aligned' ? 'bg-emerald-400' : align === 'near' ? 'bg-amber-300' : 'bg-red-500',
          text: !live ? '—' : align === 'aligned' ? 'ALIGNED' : align === 'near' ? 'SLIGHTLY OFF' : 'WAY OFF',
          title: 'Alignment of the new mask to the layer below (game steps, not nanometres)',
        };
      }
      case 'progress': return { kind: 'bar', fill: processShare, text: `${Math.round(processShare * 100)} %`, value: processShare * 100, max: 100, color: 'bg-amber-300' };
      case 'good': return {
        kind: 'bar', fill: revealed ? good / ACTIVE_DIES.length : 0, value: good, max: ACTIVE_DIES.length, color: 'bg-emerald-400',
        text: revealed ? `${good}/${revealed}` : '—', title: 'Good dies / dies tested so far',
      };
    }
  };
  const led = (id: TaiwanControlId): Led => {
    if (waiting?.control === id) return 'next';
    if (id === 'retry' && phase === 'release') return map && mapCounts(map).goodDiesCount === 0 ? 'next' : 'on';
    if ((id === 'xDown' || id === 'xUp' || id === 'yDown' || id === 'yUp') && phase === 'align') return 'on';
    return 'off';
  };

  return (
    <WorkshopLayout
      ariaLabel="Taiwan circuit workshop" kicker="Taiwan · Chip fab" title="From blank wafer to tested chips" onReturnToMap={onReturnToMap}
      scene={<>
        <TaiwanFabScene phase={phase} progress={progress} field={field} dx={dx} dy={dy} detail={detail} probeIndex={probeIndex} target={waiting?.target ?? null} onAct={act} />
        <LayerDetail phase={phase} progress={progress} field={field} dx={dx} dy={dy} exposures={exposures} />
        {(from('probing') && phase !== 'retrying' && phase !== 'done') && map && <MapInset map={map} revealed={revealed} />}
      </>}
      panel={<CockpitPanel layout={TAIWAN_PANEL} label="Fab control panel" asset="taiwan-control-panel" lamp={lamp} gauge={gauge} led={led} onPress={press} />}
      guide={<GuideBox name="Mei" line={chat} asset="taiwan-chat-box" />}
    />
  );
}

const C = { substrate: '#8d99a3', film1: '#3b6ea8', film2: '#2f8f86', resist: '#f0a830', latent: '#fde68a', metal: '#d4b04c', upper: '#6b5aa8' };

/**
 * Magnified slice of one die and the box-in-box alignment mark. Exaggerated, schematic geometry:
 * film, positive-tone resist, development, etch, and a contact that must land on the feature below.
 */
function LayerDetail({ phase, progress: p, field, dx, dy, exposures }: { phase: TaiwanPhase; progress: number; field: FieldId; dx: number; dy: number; exposures: FieldExposure[] }) {
  const [cycle, setCycle] = useState(0);
  const after = order(phase) >= order('finish');
  useEffect(() => {
    if (!after) return;
    const id = setInterval(() => setCycle(c => (c + 1) % 4), 1500);
    return () => clearInterval(id);
  }, [after]);
  if (phase === 'done') return null;
  // After the second exposure, the slice cycles through the four fields so each one's result is visible.
  const shownField = after && phase !== 'retrying' ? FIELDS[cycle] : field;
  const record = exposures.find(e => e.field === shownField);
  const offset = after ? (record?.dx ?? 0) : dx;
  const missed = after && record ? record.dx !== 0 || record.dy !== 0 : false;

  const fresh = phase === 'load' || phase === 'loading' || phase === 'first' || phase === 'retrying';
  const fl = phase === 'firstLayer';
  const film1Full = fl && p < 0.66;
  const film1Block = (fl && p >= 0.66) || (!fresh && !fl);
  const resist1 = fl && p >= 0.12 && p < 0.84;
  const resist1Open = fl && p >= 0.58;
  const latent1 = fl && p >= 0.38 && p < 0.58;
  const layer2 = (fl && p >= 0.9) || (order(phase) >= order('align') && !fresh);
  const resist2 = (fl && p >= 0.9) || phase === 'align' || phase === 'exposing' || phase === 'finish' || (phase === 'finishing' && p < 0.2);
  const latent2 = phase === 'exposing' || phase === 'finish' || (phase === 'align' && exposures.some(e => e.field === field));
  const opened2 = (phase === 'finishing' && p >= 0.1) || order(phase) > order('finishing');
  const contact = (phase === 'finishing' && p >= 0.45) || order(phase) > order('finishing');
  const upper = (phase === 'finishing' && p >= 0.6) || order(phase) > order('finishing');
  const hole = 84 + offset * 7;

  return (
    <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-white/15 bg-[#14140f]/90 p-2 text-[9px] font-mono text-amber-100 shadow-lg" aria-hidden="true">
      <div className="mb-1 flex justify-between gap-3 tracking-widest"><span>LAYER DETAIL</span><span>{fresh ? '' : `FIELD ${shownField}`}</span></div>
      <div className="flex items-center gap-2">
        <svg width="180" height="96" viewBox="0 0 180 96">
          <rect x="0" y="72" width="180" height="24" fill={C.substrate} />
          {film1Full && <rect x="0" y="60" width="180" height="12" fill={C.film1} opacity={fl && p < 0.12 ? p / 0.12 : 1} />}
          {film1Block && <rect x="76" y="60" width="28" height="12" fill={C.film1} />}
          {resist1 && !resist1Open && <rect x="0" y="50" width="180" height="10" fill={C.resist} />}
          {resist1 && latent1 && <><rect x="0" y="50" width="76" height="10" fill={C.latent} /><rect x="104" y="50" width="76" height="10" fill={C.latent} /></>}
          {resist1 && resist1Open && <rect x="76" y="50" width="28" height="10" fill={C.resist} />}
          {layer2 && <path d={`M0 48 H180 V72 H104 V60 H76 V72 H0 Z`} fill={C.film2} opacity={fl && p < 0.95 ? (p - 0.9) / 0.05 : 1} />}
          {layer2 && opened2 && <rect x={hole} y="48" width="12" height={contact ? 0 : 24} fill="#14140f" />}
          {contact && <rect x={hole} y="48" width="12" height="24" fill={C.metal} />}
          {resist2 && <rect x="0" y="38" width="180" height="10" fill={C.resist} />}
          {resist2 && latent2 && <rect x={hole} y="38" width="12" height="10" fill={C.latent} />}
          {resist2 && phase === 'align' && !latent2 && <rect x={hole} y="38" width="12" height="34" fill="none" stroke={offset === 0 && dy === 0 ? '#34d399' : '#fbbf24'} strokeDasharray="2 2" />}
          {upper && [0, 1, 2].map(i => <rect key={i} x="0" y={28 - i * 9} width="180" height="7" fill={i % 2 ? C.metal : C.upper} opacity="0.85" />)}
          {missed && <text x={hole + 6} y="94" textAnchor="middle" fill="#fca5a5" fontSize="9">miss</text>}
        </svg>
        {(phase === 'align' || phase === 'exposing') && (
          <svg width="64" height="64" viewBox="-32 -32 64 64">
            <rect x="-20" y="-20" width="40" height="40" fill="none" stroke={C.film1} strokeWidth="4" />
            <rect x={-9 + dx * 5} y={-9 - dy * 5} width="18" height="18" fill="none" stroke={dx === 0 && dy === 0 ? '#34d399' : C.resist} strokeWidth="4" />
          </svg>
        )}
      </div>
      <div className="mt-1 flex gap-2 text-[8px] text-amber-100/70">
        <span style={{ color: C.film1 }}>■ layer 1</span><span style={{ color: C.film2 }}>■ layer 2</span><span style={{ color: C.resist }}>■ resist</span><span style={{ color: C.metal }}>■ contact</span>
      </div>
    </div>
  );
}

/** The probe result, die by die. Colors are the electronic map, not paint on the wafer. */
function MapInset({ map, revealed }: { map: WaferMap; revealed: number }) {
  const done = new Set(ACTIVE_DIES.slice(0, revealed).map(({ row, col }) => dieId(row, col)));
  return (
    <div className="pointer-events-none absolute right-3 top-3 rounded-lg border border-white/15 bg-[#14140f]/90 p-2 text-[9px] font-mono text-amber-100 shadow-lg" role="img" aria-label={`Wafer map ${map.waferId}`}>
      <div className="mb-1 tracking-widest">WAFER MAP · {map.waferId}</div>
      <div className="relative grid grid-cols-8 gap-[2px] rounded-full bg-white/5 p-2">
        {map.dies.map(die => {
          if (die.status === 'excluded') return <span key={die.id} className="h-3.5 w-3.5" />;
          const tested = done.has(die.id);
          return <span key={die.id} className={`flex h-3.5 w-3.5 items-center justify-center rounded-[2px] text-[8px] font-bold ${!tested ? 'bg-white/15' : die.status === 'pass' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>{tested ? (die.status === 'pass' ? '✓' : '✗') : ''}</span>;
        })}
        <span className="absolute -bottom-1 left-1/2 h-1.5 w-3 -translate-x-1/2 rounded-t-full bg-[#14140f]" />
      </div>
      <div className="mt-1 text-[8px] text-amber-100/70">✓ pass · ✗ fail · notch down</div>
    </div>
  );
}
