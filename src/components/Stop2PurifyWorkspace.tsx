import React, { useState } from 'react';
import { CargoState } from '../types/route';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Beaker, Filter, Flame } from 'lucide-react';
import { sound } from '../services/audio';

interface Stop2PurifyWorkspaceProps {
  cargo: CargoState;
  onPurificationCompleted: (polysiliconBatchKg: number) => void;
  onStepChange: (step: 'convert' | 'distill' | 'deposit') => void;
}

export const Stop2PurifyWorkspace: React.FC<Stop2PurifyWorkspaceProps> = ({
  cargo,
  onPurificationCompleted,
  onStepChange
}) => {
  const [substep, setSubstep] = useState<'convert' | 'distill' | 'deposit'>('convert');

  // Substep 1: Fluidized Bed Hydrochlorination
  const [bedTemp, setBedTemp] = useState<number>(300); // 290 - 320°C optimal
  const [hclFlowRate, setHclFlowRate] = useState<number>(4.0); // Nm3/hr
  const [conversionDone, setConversionDone] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  // Substep 2: Multi-stage fractional distillation
  const [refluxRatio, setRefluxRatio] = useState<number>(12); // optimal 10-15
  const [distillPasses, setDistillPasses] = useState<number>(0); // 3 passes needed
  const [impurityPpb, setImpurityPpb] = useState<number>(450); // starts at 450 ppm/ppb down to < 0.1 ppb

  // Substep 3: Siemens Bell Jar Deposition
  const [rodTemp, setRodTemp] = useState<number>(1100); // 1080 - 1120°C
  const [depositionProgress, setDepositionProgress] = useState<number>(0);
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [depositDone, setDepositDone] = useState<boolean>(false);
  const [outputWeightKg, setOutputWeightKg] = useState<number>(10);

  const handleRunConversion = () => {
    if (bedTemp < 280) {
      sound.playProbePing(false);
      setConvertError('Bed temperature too low: silicon metal does not react with HCl gas.');
      return;
    }
    if (bedTemp > 340) {
      sound.playProbePing(false);
      setConvertError('Bed temperature too high: side-reaction forms excess waste silicon tetrachloride (SiCl4) instead of trichlorosilane.');
      return;
    }

    sound.playBubble();
    setConvertError(null);
    setIsConverting(true);
    setTimeout(() => {
      sound.playSelect();
      setIsConverting(false);
      setConversionDone(true);
    }, 700);
  };

  const handleRunDistillationPass = () => {
    sound.playBubble();
    const nextPass = distillPasses + 1;
    setDistillPasses(nextPass);
    const remaining = Math.max(0.05, impurityPpb * 0.12);
    setImpurityPpb(parseFloat(remaining.toFixed(2)));
  };

  const handleStartSiemensDeposition = () => {
    sound.playCrystalHum();
    setIsDepositing(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setDepositionProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsDepositing(false);
        setDepositDone(true);
        sound.playSelect();
        onPurificationCompleted(outputWeightKg);
      }
    }, 180);
  };

  const changeSubstep = (step: 'convert' | 'distill' | 'deposit') => {
    sound.playSelect();
    setSubstep(step);
    onStepChange(step);
  };

  return (
    <div className="space-y-4">
      {/* Sourced Context Notice */}
      <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-[11px] text-stone-600">
        <strong className="text-stone-900 block font-sans">WACKER Germany Example (R04, R13):</strong>
        Crude silicon metal is hydrochlorinated into trichlorosilane gas, distilled to separate trace boron and metals, and deposited in Siemens bell jars.
        Material transformed: <strong>{cargo.siliconMetalBatchKg || 12} kg silicon metal $\rightarrow$ 10 kg electronic-grade polysilicon</strong>.
      </div>

      {/* Substep tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-200 rounded-xl text-xs font-semibold">
        <button
          onClick={() => changeSubstep('convert')}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            substep === 'convert' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600'
          }`}
        >
          1. Gas Conversion
        </button>
        <button
          onClick={() => {
            if (conversionDone) changeSubstep('distill');
          }}
          disabled={!conversionDone}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            substep === 'distill'
              ? 'bg-white text-stone-900 shadow-2xs font-bold'
              : conversionDone
              ? 'text-stone-600'
              : 'text-stone-400 cursor-not-allowed'
          }`}
        >
          2. Distillation
        </button>
        <button
          onClick={() => {
            if (distillPasses >= 3) changeSubstep('deposit');
          }}
          disabled={distillPasses < 3}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            substep === 'deposit'
              ? 'bg-white text-stone-900 shadow-2xs font-bold'
              : distillPasses >= 3
              ? 'text-stone-600'
              : 'text-stone-400 cursor-not-allowed'
          }`}
        >
          3. Siemens Rods
        </button>
      </div>

      {/* SUBSTEP 1: CHEMICAL GAS CONVERSION */}
      {substep === 'convert' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Beaker className="w-4 h-4 text-stone-700" />
              <span>Fluidized Bed Hydrochlorination (300°C)</span>
            </h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Pulverized silicon reacts with anhydrous HCl gas to synthesize liquid-volatile trichlorosilane: Si + 3HCl yields SiHCl3 + H2.
            </p>
          </div>

          <div className="p-3 bg-stone-900 rounded-xl text-white font-mono text-[11px] space-y-3">
            <div>
              <div className="flex justify-between text-stone-300">
                <span>Fluidized Bed Temperature:</span>
                <span className={Math.abs(bedTemp - 300) <= 15 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {bedTemp}°C (Target: 300°C)
                </span>
              </div>
              <input
                type="range"
                min="260"
                max="360"
                value={bedTemp}
                disabled={isConverting || conversionDone}
                onChange={(e) => setBedTemp(Number(e.target.value))}
                className="w-full accent-amber-500 mt-1"
              />
            </div>

            <div className="flex justify-between pt-1 border-t border-stone-800 text-stone-400">
              <span>Reaction Phase:</span>
              <span className="text-cyan-400 font-bold">
                {conversionDone ? 'SiHCl3 SYNTHESIZED' : isConverting ? 'REACTING...' : 'CHARGED'}
              </span>
            </div>
          </div>

          {convertError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{convertError}</span>
            </div>
          )}

          <button
            onClick={handleRunConversion}
            disabled={isConverting || conversionDone}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {conversionDone
              ? 'Crude Trichlorosilane Gas Synthesized ✓'
              : isConverting
              ? 'Synthesizing Gas in Fluidized Bed...'
              : 'Inject HCl Gas & Synthesize Trichlorosilane'}
          </button>

          {conversionDone && (
            <button
              onClick={() => changeSubstep('distill')}
              className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <span>Gas Ready ✓ Advance to Fractional Distillation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* SUBSTEP 2: FRACTIONAL DISTILLATION */}
      {substep === 'distill' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-stone-700" />
              <span>Multi-Stage Fractional Distillation Columns</span>
            </h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Boil and condense trichlorosilane (boiling point 31.8°C) to boil off trace boron, phosphorus, and iron chlorides.
            </p>
          </div>

          <div className="p-3 bg-stone-900 rounded-xl text-white font-mono text-[11px] space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-400">Distillation Stages Completed:</span>
              <span className="text-cyan-400 font-bold">{distillPasses} of 3 Passes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Total Impurity Content:</span>
              <span className={impurityPpb < 1 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {impurityPpb} {distillPasses >= 3 ? 'ppb (Parts Per Billion)' : 'ppm'}
              </span>
            </div>
            <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-cyan-400 h-full transition-all duration-300"
                style={{ width: `${(distillPasses / 3) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleRunDistillationPass}
            disabled={distillPasses >= 3}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {distillPasses >= 3
              ? 'Ultra-Pure Trichlorosilane Distilled (&lt;0.1 ppb) ✓'
              : `Execute Distillation Pass ${distillPasses + 1}`}
          </button>

          {distillPasses >= 3 && (
            <button
              onClick={() => changeSubstep('deposit')}
              className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <span>Distillation Complete ✓ Advance to Siemens Deposition</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* SUBSTEP 3: SIEMENS BELL-JAR DEPOSITION */}
      {substep === 'deposit' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-600" />
              <span>Siemens Deposition Bell Jar (1100°C)</span>
            </h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Decompose pure trichlorosilane gas with hydrogen onto glowing thin silicon starter rods, growing solid polysilicon.
            </p>
          </div>

          <div className="p-3 bg-stone-900 rounded-xl text-white font-mono text-[11px] space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-400">Filament Rod Temperature:</span>
              <span className="text-orange-400 font-bold">{rodTemp}°C (Glowing Orange)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Electronic Purity Rating:</span>
              <span className="text-emerald-400 font-bold">11 Nines (99.9999999%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Grown Polysilicon Output:</span>
              <span className="text-cyan-400 font-bold">{outputWeightKg} kg</span>
            </div>
            <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-orange-500 h-full transition-all duration-150"
                style={{ width: `${depositionProgress}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleStartSiemensDeposition}
            disabled={isDepositing || depositDone}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {depositDone
              ? '10 kg Electronic-Grade Polysilicon Grown ✓'
              : isDepositing
              ? 'Chemical Vapor Deposition Growing Rods...'
              : 'Feed Gas & Grow Polysilicon Rods'}
          </button>

          {depositDone && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Electronic-grade polysilicon harvested. Ready for crystal ingot pulling in Japan!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
