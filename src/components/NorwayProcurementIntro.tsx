import React, { useEffect, useRef, useState } from 'react';
import { ASSETS } from '../content/assets';

interface Props { onDone: () => void }

type SceneMode = 'arriving' | 'talking' | 'leaving';
const FLOOR_Y = 700;
const INTRO_LINE = "This time, the inputs aren't free. Find what the furnace needs, compare the suppliers, and make the cost work. Off you go - the supplier map is waiting.";

/** Short Loop 2 prologue: Sigurd sends the player from the Norway workshop into procurement. */
export function NorwayProcurementIntro({ onDone }: Props) {
  const [mode, setMode] = useState<SceneMode>('arriving');
  const [playerX, setPlayerX] = useState(1450);
  const [frame, setFrame] = useState(0);
  const playerXRef = useRef(1450);

  useEffect(() => {
    if (mode !== 'arriving' && mode !== 'leaving') return;
    const from = mode === 'arriving' ? 1450 : playerXRef.current;
    const to = mode === 'arriving' ? 990 : -180;
    const duration = mode === 'arriving' ? 1100 : 1300;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const x = from + (to - from) * t;
      playerXRef.current = x;
      setPlayerX(x);
      setFrame(Math.floor((now - start) / (1000 / ASSETS.playerWalk.framesPerSecond)) % ASSETS.playerWalk.frameCount);
      if (t < 1) raf = requestAnimationFrame(tick);
      else if (mode === 'arriving') setMode('talking');
      else onDone();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, onDone]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === ' ') && mode === 'talking') {
        event.preventDefault();
        setMode('leaving');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode]);

  const walking = mode !== 'talking';
  return (
    <main className="relative flex h-full w-full flex-col overflow-hidden bg-[#08121b] text-white" aria-label="Norway procurement introduction">
      <header className="z-10 flex shrink-0 items-center justify-between border-b-4 border-[#1a0b02] bg-[#101d27] px-4 py-3 shadow-lg">
        <div>
          <p className="font-pixel text-[9px] tracking-widest text-amber-300">LOOP 2 · PROCUREMENT</p>
          <h1 className="mt-2 font-pixel text-sm text-white sm:text-base">BACK TO NORWAY</h1>
        </div>
        <span className="rounded border border-white/15 bg-black/25 px-3 py-2 text-xs text-slate-300">A new run begins</span>
      </header>

      <section className="relative min-h-0 flex-1 bg-[#020409]">
        <svg viewBox="0 0 1376 768" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" role="img" aria-label="Pixel art view of the Norway smelter workshop">
          <image href={ASSETS.stages[1]} width="1376" height="768" preserveAspectRatio="none" style={{ imageRendering: 'pixelated' }} />
          <ellipse cx={playerX} cy={FLOOR_Y - 2} rx="42" ry="9" fill="#000" fillOpacity="0.55" />
          <g transform={`translate(760 ${FLOOR_Y})`} aria-label="Sigurd">
            <ellipse cx="0" cy="-2" rx="38" ry="8" fill="#000" fillOpacity="0.5" />
            <svg x={-ASSETS.norwayGuide.anchorX * 3} y={-ASSETS.norwayGuide.anchorY * 3} width={ASSETS.norwayGuide.frameWidth * 3} height={ASSETS.norwayGuide.frameHeight * 3} viewBox="0 0 64 72" overflow="hidden">
              <image href={ASSETS.norwayGuide.image} width="64" height="72" style={{ imageRendering: 'pixelated' }} />
            </svg>
            <text x="0" y={-ASSETS.norwayGuide.characterHeight * 3 - 16} textAnchor="middle" fill="white" stroke="#09111f" strokeWidth="5" paintOrder="stroke" fontSize="20" fontWeight="bold">SIGURD</text>
          </g>
          <g transform={`translate(${playerX} ${FLOOR_Y}) scale(-1 1)`} aria-label="Player">
            <ellipse cx="0" cy="-2" rx="38" ry="8" fill="#000" fillOpacity="0.5" />
            <svg x={-ASSETS.playerWalk.anchorX * 3} y={-ASSETS.playerWalk.anchorY * 3} width={ASSETS.playerWalk.frameWidth * 3} height={ASSETS.playerWalk.frameHeight * 3} viewBox={`${frame * ASSETS.playerWalk.frameWidth} 0 ${ASSETS.playerWalk.frameWidth} ${ASSETS.playerWalk.frameHeight}`} overflow="hidden">
              <image href={ASSETS.playerWalk.image} width={ASSETS.playerWalk.frameWidth * ASSETS.playerWalk.frameCount} height={ASSETS.playerWalk.frameHeight} style={{ imageRendering: 'pixelated' }} />
            </svg>
          </g>
        </svg>

        {mode !== 'arriving' && mode !== 'leaving' && (
          <div className="absolute inset-x-4 top-5 mx-auto max-w-3xl" aria-live="polite">
            <div className="ml-5 inline-block rounded-t border-2 border-white bg-[#bf6b2d] px-3 py-1 text-xs font-black tracking-widest">SIGURD · FURNACE OPERATOR</div>
            <div className="rounded-lg border-4 border-white bg-[#0b1238]/95 p-1 shadow-[6px_6px_0_#000]">
              <p className="rounded border-2 border-[#5b74d6] px-5 py-4 text-base leading-relaxed text-white sm:text-lg">{INTRO_LINE}</p>
              <div className="flex justify-end px-3 py-2">
                <button autoFocus onClick={() => setMode('leaving')} className="rounded-md border-2 border-[#1a0b02] bg-amber-300 px-5 py-2.5 font-bold text-[#1a0b02] shadow-[3px_3px_0_#1a0b02] hover:bg-amber-200 focus-visible:outline-4 focus-visible:outline-white">
                  Leave for the supplier map →
                </button>
              </div>
            </div>
          </div>
        )}
        {mode === 'leaving' && <div className="pointer-events-none absolute inset-0 bg-black/20 transition-opacity" aria-hidden="true" />}
        {walking && <span className="sr-only">The player is walking through the workshop.</span>}
      </section>
      <footer className="flex shrink-0 items-center justify-center border-t-4 border-[#1a0b02] bg-[#101d27] px-4 py-2 text-center text-xs text-slate-300">
        {mode === 'talking' ? 'Press Enter or Space, or choose the button, to leave.' : mode === 'leaving' ? 'Heading out to the supplier map…' : 'Walking into the workshop…'}
      </footer>
    </main>
  );
}
