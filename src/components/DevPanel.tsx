import React, { useState } from 'react';

export interface DevAction { label: string; run: () => void }

/** Developer shortcuts (dev server only): a small "dev" tab in the corner that opens a list of jumps. */
export function DevPanel({ actions }: { actions: DevAction[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-2 right-2 z-[60] text-xs text-slate-100">
      {open && (
        <div className="mb-1 flex w-56 flex-col gap-1 rounded-lg border border-white/15 bg-slate-900/90 p-2 shadow-lg">
          <p className="px-1 text-[10px] uppercase tracking-wide text-slate-400">Developer</p>
          {actions.map(a => (
            <button key={a.label} className="rounded border border-white/10 px-2 py-1 text-left hover:bg-white/10"
              onClick={() => { a.run(); setOpen(false); }}>{a.label}</button>
          ))}
        </div>
      )}
      <button className="ml-auto block rounded border border-white/15 bg-slate-900/80 px-2 py-0.5 text-slate-300 hover:bg-slate-800"
        onClick={() => setOpen(o => !o)}>{open ? 'close' : 'dev'}</button>
    </div>
  );
}
