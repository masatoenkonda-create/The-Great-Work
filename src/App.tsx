import React, { useState, useEffect } from 'react';
import { RouteStop, ROUTE_STOPS, StopId, CargoState } from './types/route';
import { loadSavedCargo, saveCargoState, clearCargoState } from './services/storage';
import { WorldMap } from './components/WorldMap';
import { Workspace3D } from './components/Workspace3D';
import { SourcesPanel } from './components/SourcesPanel';
import { sound } from './services/audio';

export default function App() {
  const [cargo, setCargo] = useState<CargoState>(() => loadSavedCargo());
  const [view, setView] = useState<'map' | 'workspace'>('map');
  const [activeStopId, setActiveStopId] = useState<StopId>(cargo.currentStopId);
  const [isSourcesOpen, setIsSourcesOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sync activeStopId when cargo loads
  useEffect(() => {
    setActiveStopId(cargo.currentStopId);
  }, [cargo.currentStopId]);

  // Stage advancement handler (Earned or Placeholder)
  const handleCompleteStop = (isPlaceholder: boolean, updates: Partial<CargoState>) => {
    sound.playStageClear();

    setCargo((prev) => {
      const completed = Array.from(new Set([...prev.completedStops, activeStopId]));
      const nextStopId = (Math.min(7, activeStopId + 1)) as StopId;
      
      const nextCargo: CargoState = {
        ...prev,
        ...updates,
        completedStops: completed,
        currentStopId: nextStopId,
        completionMethod: {
          ...prev.completionMethod,
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
      setView('map');
    }
  };

  const handleResetRun = () => {
    const freshState = clearCargoState();
    setCargo(freshState);
    setActiveStopId(1);
    setView('map');
  };

  const handleSelectStop = (stopId: StopId) => {
    setActiveStopId(stopId);
    setView('workspace');
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const currentStop = ROUTE_STOPS.find((s) => s.id === activeStopId) || ROUTE_STOPS[0];

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#181c22]">
      {view === 'map' ? (
        <WorldMap
          cargo={cargo}
          onSelectStop={handleSelectStop}
          onOpenSources={() => setIsSourcesOpen(true)}
          onReset={handleResetRun}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      ) : (
        <Workspace3D
          stop={currentStop}
          cargo={cargo}
          onComplete={handleCompleteStop}
          onReturnToMap={() => setView('map')}
        />
      )}

      {/* Sources & Evidence Panel */}
      <SourcesPanel
        isOpen={isSourcesOpen}
        onClose={() => setIsSourcesOpen(false)}
      />
    </div>
  );
}
