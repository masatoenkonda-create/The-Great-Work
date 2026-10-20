import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { ASSETS } from '../content/assets';

interface TitleScreenProps {
  hasSaveData: boolean;
  onNewGame: () => void;
  onContinue: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasSaveData,
  onNewGame,
  onContinue,
  isMuted,
  onToggleMute
}) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState<'continue' | 'new' | 'sound'>(
    hasSaveData ? 'continue' : 'new'
  );

  // Handle keyboard navigation: Up/Down arrow, Enter, Space, M
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        sound.playClick();
        setSelectedMenuItem((prev) => {
          if (prev === 'sound') return 'new';
          if (prev === 'new') return hasSaveData ? 'continue' : 'sound';
          return 'sound';
        });
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        sound.playClick();
        setSelectedMenuItem((prev) => {
          if (prev === 'continue') return 'new';
          if (prev === 'new') return 'sound';
          return hasSaveData ? 'continue' : 'new';
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (selectedMenuItem === 'continue' && hasSaveData) {
          sound.playConfirm();
          sound.startCozyAmbience();
          onContinue();
        } else if (selectedMenuItem === 'new') {
          sound.playConfirm();
          sound.startCozyAmbience();
          onNewGame();
        } else if (selectedMenuItem === 'sound') {
          sound.playClick();
          onToggleMute();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        onToggleMute();
      }
    },
    [hasSaveData, selectedMenuItem, onContinue, onNewGame, onToggleMute]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[#020409] font-mono select-none overflow-hidden text-white">
      {/* 1376x768 Aspect Ratio Canvas Wrapper to preserve exact artwork geometry */}
      <div className="relative aspect-[1376/768] w-full max-h-full max-w-full shadow-2xl overflow-hidden flex flex-col justify-between">
        {/* Approved Corridor Artwork (1376x768 JPEG) */}
        <img
          src={ASSETS.titleBackground}
          alt="Title corridor background"
          className="absolute inset-0 w-full h-full object-cover pixelated"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Quiet upper area scrim for clean readability per GUIDELINES §Current implementation */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030612]/92 via-[#030612]/55 to-transparent pointer-events-none" />

        {/* Top Header / Studio Brand */}
        <header className="relative z-10 w-full px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#dc2626] border-2 border-white text-white font-black text-[11px] uppercase tracking-widest shadow-[2px_2px_0_#000]">
              16-BIT ARCADE
            </span>
            <span className="text-xs text-[#93c5fd] font-bold tracking-wider drop-shadow-[1px_1px_0_#000]">
              SEMICONDUCTOR SUPPLY CHAIN
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onToggleMute();
            }}
            className="px-3 py-1.5 bg-[#141b2d]/90 hover:bg-[#1e293b] text-[#facc15] border-2 border-[#facc15] text-xs font-bold shadow-[2px_2px_0_#000] cursor-pointer transition-colors"
            title="Toggle sound (M)"
          >
            {isMuted ? 'SOUND: OFF [M]' : 'SOUND: ON [M]'}
          </button>
        </header>

        {/* Quiet Upper Area Content: Title & Menu */}
        <div className="relative z-10 flex flex-col items-center text-center mt-2 px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-widest text-[#fbbf24] uppercase drop-shadow-[4px_4px_0_#000] stroke-black">
            THE GREAT WORK
          </h1>
          <p className="mt-2 text-xs md:text-sm text-[#bae6fd] tracking-wide font-medium drop-shadow-[2px_2px_0_#000] max-w-xl">
            From Raw Quartz in Norway to Pocket Smartphone in America
          </p>

          {/* New Game / Continue Menu */}
          <div className="mt-8 flex flex-col items-stretch gap-2.5 w-64 max-w-full">
            {hasSaveData && (
              <button
                onClick={() => {
                  sound.playConfirm();
                  sound.startCozyAmbience();
                  onContinue();
                }}
                onMouseEnter={() => setSelectedMenuItem('continue')}
                className={`flex items-center justify-between px-4 py-2.5 border-2 text-sm font-bold tracking-wider uppercase transition-all shadow-[3px_3px_0_#000] cursor-pointer ${
                  selectedMenuItem === 'continue'
                    ? 'bg-[#10b981] border-white text-white translate-x-1 scale-[1.02]'
                    : 'bg-[#0f172a]/90 border-[#38bdf8] text-[#93c5fd] hover:border-white'
                }`}
              >
                <span>{selectedMenuItem === 'continue' ? '▶ CONTINUE' : '  CONTINUE'}</span>
                <span className="text-xs opacity-80">RESUME</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playConfirm();
                sound.startCozyAmbience();
                onNewGame();
              }}
              onMouseEnter={() => setSelectedMenuItem('new')}
              className={`flex items-center justify-between px-4 py-2.5 border-2 text-sm font-bold tracking-wider uppercase transition-all shadow-[3px_3px_0_#000] cursor-pointer ${
                selectedMenuItem === 'new'
                  ? 'bg-[#fbbf24] border-white text-stone-950 translate-x-1 scale-[1.02]'
                  : 'bg-[#0f172a]/90 border-[#38bdf8] text-[#93c5fd] hover:border-white'
              }`}
            >
              <span>{selectedMenuItem === 'new' ? '▶ NEW GAME' : '  NEW GAME'}</span>
              <span className="text-xs opacity-80">{hasSaveData ? 'RESET' : 'START'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onToggleMute();
              }}
              onMouseEnter={() => setSelectedMenuItem('sound')}
              className={`flex items-center justify-between px-4 py-2 border-2 text-xs font-bold tracking-wider uppercase transition-all shadow-[2px_2px_0_#000] cursor-pointer ${
                selectedMenuItem === 'sound'
                  ? 'bg-[#3b82f6] border-white text-white translate-x-1'
                  : 'bg-[#0f172a]/80 border-stone-600 text-stone-300 hover:border-stone-400'
              }`}
            >
              <span>{selectedMenuItem === 'sound' ? '▶ AUDIO' : '  AUDIO'}</span>
              <span>{isMuted ? 'MUTED' : 'ENABLED'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Status / Instructions Ticker */}
        <footer className="relative z-10 w-full px-8 py-3 bg-[#030612]/90 border-t border-[#1e293b] flex items-center justify-between text-[11px] text-[#94a3b8]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span>FABRICATOR TERMINAL READY</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-stone-400 font-mono">
            <span>↑ / ↓ SELECT</span>
            <span>ENTER / SPACE CONFIRM</span>
            <span>CLICK DIRECTLY</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
