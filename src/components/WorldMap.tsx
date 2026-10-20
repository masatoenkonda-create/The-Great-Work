import React, { useState } from 'react';
import { RouteStop, ROUTE_STOPS, StopId, CargoState } from '../types/route';
import { Play, CheckCircle2, Lock, ArrowRight, RotateCcw, BookOpen, Volume2, VolumeX, Sparkles, MapPin } from 'lucide-react';
import { sound } from '../services/audio';

interface WorldMapProps {
  cargo: CargoState;
  onSelectStop: (stopId: StopId) => void;
  onOpenSources: () => void;
  onReset: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  cargo,
  onSelectStop,
  onOpenSources,
  onReset,
  isMuted,
  onToggleMute
}) => {
  // SVG points for connecting route
  const pathD = ROUTE_STOPS.reduce((acc, stop, i) => {
    return i === 0
      ? `M ${stop.coordinates.x * 10} ${stop.coordinates.y * 5}`
      : `${acc} L ${stop.coordinates.x * 10} ${stop.coordinates.y * 5}`;
  }, '');

  // Pixel landmark badges per stop
  const LANDMARK_ICONS: Record<StopId, string> = {
    1: '⛰️', // Norway Quarry & Smelter
    2: '🧪', // Germany Chemical Tower
    3: '⛩️', // Japan Wafer Cleanroom
    4: '⚡', // Taiwan Advanced Fab
    5: '📦', // Malaysia OSAT Packaging
    6: '🏭', // China Phone Assembly
    7: '📱'  // User Smartphone
  };

  return (
    <div className="flex flex-col h-full bg-[#dfd8c8] text-stone-900 select-none overflow-hidden font-sans">
      {/* Top Header: SNES Stage Ribbon */}
      <header className="px-6 py-3.5 bg-[#4a3b32] text-amber-100 border-b-4 border-[#2b211b] flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          {/* 16-bit pixel chip icon */}
          <div className="w-10 h-10 bg-amber-400 border-2 border-amber-200 rounded flex items-center justify-center text-stone-950 font-black shadow-inner text-sm font-mono tracking-tighter">
            CHIP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-red-600 text-white rounded font-mono">
                WORLD ROUTE
              </span>
              <span className="text-xs text-amber-200 font-mono">
                LOT #{cargo.lotId}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5 font-serif">
              One Chip, One Road — Worldwide Journey
            </h1>
          </div>
        </div>

        {/* Global Controls & Audio */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onToggleMute();
              sound.playSelect();
            }}
            className="p-2 bg-[#382b24] hover:bg-[#2e231d] text-amber-200 rounded-lg border border-amber-900 shadow-xs transition cursor-pointer"
            title={isMuted ? 'Unmute procedural sound' : 'Mute sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              onOpenSources();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#382b24] hover:bg-[#2e231d] text-amber-200 border border-amber-900 rounded-lg shadow-xs transition cursor-pointer font-mono"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>SOURCES.md</span>
          </button>

          <button
            onClick={() => {
              sound.playSelect();
              if (window.confirm('Reset this journey to a fresh batch at Stop 1?')) {
                onReset();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-800 hover:bg-red-700 text-white rounded-lg shadow-xs transition cursor-pointer font-mono"
            title="Reset to fresh run"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      </header>

      {/* Main Map Viewport: SNES 16-bit Style Stage Map */}
      <div className="flex-1 relative overflow-hidden flex flex-col justify-between p-4 sm:p-6">
        {/* World Map Container */}
        <div className="w-full h-full max-h-[58vh] bg-[#709fb0] border-4 border-[#3e2723] rounded-2xl relative overflow-hidden shadow-2xl flex items-center justify-center">
          {/* Pixel water wave grid pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* SVG Map Continents */}
          <svg
            viewBox="0 0 1000 500"
            className="w-full h-full object-contain pointer-events-none"
          >
            {/* Grid coordinates */}
            <defs>
              <pattern id="snes-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#5a8b9e" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1000" height="500" fill="url(#snes-grid)" opacity="0.4" />

            {/* Continents styled in lush 16-bit green terrain with pixel borders */}
            {/* North America */}
            <path
              d="M 120 70 L 220 50 L 270 90 L 280 160 L 220 220 L 150 180 Z"
              fill="#5b8c5a"
              stroke="#3a6039"
              strokeWidth="4"
            />
            {/* South America */}
            <path
              d="M 230 250 L 300 290 L 280 390 L 220 450 L 190 330 Z"
              fill="#5b8c5a"
              stroke="#3a6039"
              strokeWidth="4"
            />
            {/* Europe & Asia (Eurasia) */}
            <path
              d="M 450 70 L 610 50 L 830 80 L 930 190 L 880 270 L 760 270 L 620 230 L 480 180 Z"
              fill="#5b8c5a"
              stroke="#3a6039"
              strokeWidth="4"
            />
            {/* Africa */}
            <path
              d="M 470 190 L 570 200 L 550 360 L 470 390 L 440 270 Z"
              fill="#5b8c5a"
              stroke="#3a6039"
              strokeWidth="4"
            />
            {/* Australia */}
            <path
              d="M 790 320 L 900 320 L 890 410 L 800 410 Z"
              fill="#5b8c5a"
              stroke="#3a6039"
              strokeWidth="4"
            />
          </svg>

          {/* Connected Route Line */}
          <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Dashed connector road */}
            <path
              d={pathD}
              fill="none"
              stroke="#fef08a"
              strokeWidth="4"
              strokeDasharray="8 8"
            />
            {/* Traveled active path */}
            {cargo.currentStopId > 1 && (
              <path
                d={ROUTE_STOPS.slice(0, cargo.currentStopId).reduce((acc, stop, i) => {
                  return i === 0
                    ? `M ${stop.coordinates.x * 10} ${stop.coordinates.y * 5}`
                    : `${acc} L ${stop.coordinates.x * 10} ${stop.coordinates.y * 5}`;
                }, '')}
                fill="none"
                stroke="#dc2626"
                strokeWidth="5"
              />
            )}
          </svg>

          {/* 7 Stage Nodes */}
          {ROUTE_STOPS.map((stop) => {
            const isCompleted = cargo.completedStops.includes(stop.id);
            const isCurrent = cargo.currentStopId === stop.id;
            const isLocked = stop.id > cargo.currentStopId && !isCompleted;
            const completionType = cargo.completionMethod[stop.id];

            return (
              <div
                key={stop.id}
                style={{
                  left: `${stop.coordinates.x}%`,
                  top: `${stop.coordinates.y}%`
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer"
                onClick={() => {
                  sound.playSelect();
                  if (!isLocked || isCompleted) {
                    onSelectStop(stop.id);
                  }
                }}
              >
                {/* 16-bit node fortress / stage flag */}
                <div
                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold text-xs shadow-lg transition-transform duration-200 ${
                    isCurrent
                      ? 'bg-amber-300 text-stone-950 border-amber-100 ring-4 ring-amber-400/50 scale-125 z-20 animate-bounce'
                      : isCompleted
                      ? 'bg-stone-900 text-white border-stone-600'
                      : 'bg-stone-400 text-stone-700 border-stone-500 opacity-70 cursor-not-allowed'
                  }`}
                  title={`${stop.id}. ${stop.name} (${stop.location})`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-stone-600" />
                  ) : (
                    <span className="text-base">{LANDMARK_ICONS[stop.id]}</span>
                  )}
                </div>

                {/* Country label banner */}
                <div className="mt-1 px-2 py-0.5 bg-[#2b211b] text-amber-200 border border-[#4a3b32] rounded text-[10px] font-mono whitespace-nowrap shadow-md pointer-events-none flex items-center gap-1">
                  <span>{stop.id}. {stop.location}</span>
                  {completionType === 'placeholder' && (
                    <span className="text-[8px] text-amber-400">[DEMO]</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Current Stop Information Card & Navigation */}
        <div className="mt-4 bg-[#ece8de] border-2 border-stone-400 rounded-2xl p-4 shadow-sm">
          {(() => {
            const activeStop = ROUTE_STOPS.find((s) => s.id === cargo.currentStopId) || ROUTE_STOPS[0];
            const isCompleted = cargo.completedStops.includes(activeStop.id);

            return (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-stone-900 text-white text-[10px] font-bold font-mono rounded">
                      STAGE 0{activeStop.id} OF 07
                    </span>
                    <span className="text-xs font-bold text-stone-800">
                      {activeStop.location}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">
                      Sources: {activeStop.sources.join(', ')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-stone-900">
                    {activeStop.name}: <span className="font-normal text-stone-700">{activeStop.purpose}</span>
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {activeStop.summary}
                  </p>
                </div>

                {/* Action button to enter production workspace */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      sound.playSelect();
                      onSelectStop(activeStop.id);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>
                      {activeStop.id === 7 ? 'Enter Ending' : isCompleted ? 'Review Workspace' : 'Enter Workspace'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Mandatory Map Legend Disclaimer as required by GUIDELINES.md Section 4 */}
        <div className="mt-2 text-center text-[11px] text-stone-500 font-mono">
          Note: This is a representative teaching scenario grounded in real regional activities. It is <strong>not</strong> a documented supplier itinerary for an actual iPhone chip.
        </div>
      </div>
    </div>
  );
};
