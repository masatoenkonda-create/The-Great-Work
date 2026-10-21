import React from 'react';

/** A rectangle on the fixed panel canvas (see each level's <country>Panel.ts). */
export interface PanelRect { x: number; y: number; w: number; h: number; label: string }

export interface PanelLayout<C extends string, G extends string, L extends string> {
  size: { width: number; height: number };
  sections: (PanelRect & { id: string })[];
  lamps: (PanelRect & { id: L })[];
  gauges: (PanelRect & { id: G })[];
  /** `red` draws the big red caps used for main power and similar. */
  controls: (PanelRect & { id: C; red?: boolean })[];
}

export type Led = 'off' | 'on' | 'next';
export type LampColor = 'off' | 'amber' | 'green' | 'orange';

export type GaugeReading =
  | { kind: 'bar'; fill: number; text: string; color: string; band?: [number, number]; value: number; max: number; title?: string }
  | { kind: 'bars'; value: number; max: number; label: string };

interface Props<C extends string, G extends string, L extends string> {
  layout: PanelLayout<C, G, L>;
  label: string;
  asset: string;
  lamp: (id: L) => LampColor;
  gauge: (id: G) => GaugeReading;
  led: (id: C) => Led;
  /** On/off state for toggle controls; undefined for plain push buttons. */
  pressed?: (id: C) => boolean | undefined;
  onPress: (id: C) => void;
}

const LABEL = 'absolute inset-x-0 bottom-0 truncate text-center font-mono text-[8px] leading-none tracking-wide text-slate-300 sm:text-[9px]';
const LAMP: Record<LampColor, string> = {
  off: 'bg-[#2c3439]',
  amber: 'bg-amber-300 shadow-[0_0_8px_#fcd34d]',
  green: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
  orange: 'bg-orange-400 shadow-[0_0_8px_#fb923c]',
};

/**
 * Placeholder cockpit panel. Fixed: nothing on it moves or reflows, only lights and needles change.
 * Final pixel art replaces the drawn shapes; hotspots stay at the layout rectangles.
 */
export function CockpitPanel<C extends string, G extends string, L extends string>({ layout, label, asset, lamp, gauge, led, pressed, onPress }: Props<C, G, L>) {
  const pct = (rect: PanelRect) => ({
    left: `${rect.x / layout.size.width * 100}%`, top: `${rect.y / layout.size.height * 100}%`,
    width: `${rect.w / layout.size.width * 100}%`, height: `${rect.h / layout.size.height * 100}%`,
  });
  return (
    <div className="relative w-full shrink-0 select-none overflow-hidden rounded-xl border-2 border-[#4b5a63] bg-[#232c31] shadow-[inset_0_0_0_3px_#151b1f]" style={{ aspectRatio: `${layout.size.width} / ${layout.size.height}` }} role="group" aria-label={label} data-asset={asset}>
      {[[1.5, 1.5], [98.5, 1.5], [1.5, 98.5], [98.5, 98.5]].map(([x, y]) => <span key={`${x}${y}`} aria-hidden="true" className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5f6e77]" style={{ left: `${x}%`, top: `${y}%` }} />)}
      {layout.sections.map(section => <div key={section.id} aria-hidden="true" className="absolute rounded-md border border-[#3a464d] bg-[#1b2226]" style={pct(section)}>
        <span className="absolute -top-px left-2 bg-[#1b2226] px-1 font-mono text-[7px] font-bold tracking-[0.2em] text-amber-200/70 sm:text-[8px]">{section.label}</span>
      </div>)}
      {layout.lamps.map(item => {
        const color = lamp(item.id);
        return <div key={item.id} className="absolute" style={pct(item)} role="status" aria-label={`${item.label}: ${color === 'off' ? 'off' : 'on'}`}>
          <span className={`absolute left-1/2 top-[18%] h-[38%] aspect-square -translate-x-1/2 rounded-full border border-black/60 ${LAMP[color]}`} />
          <span className={LABEL}>{item.label}</span>
        </div>;
      })}
      {layout.gauges.map(item => <Gauge key={item.id} rect={item} style={pct(item)} reading={gauge(item.id)} />)}
      {layout.controls.map(control => {
        const state = led(control.id);
        const on = pressed?.(control.id);
        const description = on === undefined ? control.label : `${control.label}: ${on ? 'on' : 'off'}`;
        return <button key={control.id} type="button" onClick={() => onPress(control.id)} aria-label={control.label} aria-pressed={on} title={description} className="group absolute focus-visible:outline-2 focus-visible:outline-amber-300" style={pct(control)}>
          <span aria-hidden="true" className={`absolute left-1/2 top-[4%] h-[11%] aspect-square -translate-x-1/2 rounded-full ${state === 'next' ? 'animate-pulse bg-amber-300 shadow-[0_0_8px_#fcd34d]' : state === 'on' ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-[#2c3439]'}`} />
          <span aria-hidden="true" className={`absolute inset-x-[12%] top-[20%] bottom-[24%] rounded-md border-b-4 transition-transform group-active:translate-y-0.5 group-active:border-b-2 ${control.red ? 'border-[#7a1d18] bg-[#c8332b]' : 'border-[#20282c] bg-[#56656e] group-hover:bg-[#64757f]'}`} />
          <span className={LABEL}>{control.label}</span>
        </button>;
      })}
    </div>
  );
}

function Gauge({ rect, style, reading }: { rect: PanelRect; style: React.CSSProperties; reading: GaugeReading }) {
  if (reading.kind === 'bars') {
    return <div className="absolute" style={style} role="meter" aria-label={rect.label} aria-valuemin={1} aria-valuemax={reading.max} aria-valuenow={reading.value}>
      <div className="absolute inset-x-[6%] top-[14%] bottom-[24%] flex items-end gap-[6%] rounded border border-black/60 bg-black/50 p-[5%]">
        {Array.from({ length: reading.max }, (_, i) => <span key={i} className={`flex-1 rounded-sm ${i < reading.value ? 'bg-amber-300' : 'bg-[#2c3439]'}`} style={{ height: `${30 + i * 17}%` }} />)}
      </div>
      <span className={LABEL}>{reading.label}</span>
    </div>;
  }
  const { fill, text, color, band } = reading;
  return <div className="absolute" style={style} role="meter" aria-label={rect.label} aria-valuemin={0} aria-valuemax={reading.max} aria-valuenow={Math.round(reading.value)} aria-valuetext={text} title={reading.title ?? `${rect.label}: ${text}`}>
    <div className="absolute inset-x-[6%] top-[10%] bottom-[34%] overflow-hidden rounded border border-black/60 bg-black/60">
      {band && <span aria-hidden="true" className="absolute inset-x-0 border-y border-emerald-400/70 bg-emerald-400/15" style={{ bottom: `${band[0] * 100}%`, height: `${(band[1] - band[0]) * 100}%` }} />}
      <span aria-hidden="true" className={`absolute bottom-0 left-[30%] right-[30%] ${color}`} style={{ height: `${Math.min(1, Math.max(0, fill)) * 100}%` }} />
    </div>
    <span className="absolute inset-x-0 bottom-[14%] text-center font-mono text-[9px] font-bold text-amber-100 sm:text-[11px]">{text}</span>
    <span className={LABEL}>{rect.label}</span>
  </div>;
}
