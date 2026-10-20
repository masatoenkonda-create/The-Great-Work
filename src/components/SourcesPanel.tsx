import React from 'react';
import { SOURCES_REGISTER } from '../types/route';
import { X, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

interface SourcesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs select-none">
      <div className="bg-[#fcfbf7] border border-stone-300 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden text-stone-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-stone-800 text-white text-[10px] font-bold rounded">
                SOURCES & LIMITS
              </span>
              <span className="text-xs text-stone-500 font-mono">
                Checked October 2026
              </span>
            </div>
            <h2 className="text-lg font-bold text-stone-900 mt-0.5">
              Evidence Register (SOURCES.md)
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-200 text-stone-600 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
            <strong>Active build scope notice:</strong> The selected country sequence (Norway $\rightarrow$ Germany $\rightarrow$ Japan $\rightarrow$ Taiwan $\rightarrow$ Malaysia $\rightarrow$ China mainland $\rightarrow$ User) is an educational scenario assembled from verified industrial activities. None of these records proves that these specific facilities supply an actual iPhone model.
          </div>

          <div className="space-y-3">
            {SOURCES_REGISTER.map((src) => (
              <div key={src.id} className="p-4 bg-white border border-stone-200 rounded-xl shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-red-700">{src.id} — {src.title}</span>
                  <span className="text-stone-500 font-mono text-[11px]">{src.publisher}</span>
                </div>
                <div className="text-stone-700">
                  <strong className="text-stone-900">Supported: </strong>
                  {src.supportedFacts}
                </div>
                <div className="text-stone-500 text-[11px] pt-1 border-t border-stone-100">
                  <strong className="text-stone-700">Scope Limit: </strong>
                  {src.limits}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>Parameters and mini-game controls remain illustrative educational models.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
