import React, { useState } from 'react';
import { StageId, ChipSpec, STAGES } from '../types/game';
import { sound } from '../services/audio';
import {
  ChevronDown,
  ChevronUp,
  Camera,
  Map,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';

interface HUDProps {
  currentStage: StageId;
  chipSpec: ChipSpec;
  viewMode: 'iso' | 'focus_station' | 'macro_chip';
  onChangeViewMode: (mode: 'iso' | 'focus_station' | 'macro_chip') => void;
  onSelectStage: (stage: StageId) => void;
  onOpenMap: () => void;
  onReset: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  currentStage,
  chipSpec,
  viewMode,
  onChangeViewMode,
  onSelectStage,
  onOpenMap,
  onReset,
  isMuted,
  onToggleMute
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Left: Cleanroom Status Cluster & Spec Readout */}
      <div className="flex items-start justify-between w-full pointer-events-auto">
        <div className="bg-white/95 border border-stone-200/90 rounded-2xl shadow-sm p-3.5 space-y-1.5 max-w-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
              JASM FAB 2 · KUMAMOTO CLEANROOM
            </span>
          </div>

          <div className="text-sm font-bold text-stone-900 tracking-tight flex items-baseline gap-2">
            <span>3nm Node Logic</span>
            <span className="text-xs text-stone-500 font-mono font-normal">
              Yield: <strong className="text-emerald-600 font-bold tabular-nums">{chipSpec.yieldRate}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] font-mono text-stone-600 pt-1 border-t border-stone-100">
            <div>
              Purity: <strong className="text-stone-900">11N (99.9999999%)</strong>
            </div>
            <div>
              Tested Good: <strong className="text-emerald-700 tabular-nums">{chipSpec.testedGoodDies || 21} dies</strong>
            </div>
            <div>
              Packaged: <strong className="text-indigo-700 tabular-nums">{chipSpec.packagedUnits} units</strong>
            </div>
            <div>
              Shipped: <strong className="text-red-700 tabular-nums">
                {(chipSpec.finalBinnedCount?.servers || 0) + (chipSpec.finalBinnedCount?.phones || 0) + (chipSpec.finalBinnedCount?.vehicles || 0)}
              </strong>
            </div>
          </div>
        </div>

        {/* Top Right Quick Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onOpenMap();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/95 hover:bg-white text-stone-800 rounded-xl border border-stone-200 shadow-sm text-xs font-semibold transition cursor-pointer hover:border-amber-400"
          >
            <Map className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">Supply Chain Map</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onToggleMute();
            }}
            className="p-2 bg-white/95 hover:bg-white text-stone-700 rounded-xl border border-stone-200 shadow-sm transition cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onReset();
            }}
            className="p-2 bg-white/95 hover:bg-white text-stone-700 rounded-xl border border-stone-200 shadow-sm transition cursor-pointer"
            title="Reset Wafer Production"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Unified Bottom Control Dock with Collapsible Drawer (Zero Viewport Occlusion) */}
      <div className="pointer-events-auto mx-auto max-w-4xl w-full flex flex-col items-center">
        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={() => {
            sound.playClick();
            setIsCollapsed(!isCollapsed);
          }}
          className="flex items-center gap-1 px-3 py-1 bg-white/95 hover:bg-white border border-stone-200 border-b-0 rounded-t-xl text-stone-600 hover:text-stone-900 text-[11px] font-medium shadow-xs transition cursor-pointer mb-[-1px] z-10"
        >
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{isCollapsed ? 'Show Process Dock' : 'Hide Process Dock (Zen Mode)'}</span>
        </button>

        {/* Main Dock Container */}
        <div
          className={`w-full bg-[#fdfbf7]/95 border border-stone-200/90 rounded-2xl shadow-xl p-3 transition-all duration-300 ${
            isCollapsed ? 'translate-y-full opacity-0 pointer-events-none h-0 p-0 overflow-hidden border-0' : 'translate-y-0 opacity-100'
          }`}
        >
          {/* Top Bar: 5-Stage Stepper Selector */}
          <div className="grid grid-cols-5 gap-1.5 pb-2.5 mb-2.5 border-b border-stone-200">
            {STAGES.map((s, idx) => {
              const isActive = currentStage === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectStage(s.id);
                  }}
                  className={`p-2 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'hover:bg-amber-100/60 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={isActive ? 'text-red-400 font-bold' : 'text-red-600 font-bold'}>
                      {s.stepNumber}
                    </span>
                    <span className={isActive ? 'text-stone-300' : 'text-stone-400'}>
                      Stage {idx + 1}
                    </span>
                  </div>
                  <div className="font-bold text-xs truncate mt-0.5">
                    {s.title}
                  </div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
                    {s.subtitle.split('·')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Bar: Camera Angle Presets & Navigation info */}
          <div className="flex items-center justify-between text-xs">
            {/* Camera View Mode Pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-mono text-[11px] mr-1 hidden sm:inline">Camera:</span>
              <button
                onClick={() => {
                  sound.playClick();
                  onChangeViewMode('iso');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  viewMode === 'iso' ? 'bg-red-600 text-white font-bold' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Overview (Cleanroom)
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onChangeViewMode('focus_station');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  viewMode === 'focus_station' ? 'bg-red-600 text-white font-bold' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Active Tool Station
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onChangeViewMode('macro_chip');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  viewMode === 'macro_chip' ? 'bg-red-600 text-white font-bold' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                Inspect Wafer / Cutaway
              </button>
            </div>

            <div className="text-[11px] text-stone-500 font-mono hidden md:inline">
              Drag mouse to free orbit · Scroll to zoom
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
