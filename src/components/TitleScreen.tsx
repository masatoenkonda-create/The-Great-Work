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

  const startNew = () => {
    sound.playConfirm();
    sound.startCozyAmbience();
    onNewGame();
  };
  const resume = () => {
    sound.playConfirm();
    sound.startCozyAmbience();
    onContinue();
  };
  const menu = [
    ...(hasSaveData ? [{ id: 'continue' as const, label: 'Continue', hint: 'Resume your route', onClick: resume }] : []),
    { id: 'new' as const, label: hasSaveData ? 'New game' : 'Start', hint: hasSaveData ? 'Restart from Norway' : 'Norway awaits', onClick: startNew },
  ];

  return (
    <div className="relative w-full h-full select-none overflow-hidden text-white bg-[#020409]">
      {/* Approved corridor artwork (1376x768), shown unfiltered */}
      <img
        src={ASSETS.titleBackground}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ imageRendering: 'pixelated' }}
      />

      <div className="absolute top-4 right-4 z-20">
        <ScreenControls
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center px-4 pt-[9vh] text-center">
        {/* Logo: pixel outline instead of a dark overlay, so the art stays visible */}
        <h1 className="title-logo font-pixel leading-[1.15] text-[#fcd34d]">
          <span className="block text-[clamp(1.6rem,5.2vw,3.6rem)]">SUPPLY CHAIN</span>
          <span className="block text-[clamp(2.2rem,7.4vw,5.2rem)] text-[#fb923c]">GANG</span>
        </h1>
        <p className="title-tagline font-pixel mt-4 text-[clamp(0.5rem,1.15vw,0.8rem)] leading-relaxed text-[#e0f2fe]">
          One chip. Seven countries. Zero shortcuts.
        </p>

        <nav className="mt-[6vh] flex w-[min(20rem,90vw)] flex-col gap-4" aria-label="Main menu">
          {menu.map((item) => {
            const active = selectedMenuItem === item.id;
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                onMouseEnter={() => setSelectedMenuItem(item.id)}
                onFocus={() => setSelectedMenuItem(item.id)}
                className={`title-button group relative font-pixel flex flex-col items-center gap-1.5 px-5 py-4 transition-transform ${
                  active ? 'title-button--active -translate-y-0.5' : 'title-button--idle'
                }`}
              >
                <span className="flex items-center gap-3 text-[clamp(0.8rem,1.6vw,1.05rem)] tracking-wider">
                  <span aria-hidden="true" className={active ? 'title-cursor' : 'invisible'}>▶</span>
                  {item.label.toUpperCase()}
                  <span aria-hidden="true" className={active ? 'title-cursor title-cursor--right' : 'invisible'}>◀</span>
                </span>
                <span className="text-[0.5rem] tracking-wide opacity-75">{item.hint}</span>
              </button>
            );
          })}
        </nav>

        <p className="title-blink font-pixel mt-auto mb-[5vh] text-[0.55rem] tracking-widest text-white">
          PRESS ENTER
        </p>
      </div>
    </div>
  );
};
