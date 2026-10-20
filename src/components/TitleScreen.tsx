import React, { useEffect } from 'react';
import { sound } from '../services/audio';
import { Play, Map, BookOpen, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  onOpenMap: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenMap,
  isMuted,
  onToggleMute
}) => {
  // Listen for Space / Enter to start game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        sound.playClick();
        sound.startCozyAmbience();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 sm:p-12 pointer-events-none select-none">
      {/* Top Left Badge Lockup */}
      <div className="pointer-events-auto flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold shadow-md shadow-red-600/30">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="9" width="6" height="6" />
              <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-stone-600">
              Kyushu Silicon Craft · 日本半導体サプライチェーン
            </div>
            <div className="text-xs text-stone-500 font-mono">
              JASM Fab 2 Kumamoto · 3nm Target 2028
            </div>
          </div>
        </div>

        {/* Audio Mute & Info */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onToggleMute();
              sound.playClick();
            }}
            className="p-2.5 bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 rounded-xl border border-stone-200 shadow-sm transition-all cursor-pointer pointer-events-auto"
            title={isMuted ? 'Unmute cozy ambience' : 'Mute audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Main Center-Left Bespoke Title Lockup (over generous negative space) */}
      <div className="max-w-xl pointer-events-auto my-auto space-y-4">
        {/* Japanese Stamp Seal & Supertitle */}
        <div className="flex items-center gap-2.5">
          <div className="px-2 py-0.5 bg-red-600 text-white text-[11px] font-bold rounded tracking-wider uppercase">
            JAPAN&apos;S SUPPLY CHAIN
          </div>
          <span className="text-xs font-serif text-stone-600">
            End-to-End Semiconductor Journey
          </span>
        </div>

        {/* Bespoke inline SVG / typography lockup */}
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-6xl font-serif font-black text-stone-900 tracking-tight leading-none">
            KYUSHU<br />
            <span className="text-red-700">SILICON CRAFT</span>
          </h1>
          <p className="text-sm sm:text-base text-stone-700 font-medium leading-relaxed pt-2">
            Build an advanced microchip from molten quartz and silicon ingots to 3nm EUV photolithography, ABF packaging, and autonomous vehicle systems.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          <button
            onClick={() => {
              sound.playClick();
              sound.startCozyAmbience();
              onStart();
            }}
            className="flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Enter the Cleanroom</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenMap();
            }}
            className="flex items-center gap-2 px-5 py-3.5 bg-white/90 hover:bg-white text-stone-800 font-semibold text-sm rounded-xl border border-stone-300 shadow-sm transition-all cursor-pointer hover:border-amber-400"
          >
            <Map className="w-4 h-4 text-red-600" />
            <span>Explore Supply Chain Map</span>
          </button>
        </div>

        {/* Flat control hint line */}
        <div className="pt-2 text-xs text-stone-500 font-mono tracking-wide">
          <span>Press </span>
          <kbd className="px-1.5 py-0.5 bg-white border border-stone-300 rounded text-[11px] text-stone-800 shadow-xs">
            Space
          </kbd>
          <span> or </span>
          <kbd className="px-1.5 py-0.5 bg-white border border-stone-300 rounded text-[11px] text-stone-800 shadow-xs">
            Enter
          </kbd>
          <span> to Start · Drag mouse to Orbit · Click stations to inspect</span>
        </div>
      </div>

      {/* Bottom 5 Stages Ribbon Bar */}
      <div className="pointer-events-auto bg-white/90 backdrop-blur-xs rounded-2xl border border-stone-200/90 p-3 shadow-md max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/60">
            <span className="font-mono text-[10px] text-red-600 font-bold block">01</span>
            <strong className="text-stone-900 block text-[11px]">Wafers & Chemistry</strong>
            <span className="text-[10px] text-stone-500 hidden sm:inline">SUMCO · JSR · Shin-Etsu</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/60">
            <span className="font-mono text-[10px] text-red-600 font-bold block">02</span>
            <strong className="text-stone-900 block text-[11px]">Front-End Fab</strong>
            <span className="text-[10px] text-stone-500 hidden sm:inline">TEL · SCREEN · ASML</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/60">
            <span className="font-mono text-[10px] text-red-600 font-bold block">03</span>
            <strong className="text-stone-900 block text-[11px]">Probe & Die Prep</strong>
            <span className="text-[10px] text-stone-500 hidden sm:inline">Advantest · DISCO</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/60">
            <span className="font-mono text-[10px] text-red-600 font-bold block">04</span>
            <strong className="text-stone-900 block text-[11px]">Package & Assemble</strong>
            <span className="text-[10px] text-stone-500 hidden sm:inline">Ajinomoto · IBIDEN</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200/60">
            <span className="font-mono text-[10px] text-red-600 font-bold block">05</span>
            <strong className="text-stone-900 block text-[11px]">Final Test ➔ Systems</strong>
            <span className="text-[10px] text-stone-500 hidden sm:inline">Servers · Phones · Vehicles</span>
          </div>
        </div>
      </div>
    </div>
  );
};
