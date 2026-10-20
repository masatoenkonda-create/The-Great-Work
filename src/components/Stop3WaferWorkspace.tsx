import React, { useState, useEffect } from 'react';
import { CargoState } from '../types/route';
import { CheckCircle2, AlertCircle, RotateCcw, ArrowRight, ShieldCheck, Eye } from 'lucide-react';
import { sound } from '../services/audio';

interface Stop3WaferWorkspaceProps {
  cargo: CargoState;
  onSubstepChange: (substep: 'pull' | 'slice' | 'polish') => void;
  onWaferBatchReady: (wafersCount: number) => void;
}

export const Stop3WaferWorkspace: React.FC<Stop3WaferWorkspaceProps> = ({
  cargo,
  onSubstepChange,
  onWaferBatchReady
}) => {
  const [substep, setSubstep] = useState<'pull' | 'slice' | 'polish'>('pull');

  // Substep 1: Ingot Pulling
  const [meltTemp, setMeltTemp] = useState<number>(1420); // ideal 1415-1425
  const [pullRate, setPullRate] = useState<number>(1.2); // ideal 1.0-1.4 mm/min
  const [ingotGrowth, setIngotGrowth] = useState<number>(0); // 0-100%
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [pullFailed, setPullFailed] = useState<string | null>(null);

  // Substep 2: Wire Slicing
  const [feedTension, setFeedTension] = useState<'loose' | 'optimal' | 'tight'>('optimal');
  const [sliceProgress, setSliceProgress] = useState<number>(0);
  const [isSlicing, setIsSlicing] = useState<boolean>(false);
  const [wafersProduced, setWafersProduced] = useState<number>(0);

  // Substep 3: CMP Polish & Inspection
  const [slurryFlow, setSlurryFlow] = useState<boolean>(true);
  const [polishTimeSeconds, setPolishTimeSeconds] = useState<number>(0);
  const [surfaceRoughnessNm, setSurfaceRoughnessNm] = useState<number>(12.4); // starts coarse, target < 0.2 nm
  const [inspectionPassed, setInspectionPassed] = useState<boolean>(false);

  // Notify parent of active substep to update 3D camera/model
  useEffect(() => {
    onSubstepChange(substep);
  }, [substep, onSubstepChange]);

  // Crystal growth simulation loop
  useEffect(() => {
    let timer: number;
    if (isPulling && ingotGrowth < 100) {
      sound.playCrystalHum();
      timer = window.setInterval(() => {
        // Temperature tolerance: 1410 to 1430. Outside that causes crystal dislocation.
        if (meltTemp < 1410) {
          setIsPulling(false);
          sound.playProbePing(false);
          setPullFailed('Temperature too cold: premature crystallization disrupted single-crystal lattice. Retry with heater balanced.');
          return;
        }
        if (meltTemp > 1430) {
          setIsPulling(false);
          sound.playProbePing(false);
          setPullFailed('Temperature too hot: seed crystal melted back into crucible liquid. Lower heat and retry.');
          return;
        }
        if (pullRate > 1.8) {
          setIsPulling(false);
          sound.playProbePing(false);
          setPullFailed('Pull rate too fast: ingot diameter necked down and severed. Maintain 1.0–1.4 mm/min.');
          return;
        }

        setIngotGrowth((prev) => {
          const next = Math.min(100, prev + 5);
          if (next >= 100) {
            setIsPulling(false);
            setPullFailed(null);
            sound.playSelect();
          }
          return next;
        });
      }, 180);
    }
    return () => clearInterval(timer);
  }, [isPulling, ingotGrowth, meltTemp, pullRate]);

  // Wire slicing simulation
  useEffect(() => {
    let timer: number;
    if (isSlicing && sliceProgress < 100) {
      sound.playClink();
      timer = window.setInterval(() => {
        setSliceProgress((prev) => {
          const next = Math.min(100, prev + 10);
          if (next >= 100) {
            setIsSlicing(false);
            setWafersProduced(25);
            sound.playSelect();
          }
          return next;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [isSlicing, sliceProgress]);

  // CMP polishing simulation
  const handleStartPolish = () => {
    sound.playSelect();
    let currentRa = 12.4;
    const interval = setInterval(() => {
      currentRa = Math.max(0.12, currentRa * 0.55);
      setSurfaceRoughnessNm(parseFloat(currentRa.toFixed(2)));
      setPolishTimeSeconds((s) => s + 1);

      if (currentRa <= 0.2) {
        clearInterval(interval);
        sound.playProbePing(true);
        setInspectionPassed(true);
        onWaferBatchReady(25);
      }
    }, 200);
  };

  return (
    <div className="space-y-4">
      {/* 3 Substeps Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-200 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setSubstep('pull')}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            substep === 'pull' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          1. Grow Crystal
        </button>
        <button
          onClick={() => {
            if (ingotGrowth >= 100) setSubstep('slice');
          }}
          disabled={ingotGrowth < 100}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            substep === 'slice'
              ? 'bg-white text-stone-900 shadow-xs'
              : ingotGrowth >= 100
              ? 'text-stone-600 hover:text-stone-900'
              : 'text-stone-400 cursor-not-allowed'
          }`}
        >
          2. Wire Slice
        </button>
        <button
          onClick={() => {
            if (wafersProduced > 0) setSubstep('polish');
          }}
          disabled={wafersProduced === 0}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            substep === 'polish'
              ? 'bg-white text-stone-900 shadow-xs'
              : wafersProduced > 0
              ? 'text-stone-600 hover:text-stone-900'
              : 'text-stone-400 cursor-not-allowed'
          }`}
        >
          3. CMP & Clean
        </button>
      </div>

      {/* SUBSTEP 1: CRYSTAL PULLING */}
      {substep === 'pull' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900">Czochralski Monocrystalline Ingot Puller</h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Input: {cargo.polysiliconBatchKg || 10} kg electronic-grade polysilicon melted in a quartz crucible at 1420°C.
            </p>
          </div>

          {/* Growth Visual Indicator */}
          <div className="bg-stone-900 p-3 rounded-xl text-white flex items-center gap-4">
            <div className="w-10 h-28 bg-stone-800 rounded-lg relative overflow-hidden border border-stone-700 flex flex-col justify-end">
              <div
                className="w-full bg-gradient-to-t from-stone-400 to-stone-200 transition-all duration-200"
                style={{ height: `${ingotGrowth}%` }}
              />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-stone-400">
                {ingotGrowth}%
              </div>
            </div>

            <div className="flex-1 space-y-2 font-mono text-[11px]">
              <div>
                <div className="flex justify-between text-stone-300">
                  <span>Melt Temperature:</span>
                  <span className={Math.abs(meltTemp - 1420) <= 8 ? 'text-emerald-400' : 'text-amber-400'}>
                    {meltTemp}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="1390"
                  max="1450"
                  value={meltTemp}
                  disabled={isPulling}
                  onChange={(e) => setMeltTemp(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-stone-300">
                  <span>Pull Rate:</span>
                  <span className={pullRate <= 1.4 ? 'text-emerald-400' : 'text-amber-400'}>
                    {pullRate.toFixed(1)} mm/min
                  </span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="2.2"
                  step="0.1"
                  value={pullRate}
                  disabled={isPulling}
                  onChange={(e) => setPullRate(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>
          </div>

          {pullFailed && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong>Lattice Flaw: </strong>
                {pullFailed}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPullFailed(null);
                setIsPulling(true);
              }}
              disabled={isPulling || ingotGrowth >= 100}
              className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
            >
              {ingotGrowth >= 100
                ? 'Monocrystalline Ingot Grown (Zero Dislocation) ✓'
                : isPulling
                ? 'Pulling Rotating Crystal...'
                : 'Start Seed Rotation & Pull'}
            </button>

            {pullFailed && (
              <button
                onClick={() => {
                  setIngotGrowth(0);
                  setMeltTemp(1420);
                  setPullRate(1.2);
                  setPullFailed(null);
                }}
                className="p-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg cursor-pointer"
                title="Reset crucible melt"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {ingotGrowth >= 100 && (
            <button
              onClick={() => setSubstep('slice')}
              className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <span>Advance to Step 2: Wire Slicing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* SUBSTEP 2: WIRE SLICING */}
      {substep === 'slice' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900">Multi-Wire Diamond Slurry Saw</h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Cut the solid cylindrical crystal into 300mm ultra-thin disc wafers without kerf loss warping.
            </p>
          </div>

          <div className="p-3 bg-stone-100 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-stone-700 font-mono text-[11px]">
              <span>Wire Guide Web Tension:</span>
              <div className="flex gap-1">
                {(['loose', 'optimal', 'tight'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFeedTension(t)}
                    disabled={isSlicing || wafersProduced > 0}
                    className={`px-2 py-0.5 rounded uppercase text-[10px] cursor-pointer ${
                      feedTension === t ? 'bg-stone-900 text-white font-bold' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-stone-800 h-full transition-all duration-150"
                style={{ width: `${sliceProgress}%` }}
              />
            </div>
            <div className="text-[11px] text-stone-500 font-mono text-right">
              {wafersProduced > 0 ? '25 wafers sliced' : `${sliceProgress}% sliced`}
            </div>
          </div>

          <button
            onClick={() => setIsSlicing(true)}
            disabled={isSlicing || wafersProduced > 0}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {wafersProduced > 0
              ? '25 Wafer Discs Sliced from Ingot ✓'
              : isSlicing
              ? 'Diamond Wire Web Slicing...'
              : 'Feed Ingot Through Wire Saw'}
          </button>

          {wafersProduced > 0 && (
            <button
              onClick={() => setSubstep('polish')}
              className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <span>Advance to Step 3: CMP Polish & Clean</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* SUBSTEP 3: CMP POLISH & SURFACE CLEAN */}
      {substep === 'polish' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900">Chemical-Mechanical Planarization (CMP)</h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Rotate wafer against silica slurry polishing pad. Target atomic surface flatness: roughness below 0.2 nm.
            </p>
          </div>

          <div className="p-3 bg-stone-900 text-white rounded-xl space-y-2 font-mono">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-stone-400">Surface Roughness ($R_a$):</span>
              <span className={surfaceRoughnessNm <= 0.2 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {surfaceRoughnessNm} nm
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-stone-400">Laser Reflection Inspection:</span>
              <span className={inspectionPassed ? 'text-emerald-400 font-bold' : 'text-stone-400'}>
                {inspectionPassed ? 'MIRROR FLAT (PASSED)' : 'HAZY / RAW'}
              </span>
            </div>

            <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(5, ((12.4 - surfaceRoughnessNm) / 12.2) * 100))}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleStartPolish}
            disabled={inspectionPassed}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {inspectionPassed
              ? 'Wafers Mirror-Polished & Cleaned (25 Output Units) ✓'
              : 'Engage CMP Polish Head & Deionized Wash'}
          </button>

          {inspectionPassed && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Inspection certified: 25 blank wafers ready for circuit printing in Taiwan!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
