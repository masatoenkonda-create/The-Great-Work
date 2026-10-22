import React, { useState, useEffect } from 'react';
import { RouteStop, ROUTE_STOPS, StopId, CargoState } from './types/route';
import { loadSavedCargo, saveCargoState, clearCargoState, resetFrom, takeMigrationNotice } from './services/storage';
import { TitleScreen } from './components/TitleScreen';
import { WorldMap } from './components/WorldMap';
import { Workspace3D } from './components/Workspace3D';
import { LoopReplay } from './components/LoopReplay';
import { NorwayProcurement } from './components/NorwayProcurement';
import { sound } from './services/audio';
import { useFullscreen } from './services/fullscreen';

export default function App() {
  const [cargo, setCargo] = useState<CargoState>(() => loadSavedCargo());
  // Loop 2 (procurement) is a Norway-only prototype; `?loop=2` opens its replay screen directly. Not saved yet.
  const [view, setView] = useState<'title' | 'map' | 'workspace' | 'replay'>(
    () => (new URLSearchParams(window.location.search).get('loop') === '2' ? 'replay' : 'title'));
  const [loop, setLoop] = useState<1 | 2>(1);
  const [activeStopId, setActiveStopId] = useState<StopId>(cargo.currentStopId);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  // Shown once when an old save had to be sent back to an earlier stop.
  const [notice, setNotice] = useState<string | null>(() => takeMigrationNotice());
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // One music player for the whole game; changing screens never restarts the track.
  useEffect(() => {
    const startMusic = () => sound.startBackgroundMusic();
    startMusic();
    window.addEventListener('pointerdown', startMusic);
    window.addEventListener('keydown', startMusic);
    return () => {
      window.removeEventListener('pointerdown', startMusic);
      window.removeEventListener('keydown', startMusic);
      sound.stopBackgroundMusic();
    };
  }, []);

  // Check if save data exists
  const hasSaveData = cargo.completedStops.length > 0 || cargo.currentStopId > 1;

  // Sync activeStopId when cargo loads
  useEffect(() => {
    setActiveStopId(cargo.currentStopId);
  }, [cargo.currentStopId]);

  // Stage advancement handler (Earned or Placeholder)
  const handleCompleteStop = (isPlaceholder: boolean, updates: Partial<CargoState>) => {
    sound.playStageClear();

    setCargo((prev) => {
      // Replaying an earlier stop never moves progress backwards. Taiwan, Malaysia and China make
      // the map, the chip and the TV, so replaying one clears everything built from its old result.
      const base = activeStopId >= 4 && activeStopId <= 6 ? resetFrom(activeStopId as 4 | 5 | 6, prev) : prev;
      const completed = Array.from(new Set([...base.completedStops, activeStopId]));
      const nextStopId = (Math.min(7, Math.max(base.currentStopId, activeStopId + 1))) as StopId;

      const nextCargo: CargoState = {
        ...base,
        ...updates,
        completedStops: completed,
        currentStopId: nextStopId,
        completionMethod: {
          ...base.completionMethod,
          [activeStopId]: isPlaceholder ? 'placeholder' : 'interactive'
        }
      };

      saveCargoState(nextCargo);
      return nextCargo;
    });

    // Advance to next stop workspace or return to map
    if (activeStopId < 7) {
      setActiveStopId((activeStopId + 1) as StopId);
    } else {
      setView('replay');
    }
  };

  const handleNewGame = () => {
    setLoop(1);
    const freshState = clearCargoState();
    setCargo(freshState);
    setActiveStopId(1);
    setView('map');
  };

  const handleContinue = () => {
    setActiveStopId(cargo.currentStopId);
    setView('map');
  };

  const handleResetRun = () => {
    setLoop(1);
    const freshState = clearCargoState();
    setCargo(freshState);
    setActiveStopId(1);
    setView('map');
  };

  const handleSelectStop = (stopId: StopId) => {
    if (loop === 2 && stopId !== 1) {
      setNotice('Loop 2 prototype: only Norway has a buying desk so far.');
      return;
    }
    setActiveStopId(stopId);
    setView('workspace');
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const currentStop = ROUTE_STOPS.find((s) => s.id === activeStopId) || ROUTE_STOPS[0];

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#070817]">
      {view === 'title' && (
        <TitleScreen
          hasSaveData={hasSaveData}
          onNewGame={handleNewGame}
          onContinue={handleContinue}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {notice && view === 'map' && (
        <button onClick={() => setNotice(null)} className="font-pixel fixed left-1/2 top-16 z-50 max-w-[90vw] -translate-x-1/2 border-4 border-[#1a0b02] bg-[#fcd34d] px-4 py-3 text-[10px] leading-relaxed text-[#1a0b02] shadow-[4px_4px_0_#1a0b02]">
          {notice} <span className="opacity-60">(click to close)</span>
        </button>
      )}

      {view === 'replay' && (
        <LoopReplay onStart={() => { setLoop(2); setActiveStopId(1); setView('map'); }} />
      )}

      {view === 'map' && loop === 2 && (
        <p className="font-pixel pointer-events-none fixed bottom-4 left-1/2 z-40 -translate-x-1/2 border-4 border-[#1a0b02] bg-[#fcd34d] px-3 py-2 text-[10px] text-[#1a0b02]">
          LOOP 2 · PROCUREMENT · START IN NORWAY
        </p>
      )}

      {view === 'map' && (
        <WorldMap
          cargo={loop === 2 ? { ...cargo, completedStops: [1, 2, 3, 4, 5, 6, 7], currentStopId: 1 } : cargo}
          onSelectStop={handleSelectStop}
          onOpenTitle={() => setView('title')}
          onReset={handleResetRun}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {view === 'workspace' && loop === 2 && (
        <NorwayProcurement
          onReturnToMap={() => setView('map')}
          onDone={() => { setNotice('Norway done for loop 2. Germany’s buying desk isn’t built yet.'); setView('map'); }}
        />
      )}

      {view === 'workspace' && loop === 1 && (
        <Workspace3D
          key={currentStop.id}
          stop={currentStop}
          cargo={cargo}
          onComplete={handleCompleteStop}
          onReturnToMap={() => setView('map')}
        />
      )}
    </div>
  );
}
