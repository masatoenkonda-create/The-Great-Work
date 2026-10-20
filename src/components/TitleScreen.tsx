import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../services/audio';
import { ASSETS } from '../content/assets';
import { ScreenControls } from './ScreenControls';

interface TitleScreenProps {
  hasSaveData: boolean;
  onNewGame: () => void;
  onContinue: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  hasSaveData,
  onNewGame,
  onContinue,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen
}) => {
  const [selectedMenuItem, setSelectedMenuItem] = useState<'continue' | 'new'>(
    hasSaveData ? 'continue' : 'new'
  );

  // Handle keyboard navigation: Up/Down arrow, Enter, Space, M
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' ||
        e.key === 'ArrowDown' || e.key === 's' || e.key === 'S'
      ) {
        e.preventDefault();
        if (!hasSaveData) return;
        sound.playClick();
        setSelectedMenuItem((prev) => (prev === 'continue' ? 'new' : 'continue'));
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
    <div className="relative w-full h-full font-mono select-none overflow-hidden text-white bg-[#020409]">
      {/* Approved Corridor Artwork (1376x768 JPEG), scaled to cover the whole screen */}
      <img
        src={ASSETS.titleBackground}
        alt=""
        className="absolute inset-0 w-full h-full object-cover pixelated"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Quiet upper area scrim for clean readability per GUIDELINES §Current implementation */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030612]/92 via-[#030612]/55 to-transparent pointer-events-none" />

      <div className="absolute top-4 right-4 z-20">
        <ScreenControls
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />
      </div>

      {/* Title & Menu */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pb-[12vh]">
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
        </div>
      </div>
    </div>
  );
};
