import React, { useState, useEffect } from 'react';
import { RouteStop, ROUTE_STOPS, StopId, CargoState } from './types/route';
import { INITIAL_CARGO_STATE, loadSavedCargo, saveCargoState, clearCargoState, resetFrom, takeMigrationNotice } from './services/storage';
import { TitleScreen } from './components/TitleScreen';
import { WorldMap } from './components/WorldMap';
import { Workspace3D } from './components/Workspace3D';
import { LoopReplay } from './components/LoopReplay';
import { NorwayProcurement } from './components/NorwayProcurement';
import { NorwayProcurementIntro } from './components/NorwayProcurementIntro';
import { GermanyProcurement } from './components/GermanyProcurement';
import { createTrade, tradeReducer, TradeAction, TradeState } from './content/tradeEngine';
import { NORWAY_MARKET } from './content/norwayMarket';
import { GERMANY_MARKET } from './content/germanyMarket';
import { DevPanel, DevAction } from './components/DevPanel';
import { autoPlay, GERMANY_CAREFUL, NORWAY_CAREFUL } from './content/autoPlay';
import { sound } from './services/audio';
import { useFullscreen } from './services/fullscreen';
import { buildWaferMap, chipSerial, mapCounts, tvSerialFor } from './content/waferMap';
import { FIELDS } from './content/waferMap';

export default function App() {
  const [cargo, setCargo] = useState<CargoState>(() => loadSavedCargo());
  // Loop 2 (procurement) prototype: Norway, then Germany; `?loop=2` opens its replay screen directly. Not saved yet.
  const [view, setView] = useState<'title' | 'map' | 'workspace' | 'replay' | 'procurement-intro'>(
    () => (new URLSearchParams(window.location.search).get('loop') === '2' ? 'replay' : 'title'));
  const [loop, setLoop] = useState<1 | 2>(1);
  // Keep orders/accepted stock while visiting the world map. Still session-only, isolated from campaign saves.
  const [procurement, setProcurement] = useState(() => createTrade(NORWAY_MARKET));
  const dispatchProcurement = (action: TradeAction) => setProcurement(s => tradeReducer(NORWAY_MARKET, s, action));
  // Germany's desk opens once Norway's sale is agreed; its silicon costs the price agreed there (chain model, L17).
  const [germany, setGermany] = useState<TradeState | null>(null);
  const dispatchGermany = (action: TradeAction) => setGermany(s => (s ? tradeReducer(GERMANY_MARKET, s, action) : s));
  // Replaying Norway (or restarting loop 2) changes the silicon's price, so Germany starts again.
  useEffect(() => { if (procurement.phase !== 'done') setGermany(null); }, [procurement.phase]);
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
    setProcurement(createTrade(NORWAY_MARKET));
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
    setProcurement(createTrade(NORWAY_MARKET));
    const freshState = clearCargoState();
    setCargo(freshState);
    setActiveStopId(1);
    setView('map');
  };

  const handleSelectStop = (stopId: StopId) => {
    if (loop === 2 && stopId === 2) {
      const price = procurement.phase === 'done' ? procurement.sale.price : null;
      if (price === null) { setNotice('Finish Norway first: Germany’s silicon is the batch you sell there.'); return; }
      if (!germany) setGermany(createTrade(GERMANY_MARKET, GERMANY_MARKET.intro, price));
    } else if (loop === 2 && stopId !== 1) {
      setNotice('Loop 2 prototype: only Norway and Germany have buying desks so far.');
      return;
    }
    setActiveStopId(stopId);
    setView('workspace');
  };

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  // Developer shortcuts (dev server only): finished stops are played carefully through the real engine.
  const devActions: DevAction[] = (() => {
    const norwayDone = () => autoPlay(NORWAY_MARKET, NORWAY_CAREFUL);
    const toLoop2 = (norway: TradeState, germanyState: TradeState | null, stop: StopId, to: 'map' | 'workspace' | 'procurement-intro', note: string | null) => {
      setLoop(2); setProcurement(norway); setGermany(germanyState); setActiveStopId(stop); setView(to); setNotice(note);
    };
    const completeLoop1Through = (stop: 4 | 5 | 6) => {
      const waferMap = buildWaferMap(INITIAL_CARGO_STATE.lotId, 1, FIELDS.map(field => ({ field, dx: 0, dy: 0 })));
      const firstGoodDie = waferMap.dies.find(die => die.status === 'pass')!;
      const selectedChipSerial = chipSerial(waferMap, firstGoodDie);
      const done = Array.from({ length: stop }, (_, i) => (i + 1) as StopId);
      const completedCargo: CargoState = {
        ...INITIAL_CARGO_STATE,
        currentStopId: Math.min(7, stop + 1) as StopId,
        completedStops: done,
        siliconMetalBatchKg: 12,
        polysiliconBatchKg: 12,
        wafersProducedCount: 1,
        ...mapCounts(waferMap),
        waferMap,
        selectedChipSerial: stop >= 5 ? selectedChipSerial : null,
        tvChipSerial: stop >= 6 ? selectedChipSerial : null,
        tvSerial: stop >= 6 ? tvSerialFor(selectedChipSerial) : null,
        isTvOperational: stop >= 6,
        completionMethod: {
          1: 'placeholder', 2: 'placeholder', 3: 'placeholder', 4: stop >= 4 ? 'placeholder' : null,
          5: stop >= 5 ? 'placeholder' : null, 6: stop >= 6 ? 'placeholder' : null, 7: null,
        },
      };
      setLoop(1); setCargo(completedCargo); setActiveStopId(completedCargo.currentStopId); setView('map'); setNotice(null);
    };
    return [
      { label: 'Loop 2: start (skip loop 1)', run: () => toLoop2(createTrade(NORWAY_MARKET), null, 1, 'procurement-intro', null) },
      { label: 'Loop 2: finish Norway', run: () => toLoop2(norwayDone(), null, 1, 'map', 'Dev: Norway finished (careful play). Click Germany.') },
      { label: 'Loop 2: finish Norway, open Germany', run: () => {
        const n = norwayDone();
        toLoop2(n, createTrade(GERMANY_MARKET, GERMANY_MARKET.intro, n.sale.price!), 2, 'workspace', null);
      } },
      { label: 'Loop 2: finish Norway and Germany', run: () => {
        const n = norwayDone();
        toLoop2(n, autoPlay(GERMANY_MARKET, GERMANY_CAREFUL, n.sale.price!), 2, 'map', 'Dev: Norway and Germany finished (careful play).');
      } },
      { label: 'Loop 1: complete Taiwan', run: () => completeLoop1Through(4) },
      { label: 'Loop 1: complete Malaysia', run: () => completeLoop1Through(5) },
      { label: 'Loop 1: complete China', run: () => completeLoop1Through(6) },
    ];
  })();

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
        <LoopReplay onStart={() => { setProcurement(createTrade(NORWAY_MARKET)); setLoop(2); setActiveStopId(1); setView('procurement-intro'); }} />
      )}

      {view === 'procurement-intro' && loop === 2 && (
        <NorwayProcurementIntro onDone={() => setView('workspace')} />
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

      {view === 'workspace' && loop === 2 && activeStopId === 1 && (
        <NorwayProcurement
          state={procurement}
          dispatch={dispatchProcurement}
          onReturnToMap={() => setView('map')}
          onDone={() => { setNotice('Norway done for loop 2. Your silicon is on its way: click Germany.'); setView('map'); }}
        />
      )}

      {view === 'workspace' && loop === 2 && activeStopId === 2 && germany && (
        <GermanyProcurement
          state={germany}
          dispatch={dispatchGermany}
          onReturnToMap={() => setView('map')}
          onDone={() => { setNotice('Germany done for loop 2. Japan’s buying desk isn’t built yet.'); setView('map'); }}
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

      {import.meta.env.DEV && <DevPanel actions={devActions} />}
    </div>
  );
}
