import React from 'react';
import { sound } from '../services/audio';

interface Props {
  onStart: () => void;
}

/** Between loop 1 and loop 2: the TV worked, then the bill came. Placeholder screen for the procurement prototype. */
export function LoopReplay({ onStart }: Props) {
  return (
    <section className="flex h-full items-center justify-center bg-[#070817] p-4 text-slate-100" aria-label="Replay">
      <div className="max-w-md space-y-4 rounded-2xl border-4 border-[#1a0b02] bg-[#0c1821] p-6 text-center shadow-[6px_6px_0_#1a0b02]">
        <p className="font-pixel text-[10px] text-amber-300">LOOP 1 COMPLETE</p>
        <p>The TV worked. Then the bill arrived.</p>
        <p className="font-mono text-3xl font-bold text-red-300">$1,000,000,000</p>
        <p className="text-sm text-slate-300">Making it was the easy part. This time, you buy everything yourself, and every dollar counts.</p>
        <button onClick={() => { sound.playConfirm(); onStart(); }} className="w-full rounded-xl bg-amber-300 px-4 py-3 font-bold text-[#1a0b02]">
          Replay: Loop 2 · Procurement
        </button>
      </div>
    </section>
  );
}
