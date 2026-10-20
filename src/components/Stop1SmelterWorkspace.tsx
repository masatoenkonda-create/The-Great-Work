import React, { useState } from 'react';
import { CargoState } from '../types/route';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Flame, Pickaxe, Sliders } from 'lucide-react';
import { sound } from '../services/audio';

interface Stop1SmelterWorkspaceProps {
  cargo: CargoState;
  onSmeltingCompleted: (siliconBatchKg: number) => void;
  onStepChange: (step: 'sort' | 'smelt' | 'tap') => void;
}

export const Stop1SmelterWorkspace: React.FC<Stop1SmelterWorkspaceProps> = ({
  cargo,
  onSmeltingCompleted,
  onStepChange
}) => {
  const [substep, setSubstep] = useState<'sort' | 'smelt' | 'tap'>('sort');

  // Substep 1: Rock sorting (6 rock candidates: 4 pure quartz, 2 slate/granite impurity)
  const initialRocks = [
    { id: 1, type: 'quartz', color: '#f8fafc', label: 'Milky Quartz', isPure: true, selected: false },
    { id: 2, type: 'slate', color: '#475569', label: 'Dark Slate', isPure: false, selected: false },
    { id: 3, type: 'quartz', color: '#f1f5f9', label: 'Vein Quartz', isPure: true, selected: false },
    { id: 4, type: 'granite', color: '#94a3b8', label: 'Feldspar Granite', isPure: false, selected: false },
    { id: 5, type: 'quartz', color: '#ffffff', label: 'Crystalline Quartz', isPure: true, selected: false },
    { id: 6, type: 'quartz', color: '#f8fafc', label: 'Quartzite Lump', isPure: true, selected: false }
  ];
  const [rocks, setRocks] = useState(initialRocks);
  const [sortError, setSortError] = useState<string | null>(null);
  const [sortDone, setSortDone] = useState<boolean>(false);

  // Substep 2: Submerged-arc electric furnace
  const [carbonRatio, setCarbonRatio] = useState<number>(50); // 50 is stoichiometric balance
  const [arcPowerMw, setArcPowerMw] = useState<number>(18);   // 16-20 MW optimal (over 1900 C)
  const [isSmelting, setIsSmelting] = useState<boolean>(false);
  const [smeltProgress, setSmeltProgress] = useState<number>(0);
  const [smeltError, setSmeltError] = useState<string | null>(null);
  const [smeltSuccessful, setSmeltSuccessful] = useState<boolean>(false);

  // Substep 3: Tapping molten silicon
  const [tapped, setTapped] = useState<boolean>(false);
  const [batchWeightKg, setBatchWeightKg] = useState<number>(12);

  const handleToggleRock = (id: number) => {
    sound.playClink();
    setRocks(prev =>
      prev.map(r => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleValidateSort = () => {
    const selected = rocks.filter(r => r.selected);
    const hasImpure = selected.some(r => !r.isPure);
    const quartzCount = selected.filter(r => r.isPure).length;

    if (hasImpure) {
      sound.playProbePing(false);
      setSortError('Incompatible rock selected: slate/granite contains excess iron and alumina. Pick only high-silica quartz rocks.');
      return;
    }
    if (quartzCount < 3) {
      sound.playProbePing(false);
      setSortError('Insufficient quartz collected: select at least 3 pure quartz lumps to charge the furnace.');
      return;
    }

    sound.playSelect();
    setSortError(null);
    setSortDone(true);
  };

  const handleRunSmelt = () => {
    if (carbonRatio < 40) {
      sound.playProbePing(false);
      setSmeltError('Feed under-reduced: insufficient carbon. Unreduced quartz forms molten silica slag.');
      return;
    }
    if (carbonRatio > 60) {
      sound.playProbePing(false);
      setSmeltError('Excess carbon: carbon reacted with silicon to form hard silicon carbide (SiC) crust, freezing furnace tap.');
      return;
    }
    if (arcPowerMw < 16) {
      sound.playProbePing(false);
      setSmeltError('Furnace temperature below 1800°C: quartz cannot reduce. Increase electrode electric arc power.');
      return;
    }

    sound.playCrystalHum();
    setSmeltError(null);
    setIsSmelting(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setSmeltProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsSmelting(false);
        setSmeltSuccessful(true);
        sound.playSelect();
      }
    }, 180);
  };

  const handleTapSilicon = () => {
    sound.playSelect();
    setTapped(true);
    onSmeltingCompleted(batchWeightKg);
  };

  const changeSubstep = (step: 'sort' | 'smelt' | 'tap') => {
    sound.playSelect();
    setSubstep(step);
    onStepChange(step);
  };

  return (
    <div className="space-y-4">
      {/* Sourced Context Notice */}
      <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-[11px] text-stone-600">
        <strong className="text-stone-900 block font-sans">Elkem Norway Example (R03):</strong>
        Quartzite quarry feed + carbon reducer (coal/woodchips) smelted in submerged-arc electric furnaces at &gt;1900°C to release oxygen as CO gas.
        Output: <strong>Metallurgical-grade silicon metal (approx. 98–99% pure)</strong>.
      </div>

      {/* Substep tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-200 rounded-xl text-xs font-semibold">
        <button
          onClick={() => changeSubstep('sort')}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            substep === 'sort' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600'
          }`}
        >
          1. Sort Feed
        </button>
        <button
          onClick={() => {
            if (sortDone) changeSubstep('smelt');
          }}
          disabled={!sortDone}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            substep === 'smelt'
              ? 'bg-white text-stone-900 shadow-2xs font-bold'
              : sortDone
              ? 'text-stone-600'
              : 'text-stone-400 cursor-not-allowed'
          }`}
        >
          2. Arc Smelter
        </button>
        <button
          onClick={() => {
            if (smeltSuccessful) changeSubstep('tap');
          }}
          disabled={!smeltSuccessful}
          className={`py-1.5 rounded-lg transition cursor-pointer ${
            substep === 'tap'
              ? 'bg-white text-stone-900 shadow-2xs font-bold'
              : smeltSuccessful
              ? 'text-stone-600'
              : 'text-stone-400 cursor-not-allowed'
          }`}
        >
          3. Tap Silicon
        </button>
      </div>

      {/* SUBSTEP 1: FEED SORTING */}
      {substep === 'sort' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Pickaxe className="w-4 h-4 text-stone-700" />
              <span>Collect & Sort Quartz Rock Feed</span>
            </h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Select high-purity white/vein quartz rocks from the quarry. Deselect dark iron-bearing rocks.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {rocks.map((rock) => (
              <button
                key={rock.id}
                onClick={() => handleToggleRock(rock.id)}
                disabled={sortDone}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  rock.selected
                    ? 'border-stone-900 bg-stone-100 ring-2 ring-stone-900/10'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full border border-stone-300 shadow-2xs"
                  style={{ backgroundColor: rock.color }}
                />
                <span className="font-semibold text-stone-800 text-[10px] leading-tight">
                  {rock.label}
                </span>
                <span className={`text-[9px] font-mono ${rock.selected ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                  {rock.selected ? 'Selected ✓' : 'Tap to Pick'}
                </span>
              </button>
            ))}
          </div>

          {sortError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{sortError}</span>
            </div>
          )}

          <button
            onClick={handleValidateSort}
            disabled={sortDone}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {sortDone ? 'High-Silica Quartz Batch Approved ✓' : 'Verify & Charge Feed'}
          </button>

          {sortDone && (
            <button
              onClick={() => changeSubstep('smelt')}
              className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <span>Feed Verified ✓ Advance to Submerged Arc Furnace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="text-[10px] text-stone-400 font-mono text-center">
            * Note: In game, rocks are sorted visually; in real industry, X-ray fluorescence assays verify elemental composition.
          </div>
        </div>
      )}

      {/* SUBSTEP 2: SUBMERGED ARC SMELTING */}
      {substep === 'smelt' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-600" />
              <span>Submerged-Arc Electric Furnace (1900°C)</span>
            </h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Carbothermic reduction: SiO2 + 2C reduces to Si + 2CO (gas).
            </p>
          </div>

          <div className="p-3 bg-stone-900 rounded-xl text-white font-mono text-[11px] space-y-3">
            <div>
              <div className="flex justify-between text-stone-300">
                <span>Carbon Reducer Ratio:</span>
                <span className={Math.abs(carbonRatio - 50) <= 6 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {carbonRatio}% (Target: 50% Stoichiometric)
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="70"
                value={carbonRatio}
                disabled={isSmelting || smeltSuccessful}
                onChange={(e) => setCarbonRatio(Number(e.target.value))}
                className="w-full accent-amber-500 mt-1"
              />
            </div>

            <div>
              <div className="flex justify-between text-stone-300">
                <span>Electrode Power:</span>
                <span className={arcPowerMw >= 16 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {arcPowerMw} MW (1950°C Arc)
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="24"
                value={arcPowerMw}
                disabled={isSmelting || smeltSuccessful}
                onChange={(e) => setArcPowerMw(Number(e.target.value))}
                className="w-full accent-amber-500 mt-1"
              />
            </div>

            <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-orange-500 h-full transition-all duration-150"
                style={{ width: `${smeltProgress}%` }}
              />
            </div>
          </div>

          {smeltError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{smeltError}</span>
            </div>
          )}

          <button
            onClick={handleRunSmelt}
            disabled={isSmelting || smeltSuccessful}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {smeltSuccessful
              ? 'Reduction Complete (Liquid Silicon Pool Ready) ✓'
              : isSmelting
              ? 'Electric Arc Smelting in Progress...'
              : 'Strike Arc & Smelt Charge'}
          </button>

          {smeltSuccessful && (
            <button
              onClick={() => changeSubstep('tap')}
              className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              <span>Smelt Ready ✓ Advance to Tap Liquid Silicon</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* SUBSTEP 3: TAPPING SILICON METAL */}
      {substep === 'tap' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200 text-xs">
          <div>
            <h4 className="font-bold text-stone-900">Tap Furnace & Cast Ingot Slab</h4>
            <p className="text-stone-600 text-[11px] mt-0.5">
              Open the taphole to drain molten silicon at 1500°C into refractory ladles for casting.
            </p>
          </div>

          <div className="p-3 bg-stone-900 rounded-xl text-white font-mono text-[11px] space-y-1.5">
            <div className="flex justify-between">
              <span className="text-stone-400">Tapped Liquid Silicon:</span>
              <span className="text-amber-400 font-bold">{batchWeightKg} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Assayed Silicon Content:</span>
              <span className="text-emerald-400 font-bold">98.8% Si (Metallurgical-Grade)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Residual Trace:</span>
              <span className="text-stone-400">Fe &lt; 0.5%, Al &lt; 0.4%, Ca &lt; 0.2%</span>
            </div>
          </div>

          <button
            onClick={handleTapSilicon}
            disabled={tapped}
            className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer"
          >
            {tapped
              ? `${batchWeightKg} kg Silicon Metal Tapped & Solidified ✓`
              : 'Open Taphole & Pour Silicon Metal'}
          </button>

          {tapped && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Silicon metal slab certified. Ready for chemical purification into electronic-grade polysilicon in Germany!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
