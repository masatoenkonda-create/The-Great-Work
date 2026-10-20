import React, { useState, useEffect, useCallback } from 'react';
import { RouteStop, ROUTE_STOPS, StopId, CargoState } from '../types/route';
import { sound } from '../services/audio';
import { ASSETS } from '../content/assets';
import { Lock, ChevronRight, ArrowLeft } from 'lucide-react';
import { ScreenControls } from './ScreenControls';

interface WorldMapProps {
  cargo: CargoState;
  onSelectStop: (stopId: StopId) => void;
  onOpenTitle?: () => void;
  onReset: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  cargo,
  onSelectStop,
  onOpenTitle,
  onReset,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen
}) => {
  const [selectedId, setSelectedId] = useState<StopId>(cargo.currentStopId);
  // Development build: all entrances stay open without changing earned completion.
  const devPreviewMode = true;
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const selectedStop = ROUTE_STOPS.find((s) => s.id === selectedId) || ROUTE_STOPS[0];

  // Progression logic per GUIDELINES §Current implementation & §10:
  // Normal mode: unlocked if stop is currentStopId or already completed.
  // Dev preview mode: all stops can be entered for inspection without modifying campaign save.
  const isStopUnlocked = (id: StopId) => {
    if (devPreviewMode) return true;
    return id <= cargo.currentStopId || cargo.completedStops.includes(id);
  };

  const isStopCompleted = (id: StopId) => cargo.completedStops.includes(id);

  // Sync selectedId when currentStopId advances
  useEffect(() => {
    setSelectedId(cargo.currentStopId);
  }, [cargo.currentStopId]);

  // Audio ambience
  useEffect(() => {
    sound.startCozyAmbience();
  }, []);

  // Enter active stage
  const handleEnterStage = useCallback(
    (targetId: StopId) => {
      const unlocked = isStopUnlocked(targetId);
      if (!unlocked) {
        sound.playError();
        setFeedbackMsg(`Stage 0${targetId} is locked. Complete Stage 0${targetId - 1} first.`);
        setTimeout(() => setFeedbackMsg(null), 3000);
        return;
      }
      sound.playConfirm();
      onSelectStop(targetId);
    },
    [devPreviewMode, cargo.currentStopId, cargo.completedStops, onSelectStop]
  );

  // Keyboard navigation per GUIDELINES §2 & §Current implementation:
  // Left/Right arrow keys hop sequentially between the 7 stops
  // Enter enters stage, Escape returns to title, P toggles dev preview, M toggles mute
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        sound.playClick();
        setSelectedId((prev) => (prev > 1 ? ((prev - 1) as StopId) : 7));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        sound.playClick();
        setSelectedId((prev) => (prev < 7 ? ((prev + 1) as StopId) : 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnterStage(selectedId);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (onOpenTitle) {
          sound.playClick();
          onOpenTitle();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        sound.playClick();
        setFeedbackMsg('All stages are unlocked during development.');
        setTimeout(() => setFeedbackMsg(null), 3000);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        onToggleMute();
      } else if (e.key >= '1' && e.key <= '7') {
        e.preventDefault();
        const num = parseInt(e.key, 10) as StopId;
        sound.playClick();
        setSelectedId(num);
      }
    },
    [selectedId, handleEnterStage, onOpenTitle, onToggleMute]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Route path geometry (Ordered chain: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7)
  // Leg 6 crosses the Pacific seam: Exit right edge at (1376, 275), enter left edge at (0, 275)
  const ROUTE_LEGS = [
    {
      id: 1,
      from: 1 as StopId,
      to: 2 as StopId,
      path: 'M 700 150 Q 695 185 680 220'
    },
    {
      id: 2,
      from: 2 as StopId,
      to: 3 as StopId,
      path: 'M 680 220 Q 940 130 1200 280'
    },
    {
      id: 3,
      from: 3 as StopId,
      to: 4 as StopId,
      path: 'M 1200 280 Q 1170 315 1120 350'
    },
    {
      id: 4,
      from: 4 as StopId,
      to: 5 as StopId,
      path: 'M 1120 350 Q 1090 405 1040 445'
    },
    {
      id: 5,
      from: 5 as StopId,
      to: 6 as StopId,
      path: 'M 1040 445 Q 1055 365 1090 300'
    },
    {
      id: 6,
      from: 6 as StopId,
      to: 7 as StopId,
      // Leg 6: Pacific seam crossing pieces
      pathA: 'M 1090 300 Q 1240 275 1376 275',
      pathB: 'M 0 275 Q 120 275 260 260'
    }
  ];

  // Leg status styling helper
  const getLegStatus = (fromId: StopId, toId: StopId) => {
    const isCompleted = isStopCompleted(fromId) && isStopCompleted(toId);
    const isActive = isStopCompleted(fromId) && toId === cargo.currentStopId;
    return { isCompleted, isActive };
  };

  const selectedIsUnlocked = isStopUnlocked(selectedId);
  const selectedIsCompleted = isStopCompleted(selectedId);

  return (
    <div className="relative w-full h-full bg-[#020409] text-white font-mono select-none overflow-hidden">
      {/* Top-left overlay: back to title + progress */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        {onOpenTitle && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenTitle();
            }}
            className="p-2 bg-[#030612]/70 hover:bg-[#030612]/90 border border-white/20 rounded text-white/80 hover:text-white cursor-pointer transition-colors"
            title="Title screen"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div className="px-3 py-1.5 bg-[#030612]/70 border border-white/20 rounded text-xs font-bold text-[#10b981]">
          {cargo.completedStops.length} / 7
        </div>
      </div>

      {/* Top-right overlay: sound + fullscreen (P still toggles dev preview, shown only when on) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {devPreviewMode && (
          <span className="px-2 py-1 bg-[#ca8a04] text-stone-950 rounded text-[10px] font-black">DEV</span>
        )}
        <ScreenControls
          isMuted={isMuted}
          onToggleMute={onToggleMute}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />
      </div>

      {/* Main Map Viewport: SVG 1376x768 viewBox scaled to cover the whole screen */}
      <main className="absolute inset-0">
        <div className="relative w-full h-full">
          <svg
            viewBox="0 0 1376 768"
            className="w-full h-full block pixelated"
            preserveAspectRatio="xMidYMid slice"
            style={{ imageRendering: 'pixelated' }}
          >
            {/* Approved Pixel Art World Map Background (1376x768 JPEG) */}
            <image
              href={ASSETS.worldMap}
              x="0"
              y="0"
              width="1376"
              height="768"
              preserveAspectRatio="none"
            />

            {/* Subtle retro scanline / grid vignette pattern */}
            <rect
              width="1376"
              height="768"
              fill="url(#vignetteGrad)"
              pointerEvents="none"
            />

            <defs>
              <radialGradient id="vignetteGrad" cx="50%" cy="50%" r="70%">
                <stop offset="60%" stopColor="#000000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
              </radialGradient>
            </defs>

            {/* 1. ROUTE LEGS (Behind markers per GUIDELINES §How to draw the road) */}
            <g id="route-legs">
              {ROUTE_LEGS.map((leg) => {
                const { isCompleted, isActive } = getLegStatus(leg.from, leg.to);

                // Normal 1-piece legs (Legs 1-5)
                if (leg.path) {
                  return (
                    <g key={`leg-${leg.id}`}>
                      {/* Outline path for crisp contrast over land & ocean */}
                      <path
                        d={leg.path}
                        fill="none"
                        stroke="#050814"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray="6 8"
                      />
                      {/* Foreground colored route path */}
                      <path
                        d={leg.path}
                        fill="none"
                        stroke={
                          isCompleted
                            ? '#10b981'
                            : isActive
                            ? '#fbbf24'
                            : '#475569'
                        }
                        strokeWidth={isActive ? '3.5' : '3'}
                        strokeLinecap="round"
                        strokeDasharray="6 8"
                        strokeOpacity={isCompleted || isActive ? 1 : 0.4}
                        className={isActive ? 'animate-pulse' : ''}
                      />
                    </g>
                  );
                }

                // Leg 6: Pacific Seam Crossing (Pieces A and B)
                return (
                  <g key={`leg-${leg.id}-seam`}>
                    {/* Piece A: China to East Edge */}
                    <path
                      d={leg.pathA}
                      fill="none"
                      stroke="#050814"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="6 8"
                    />
                    <path
                      d={leg.pathA}
                      fill="none"
                      stroke={
                        isCompleted
                          ? '#10b981'
                          : isActive
                          ? '#fbbf24'
                          : '#475569'
                      }
                      strokeWidth={isActive ? '3.5' : '3'}
                      strokeLinecap="round"
                      strokeDasharray="6 8"
                      strokeOpacity={isCompleted || isActive ? 1 : 0.4}
                      className={isActive ? 'animate-pulse' : ''}
                    />

                    {/* Piece B: West Edge to USA */}
                    <path
                      d={leg.pathB}
                      fill="none"
                      stroke="#050814"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray="6 8"
                    />
                    <path
                      d={leg.pathB}
                      fill="none"
                      stroke={
                        isCompleted
                          ? '#10b981'
                          : isActive
                          ? '#fbbf24'
                          : '#475569'
                      }
                      strokeWidth={isActive ? '3.5' : '3'}
                      strokeLinecap="round"
                      strokeDasharray="6 8"
                      strokeOpacity={isCompleted || isActive ? 1 : 0.4}
                      className={isActive ? 'animate-pulse' : ''}
                    />

                    {/* Pacific Seam Continuation Cues (inset so they survive edge cropping on narrow screens) */}
                    <g transform="translate(1290, 305)">
                      <rect
                        x="-52"
                        y="-10"
                        width="64"
                        height="20"
                        rx="3"
                        fill="#0b0f1d"
                        stroke="#38bdf8"
                        strokeWidth="1"
                        fillOpacity="0.85"
                      />
                      <text
                        x="-20"
                        y="4"
                        fill="#38bdf8"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        TO USA ▶
                      </text>
                    </g>

                    <g transform="translate(90, 250)">
                      <rect
                        x="-5"
                        y="-10"
                        width="70"
                        height="20"
                        rx="3"
                        fill="#0b0f1d"
                        stroke="#38bdf8"
                        strokeWidth="1"
                        fillOpacity="0.85"
                      />
                      <text
                        x="30"
                        y="4"
                        fill="#38bdf8"
                        fontSize="9"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        ◀ FROM ASIA
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* 2. LEADER LINES & CALLOUT LABELS (Staggered to prevent overlap in East Asia) */}
            <g id="callout-labels">
              {ROUTE_STOPS.map((stop) => {
                const isSelected = stop.id === selectedId;
                const isCompleted = isStopCompleted(stop.id);
                const isUnlocked = isStopUnlocked(stop.id);

                const labelWidth = 145;
                const labelHeight = 28;

                // Callout coordinates
                const anchorX = stop.x;
                const anchorY = stop.y;
                let targetX = anchorX + stop.callout.dx;
                let targetY = anchorY + stop.callout.dy;

                // Adjust box placement based on alignment
                let boxX = targetX;
                if (stop.callout.align === 'center') {
                  boxX = targetX - labelWidth / 2;
                } else if (stop.callout.align === 'right') {
                  boxX = targetX - labelWidth;
                }

                // Clamp within SVG boundary
                boxX = Math.max(10, Math.min(1376 - labelWidth - 10, boxX));
                const boxY = Math.max(10, Math.min(768 - labelHeight - 10, targetY - labelHeight / 2));

                const leaderEndX =
                  stop.callout.align === 'left'
                    ? boxX
                    : stop.callout.align === 'right'
                    ? boxX + labelWidth
                    : boxX + labelWidth / 2;
                const leaderEndY = boxY + labelHeight / 2;

                return (
                  <g
                    key={`label-${stop.id}`}
                    className="cursor-pointer transition-opacity"
                    onClick={() => {
                      sound.playClick();
                      setSelectedId(stop.id);
                    }}
                    onDoubleClick={() => handleEnterStage(stop.id)}
                  >
                    {/* Leader Line with dark outline */}
                    <line
                      x1={anchorX}
                      y1={anchorY}
                      x2={leaderEndX}
                      y2={leaderEndY}
                      stroke="#050814"
                      strokeWidth="3.5"
                    />
                    <line
                      x1={anchorX}
                      y1={anchorY}
                      x2={leaderEndX}
                      y2={leaderEndY}
                      stroke={
                        isSelected
                          ? '#fbbf24'
                          : isCompleted
                          ? '#10b981'
                          : isUnlocked
                          ? '#38bdf8'
                          : '#64748b'
                      }
                      strokeWidth="1.5"
                      strokeDasharray={isSelected ? 'none' : '3 3'}
                    />

                    {/* Callout Box */}
                    <rect
                      x={boxX}
                      y={boxY}
                      width={labelWidth}
                      height={labelHeight}
                      rx="4"
                      fill="#070c1b"
                      fillOpacity="0.92"
                      stroke={
                        isSelected
                          ? '#fbbf24'
                          : isCompleted
                          ? '#10b981'
                          : isUnlocked
                          ? '#38bdf8'
                          : '#334155'
                      }
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      className="transition-all"
                    />

                    {/* Label Badge / Order */}
                    <rect
                      x={boxX + 4}
                      y={boxY + 4}
                      width="20"
                      height="20"
                      rx="3"
                      fill={
                        isCompleted
                          ? '#10b981'
                          : isSelected
                          ? '#fbbf24'
                          : isUnlocked
                          ? '#0284c7'
                          : '#1e293b'
                      }
                    />
                    <text
                      x={boxX + 14}
                      y={boxY + 18}
                      fill={isSelected && !isCompleted ? '#050814' : '#ffffff'}
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {isCompleted ? '✓' : stop.order}
                    </text>

                    {/* Label Text */}
                    <text
                      x={boxX + 28}
                      y={boxY + 18}
                      fill={
                        isSelected
                          ? '#fbbf24'
                          : isCompleted
                          ? '#a7f3d0'
                          : isUnlocked
                          ? '#ffffff'
                          : '#94a3b8'
                      }
                      fontSize="10"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="monospace"
                    >
                      {stop.label}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* 3. STAGE ANCHOR MARKERS & SELECTION INDICATOR */}
            <g id="anchor-markers">
              {ROUTE_STOPS.map((stop) => {
                const isSelected = stop.id === selectedId;
                const isCompleted = isStopCompleted(stop.id);
                const isUnlocked = isStopUnlocked(stop.id);

                return (
                  <g
                    key={`marker-${stop.id}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Stage 0${stop.id}: ${stop.label}`}
                    className="cursor-pointer focus:outline-none"
                    onClick={() => {
                      if (selectedId === stop.id) {
                        handleEnterStage(stop.id);
                      } else {
                        sound.playClick();
                        setSelectedId(stop.id);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleEnterStage(stop.id);
                      }
                    }}
                  >
                    {/* Shadow underneath anchor */}
                    <ellipse
                      cx={stop.x}
                      cy={stop.y + 11}
                      rx="11"
                      ry="4"
                      fill="#000000"
                      fillOpacity="0.45"
                    />

                    {/* Selected Active Ring / Reticle */}
                    {isSelected && (
                      <g>
                        <circle
                          cx={stop.x}
                          cy={stop.y}
                          r="21"
                          fill="none"
                          stroke="#fbbf24"
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                          className="animate-spin"
                          style={{
                            transformOrigin: `${stop.x}px ${stop.y}px`,
                            animationDuration: '10s'
                          }}
                        />

                        {/* Bouncing Selector Arrow '▼' */}
                        <g transform={`translate(${stop.x}, ${stop.y - 25})`}>
                          <polygon
                            points="0,8 -7,-4 7,-4"
                            fill="#fbbf24"
                            stroke="#050814"
                            strokeWidth="1.5"
                          />
                        </g>
                      </g>
                    )}

                    {/* Anchor Pin Circle */}
                    <circle
                      cx={stop.x}
                      cy={stop.y}
                      r="13"
                      fill={
                        isCompleted
                          ? '#10b981'
                          : isSelected
                          ? '#fbbf24'
                          : isUnlocked
                          ? '#0284c7'
                          : '#1e293b'
                      }
                      stroke="#ffffff"
                      strokeWidth={isSelected ? '2.5' : '2'}
                      filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.7))"
                    />

                    {/* Stop Number or Icon */}
                    {isCompleted ? (
                      <text
                        x={stop.x}
                        y={stop.y + 4.5}
                        fill="#ffffff"
                        fontSize="12"
                        fontWeight="900"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        ✓
                      </text>
                    ) : !isUnlocked ? (
                      <g transform={`translate(${stop.x - 5}, ${stop.y - 5})`}>
                        <path
                          d="M2.5 4V3a2.5 2.5 0 0 1 5 0v1h.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h.5zm1 0h3V3a1.5 1.5 0 0 0-3 0v1z"
                          fill="#94a3b8"
                        />
                      </g>
                    ) : (
                      <text
                        x={stop.x}
                        y={stop.y + 4.5}
                        fill={isSelected ? '#0f172a' : '#ffffff'}
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {stop.order}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </main>

      {/* Temporary Feedback Message (e.g. Locked alert) */}
      {feedbackMsg && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30 px-4 py-2 bg-red-950/90 border-2 border-red-500 rounded text-red-200 text-xs font-bold shadow-lg animate-bounce">
          {feedbackMsg}
        </div>
      )}

      {/* Selected stop panel, floating over the map */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(720px,calc(100%-2rem))] px-4 py-3 bg-[#030612]/80 border border-white/20 rounded flex items-center gap-4 shadow-lg">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-[#fbbf24]">{selectedStop.label}</span>
            <span className="text-xs text-stone-400 truncate">{selectedStop.location}</span>
          </div>
          {/* Activity caption per GUIDELINES §How to draw the road */}
          <p className="mt-1 text-xs text-[#bae6fd] leading-relaxed">{selectedStop.activity}</p>
        </div>

        <button
          onClick={() => handleEnterStage(selectedId)}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded border-2 text-xs font-bold tracking-wider uppercase transition-all shadow-[3px_3px_0_#000] cursor-pointer ${
            selectedIsUnlocked
              ? 'bg-[#10b981] hover:bg-[#059669] border-white text-white'
              : 'bg-[#1e293b] border-stone-500 text-stone-400'
          }`}
        >
          {selectedIsUnlocked ? (
            <>
              <span>{selectedIsCompleted ? 'REPLAY' : 'ENTER'}</span>
              <ChevronRight size={14} />
            </>
          ) : (
            <>
              <Lock size={12} />
              <span>LOCKED</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
