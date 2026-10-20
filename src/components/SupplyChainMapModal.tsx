import React, { useState } from 'react';
import { JAPAN_COMPANIES, STAGES, StageId } from '../types/game';
import { X, MapPin, Building2, Globe2, ShieldAlert, Cpu, Sparkles, BookOpen, ExternalLink, ChevronRight } from 'lucide-react';
import { sound } from '../services/audio';

interface SupplyChainMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStage?: (stageId: StageId) => void;
}

export const SupplyChainMapModal: React.FC<SupplyChainMapModalProps> = ({
  isOpen,
  onClose,
  onSelectStage
}) => {
  const [selectedCompanyKey, setSelectedCompanyKey] = useState<string>('JASM');
  const [activeTab, setActiveTab] = useState<'map' | 'kyushu' | 'strategy' | 'glossary'>('map');

  if (!isOpen) return null;

  const currentCompany = JAPAN_COMPANIES[selectedCompanyKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fcfbf7] border border-amber-200/90 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-stone-900">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded tracking-widest uppercase">
                INTELLIGENCE BRIEFING
              </span>
              <span className="text-xs text-stone-500 font-serif italic">
                Checked 20 Oct 2026
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight mt-0.5">
              JAPAN&apos;S SEMICONDUCTOR SUPPLY CHAIN
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              Where Japan supplies the world — and where it still depends on it
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Pills */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-200/60 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => {
                  setActiveTab('map');
                  sound.playClick();
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'map' ? 'bg-white shadow-sm text-stone-900 font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Workflow & Infographic
              </button>
              <button
                onClick={() => {
                  setActiveTab('kyushu');
                  sound.playClick();
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'kyushu' ? 'bg-white shadow-sm text-stone-900 font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Kyushu &ldquo;Silicon Island&rdquo;
              </button>
              <button
                onClick={() => {
                  setActiveTab('strategy');
                  sound.playClick();
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'strategy' ? 'bg-white shadow-sm text-stone-900 font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                The Strategic Question
              </button>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 hover:bg-stone-200 text-stone-600 hover:text-stone-900 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Pills */}
        <div className="sm:hidden flex items-center justify-around border-b border-stone-200 bg-stone-100/60 p-2 text-xs">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2 py-1 rounded ${activeTab === 'map' ? 'bg-white font-bold text-stone-900 shadow-sm' : 'text-stone-600'}`}
          >
            Infographic
          </button>
          <button
            onClick={() => setActiveTab('kyushu')}
            className={`px-2 py-1 rounded ${activeTab === 'kyushu' ? 'bg-white font-bold text-stone-900 shadow-sm' : 'text-stone-600'}`}
          >
            Kyushu
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`px-2 py-1 rounded ${activeTab === 'strategy' ? 'bg-white font-bold text-stone-900 shadow-sm' : 'text-stone-600'}`}
          >
            Strategic Question
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: WORKFLOW & INFOGRAPHIC */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              {/* Reference Infographic Image Container */}
              <div className="bg-stone-900 rounded-2xl overflow-hidden shadow-lg border border-stone-800 relative group">
                <div className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-stone-900/90 text-stone-200 text-[11px] font-mono rounded-lg backdrop-blur-sm border border-stone-700">
                  Original Reference Infographic
                </div>
                <img
                  src="/assets/aistudio/japan-supply-chain-map-v2_a7109ee3.png"
                  alt="Japan Semiconductor Supply Chain Infographic"
                  className="w-full h-auto object-contain max-h-[500px] mx-auto select-none"
                />
              </div>

              {/* 5-Stage Interactive Explorer */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-3">
                  The Five End-to-End Stages (Click to Select)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {STAGES.map((s, idx) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        sound.playClick();
                        if (onSelectStage) {
                          onSelectStage(s.id);
                          onClose();
                        }
                      }}
                      className="p-3 bg-white hover:bg-amber-50/70 border border-stone-200 hover:border-amber-400 rounded-xl transition-all shadow-sm cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono font-bold text-red-600 mb-1">
                          <span>{s.stepNumber}</span>
                          <span className="text-[10px] text-stone-400 font-sans">Stage {idx + 1}</span>
                        </div>
                        <h4 className="font-bold text-stone-900 text-xs sm:text-[13px] leading-snug">
                          {s.title}
                        </h4>
                        <p className="text-[11px] text-stone-600 line-clamp-2 mt-1">
                          {s.subtitle}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-medium">
                        <span>Jump to Tool</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Company Profile Quick Selector */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-3">
                  Key Japanese Champions & Global Dependencies
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Object.keys(JAPAN_COMPANIES).map(key => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedCompanyKey(key);
                        sound.playClick();
                      }}
                      className={`px-3 py-1.5 text-xs rounded-xl border transition-all cursor-pointer ${
                        selectedCompanyKey === key
                          ? 'bg-red-600 text-white font-bold border-red-600 shadow-sm'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {key} {JAPAN_COMPANIES[key].isKyushuHub && '📍'}
                    </button>
                  ))}
                </div>

                {currentCompany && (
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-stone-900">{currentCompany.name}</h4>
                          {currentCompany.isKyushuHub && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 font-semibold rounded text-[10px]">
                              Kyushu Cluster
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-red-700 font-medium">{currentCompany.role}</p>
                      </div>
                      <div className="text-xs text-stone-500 flex items-center gap-1 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{currentCompany.locations}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl text-xs space-y-2">
                      <div>
                        <strong className="text-stone-800">Technological Specialty:</strong>
                        <p className="text-stone-600 mt-0.5">{currentCompany.specialty}</p>
                      </div>
                      <div className="pt-2 border-t border-stone-200">
                        <strong className="text-stone-800">Strategic Moat / Lock-in:</strong>
                        <p className="text-stone-600 mt-0.5">{currentCompany.strategicNote}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: KYUSHU CLOSE-UP */}
          {activeTab === 'kyushu' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                      REGIONAL INSET
                    </span>
                    <h3 className="text-xl font-serif font-bold text-stone-900 mt-1">
                      KYUSHU CLOSE-UP (&ldquo;Silicon Island&rdquo;)
                    </h3>
                    <p className="text-xs text-stone-600">
                      Japan&apos;s historic chip hub revitalized with next-generation 3nm foundry targets
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-mono font-bold">
                      JASM Fab 2 · 3nm Target 2028
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Kumamoto Pin */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                      <h4 className="font-bold text-stone-900 text-sm">Kumamoto Hub</h4>
                    </div>
                    <ul className="text-xs text-stone-700 space-y-2 pl-4 list-disc">
                      <li>
                        <strong>JASM (Japan Advanced Semiconductor Manufacturing)</strong> — TSMC / Sony / Denso joint venture foundry in Kikuyo. Fab 1 logic & Fab 2 planned for 3nm production target in 2028.
                      </li>
                      <li>
                        <strong>Sony Semiconductor Solutions</strong> — World leader in stacked CMOS image sensors powering smartphones & autonomous vehicles.
                      </li>
                      <li>
                        <strong>Tokyo Electron Kyushu (Koshi)</strong> — Global equipment engineering hub for coater/developers, wafer cleaning, and advanced 3D packaging systems.
                      </li>
                    </ul>
                  </div>

                  {/* Kagoshima / Kirishima Pin */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-600" />
                      <h4 className="font-bold text-stone-900 text-sm">Kagoshima / Kirishima Hub</h4>
                    </div>
                    <ul className="text-xs text-stone-700 space-y-2 pl-4 list-disc">
                      <li>
                        <strong>Kyocera (Kagoshima Kirishima Plant)</strong> — High-purity fine ceramics, electrostatic wafer chucks, and advanced semiconductor packaging components.
                      </li>
                      <li>
                        <strong>SUMCO (Imari & Saga)</strong> — Northern Kyushu wafer slicing and silicon polishing plants delivering 300mm substrate disks.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Global Interdependence Note */}
              <div className="p-5 bg-teal-50 border border-teal-200 rounded-2xl space-y-2 text-xs text-teal-950">
                <div className="flex items-center gap-2 text-teal-800 font-bold">
                  <Globe2 className="w-4 h-4" />
                  <span>GLOBAL INTERDEPENDENCE (Thin External Band)</span>
                </div>
                <p>
                  While Japan possesses unprecedented dominance in upstream materials (wafers, photoresists, ABF film) and specialized tooling (TEL, SCREEN, DISCO, Advantest), it depends on three crucial global partners:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  <div className="p-2.5 bg-white/80 rounded-xl border border-teal-200 font-medium">
                    <span className="text-teal-900 font-bold block">1. Customer Designs</span>
                    US / fabless chip designers (Apple, Nvidia, AMD, Qualcomm) defining system architectures.
                  </div>
                  <div className="p-2.5 bg-white/80 rounded-xl border border-teal-200 font-medium">
                    <span className="text-teal-900 font-bold block">2. ASML (Netherlands)</span>
                    Exclusive supplier of 13.5nm EUV scanners without which no 3nm fab can operate.
                  </div>
                  <div className="p-2.5 bg-white/80 rounded-xl border border-teal-200 font-medium">
                    <span className="text-teal-900 font-bold block">3. Overseas OSAT</span>
                    Taiwan & Southeast Asia assembly & packaging capacity balancing domestic production.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THE STRATEGIC QUESTION */}
          {activeTab === 'strategy' && (
            <div className="space-y-5">
              <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 space-y-4">
                <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-bold tracking-widest uppercase rounded">
                  ANALYSIS PANEL
                </span>
                <h3 className="text-2xl font-serif font-bold text-amber-200">
                  &ldquo;Who owns the qualified input, the process knowledge, and the customer relationship?&rdquo;
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  In semiconductor geopolitics, headline discussions often focus on where the fab building stands. But the actual balance of power resides in the invisible links of qualification, purity tolerance, and process lock-in.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2 text-xs">
                  <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>The Qualification Switching Risk</span>
                  </h4>
                  <p className="text-stone-600">
                    Why can&apos;t a fab switch photoresist suppliers from JSR or Shin-Etsu? Because qualifying a new photoresist formulation takes 9 to 18 months of wafer runs and millions of dollars in test scrap. Once qualified, the chemical recipe becomes an unalterable constant.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2 text-xs">
                  <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>The Accidental Monopolies (Ajinomoto ABF)</span>
                  </h4>
                  <p className="text-stone-600">
                    In the 1990s, Ajinomoto researcher Shigeo Mori recognized that their amino acid polymer insulating film could insulate micro-vias better than liquid resin. Today, ABF has near 100% market share in high-end CPU/GPU substrates—an irreplaceable input born from umami seasoning chemistry.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2 text-xs">
                  <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Capex vs Recurrent Inputs</span>
                  </h4>
                  <p className="text-stone-600">
                    Tools (ASML, TEL, SCREEN, DISCO) benefit from new-fab capex expansions. Consumables (SUMCO wafers, Shin-Etsu resists, Ajinomoto ABF films) recur with every single wafer start, providing sticky, recession-resistant operating cash flow.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2 text-xs">
                  <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-red-600" />
                    <span>The Kyushu Renaissance</span>
                  </h4>
                  <p className="text-stone-600">
                    TSMC&apos;s choice of Kumamoto for JASM is deliberate: Kyushu offers abundant groundwater (essential for wafer cleaning), reliable nuclear/green power, proximity to Sony and Tokyo Electron Kyushu, and deep institutional semiconductor memory.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between text-xs text-stone-500 font-mono">
          <span>Selected examples, not exhaustive. | Sources: SUMCO, TEL, SCREEN, ASML, DISCO, Advantest, Ajinomoto, IBIDEN.</span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-sans font-medium transition cursor-pointer"
          >
            Close Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
