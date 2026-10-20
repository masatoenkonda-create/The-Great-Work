import React, { useState } from 'react';
import { CargoState } from '../types/route';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Scissors, Cpu, Zap, Microscope } from 'lucide-react';
import { sound } from '../services/audio';

interface Stop5PackagingWorkspaceProps {
  cargo: CargoState;
  onPackagingCompleted: (chipSerial: string) => void;
  onStepChange: (step: 'dice' | 'attach' | 'wire' | 'mold' | 'test') => void;
}

export const Stop5PackagingWorkspace: React.FC<Stop5PackagingWorkspaceProps> = ({
  cargo,
  onPackagingCompleted,
  onStepChange
}) => {
  const [activeStep, setActiveStep] = useState<'dice' | 'attach' | 'wire' | 'mold' | 'test'>('dice');

  // Substep 1: Scribe line dicing
  const [horizontalCuts, setHorizontalCuts] = useState<number>(0); // 4 needed
  const [verticalCuts, setVerticalCuts] = useState<number>(0);     // 6 needed
  const [isDiced, setIsDiced] = useState<boolean>(false);

  // Substep 2: Pick good die
  const [selectedDieIndex, setSelectedDieIndex] = useState<number | null>(null);
  const [diePicked, setDiePicked] = useState<boolean>(false);
  const [pickError, setPickError] = useState<string | null>(null);

  // Substep 3: Wire bonding
  const [wiresBonded, setWiresBonded] = useState<number>(0); // 8 micro-wires
  const [isWireBonding, setIsWireBonding] = useState<boolean>(false);

  // Substep 4: Epoxy encapsulation
  const [resinInjected, setResinInjected] = useState<boolean>(false);
  const [moldCured, setMoldCured] = useState<boolean>(false);

  // Substep 5: Final electrical test
  const [clockSpeedPass, setClockSpeedPass] = useState<boolean>(false);
  const [thermalCyclePass, setThermalCyclePass] = useState<boolean>(false);
  const [testComplete, setTestComplete] = useState<boolean>(false);
  const [assignedSerial, setAssignedSerial] = useState<string>('CHIP-LOT26-D28');

  const handleCut = (axis: 'h' | 'v') => {
    sound.playClink();
    if (axis === 'h') {
      const next = Math.min(4, horizontalCuts + 1);
      setHorizontalCuts(next);
      if (next === 4 && verticalCuts === 6) {
        setIsDiced(true);
        sound.playSelect();
      }
    } else {
      const next = Math.min(6, verticalCuts + 1);
      setVerticalCuts(next);
      if (horizontalCuts === 4 && next === 6) {
        setIsDiced(true);
        sound.playSelect();
      }
    }
  };

  const handleSelectDie = (dieIndex: number) => {
    // Indices 0, 7, 40, 47 are defective edge dies identified in Stop 4
    if (dieIndex === 0 || dieIndex === 7 || dieIndex === 40 || dieIndex === 47) {
      sound.playProbePing(false);
      setPickError(`Die #${dieIndex + 1} was marked DEFECTIVE during Taiwan wafer probe. You must pick a verified good die.`);
      return;
    }
    sound.playSelect();
    setPickError(null);
    setSelectedDieIndex(dieIndex);
    setAssignedSerial(`CHIP-LOT26-D${dieIndex + 1}`);
    setDiePicked(true);
  };

  const handleRunWireBonding = () => {
    setIsWireBonding(true);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      sound.playSelect();
      setWiresBonded(count);
      if (count >= 8) {
        clearInterval(interval);
        setIsWireBonding(false);
      }
    }, 120);
  };

  const handleInjectMold = () => {
    sound.playBubble();
    setResinInjected(true);
    setTimeout(() => {
      sound.playSelect();
      setMoldCured(true);
    }, 700);
  };

  const handleFinalTest = () => {
    sound.playProbePing(true);
    setClockSpeedPass(true);
    setTimeout(() => {
      sound.playProbePing(true);
      setThermalCyclePass(true);
      setTestComplete(true);
      onPackagingCompleted(assignedSerial);
    }, 600);
  };

  const changeSubstep = (step: 'dice' | 'attach' | 'wire' | 'mold' | 'test') => {
    sound.playSelect();
    setActiveStep(step);
    onStepChange(step);
  };

  return (
    <div className="space-y-4">
      {/* Ready-made packaging supplies notice per GUIDELINES Section 5 */}
      <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-[11px] text-stone-600">
        <strong className="text-stone-900 block font-sans">Ready-Made Packaging Materials:</strong>
        Package substrate carriers, gold bonding wire, and epoxy resin mold compound arrive pre-manufactured.
        Material transformed: <strong>Tested wafer ({cargo.goodDiesCount || 44} good dies) $\rightarrow$ 1 released packaged chip</strong>.
      </div>

      {/* 5 Substep Navigation Pills */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-stone-200 rounded-xl text-[10px] font-semibold">
        <button
          onClick={() => changeSubstep('dice')}
          className={`py-1 rounded-md transition cursor-pointer ${
            activeStep === 'dice' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600'
          }`}
        >
          1. Dice
        </button>
        <button
          onClick={() => {
            if (isDiced) changeSubstep('attach');
          }}
          disabled={!isDiced}
          className={`py-1 rounded-md transition cursor-pointer ${
            activeStep === 'attach'
              ? 'bg-white text-stone-900 shadow-2xs font-bold'
              : isDiced
              ? 'text-stone-600'
              : 'text-stone-400 cursor-not-allowed'
          }`}
        >
          2. Pick Die
        </button>
        <button
          onClick={() => {
            if (diePicked) changeSubstep('wire');
          }}
          disabled={!diePicked}
          className={`py-1 rounded-md transition cursor-pointer ${
            activeStep === 'wire'
              ? 'bg-white text-stone-900 shadow-2xs font-bold'
              : diePicked
              ? 'text-stone-600'
              : 'text-stone-400 cursor-not-allowed'
          }`}
        >
          3. Bond
        </button>
        <button
          onClick={() => {
            if (wiresBonded >= 8) changeSubstep('mold');
          }}
          disabled={wiresBonded < 8}
          className={`py-1 rounded-md transition cursor-pointer ${
            activeStep === 'mold'
              ? 'bg-white text-stone-900 shadow-2xs font-bold'
              : wiresBonded >= 8
              ? 'text-stone-600'
              : 'text-stone-400 cursor-not-allowed'
          }`}
        >
          4. Encapsulate
        </button>
        <button
          onClick={() => {
            if (moldCured) changeSubstep('test');
          }}
          disabled={!moldCured}
          className={`py-1 rounded-md transition cursor-pointer ${
            activeStep === 'test'
              ? 'bg-white text-stone-900 shadow-2xs font-bold'
              : moldCured
              ? 'text-stone-600'
              : 'text-stone-400 cursor-not-allowed'
          }`}
        >
          5. Final Test
        </button>
      </div>

      {/* STEP 1: WAFER DICING */}
      {activeStep === 'dice' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900">Diamond Scribe Street Dicing</h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              High-speed rotating diamond saw cuts along narrow grid alleys (scribe streets) separating all dies.
            </p>
          </div>

          <div className="p-3 bg-stone-900 rounded-xl text-white space-y-2 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-stone-400">Horizontal Cuts:</span>
              <span className="text-cyan-400 font-bold">{horizontalCuts} / 4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Vertical Cuts:</span>
              <span className="text-cyan-400 font-bold">{verticalCuts} / 6</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleCut('h')}
              disabled={horizontalCuts >= 4}
              className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:text-stone-500 text-white font-bold rounded-lg transition cursor-pointer"
            >
              Cut Horizontal Scribe
            </button>
            <button
              onClick={() => handleCut('v')}
              disabled={verticalCuts >= 6}
              className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:text-stone-500 text-white font-bold rounded-lg transition cursor-pointer"
            >
              Cut Vertical Scribe
            </button>
          </div>

          {isDiced && (
            <button
              onClick={() => changeSubstep('attach')}
              className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <span>Wafer Diced ✓ Advance to Pick Good Die</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* STEP 2: DIE PICK & ATTACH */}
      {activeStep === 'attach' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900">Vacuum Collet Die Pick-and-Place</h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Select one verified functional die from the tested map to mount onto the package substrate carrier.
            </p>
          </div>

          {/* Die Selection Array */}
          <div className="p-3 bg-stone-950 rounded-xl flex flex-col items-center">
            <div className="grid grid-cols-8 gap-1 p-2 bg-stone-900 rounded-lg">
              {Array.from({ length: 48 }).map((_, idx) => {
                const isDefect = idx === 0 || idx === 7 || idx === 40 || idx === 47;
                const isSelected = selectedDieIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectDie(idx)}
                    className={`w-5 h-5 rounded-xs flex items-center justify-center text-[8px] font-mono font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-stone-950 ring-2 ring-white scale-110 z-10'
                        : isDefect
                        ? 'bg-red-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                    title={`Die #${idx + 1} (${isDefect ? 'DEFECT' : 'GOOD'})`}
                  >
                    {isDefect ? '✗' : idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="text-[10px] text-stone-400 font-mono mt-2">
              Green = Verified Good Dies · Red = Defective Edge Dies
            </div>
          </div>

          {pickError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{pickError}</span>
            </div>
          )}

          {diePicked && (
            <button
              onClick={() => changeSubstep('wire')}
              className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <span>Die #{selectedDieIndex! + 1} Attached to Carrier ✓ Advance to Wire Bonding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* STEP 3: WIRE BONDING */}
      {activeStep === 'wire' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900">Ultrasonic Ball-Wedge Wire Bonding</h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Connect microscopic gold/copper wires from the die pads to the package carrier contact leads.
            </p>
          </div>

          <div className="p-3 bg-stone-900 rounded-xl text-white font-mono text-[11px] space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-400">Interconnect Wires Bonded:</span>
              <span className="text-amber-400 font-bold">{wiresBonded} / 8 Wires</span>
            </div>
            <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-150"
                style={{ width: `${(wiresBonded / 8) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleRunWireBonding}
            disabled={isWireBonding || wiresBonded >= 8}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {wiresBonded >= 8
              ? 'All 8 Microscopic Wire Interconnects Fused ✓'
              : isWireBonding
              ? 'Bonding Micro-Wires with Ultrasonic Capillary...'
              : 'Engage Ultrasonic Wire Bonder'}
          </button>

          {wiresBonded >= 8 && (
            <button
              onClick={() => changeSubstep('mold')}
              className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <span>Interconnects Complete ✓ Advance to Encapsulation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* STEP 4: ENCAPSULATION & MOLDING */}
      {activeStep === 'mold' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900">Epoxy Molding Compound (EMC) Transfer</h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Inject protective thermoset resin over the die and wires to seal against moisture, shock, and oxidation.
            </p>
          </div>

          <div className="p-3 bg-stone-100 rounded-xl text-[11px] font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-600">Cavity Mold Status:</span>
              <span className="font-bold text-stone-900">
                {moldCured ? 'THERMOSET CURED (HERMETIC SEAL)' : resinInjected ? 'INJECTING RESIN...' : 'READY FOR TRANSFER'}
              </span>
            </div>
          </div>

          <button
            onClick={handleInjectMold}
            disabled={moldCured}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {moldCured
              ? 'Packaged Chip Hermetically Encapsulated ✓'
              : 'Inject Epoxy Mold & Heat Cure'}
          </button>

          {moldCured && (
            <button
              onClick={() => changeSubstep('test')}
              className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <span>Package Cured ✓ Advance to Final Electrical Test</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* STEP 5: FINAL ELECTRICAL TEST */}
      {activeStep === 'test' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900">Automated Test Equipment (ATE) Package Test</h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Insert packaged chip into test socket to verify contact resistance, clock frequency, and thermal stability.
            </p>
          </div>

          <div className="p-3 bg-stone-900 rounded-xl text-white font-mono text-[11px] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-stone-400">Clock Signal Sweep:</span>
              <span className={clockSpeedPass ? 'text-emerald-400 font-bold' : 'text-stone-400'}>
                {clockSpeedPass ? 'PASSED (Frequency Lock OK)' : 'Awaiting Test'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Thermal Shock Burn-In:</span>
              <span className={thermalCyclePass ? 'text-emerald-400 font-bold' : 'text-stone-400'}>
                {thermalCyclePass ? 'PASSED (Zero Delamination)' : 'Awaiting Test'}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-stone-800">
              <span className="text-stone-400">Assigned Serial:</span>
              <span className="text-amber-300 font-bold">{assignedSerial}</span>
            </div>
          </div>

          <button
            onClick={handleFinalTest}
            disabled={testComplete}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {testComplete
              ? `Chip ${assignedSerial} Released for Board Assembly ✓`
              : 'Run Final Electrical Test & Binning'}
          </button>

          {testComplete && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Chip certified and released. Ready for shipment to China mainland for smartphone assembly!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
