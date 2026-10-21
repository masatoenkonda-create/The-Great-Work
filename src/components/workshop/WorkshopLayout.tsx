import React, { useEffect, useRef } from 'react';

interface Props {
  ariaLabel: string;
  kicker: string;
  title: string;
  onReturnToMap: () => void;
  scene: React.ReactNode;
  panel: React.ReactNode;
  guide: React.ReactNode;
}

/** Workshop frame shared by every level: 3D scene left; fixed cockpit panel and guide box right. */
export function WorkshopLayout({ ariaLabel, kicker, title, onReturnToMap, scene, panel, guide }: Props) {
  return (
    <section className="h-full overflow-hidden bg-[#0c1821] text-slate-100 font-sans" aria-label={ariaLabel}>
      <div className="mx-auto flex h-full min-h-0 max-w-[1800px] flex-col gap-3 p-3 sm:p-4">
        <header className="flex shrink-0 items-center justify-between gap-3">
          <div><p className="text-sm font-medium text-amber-300">{kicker}</p><h1 className="text-xl font-bold sm:text-2xl">{title}</h1></div>
          <button onClick={onReturnToMap} className="rounded-lg border border-white/20 px-3 py-2 text-xs hover:bg-white/10">← Map</button>
        </header>
        <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_420px] lg:overflow-hidden">
          <div className="relative h-[48svh] min-h-[300px] lg:h-full lg:min-h-0">{scene}</div>
          <div className="flex min-h-0 flex-col gap-3">
            {panel}
            {guide}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Space or Enter uses the highlighted object, the same as clicking it (ignored while a control or the guide box has focus). */
export function useActKey(target: string | undefined, act: (target: string) => unknown) {
  const latest = useRef({ target, act });
  latest.current = { target, act };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      if (event.repeat || (event.target instanceof HTMLElement && event.target.closest('button, input, select, textarea, [contenteditable="true"], [data-guide-box]'))) return;
      event.preventDefault();
      const { target: current, act: run } = latest.current;
      if (current) run(current);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/** Runs a timed animation phase: progress 0..1 over `duration`, then calls `onDone`. */
export function useTimedPhase(key: string, duration: number | undefined, setProgress: (value: number) => void, onDone: () => void) {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (!duration) return;
    let frame = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const value = Math.min(1, (now - start) / duration);
      setProgress(value);
      if (value < 1) frame = requestAnimationFrame(animate);
      else { setProgress(0); done.current(); }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [key]);
}
