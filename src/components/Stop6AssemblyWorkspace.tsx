import React, { useState } from 'react';
import { CargoState } from '../types/route';
import { CheckCircle2, ArrowRight, ShieldCheck, Cpu, Smartphone, Zap, Sliders } from 'lucide-react';
import { sound } from '../services/audio';

interface Stop6AssemblyWorkspaceProps {
  cargo: CargoState;
  onAssemblyCompleted: (phoneSerial: string) => void;
  onStepChange: (step: 'smt' | 'chassis' | 'diag') => void;
}

export const Stop6AssemblyWorkspace: React.FC<Stop6AssemblyWorkspaceProps> = ({
  cargo,
  onAssemblyCompleted,
  onStepChange
}) => {
  const [substep, setSubstep] = useState<'smt' | 'chassis' | 'diag'>('smt');

  // Substep 1: SMT Placement
  const [chipAligned, setChipAligned] = useState<boolean>(false);
  const [solderReflowed, setSolderReflowed] = useState<boolean>(false);

  // Substep 2: Chassis & Modules
  const [batteryConnected, setBatteryConnected] = useState<boolean>(false);
  const [displayConnected, setDisplayConnected] = useState<boolean>(false);
  const [chassisScrewed, setChassisScrewed] = useState<boolean>(false);

  // Substep 3: Factory Diagnostics
  const [powerRailPass, setPowerRailPass] = useState<boolean>(false);
  const [busCommsPass, setBusCommsPass] = useState<boolean>(false);
  const [displaySyncPass, setDisplaySyncPass] = useState<boolean>(false);
  const [diagnosticDone, setDiagnosticDone] = useState<boolean>(false);
  const [phoneSerial, setPhoneSerial] = useState<string>('PHONE-A18-8842');

  const handleReflow = () => {
    sound.playSelect();
    setChipAligned(true);
    setTimeout(() => {
      sound.playSelect();
      setSolderReflowed(true);
    }, 600);
  };

  const handleAssembleModules = () => {
    sound.playSelect();
    setBatteryConnected(true);
    setDisplayConnected(true);
    setTimeout(() => {
      sound.playSelect();
      setChassisScrewed(true);
    }, 500);
  };

  const handleRunDiagnostics = () => {
    sound.playProbePing(true);
    setPowerRailPass(true);
    setTimeout(() => {
      sound.playProbePing(true);
      setBusCommsPass(true);
      setTimeout(() => {
        sound.playProbePing(true);
        setDisplaySyncPass(true);
        setDiagnosticDone(true);
        onAssemblyCompleted(phoneSerial);
      }, 400);
    }, 400);
  };

  const changeSubstep = (step: 'smt' | 'chassis' | 'diag') => {
    sound.playSelect();
    setSubstep(step);
    onStepChange(step);
  };

  return (
    <div className="space-y-4">
      {/* Ready-made components notice per GUIDELINES Section 5 */}
      <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-[11px] text-stone-600">
        <strong className="text-stone-900 block font-sans">Ready-Made System Modules:</strong>
        Logic board PCB, flash memory, battery, camera module, and OLED display arrive pre-manufactured.
        Material transformed: <strong>1 released packaged chip ({cargo.selectedChipSerial ?? 'none yet: finish Malaysia'}) $\rightarrow$ 1 working phone</strong>.
      </div>

      {/* Substep tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-200 rounded-xl text-xs font-semibold">
        <button
          onClick={() => changeSubstep('smt')}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            substep === 'smt' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600'
          }`}
        >
          1. SMT Placement
        </button>
        <button
          onClick={() => {
            if (solderReflowed) changeSubstep('chassis');
          }}
          disabled={!solderReflowed}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            substep === 'chassis'
              ? 'bg-white text-stone-900 shadow-2xs font-bold'
              : solderReflowed
              ? 'text-stone-600'
              : 'text-stone-400 cursor-not-allowed'
          }`}
        >
          2. Chassis Assembly
        </button>
        <button
          onClick={() => {
            if (chassisScrewed) changeSubstep('diag');
          }}
          disabled={!chassisScrewed}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            substep === 'diag'
              ? 'bg-white text-stone-900 shadow-2xs font-bold'
              : chassisScrewed
              ? 'text-stone-600'
              : 'text-stone-400 cursor-not-allowed'
          }`}
        >
          3. Diagnostics
        </button>
      </div>

      {/* SUBSTEP 1: SMT CHIP MOUNTING */}
      {substep === 'smt' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900">Surface-Mount Technology (SMT) Placement</h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Mount your packaged chip onto the main printed circuit board logic motherboard.
            </p>
          </div>

          <div className="p-3 bg-stone-900 rounded-xl text-white font-mono text-[11px] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-stone-400">Target Socket:</span>
              <span className="text-amber-300 font-bold">Main CPU / SoC Footprint</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Incoming Chip Serial:</span>
              <span className="text-emerald-400 font-bold">{cargo.selectedChipSerial ?? 'none yet: finish Malaysia'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Solder Reflow Convection:</span>
              <span className={solderReflowed ? 'text-emerald-400 font-bold' : 'text-stone-400'}>
                {solderReflowed ? 'SOLIDIFIED (240°C CURE)' : 'READY'}
              </span>
            </div>
          </div>

          <button
            onClick={handleReflow}
            disabled={solderReflowed}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {solderReflowed
              ? 'Chip Soldered & Fixed to Motherboard ✓'
              : 'Align Chip & Reflow Solder'}
          </button>

          {solderReflowed && (
            <button
              onClick={() => changeSubstep('chassis')}
              className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <span>Board Complete ✓ Advance to Chassis Assembly</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* SUBSTEP 2: CHASSIS & MODULE INTEGRATION */}
      {substep === 'chassis' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900">Enclosure & Module Integration</h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Install the logic motherboard into the unibody chassis and attach ready-made modules.
            </p>
          </div>

          <div className="p-3 bg-stone-100 rounded-xl space-y-2 text-[11px]">
            <div className="flex justify-between items-center">
              <span>Battery Power Connector:</span>
              <span className={batteryConnected ? 'text-emerald-700 font-bold' : 'text-stone-500'}>
                {batteryConnected ? 'LOCKED' : 'PENDING'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>OLED Display Ribbon Cable:</span>
              <span className={displayConnected ? 'text-emerald-700 font-bold' : 'text-stone-500'}>
                {displayConnected ? 'SEATED' : 'PENDING'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Chassis Torque Fasteners:</span>
              <span className={chassisScrewed ? 'text-emerald-700 font-bold' : 'text-stone-500'}>
                {chassisScrewed ? 'SECURED (IP68 SEAL)' : 'PENDING'}
              </span>
            </div>
          </div>

          <button
            onClick={handleAssembleModules}
            disabled={chassisScrewed}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {chassisScrewed
              ? 'Modules Connected & Chassis Closed ✓'
              : 'Connect Modules & Fasten Chassis'}
          </button>

          {chassisScrewed && (
            <button
              onClick={() => changeSubstep('diag')}
              className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <span>Phone Assembled ✓ Advance to Factory Diagnostics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* SUBSTEP 3: FACTORY HARDWARE DIAGNOSTICS */}
      {substep === 'diag' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900">Automated Factory Quality Check</h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Boot system test firmware to verify chip bus communication and subsystem health.
            </p>
          </div>

          <div className="p-3 bg-stone-900 rounded-xl text-white font-mono text-[11px] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-stone-400">1. Power Rails Stability:</span>
              <span className={powerRailPass ? 'text-emerald-400 font-bold' : 'text-stone-400'}>
                {powerRailPass ? 'PASSED (0.85V Core / 1.8V I/O)' : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">2. Chip High-Speed Bus:</span>
              <span className={busCommsPass ? 'text-emerald-400 font-bold' : 'text-stone-400'}>
                {busCommsPass ? 'PASSED (Zero Bit Errors)' : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">3. Display Driver Sync:</span>
              <span className={displaySyncPass ? 'text-emerald-400 font-bold' : 'text-stone-400'}>
                {displaySyncPass ? 'PASSED (60 Hz OK)' : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-stone-800">
              <span className="text-stone-400">Phone Serial Number:</span>
              <span className="text-amber-300 font-bold">{phoneSerial}</span>
            </div>
          </div>

          <button
            onClick={handleRunDiagnostics}
            disabled={diagnosticDone}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {diagnosticDone
              ? `Phone ${phoneSerial} Operational & Ready for Delivery ✓`
              : 'Run Factory Hardware Diagnostics'}
          </button>

          {diagnosticDone && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full assembly certified! Packed into retail delivery box for the user.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
