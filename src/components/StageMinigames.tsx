import React, { useState, useEffect } from 'react';
import { StageId, ChipSpec, STAGES } from '../types/game';
import { sound } from '../services/audio';
import {
  Sparkles,
  Layers,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Flame,
  RotateCw,
  Zap,
  ShieldCheck,
  Server,
  Smartphone,
  Car,
  ChevronRight,
  ArrowRight,
  Info
} from 'lucide-react';

interface StageMinigamesProps {
  currentStage: StageId;
  chipSpec: ChipSpec;
  onUpdateSpec: (spec: Partial<ChipSpec>) => void;
  onCompleteStage: (nextStageId: StageId) => void;
  onOpenMap: () => void;
}

export const StageMinigames: React.FC<StageMinigamesProps> = ({
  currentStage,
  chipSpec,
  onUpdateSpec,
  onCompleteStage,
  onOpenMap
}) => {
  // --------------------------------------------------------------------------------
  // STAGE 1: WAFERS & CHEMISTRY (SUMCO & JSR / Shin-Etsu)
  // --------------------------------------------------------------------------------
  const [s1SubStep, setS1SubStep] = useState<'pull' | 'polish' | 'resist'>('pull');
  const [pullTemp, setPullTemp] = useState<number>(1420); // ideal 1420 C
  const [pullSpeed, setPullSpeed] = useState<number>(1.2); // mm/min
  const [ingotLength, setIngotLength] = useState<number>(0);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [polishProgress, setPolishProgress] = useState<number>(0);
  const [spinRpm, setSpinRpm] = useState<number>(3000); // 3000 rpm ideal
  const [resistDispensed, setResistDispensed] = useState<boolean>(false);
  const [resistThickness, setResistThickness] = useState<number>(0);

  // Ingot growth timer
  useEffect(() => {
    let timer: number;
    if (isPulling && ingotLength < 100) {
      timer = window.setInterval(() => {
        // Ideal temperature is 1418 - 1422 C and speed 1.0 - 1.5
        const tempGood = Math.abs(pullTemp - 1420) <= 5;
        const speedGood = pullSpeed >= 1.0 && pullSpeed <= 1.4;
        const growth = tempGood && speedGood ? 4 : 1.5;

        setIngotLength(prev => {
          const next = Math.min(100, prev + growth);
          if (next >= 100) {
            setIsPulling(false);
            sound.playCrystalHum();
            onUpdateSpec({ purity: 99.9999999 });
          }
          return next;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [isPulling, ingotLength, pullTemp, pullSpeed]);

  // Polish timer
  const handlePolish = () => {
    sound.playSpinCoat();
    let val = 0;
    const interval = setInterval(() => {
      val += 15;
      if (val >= 100) {
        setPolishProgress(100);
        clearInterval(interval);
      } else {
        setPolishProgress(val);
      }
    }, 120);
  };

  // Dispense & spin resist
  const handleSpinCoat = () => {
    setResistDispensed(true);
    sound.playSpinCoat();
    setTimeout(() => {
      const deviation = Math.abs(spinRpm - 3000);
      const thickness = Math.max(28, Math.min(32, 30 + (deviation > 300 ? (spinRpm < 3000 ? 5 : -4) : 0)));
      setResistThickness(thickness);
      onUpdateSpec({ yieldRate: 94 });
    }, 1400);
  };

  // --------------------------------------------------------------------------------
  // STAGE 2: FRONT-END FAB (TEL Deposition/Etch · ASML Lithography · SCREEN Cleaning)
  // --------------------------------------------------------------------------------
  const [fabStep, setFabStep] = useState<'deposit' | 'pattern' | 'etch' | 'clean'>('deposit');
  const [asmlAlignment, setAsmlAlignment] = useState<{ x: number; y: number }>({ x: 2, y: -2 });
  const [laserFired, setLaserFired] = useState<boolean>(false);
  const [layerCount, setLayerCount] = useState<number>(chipSpec.layersCompleted || 1);
  const [etchPower, setEtchPower] = useState<number>(85);
  const [cleaningStatus, setCleaningStatus] = useState<string>('Ready for Megasonic Rinse');

  const handleDeposit = () => {
    sound.playCrystalHum();
    setTimeout(() => {
      setFabStep('pattern');
      sound.playClick();
    }, 800);
  };

  const handleFireASML = () => {
    sound.playEUVLaser();
    setLaserFired(true);
    setTimeout(() => {
      setLaserFired(false);
      setFabStep('etch');
    }, 900);
  };

  const handleEtch = () => {
    sound.playPlasmaEtch();
    setTimeout(() => {
      setFabStep('clean');
    }, 800);
  };

  const handleScreenClean = () => {
    sound.playCleanRinse();
    setCleaningStatus('Rinsing particles < 1nm...');
    setTimeout(() => {
      setCleaningStatus('Wafer Ultra-Pure & Dehydrated');
      const nextLayers = layerCount + 1;
      setLayerCount(nextLayers);
      onUpdateSpec({
        layersCompleted: nextLayers,
        yieldRate: Math.min(96, (chipSpec.yieldRate || 92) + 0.5)
      });
      setFabStep('deposit');
    }, 1000);
  };

  // --------------------------------------------------------------------------------
  // STAGE 3: PROBE & DIE PREP (Advantest Electrical Wafer Prober & DISCO Dicing)
  // --------------------------------------------------------------------------------
  const TOTAL_PROBE_DIES = 24;
  const [probedDies, setProbedDies] = useState<Record<number, boolean>>({});
  const [goodDieCount, setGoodDieCount] = useState<number>(0);
  const [waferThickness, setWaferThickness] = useState<number>(775); // microns
  const [dicingCuts, setDicingCuts] = useState<number>(0); // 8 cuts to dice wafer
  const [s3SubStep, setS3SubStep] = useState<'probe' | 'grind' | 'dice'>('probe');

  const handleProbeDie = (index: number) => {
    if (probedDies[index] !== undefined) return;
    // Edge dies have a slightly higher chance of defect
    const isEdge = index < 4 || index > 19;
    const isGood = isEdge ? Math.random() > 0.35 : Math.random() > 0.08;

    sound.playProbePin(isGood);
    const updated = { ...probedDies, [index]: isGood };
    setProbedDies(updated);

    const good = Object.values(updated).filter(Boolean).length;
    setGoodDieCount(good);
    onUpdateSpec({
      testedGoodDies: good,
      totalDies: TOTAL_PROBE_DIES
    });
  };

  const handleAutoProbeAll = () => {
    const updated: Record<number, boolean> = {};
    let good = 0;
    for (let i = 0; i < TOTAL_PROBE_DIES; i++) {
      const isEdge = i < 4 || i > 19;
      const pass = isEdge ? Math.random() > 0.35 : Math.random() > 0.08;
      updated[i] = pass;
      if (pass) good++;
    }
    sound.playProbePin(true);
    setProbedDies(updated);
    setGoodDieCount(good);
    onUpdateSpec({ testedGoodDies: good, totalDies: TOTAL_PROBE_DIES });
  };

  const handleBackgrind = () => {
    sound.playDicingSaw();
    let current = waferThickness;
    const interval = setInterval(() => {
      current -= 95;
      if (current <= 30) {
        setWaferThickness(30);
        clearInterval(interval);
      } else {
        setWaferThickness(current);
      }
    }, 150);
  };

  const handleDicingCut = () => {
    sound.playDicingSaw();
    setDicingCuts(prev => {
      const next = Math.min(8, prev + 1);
      if (next === 8) {
        onUpdateSpec({ dicedDies: goodDieCount || 21 });
      }
      return next;
    });
  };

  // --------------------------------------------------------------------------------
  // STAGE 4: PACKAGE & ASSEMBLE (Ajinomoto ABF + IBIDEN Substrates + Flip-Chip)
  // --------------------------------------------------------------------------------
  const [s4SubStep, setS4SubStep] = useState<'abf' | 'flipchip' | 'reflow'>('abf');
  const [abfPressure, setAbfPressure] = useState<number>(0.8); // MPa
  const [abfTemp, setAbfTemp] = useState<number>(180); // C
  const [abfLaminated, setAbfLaminated] = useState<boolean>(false);
  const [dieBonded, setDieBonded] = useState<boolean>(false);
  const [solderReflowed, setSolderReflowed] = useState<boolean>(false);

  const handleLaminateABF = () => {
    sound.playABFLaminate();
    setTimeout(() => {
      setAbfLaminated(true);
    }, 700);
  };

  const handleBondFlipChip = () => {
    sound.playClick();
    setTimeout(() => {
      setDieBonded(true);
      sound.playClick();
    }, 600);
  };

  const handleReflowOven = () => {
    sound.playCrystalHum();
    setTimeout(() => {
      setSolderReflowed(true);
      onUpdateSpec({ packagedUnits: chipSpec.dicedDies || 21 });
    }, 900);
  };

  // --------------------------------------------------------------------------------
  // STAGE 5: FINAL TEST -> SYSTEMS (Advantest ATE & Systems Deployment)
  // --------------------------------------------------------------------------------
  const [atePassed, setAtePassed] = useState<boolean>(false);
  const [clockSpeedGhz, setClockSpeedGhz] = useState<number>(3.6);
  const [thermalPassed, setThermalPassed] = useState<boolean>(false);
  const [binnedDestinations, setBinnedDestinations] = useState<{
    servers: number;
    phones: number;
    vehicles: number;
  }>({ servers: 8, phones: 10, vehicles: 3 });

  const handleRunATE = () => {
    sound.playProbePin(true);
    setTimeout(() => {
      setClockSpeedGhz(3.95);
      setThermalPassed(true);
      setAtePassed(true);
      sound.playVictoryFanfare();
      onUpdateSpec({
        finalBinnedCount: binnedDestinations
      });
    }, 1000);
  };

  const handleDispatch = (target: 'servers' | 'phones' | 'vehicles') => {
    sound.playClick();
    setBinnedDestinations(prev => {
      const updated = { ...prev, [target]: prev[target] + 1 };
      onUpdateSpec({ finalBinnedCount: updated });
      return updated;
    });
  };

  return (
    <div className="bg-amber-50/80 backdrop-blur-md rounded-2xl border border-amber-200/80 shadow-xl p-5 text-stone-800 transition-all max-w-xl w-full">
      {/* Stage Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-200/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-md tracking-wider">
              STAGE {STAGES.find(s => s.id === currentStage)?.stepNumber}
            </span>
            <span className="text-xs font-medium text-stone-500">
              {STAGES.find(s => s.id === currentStage)?.japaneseTitle}
            </span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight mt-0.5">
            {STAGES.find(s => s.id === currentStage)?.title}
          </h2>
          <p className="text-xs text-amber-900 font-medium">
            {STAGES.find(s => s.id === currentStage)?.subtitle}
          </p>
        </div>

        <button
          onClick={onOpenMap}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white hover:bg-stone-50 text-stone-700 rounded-lg border border-stone-300 shadow-sm transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-red-600" />
          <span>Supply Chain Map</span>
        </button>
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* STAGE 1 MINIGAME: WAFERS & CHEMISTRY */}
      {/* -------------------------------------------------------------------------- */}
      {currentStage === 'wafers_chemistry' && (
        <div className="space-y-4">
          {/* Substep tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-amber-100/60 rounded-xl text-xs font-medium">
            <button
              onClick={() => setS1SubStep('pull')}
              className={`py-1.5 rounded-lg transition-all ${
                s1SubStep === 'pull' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-600'
              }`}
            >
              1. Ingot Pull (SUMCO)
            </button>
            <button
              onClick={() => setS1SubStep('polish')}
              className={`py-1.5 rounded-lg transition-all ${
                s1SubStep === 'polish' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-600'
              }`}
            >
              2. Slice & CMP (SUMCO)
            </button>
            <button
              onClick={() => setS1SubStep('resist')}
              className={`py-1.5 rounded-lg transition-all ${
                s1SubStep === 'resist' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-600'
              }`}
            >
              3. Resist (JSR/Shin-Etsu)
            </button>
          </div>

          {s1SubStep === 'pull' && (
            <div className="space-y-3 bg-white/70 p-4 rounded-xl border border-amber-100">
              <div className="flex items-start justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-stone-900">Czochralski Monocrystalline Silicon Ingot Growth</h4>
                  <p className="text-stone-500">Melt polysilicon in quartz crucible, dip seed crystal, and rotate.</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-mono">
                  SUMCO · Saga
                </span>
              </div>

              {/* Ingot visual gauge */}
              <div className="bg-stone-900 rounded-xl p-3 text-white flex items-center gap-4">
                <div className="w-10 h-28 bg-stone-800 rounded-lg relative overflow-hidden border border-stone-700 flex flex-col justify-end">
                  <div
                    className="w-full bg-gradient-to-t from-amber-500 via-stone-300 to-white transition-all duration-300"
                    style={{ height: `${ingotLength}%` }}
                  />
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] text-stone-400 font-mono">
                    {Math.round(ingotLength * 20)}mm
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-stone-400">Crucible Temp:</span>
                    <span className={Math.abs(pullTemp - 1420) <= 5 ? 'text-emerald-400' : 'text-amber-400'}>
                      {pullTemp}°C (Target: 1420°C)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1400"
                    max="1440"
                    value={pullTemp}
                    onChange={e => setPullTemp(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />

                  <div className="flex justify-between font-mono">
                    <span className="text-stone-400">Pull Speed:</span>
                    <span className={pullSpeed >= 1.0 && pullSpeed <= 1.4 ? 'text-emerald-400' : 'text-amber-400'}>
                      {pullSpeed.toFixed(1)} mm/min
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={pullSpeed}
                    onChange={e => setPullSpeed(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-stone-600 font-mono">
                  Crystal Purity: <strong className="text-stone-900">99.9999999% (11N)</strong>
                </span>

                <button
                  onClick={() => {
                    setIsPulling(!isPulling);
                    sound.playCrystalHum();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                    ingotLength >= 100
                      ? 'bg-emerald-600 text-white'
                      : isPulling
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-stone-900 text-white hover:bg-stone-800'
                  }`}
                >
                  {ingotLength >= 100 ? 'Ingot Ready ✓' : isPulling ? 'Growing Crystal...' : 'Start Crystal Pull'}
                </button>
              </div>
            </div>
          )}

          {s1SubStep === 'polish' && (
            <div className="space-y-3 bg-white/70 p-4 rounded-xl border border-amber-100">
              <div className="flex items-start justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-stone-900">Wire Slicing & Chemical-Mechanical Polishing</h4>
                  <p className="text-stone-500">Diamond wire slices 300mm wafer; CMP achieves sub-nanometer flatness.</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-mono">
                  300mm Diameter
                </span>
              </div>

              <div className="p-4 bg-stone-900 rounded-xl text-center space-y-3">
                <div className="inline-block relative">
                  <div
                    className={`w-24 h-24 rounded-full border-4 transition-all duration-700 mx-auto flex items-center justify-center ${
                      polishProgress >= 100
                        ? 'border-emerald-400 bg-gradient-to-tr from-stone-800 via-stone-700 to-emerald-950 shadow-lg shadow-emerald-500/20'
                        : 'border-stone-600 bg-stone-800'
                    }`}
                  >
                    <span className="text-[11px] font-mono text-stone-200">
                      {polishProgress >= 100 ? 'Ra < 0.1nm' : `${polishProgress}%`}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${polishProgress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handlePolish}
                disabled={polishProgress >= 100}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                {polishProgress >= 100 ? 'Wafer Mirror-Polished ✓' : 'Engage CMP Polish Head'}
              </button>
            </div>
          )}

          {s1SubStep === 'resist' && (
            <div className="space-y-3 bg-white/70 p-4 rounded-xl border border-amber-100">
              <div className="flex items-start justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-stone-900">EUV Photoresist Formulation & Spin-Coating</h4>
                  <p className="text-stone-500">JSR & Shin-Etsu supply &gt;80% of world photoresists for EUV lithography.</p>
                </div>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[11px] font-mono">
                  JSR / Shin-Etsu
                </span>
              </div>

              <div className="p-3 bg-stone-100 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-stone-600">Spin Speed:</span>
                  <span className="font-bold text-stone-900">{spinRpm} RPM</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="4000"
                  step="100"
                  value={spinRpm}
                  onChange={e => setSpinRpm(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />

                <div className="flex justify-between items-center pt-2 text-[11px] border-t border-stone-200">
                  <span className="text-stone-600">Resist Film Thickness:</span>
                  <span className="font-mono font-bold text-stone-900">
                    {resistThickness > 0 ? `${resistThickness.toFixed(1)} nm (Uniform)` : 'Awaiting dispense'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSpinCoat}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {resistThickness > 0 ? 'Resist Layer Certified ✓' : 'Dispense & Spin Photoresist'}
              </button>
            </div>
          )}

          {/* Next Stage button */}
          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              {ingotLength >= 100 && polishProgress >= 100 && resistThickness > 0
                ? 'Ready for cleanroom front-end fab!'
                : 'Complete all 3 wafer preparation steps to proceed.'}
            </span>
            <button
              onClick={() => onCompleteStage('front_end_fab')}
              disabled={!(ingotLength >= 100 && polishProgress >= 100 && resistThickness > 0)}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Transfer to Front-End Fab</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* STAGE 2 MINIGAME: FRONT-END FAB (TEL, ASML, SCREEN) */}
      {/* -------------------------------------------------------------------------- */}
      {currentStage === 'front_end_fab' && (
        <div className="space-y-4">
          {/* The repeated circular process motif matching the infographic: Deposit -> Pattern -> Etch -> Clean */}
          <div className="p-3 bg-stone-900 text-white rounded-xl">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-stone-400 font-mono">The 4-Step Nanometer Loop</span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono text-[10px]">
                Layer {layerCount} of 48
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] font-medium">
              <div
                className={`p-2 rounded-lg transition-all ${
                  fabStep === 'deposit' ? 'bg-amber-500 text-stone-950 font-bold shadow' : 'bg-stone-800 text-stone-400'
                }`}
              >
                1. Deposit (TEL)
              </div>
              <div
                className={`p-2 rounded-lg transition-all ${
                  fabStep === 'pattern' ? 'bg-blue-500 text-white font-bold shadow' : 'bg-stone-800 text-stone-400'
                }`}
              >
                2. Pattern (ASML)
              </div>
              <div
                className={`p-2 rounded-lg transition-all ${
                  fabStep === 'etch' ? 'bg-orange-500 text-white font-bold shadow' : 'bg-stone-800 text-stone-400'
                }`}
              >
                3. Etch (TEL)
              </div>
              <div
                className={`p-2 rounded-lg transition-all ${
                  fabStep === 'clean' ? 'bg-cyan-500 text-stone-950 font-bold shadow' : 'bg-stone-800 text-stone-400'
                }`}
              >
                4. Clean (SCREEN)
              </div>
            </div>
          </div>

          {/* Front End Active Tool Interaction */}
          <div className="bg-white/80 p-4 rounded-xl border border-amber-100 space-y-3">
            {fabStep === 'deposit' && (
              <div className="space-y-3">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold text-stone-900">Tokyo Electron (TEL) Atomic Layer Deposition</h4>
                    <p className="text-stone-500">Apply dielectric SiO2 film insulator across 300mm wafer surface.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[11px] font-mono">
                    TEL Kyushu · Koshi
                  </span>
                </div>
                <div className="p-3 bg-stone-100 rounded-lg text-xs font-mono text-stone-700 flex justify-between">
                  <span>Precursor Gas: Silane + Oxygen Plasma</span>
                  <span className="text-emerald-600 font-bold">Flow Stabilized</span>
                </div>
                <button
                  onClick={handleDeposit}
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Deposit Dielectric Layer
                </button>
              </div>
            )}

            {fabStep === 'pattern' && (
              <div className="space-y-3">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold text-stone-900">ASML EUV Lithography (13.5nm Photon Pulse)</h4>
                    <p className="text-stone-500">
                      Global Interdependence: Veldhoven, Netherlands EUV scanner printing 3nm circuit mask.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[11px] font-mono">
                    ASML Twinscan NXE
                  </span>
                </div>

                {/* Reticle alignment simulator */}
                <div className="p-4 bg-stone-950 rounded-xl relative overflow-hidden flex flex-col items-center justify-center">
                  <div className="w-32 h-32 border border-dashed border-blue-500/50 rounded-lg relative flex items-center justify-center">
                    {/* Reticle crosshair */}
                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-blue-500/40" />
                    <div className="absolute inset-y-0 left-1/2 w-[1px] bg-blue-500/40" />

                    {/* Aligned wafer reticle */}
                    <div
                      className={`w-6 h-6 border-2 transition-all ${
                        laserFired ? 'border-white bg-blue-400 scale-125' : 'border-amber-400'
                      }`}
                      style={{
                        transform: `translate(${asmlAlignment.x * 4}px, ${asmlAlignment.y * 4}px)`
                      }}
                    />
                  </div>

                  <div className="text-[10px] text-stone-400 font-mono mt-2">
                    Overlay Error: <span className="text-emerald-400">±0.4nm</span> (Sub-nanometer precision)
                  </div>
                </div>

                <button
                  onClick={handleFireASML}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Expose EUV Lithography Pattern</span>
                </button>
              </div>
            )}

            {fabStep === 'etch' && (
              <div className="space-y-3">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold text-stone-900">Tokyo Electron (TEL) Deep Reactive Ion Etch</h4>
                    <p className="text-stone-500">Fluorocarbon plasma cuts vertical trenches without undercutting.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-orange-50 text-orange-800 border border-orange-200 rounded text-[11px] font-mono">
                    TEL Plasma Etch
                  </span>
                </div>

                <div className="p-3 bg-stone-100 rounded-lg space-y-1.5 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-stone-600">RF Plasma Power:</span>
                    <span className="font-bold text-stone-900">{etchPower} Watts</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={etchPower}
                    onChange={e => setEtchPower(Number(e.target.value))}
                    className="w-full accent-orange-600"
                  />
                </div>

                <button
                  onClick={handleEtch}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Strike Plasma & Anisotropically Etch
                </button>
              </div>
            )}

            {fabStep === 'clean' && (
              <div className="space-y-3">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold text-stone-900">SCREEN Megasonic Single-Wafer Cleaning</h4>
                    <p className="text-stone-500">Supercritical CO2 & ultra-pure deionized water strip photoresist residue.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-cyan-50 text-cyan-800 border border-cyan-200 rounded text-[11px] font-mono">
                    SCREEN · Kyoto
                  </span>
                </div>

                <div className="p-3 bg-cyan-50/70 border border-cyan-200 rounded-lg text-xs font-mono text-cyan-900 flex justify-between items-center">
                  <span>Chemical Bath: DIO3 + SC1 + UPW</span>
                  <span className="font-semibold">{cleaningStatus}</span>
                </div>

                <button
                  onClick={handleScreenClean}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Execute Megasonic Rinse & Complete Layer
                </button>
              </div>
            )}
          </div>

          {/* Front End to Probe transition */}
          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              Completed {layerCount >= 3 ? 'multilevel gate interconnects' : `${layerCount}/3 demo layers`}
            </span>
            <button
              onClick={() => onCompleteStage('probe_die_prep')}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Transfer to Probe & Die Prep</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* STAGE 3 MINIGAME: PROBE & DIE PREP (Advantest & DISCO) */}
      {/* -------------------------------------------------------------------------- */}
      {currentStage === 'probe_die_prep' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-amber-100/60 rounded-xl text-xs font-medium">
            <button
              onClick={() => setS3SubStep('probe')}
              className={`py-1.5 rounded-lg transition-all ${
                s3SubStep === 'probe' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-600'
              }`}
            >
              1. Wafer Test (Advantest)
            </button>
            <button
              onClick={() => setS3SubStep('grind')}
              className={`py-1.5 rounded-lg transition-all ${
                s3SubStep === 'grind' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-600'
              }`}
            >
              2. Backgrind (DISCO)
            </button>
            <button
              onClick={() => setS3SubStep('dice')}
              className={`py-1.5 rounded-lg transition-all ${
                s3SubStep === 'dice' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-600'
              }`}
            >
              3. Dicing Saw (DISCO)
            </button>
          </div>

          {s3SubStep === 'probe' && (
            <div className="space-y-3 bg-white/80 p-4 rounded-xl border border-amber-100">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <h4 className="font-bold text-stone-900">Advantest Wafer Electrical Probe Test</h4>
                  <p className="text-stone-500">Touch micro-cantilever needles to pads to map functional vs defective dies.</p>
                </div>
                <button
                  onClick={handleAutoProbeAll}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] font-medium transition cursor-pointer"
                >
                  Auto-Probe All
                </button>
              </div>

              {/* Wafer Die Map Visual */}
              <div className="p-4 bg-stone-900 rounded-xl flex flex-col items-center justify-center">
                <div className="grid grid-cols-6 gap-1.5 p-3 bg-stone-950 rounded-full border border-stone-800">
                  {Array.from({ length: TOTAL_PROBE_DIES }).map((_, idx) => {
                    const status = probedDies[idx];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleProbeDie(idx)}
                        className={`w-7 h-7 rounded-sm transition-all text-[9px] font-mono flex items-center justify-center cursor-pointer ${
                          status === undefined
                            ? 'bg-stone-800 hover:bg-stone-700 text-stone-500'
                            : status
                            ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm shadow-emerald-500/50'
                            : 'bg-red-500 text-white font-bold'
                        }`}
                        title={`Die #${idx + 1}: ${
                          status === undefined ? 'Untested' : status ? 'PASS' : 'FAIL (Defect)'
                        }`}
                      >
                        {status === undefined ? idx + 1 : status ? '✓' : '✗'}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono mt-3 text-stone-300">
                  <span>Tested: {Object.keys(probedDies).length}/{TOTAL_PROBE_DIES}</span>
                  <span className="text-emerald-400">Passed: {goodDieCount}</span>
                  <span className="text-amber-400">
                    Yield: {Object.keys(probedDies).length > 0
                      ? `${Math.round((goodDieCount / Object.keys(probedDies).length) * 100)}%`
                      : '--'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {s3SubStep === 'grind' && (
            <div className="space-y-3 bg-white/80 p-4 rounded-xl border border-amber-100">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <h4 className="font-bold text-stone-900">DISCO Ultra-Precision Wafer Backgrinding</h4>
                  <p className="text-stone-500">Grind rear silicon substrate from 775µm down to ultra-thin 30µm.</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[11px] font-mono">
                  DISCO · Kiru/Kezuru
                </span>
              </div>

              <div className="p-4 bg-stone-900 rounded-xl text-center space-y-3">
                <div className="text-xs text-stone-300 font-mono">
                  Current Wafer Thickness: <strong className="text-cyan-400 text-lg">{waferThickness} µm</strong>
                </div>

                <div className="w-full bg-stone-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full transition-all duration-200"
                    style={{ width: `${Math.max(4, ((775 - waferThickness) / 745) * 100)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={handleBackgrind}
                disabled={waferThickness <= 30}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {waferThickness <= 30 ? 'Backgrinding Complete (30µm Reached) ✓' : 'Engage DISCO Precision Grinder'}
              </button>
            </div>
          )}

          {s3SubStep === 'dice' && (
            <div className="space-y-3 bg-white/80 p-4 rounded-xl border border-amber-100">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <h4 className="font-bold text-stone-900">DISCO Precision Dicing Saw & UV Tape Expansion</h4>
                  <p className="text-stone-500">Diamond resinoid blade cuts along scribe streets to separate dies.</p>
                </div>
                <span className="px-2 py-0.5 bg-cyan-50 text-cyan-800 border border-cyan-200 rounded text-[11px] font-mono">
                  Diamond Blade Saw
                </span>
              </div>

              <div className="p-4 bg-stone-900 rounded-xl text-center space-y-2">
                <div className="text-xs text-stone-300 font-mono">
                  Scribe Street Slices: <strong className="text-cyan-400">{dicingCuts}/8 Cuts</strong>
                </div>
                <div className="flex justify-center gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                        i < dicingCuts ? 'bg-cyan-500 text-stone-950' : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleDicingCut}
                disabled={dicingCuts >= 8}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {dicingCuts >= 8 ? `${goodDieCount || 21} Individual Dies Separated ✓` : 'Perform Precision Diamond Saw Cut'}
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              {dicingCuts >= 8 ? 'Dies ready for packaging!' : 'Complete probing and dicing.'}
            </span>
            <button
              onClick={() => onCompleteStage('package_assemble')}
              disabled={dicingCuts < 8}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Transfer to Package & Assemble</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* STAGE 4 MINIGAME: PACKAGE & ASSEMBLE (Ajinomoto ABF & IBIDEN Substrates) */}
      {/* -------------------------------------------------------------------------- */}
      {currentStage === 'package_assemble' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-amber-100/60 rounded-xl text-xs font-medium">
            <button
              onClick={() => setS4SubStep('abf')}
              className={`py-1.5 rounded-lg transition-all ${
                s4SubStep === 'abf' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-600'
              }`}
            >
              1. ABF Film (Ajinomoto)
            </button>
            <button
              onClick={() => setS4SubStep('flipchip')}
              className={`py-1.5 rounded-lg transition-all ${
                s4SubStep === 'flipchip' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-600'
              }`}
            >
              2. Substrate (IBIDEN)
            </button>
            <button
              onClick={() => setS4SubStep('reflow')}
              className={`py-1.5 rounded-lg transition-all ${
                s4SubStep === 'reflow' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-600'
              }`}
            >
              3. Reflow & Mold
            </button>
          </div>

          {s4SubStep === 'abf' && (
            <div className="space-y-3 bg-white/80 p-4 rounded-xl border border-amber-100">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <h4 className="font-bold text-stone-900">Ajinomoto Build-up Film (ABF) Lamination</h4>
                  <p className="text-stone-500">Thermoset insulating film born from amino acid bioscience research.</p>
                </div>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[11px] font-mono">
                  Ajinomoto Fine-Techno
                </span>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-2">
                <div className="flex justify-between font-mono">
                  <span className="text-stone-700">Vacuum Chamber Temp:</span>
                  <span className="font-bold text-amber-900">{abfTemp}°C (Thermoset cure)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-stone-700">Lamination Pressure:</span>
                  <span className="font-bold text-amber-900">{abfPressure} MPa</span>
                </div>
              </div>

              <button
                onClick={handleLaminateABF}
                disabled={abfLaminated}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {abfLaminated ? 'ABF Dielectric Layers Thermoset Fused ✓' : 'Vacuum Laminate ABF Film onto Substrate'}
              </button>
            </div>
          )}

          {s4SubStep === 'flipchip' && (
            <div className="space-y-3 bg-white/80 p-4 rounded-xl border border-amber-100">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <h4 className="font-bold text-stone-900">IBIDEN Package Substrate & Flip-Chip Placement</h4>
                  <p className="text-stone-500">Mount inverted die with microscopic copper pillar solder micro-bumps.</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px] font-mono">
                  IBIDEN · Gifu
                </span>
              </div>

              <div className="p-4 bg-stone-900 rounded-xl text-center text-xs text-stone-300 font-mono space-y-2">
                <div>Micro-Bump Alignment: <span className="text-emerald-400">±1.2 µm</span></div>
                <div className="text-[11px] text-stone-400">
                  Flip-chip thermocompression head ready for bonding.
                </div>
              </div>

              <button
                onClick={handleBondFlipChip}
                disabled={dieBonded}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {dieBonded ? 'Die Bonded to IBIDEN Substrate ✓' : 'Execute Flip-Chip Thermocompression'}
              </button>
            </div>
          )}

          {s4SubStep === 'reflow' && (
            <div className="space-y-3 bg-white/80 p-4 rounded-xl border border-amber-100">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <h4 className="font-bold text-stone-900">Epoxy Molding Compound & BGA Solder Ball Reflow</h4>
                  <p className="text-stone-500">Attach Ball Grid Array (BGA) sphere matrix and inject ceramic mold resin.</p>
                </div>
                <span className="px-2 py-0.5 bg-stone-100 text-stone-800 rounded text-[11px] font-mono">
                  Kyocera Ceramics
                </span>
              </div>

              <div className="p-3 bg-stone-950 text-white rounded-xl text-xs space-y-1 font-mono">
                <div className="text-stone-400">Package Cross-Section Assembled:</div>
                <div className="text-emerald-400 text-[11px]">
                  • Epoxy Mold Compound Encapsulation<br />
                  • Silicon Die with Interconnects<br />
                  • ABF Dielectric Insulation Layers<br />
                  • IBIDEN Package Substrate Carrier<br />
                  • BGA Solder Balls Array
                </div>
              </div>

              <button
                onClick={handleReflowOven}
                disabled={solderReflowed}
                className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {solderReflowed ? 'Package Assembly Certified ✓' : 'Reflow BGA Balls & Cure Mold Resin'}
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              {solderReflowed ? 'Packaged chips ready for final electrical test!' : 'Assemble package components.'}
            </span>
            <button
              onClick={() => onCompleteStage('final_test_systems')}
              disabled={!solderReflowed}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span>Transfer to Final Test & Systems</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* STAGE 5 MINIGAME: FINAL TEST -> SYSTEMS (Advantest & Global Deployment) */}
      {/* -------------------------------------------------------------------------- */}
      {currentStage === 'final_test_systems' && (
        <div className="space-y-4">
          <div className="bg-white/80 p-4 rounded-xl border border-amber-100 space-y-3">
            <div className="flex justify-between items-start text-xs">
              <div>
                <h4 className="font-bold text-stone-900">Advantest Automated Test Equipment (ATE)</h4>
                <p className="text-stone-500">Electrical verification, clock frequency binning, and thermal chamber stress.</p>
              </div>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[11px] font-mono">
                Advantest · Gunma
              </span>
            </div>

            <div className="p-3 bg-stone-900 text-white rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-stone-400">Clock Frequency Sweep:</span>
                <span className={atePassed ? 'text-emerald-400 font-bold' : 'text-stone-400'}>
                  {atePassed ? `${clockSpeedGhz} GHz (Ultra-High Bin)` : 'Awaiting Test'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Thermal Cycling (-40°C to +125°C):</span>
                <span className={thermalPassed ? 'text-emerald-400 font-bold' : 'text-stone-400'}>
                  {thermalPassed ? 'PASSED (Zero Delamination)' : 'Awaiting Test'}
                </span>
              </div>
            </div>

            <button
              onClick={handleRunATE}
              disabled={atePassed}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              {atePassed ? 'Chips Electrically Qualified & Binned ✓' : 'Run Full ATE Electrical Test & Binning'}
            </button>
          </div>

          {/* Deployment to systems matching infographic */}
          <div className="bg-white/80 p-4 rounded-xl border border-amber-100 space-y-3">
            <div className="text-xs">
              <h4 className="font-bold text-stone-900">Deploy to Global Systems & End Markets</h4>
              <p className="text-stone-500">Select destination system to fulfill customer orders.</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {/* Server */}
              <button
                onClick={() => handleDispatch('servers')}
                className="p-3 bg-stone-50 hover:bg-amber-50 rounded-xl border border-stone-200 hover:border-amber-300 transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <Server className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-stone-900">AI Servers</span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {binnedDestinations.servers} units shipped
                </span>
              </button>

              {/* Phone */}
              <button
                onClick={() => handleDispatch('phones')}
                className="p-3 bg-stone-50 hover:bg-amber-50 rounded-xl border border-stone-200 hover:border-amber-300 transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-5 h-5 text-sky-600" />
                <span className="font-semibold text-stone-900">Phones</span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {binnedDestinations.phones} units shipped
                </span>
              </button>

              {/* Vehicle */}
              <button
                onClick={() => handleDispatch('vehicles')}
                className="p-3 bg-stone-50 hover:bg-amber-50 rounded-xl border border-stone-200 hover:border-amber-300 transition-all flex flex-col items-center gap-1 cursor-pointer"
              >
                <Car className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-stone-900">Vehicles</span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {binnedDestinations.vehicles} units shipped
                </span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              End-to-end semiconductor journey complete!
            </span>
            <button
              onClick={() => onCompleteStage('wafers_chemistry')}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Restart or Review Supply Chain</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
