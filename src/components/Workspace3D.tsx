import React, { useEffect, useState } from 'react';
import { RouteStop, CargoState } from '../types/route';
import { sound } from '../services/audio';
import { ASSETS } from '../content/assets';
import { STAGE_INTROS } from '../content/dialogues';
import { StageIntro } from './StageIntro';
import { NorwayManufacturing } from './NorwayManufacturing';
import { GermanyManufacturing } from './GermanyManufacturing';
import { JapanManufacturing } from './JapanManufacturing';
import { TaiwanManufacturing } from './TaiwanManufacturing';
import { MalaysiaManufacturing } from './MalaysiaManufacturing';
import { ChinaManufacturing } from './ChinaManufacturing';
import { UsaHomeEnding } from './UsaHomeEnding';

interface Workspace3DProps {
  stop: RouteStop;
  cargo: CargoState;
  onComplete: (isPlaceholder: boolean, updatedCargo: Partial<CargoState>) => void;
  onReturnToMap: () => void;
}

/** One stop: its arrival scene first (when scripted), then that stop's workshop. Escape returns to the map. */
export const Workspace3D: React.FC<Workspace3DProps> = ({ stop, cargo, onComplete, onReturnToMap }) => {
  const backdrop = ASSETS.stages[stop.id];
  const introScript = STAGE_INTROS[stop.id];
  const [phase, setPhase] = useState<'intro' | 'work'>(backdrop && introScript ? 'intro' : 'work');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        sound.playClick();
        onReturnToMap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onReturnToMap]);

  if (phase === 'intro' && backdrop && introScript) {
    return (
      <StageIntro
        stop={stop}
        lotId={cargo.lotId}
        backdrop={backdrop}
        script={introScript}
        onDone={() => setPhase('work')}
        onReturnToMap={onReturnToMap}
      />
    );
  }

  const props = { onComplete, onReturnToMap };
  switch (stop.id) {
    case 1: return <NorwayManufacturing {...props} />;
    case 2: return <GermanyManufacturing {...props} />;
    case 3: return <JapanManufacturing {...props} />;
    case 4: return <TaiwanManufacturing lotId={cargo.lotId} {...props} />;
    case 5: return <MalaysiaManufacturing waferMap={cargo.waferMap} {...props} />;
    case 6: return <ChinaManufacturing cargo={cargo} {...props} />;
    case 7: return <UsaHomeEnding cargo={cargo} {...props} />;
  }
};
