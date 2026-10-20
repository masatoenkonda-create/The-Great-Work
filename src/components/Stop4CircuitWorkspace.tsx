import React, { useState } from 'react';
import { CargoState } from '../types/route';
import { CheckCircle2, AlertCircle, Layers, Zap, Crosshair, ArrowRight, ShieldCheck, Microscope } from 'lucide-react';
import { sound } from '../services/audio';

interface Stop4CircuitWorkspaceProps {
  cargo: CargoState;
  onProbeCompleted: (totalDies: number, goodDies: number) => void;
  onStepChange: (stepIdx: number) => void;
}

export const Stop4CircuitWorkspace: React.FC<Stop4CircuitWorkspaceProps> = ({
  cargo,
  onProbeCompleted,
  onStepChange
}) => {
  // Phase 1: The 6-step fabrication cycle
  // deposit -> coat -> expose -> bake/develop -> etch -> strip/clean
  const [cycleStep, setCycleStep] = useState<number>(0);
  const [reticleAligned, setReticleAligned] = useState<boolean>(false);
  const [reticleOffset, setReticleOffset] = useState<{ x: number; y: number }>({ x: 4, y: -3 });
  const [exposureFired, setExposureFired] = useState<boolean>(false);
  const [cycleCompleted, setCycleCompleted] = useState<boolean>(false);

  // Phase 2: Electrical Wafer Probe Testing
  const TOTAL_DIES = 48; // 6x8 grid
  const [probedMap, setProbedMap] = useState<Record<number, boolean>>({});
  const [isProbingActive, setIsProbingActive] = useState<boolean>(false);
  const [probeDone, setProbeDone] = useState<boolean>(false);

  const FAB_LOOP_STEPS = [
    { name: '1. Deposit film', desc: 'Grow an insulating silicon dioxide / dielectric layer across the blank wafer surface.' },
    { name: '2. Coat resist', desc: 'Spin-dispense light-sensitive chemical photoresist into a uniform, nanometer-thin film.' },
    { name: '3. Expose pattern', desc: 'Align the pre-made circuit mask reticle and flash high-intensity light to project circuits.' },
    { name: '4. Bake & develop', desc: 'Bake the wafer and apply chemical developer to wash away exposed photoresist areas.' },
    { name: '5. Etch trenches', desc: 'Strike an energized plasma gas to carve micro-trenches into the unprotected oxide layer.' },
    { name: '6. Strip & clean', desc: 'Strip remaining resist polymer and rinse clean with ultra-pure deionized water.' }
  ];

  const handleNextFabStep = () => {
    sound.playSelect();
    if (cycleStep < 5) {
      const next = cycleStep + 1;
      setCycleStep(next);
      onStepChange(next);
    } else {
      setCycleCompleted(true);
      onStepChange(6);
    }
  };

  // Align reticle
  const handleAutoAlign = () => {
    sound.playSelect();
    setReticleOffset({ x: 0, y: 0 });
    setReticleAligned(true);
  };

  const handleFireExposure = () => {
    sound.playExposure();
    setExposureFired(true);
    setTimeout(() => {
      setExposureFired(false);
      handleNextFabStep();
    }, 700);
  };

  // Automated probe testing
  const handleRunWaferProbe = () => {
    setIsProbingActive(true);
    let index = 0;
    const currentResults: Record<number, boolean> = {};

    const interval = setInterval(() => {
      // Determine defect: 4 specific edge perimeter dies fail
      const isDefectDie = index === 0 || index === 7 || index === 40 || index === 47;
      sound.playProbePing(!isDefectDie);
      currentResults[index] = !isDefectDie;
      setProbedMap({ ...currentResults });

      index++;
      if (index >= TOTAL_DIES) {
        clearInterval(interval);
        setIsProbingActive(false);
        setProbeDone(true);
        sound.playSelect();
        const good = Object.values(currentResults).filter(Boolean).length;
        onProbeCompleted(TOTAL_DIES, good);
      }
    }, 45);
  };

  const goodCount = Object.values(probedMap).filter(Boolean).length;
  const testedCount = Object.keys(probedMap).length;

  return (
    <div className="space-y-4">
      {/* Ready-made inputs arrival note as mandated by GUIDELINES.md Section 5 */}
      <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-[11px] text-stone-600">
        <strong className="text-stone-900 block font-sans">Cleanroom Pre-Conditions:</strong>
        Circuit mask designs, lithography tools, process gases, and ultra-pure water were designed and qualified in advance. Material transformed: <strong>{cargo.wafersProducedCount || 25} blank wafers</strong>.
      </div>

      {/* PHASE 1: THE 6-STEP CYCLE */}
      {!cycleCompleted ? (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-stone-900">
              The Patterning Cycle: Step {cycleStep + 1} of 6
            </span>
            <span className="text-[10px] text-stone-500 font-mono">
              Representative Loop
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-red-700 h-full transition-all duration-300"
              style={{ width: `${((cycleStep + 1) / 6) * 100}%` }}
            />
          </div>

          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
            <div className="font-semibold text-stone-900">
              {FAB_LOOP_STEPS[cycleStep].name}
            </div>
            <p className="text-stone-600 text-[11px] mt-0.5">
              {FAB_LOOP_STEPS[cycleStep].desc}
            </p>
          </div>

          {/* Interactive Exposure Alignment Sub-task */}
          {cycleStep === 2 && (
            <div className="p-4 bg-stone-950 rounded-xl text-white space-y-3">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-stone-400">Mask Overlay Alignment:</span>
                <span className={reticleAligned ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {reticleAligned ? 'ALIGNED (Δ < 0.5 nm)' : `OFFSET: X=${reticleOffset.x}nm, Y=${reticleOffset.y}nm`}
                </span>
              </div>

              {/* Crosshair Viewfinder */}
              <div className="h-28 border border-stone-700 rounded-lg relative flex items-center justify-center overflow-hidden bg-stone-900">
                <div className="absolute inset-x-0 top-1/2 h-px bg-stone-600" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-stone-600" />

                {/* Target box */}
                <div className="w-8 h-8 border border-dashed border-stone-500 rounded" />

                {/* Moving reticle */}
                <div
                  className={`w-6 h-6 border-2 transition-all duration-300 flex items-center justify-center ${
                    exposureFired
                      ? 'border-white bg-blue-400 scale-125'
                      : reticleAligned
                      ? 'border-emerald-400 bg-emerald-500/20'
                      : 'border-amber-400'
                  }`}
                  style={{
                    transform: `translate(${reticleOffset.x * 6}px, ${reticleOffset.y * 6}px)`
                  }}
                >
                  <Crosshair className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAutoAlign}
                  disabled={reticleAligned}
                  className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 disabled:bg-stone-800/50 text-stone-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  {reticleAligned ? 'Mask Aligned ✓' : 'Auto-Align Laser Reticle'}
                </button>
                <button
                  onClick={handleFireExposure}
                  disabled={!reticleAligned || exposureFired}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Expose Light Pulse</span>
                </button>
              </div>
            </div>
          )}

          {cycleStep !== 2 && (
            <button
              onClick={handleNextFabStep}
              className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg transition cursor-pointer text-xs"
            >
              {cycleStep === 5 ? 'Complete Fabrication Loop & Move to Testing' : 'Execute Step & Observe Layer'}
            </button>
          )}

          <div className="text-[10px] text-stone-400 text-center font-mono">
            * Note: A production fab repeats dozens of mask cycles to build multilayer transistors and wiring.
          </div>
        </div>
      ) : (
        /* PHASE 2: ELECTRICAL WAFER PROBE TESTING */
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Microscope className="w-4 h-4 text-stone-700" />
              <span>Advantest Electrical Wafer Probe Testing</span>
            </h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Tungsten micro-probe card needles contact each die to test electrical logic circuits.
            </p>
          </div>

          {/* Interactive 48-Die Grid Map */}
          <div className="p-4 bg-stone-950 rounded-xl flex flex-col items-center">
            <div className="grid grid-cols-8 gap-1 p-2 bg-stone-900 rounded-lg border border-stone-800">
              {Array.from({ length: TOTAL_DIES }).map((_, idx) => {
                const status = probedMap[idx];
                return (
                  <div
                    key={idx}
                    className={`w-5 h-5 rounded-xs flex items-center justify-center text-[8px] font-mono font-bold transition-all ${
                      status === undefined
                        ? 'bg-stone-800 text-stone-600'
                        : status
                        ? 'bg-emerald-500 text-stone-950'
                        : 'bg-red-500 text-white'
                    }`}
                    title={`Die #${idx + 1}: ${status === undefined ? 'Untested' : status ? 'PASS' : 'FAIL (Defect)'}`}
                  >
                    {status === undefined ? '' : status ? '✓' : '✗'}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between w-full mt-3 text-[11px] font-mono text-stone-300 px-2">
              <span>Tested: {testedCount}/{TOTAL_DIES}</span>
              <span className="text-emerald-400">Pass: {goodCount}</span>
              <span className="text-red-400">Defects: {testedCount - goodCount}</span>
              <span className="text-amber-300">
                Yield: {testedCount > 0 ? `${Math.round((goodCount / testedCount) * 100)}%` : '--'}
              </span>
            </div>
          </div>

          <button
            onClick={handleRunWaferProbe}
            disabled={isProbingActive || probeDone}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer text-xs"
          >
            {probeDone
              ? 'Wafer Tested & Good/Bad Die Map Released (44 Good Dies) ✓'
              : isProbingActive
              ? 'Sweeping Electrical Probes Across Dies...'
              : 'Execute Automated Wafer Probe Test'}
          </button>

          {probeDone && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Electronic Die Sorting (EDS) complete. Tested wafer ready for dicing and packaging in Malaysia!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
