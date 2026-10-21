import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { sound } from '../services/audio';
import { RouteStop } from '../types/route';
import { ArrivalItem, PLAYER_NAME, StageIntroScript } from '../content/dialogues';
import { ASSETS } from '../content/assets';

interface StageIntroProps {
  stop: RouteStop;
  lotId: string;
  backdrop: string;
  script: StageIntroScript;
  onDone: () => void;
  onReturnToMap: () => void;
}

// Scene geometry in backdrop pixels (1376x768).
const FRAME_MS = 1000 / ASSETS.playerWalk.framesPerSecond;
const BODY_W = 64;
const BODY_H = 150;
const MIN_X = 60;
const MAX_X = 1320;
const WALK_MS = 1800;
const SPEED = 420; // backdrop px per second
const REACH = 80;
const TYPE_MS = 28;

type Mode = 'arrive' | 'talk' | 'explore';

export const StageIntro: React.FC<StageIntroProps> = ({ stop, lotId, backdrop, script, onDone, onReturnToMap }) => {
  const { feetY } = script;
  const startX = script.enterFrom === 'right' ? 1420 : -60;
  const [mode, setMode] = useState<Mode>('arrive');
  const [playerX, setPlayerX] = useState(startX);
  const [facing, setFacing] = useState<1 | -1>(script.enterFrom === 'right' ? -1 : 1);
  const [step, setStep] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [shown, setShown] = useState(0);
  const [collected, setCollected] = useState<string[]>([]);

  const xRef = useRef(startX);
  const keys = useRef({ left: false, right: false });
  const target = useRef<{ x: number; itemId?: string } | null>(null);

  const line = script.lines[lineIdx];
  const lineDone = shown >= line.text.length;
  const isLastLine = lineIdx === script.lines.length - 1;
  const allCollected = collected.length === script.items.length;

  // Items join the panel as the guide mentions them; all are known once the talk is over
  const revealedIds =
    mode === 'explore'
      ? script.items.map((item) => item.id)
      : mode === 'talk'
        ? script.lines.slice(0, lineIdx + 1).flatMap((l) => (l.reveal ? [l.reveal] : []))
        : [];
  const revealed = script.items.filter((item) => revealedIds.includes(item.id));
  const onFloor = revealed.filter((item) => !collected.includes(item.id));
  const nearby = mode === 'explore' ? onFloor.find((item) => Math.abs(item.x - playerX) < REACH) : undefined;

  const movePlayer = (x: number) => {
    xRef.current = x;
    setPlayerX(x);
  };

  const collect = useCallback((item: ArrivalItem) => {
    sound.playClink();
    setCollected((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
  }, []);

  // Player walks in from the side of the scene
  useEffect(() => {
    if (mode !== 'arrive') return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / WALK_MS);
      movePlayer(startX + (script.playerEndX - startX) * t);
      setStep(Math.floor((now - start) / FRAME_MS) % ASSETS.playerWalk.frameCount);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setMode('talk');
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, startX, script.playerEndX]);

  // Typewriter reveal of the current line
  useEffect(() => {
    if (mode !== 'talk' || lineDone) return;
    const id = setTimeout(() => setShown((n) => n + 1), TYPE_MS);
    return () => clearTimeout(id);
  }, [mode, shown, lineDone]);

  // Free walking: held arrow keys, or a clicked spot on the floor
  useEffect(() => {
    if (mode !== 'explore') return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let dir = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
      if (dir !== 0) {
        target.current = null;
      } else if (target.current) {
        const dx = target.current.x - xRef.current;
        if (Math.abs(dx) < 8) {
          const item = script.items.find((i) => i.id === target.current?.itemId);
          target.current = null;
          if (item) collect(item);
        } else {
          dir = Math.sign(dx);
        }
      }
      if (dir !== 0) {
        movePlayer(Math.max(MIN_X, Math.min(MAX_X, xRef.current + dir * SPEED * dt)));
        setFacing(dir > 0 ? 1 : -1);
        setStep(Math.floor(now / FRAME_MS) % ASSETS.playerWalk.frameCount);
      } else {
        setStep(0);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, script.items, collect]);

  // Click / Enter / Space during the arrival and talk: skip the walk, finish the line, or go on
  const advance = useCallback(() => {
    if (mode === 'arrive') {
      movePlayer(script.playerEndX);
      setMode('talk');
      return;
    }
    if (mode !== 'talk') return;
    if (!lineDone) {
      setShown(line.text.length);
      return;
    }
    sound.playSelect();
    if (isLastLine) {
      setMode('explore');
    } else {
      setLineIdx((i) => i + 1);
      setShown(0);
    }
  }, [mode, lineDone, isLastLine, line.text.length]);

  const finish = useCallback(() => {
    sound.playSelect();
    onDone();
  }, [onDone]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keys.current.left = true;
      if (e.key === 'ArrowRight') keys.current.right = true;
      if (e.key.startsWith('Arrow')) e.preventDefault();
      if (e.key !== 'Enter' && e.key !== ' ' && e.key.toLowerCase() !== 'e') return;
      e.preventDefault();
      if (mode !== 'explore') advance();
      else if (nearby) collect(nearby);
      else if (allCollected && e.key === 'Enter') finish();
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') keys.current.left = false;
      if (e.key === 'ArrowRight') keys.current.right = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, [mode, advance, nearby, collect, allCollected, finish]);

  const walkTo = (x: number, itemId?: string) => {
    if (mode !== 'explore') return;
    target.current = { x: Math.max(MIN_X, Math.min(MAX_X, x)), itemId };
  };

  const onSceneClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== 'explore') {
      advance();
      return;
    }
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) walkTo(pt.matrixTransform(ctm.inverse()).x);
  };

  const speaking = mode === 'talk' ? line.speaker : null;
  const bubble =
    mode === 'talk'
      ? { name: line.speaker === 'guide' ? script.guideName : PLAYER_NAME, speaker: line.speaker, text: line.text.slice(0, shown) }
      : mode === 'explore' && allCollected
        ? { name: script.guideName, speaker: 'guide' as const, text: script.readyLine }
        : null;

  return (
    <div className="flex flex-col h-full bg-[#0c1821] text-slate-100 select-none overflow-hidden font-sans">
      <div className="flex shrink-0 items-center gap-4 border-b-4 border-[#1a0b02] bg-[#101d27] px-4 py-3">
        <button
          onClick={() => {
            sound.playSelect();
            onReturnToMap();
          }}
          className="map-chip map-chip--dark font-pixel px-3 py-2 text-[9px] text-white cursor-pointer"
        >
          ◀ MAP
        </button>
        <div className="min-w-0">
          <h1 className="font-pixel text-sm text-[#fcd34d] sm:text-base">{stop.country.replace(/\./g, '')}</h1>
          <p className="mt-1 truncate text-xs text-slate-300">{stop.pitch}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left: the stage illustration, shown whole */}
        <div className="flex-1 relative h-64 md:h-full bg-[#020409] font-mono">
          <svg
            viewBox="0 0 1376 768"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 w-full h-full block cursor-pointer"
            onClick={onSceneClick}
          >
            <image href={backdrop} width="1376" height="768" preserveAspectRatio="none" style={{ imageRendering: 'pixelated' }} />

            {/* Placeholder material piles */}
            {onFloor.map((item) => (
              <g
                key={item.id}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  if (nearby?.id === item.id) collect(item);
                  else walkTo(item.x, item.id);
                }}
              >
                <ellipse cx={item.x} cy={feetY - 2} rx="54" ry="10" fill="#000" fillOpacity="0.45" />
                {[-30, -6, 18, -16, 6].map((dx, i) => (
                  <rect
                    key={i}
                    x={item.x + dx - 12}
                    y={feetY - 26 - (i > 2 ? 18 : 0)}
                    width="24"
                    height="22"
                    fill={item.color}
                    stroke="#fff"
                    strokeOpacity="0.6"
                    strokeWidth="2"
                    style={{ filter: 'drop-shadow(0 0 2px #000)' }}
                    transform={`rotate(${(i * 23) % 40 - 20} ${item.x + dx} ${feetY - 15})`}
                  />
                ))}
                <text x={item.x} y={feetY + 32} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#fff" stroke="#000" strokeWidth="4" paintOrder="stroke">
                  {item.name.toUpperCase()}
                </text>
                {nearby?.id === item.id && (
                  <text x={item.x} y={feetY - 70} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#fbbf24" stroke="#000" strokeWidth="4" paintOrder="stroke">
                    SPACE · PICK UP
                  </text>
                )}
              </g>
            ))}

            <SceneCharacter
              x={script.guideX}
              feetY={feetY}
              label={script.guideName}
              sprite={stop.id === 1 ? ASSETS.norwayGuide : undefined}
              color="#c9772f"
              facing={playerX < script.guideX ? -1 : 1}
              talking={speaking === 'guide'}
            />
            <SceneCharacter
              x={playerX}
              feetY={feetY}
              label={PLAYER_NAME}
              sprite={ASSETS.playerWalk}
              color="#2f6fd6"
              facing={facing}
              talking={speaking === 'player'}
              bob={step}
            />
          </svg>

          {/* Dialogue box over the ceiling so the floor stays visible */}
          {bubble && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[min(760px,calc(100%-2rem))] pointer-events-none">
              <div
                className={`inline-block mb-[-2px] ml-4 px-3 py-1 text-xs font-black tracking-widest border-2 border-white rounded-t text-white ${
                  bubble.speaker === 'guide' ? 'bg-[#c9772f]' : 'bg-[#2f6fd6]'
                }`}
              >
                {bubble.name}
              </div>
              <div className="relative p-1 bg-[#0b1238] border-2 border-white rounded-md shadow-[4px_4px_0_#000]">
                <div className="min-h-[4.5rem] px-4 py-3 border-2 border-[#5b74d6] rounded text-white text-sm md:text-base leading-relaxed drop-shadow-[2px_2px_0_#000]">
                  {bubble.text}
                </div>
                {mode === 'talk' && lineDone && (
                  <span className="absolute bottom-2 right-4 text-[#fbbf24] text-sm animate-bounce">▼</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: what to collect, filled as the guide talks and as you gather */}
        <div className="flex w-full flex-col justify-between gap-4 overflow-y-auto border-t-4 border-[#1a0b02] bg-[#101d27] p-5 md:w-80 md:border-l-4 md:border-t-0">
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="font-pixel text-[10px] tracking-widest text-[#fb923c]">COLLECT</span>
              <span className="font-pixel text-xs text-[#fcd34d]">{collected.length} / {script.items.length}</span>
            </div>

            <ul className="space-y-2">
              {revealed.map((item) => {
                const have = collected.includes(item.id);
                return (
                  <li
                    key={item.id}
                    className={`flex items-center gap-3 border-2 p-2.5 animate-[fadeIn_0.4s_ease-out] ${
                      have ? 'border-emerald-400/70 bg-emerald-400/10' : 'border-white/15 bg-black/20'
                    }`}
                  >
                    <span
                      className={`h-9 w-9 shrink-0 border-2 ${have ? 'border-emerald-300' : 'border-[#1a0b02]'}`}
                      style={{ background: item.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold">{item.name}</div>
                      <div className="text-xs leading-snug text-slate-400">{item.note}</div>
                    </div>
                    {have && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />}
                  </li>
                );
              })}
              {Array.from({ length: script.items.length - revealed.length }, (_, i) => (
                <li key={`empty-${i}`} className="flex h-[60px] items-center justify-center border-2 border-dashed border-white/15 font-pixel text-xs text-white/30">?</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-center font-pixel text-[8px] leading-relaxed text-slate-400">
              {mode === 'explore' ? '← → WALK · SPACE PICK UP' : 'CLICK OR SPACE TO CONTINUE'}
            </p>
            <button
              onClick={finish}
              disabled={!allCollected}
              className={`title-button font-pixel flex w-full items-center justify-center gap-2 px-4 py-3 text-[10px] ${allCollected ? 'title-button--active' : 'title-button--idle opacity-60 cursor-default'}`}
            >
              ENTER WORKSHOP
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Stand-in figure until real character art arrives */
function SceneCharacter(props: Parameters<typeof PlaceholderCharacter>[0] & {
  sprite?: {
    image: string; frameWidth: number; frameHeight: number; frameCount: number;
    anchorX: number; anchorY: number; characterHeight: number;
  };
}) {
  const [failed, setFailed] = useState(false);
  const { sprite, x, feetY, label, facing, talking, bob = 0 } = props;
  if (!sprite || failed) return <PlaceholderCharacter {...props} />;
  const scale = 3;
  const frame = bob % sprite.frameCount;
  return (
    <g pointerEvents="none" aria-label={label}>
      <ellipse cx={x} cy={feetY - 2} rx="40" ry="9" fill="#000" fillOpacity="0.45" />
      <g transform={`translate(${x} ${feetY})`}>
        <g className={talking ? 'sprite-talk' : undefined}>
          <g transform={`scale(${facing} 1)`}>
            <svg
              x={-sprite.anchorX * scale} y={-sprite.anchorY * scale}
              width={sprite.frameWidth * scale} height={sprite.frameHeight * scale}
              viewBox={`${frame * sprite.frameWidth} 0 ${sprite.frameWidth} ${sprite.frameHeight}`}
              overflow="hidden"
            >
              <image href={sprite.image} width={sprite.frameWidth * sprite.frameCount} height={sprite.frameHeight}
                style={{ imageRendering: 'pixelated' }} onError={() => setFailed(true)} />
            </svg>
          </g>
        </g>
      </g>
      <text x={x} y={feetY - sprite.characterHeight * scale - 16} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#fff" stroke="#000" strokeWidth="4" paintOrder="stroke">{label}</text>
    </g>
  );
}

function PlaceholderCharacter({
  x,
  feetY,
  label,
  color,
  facing,
  talking,
  bob = 0
}: {
  x: number;
  feetY: number;
  label: string;
  color: string;
  facing: 1 | -1;
  talking: boolean;
  bob?: number;
}) {
  const top = feetY - BODY_H - bob * 4;
  return (
    <g className={talking ? 'sprite-talk' : 'sprite-idle'} pointerEvents="none">
      <ellipse cx={x} cy={feetY - 2} rx="44" ry="9" fill="#000" fillOpacity="0.45" />
      <rect x={x - BODY_W / 2} y={top + 46} width={BODY_W} height={BODY_H - 46} rx="12" fill={color} stroke="#fff" strokeWidth="3" strokeDasharray="8 6" />
      <circle cx={x} cy={top + 24} r="24" fill={color} stroke="#fff" strokeWidth="3" strokeDasharray="8 6" />
      <circle cx={x + facing * 10} cy={top + 20} r="4" fill="#fff" />
      <text x={x} y={top - 12} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#fff" stroke="#000" strokeWidth="4" paintOrder="stroke">
        {label}
      </text>
    </g>
  );
}
