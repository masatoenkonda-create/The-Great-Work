import React from 'react';

/** `speaker` names someone other than the guide (e.g. "Harbour Coal · sales"); the guide's own lines leave it out. */
export type GuideLine = { text: string; warning: boolean; speaker?: string | null };

interface Props {
  name: string;
  /** Portrait image; without one, the guide's initial is shown as a placeholder. */
  portrait?: string;
  line: GuideLine;
  asset: string;
}

/** One current-step message; new guidance replaces old guidance without moving the frame. */
export function GuideBox({ name, portrait, line, asset }: Props) {
  return (
    <section className="flex min-h-[170px] flex-1 flex-col overflow-hidden rounded-xl border-2 border-[#528b89] bg-[#142d35] shadow-[inset_0_0_0_2px_#0b2029]" aria-label={name} data-asset={asset} data-guide-box="">
      <div className="flex shrink-0 items-center gap-3 border-b border-[#73b5ad]/25 bg-gradient-to-r from-[#24565a] via-[#234650] to-[#18323d] px-3 py-2">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-amber-300/70 bg-[#476a67] shadow-[2px_2px_0_#10252c]">
          {portrait
            ? <img src={portrait} alt="" className="h-full w-full object-cover object-top [image-rendering:pixelated]" />
            : <span aria-hidden="true" className="font-pixel text-base text-amber-200">{name[0]}</span>}
        </div>
        <p className="font-mono text-sm font-bold tracking-widest text-amber-200">{name.toUpperCase()}</p>
        <span aria-hidden="true" className={`ml-auto h-2.5 w-2.5 rounded-sm ${line.warning ? 'bg-amber-300 shadow-[0_0_8px_#fcd34d66]' : 'bg-[#84dac5] shadow-[0_0_8px_#84dac555]'}`} />
      </div>
      <div tabIndex={0} className="min-h-0 flex-1 overflow-y-auto p-3 focus-visible:outline-2 focus-visible:outline-amber-300">
        <div role="status" aria-live="polite" aria-atomic="true" className={`rounded-lg border-l-[3px] px-3 py-2.5 text-sm leading-relaxed ${line.warning ? 'border-amber-300 bg-[#463a25] text-amber-100' : 'border-[#83cabc] bg-[#203f49] text-[#edf5eb]'}`}>
          {line.speaker && <p className="mb-1 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-200">{line.speaker}</p>}
          <p>{line.text.split(/(\([^)]*\))/g).map((part, i) => part.startsWith('(') ? <span key={i} className="italic text-[#f0cc88]">{part}</span> : part)}</p>
        </div>
      </div>
    </section>
  );
}
