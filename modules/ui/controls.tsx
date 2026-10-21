"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/** Botão discreto do palco (ícone + rótulo opcional). */
export const StageButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { icon?: IconName; label?: string; active?: boolean; compact?: boolean }
>(function StageButton({ icon, label, active, compact, className = "", children, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-full border text-[13px] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
        compact ? "h-9 w-9" : "h-9 px-3.5"
      } ${
        active
          ? "border-landim-ouro/70 bg-landim-ouro/15 text-landim-ouroClaro"
          : "border-white/10 bg-palco-painel/70 text-palco-texto hover:border-white/25 hover:bg-palco-painel"
      } ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} />}
      {label && !compact && <span>{label}</span>}
      {children}
    </button>
  );
});

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40 ${checked ? "bg-landim-ouro" : "bg-white/15"}`}
    >
      <span className={`absolute left-0 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </button>
  );
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  label,
  disabled,
  className = "",
  onPointerDown,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  disabled?: boolean;
  className?: string;
  onPointerDown?: () => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onPointerDown={onPointerDown}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`range-landim h-1.5 w-full cursor-pointer appearance-none rounded-full disabled:opacity-40 ${className}`}
      style={{ background: `linear-gradient(to right, #D6B469 ${pct}%, rgba(255,255,255,.14) ${pct}%)` }}
    />
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-white/10 bg-black/20 p-0.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            o.value === value ? "bg-landim-ouro text-landim-roxo950" : "text-palco-suave hover:text-palco-texto"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PanelSection({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-palco-suave">{title}</h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "pending" | "pain" }) {
  const cls =
    tone === "pending"
      ? "border-clinico-pendente/30 bg-clinico-pendente/10 text-[#F3D79C]"
      : tone === "pain"
        ? "border-clinico-desconforto/35 bg-clinico-desconforto/10 text-[#F6C8BB]"
        : "border-white/10 bg-white/5 text-palco-suave";
  return <div className={`rounded-xl border px-3 py-2 text-xs leading-relaxed ${cls}`}>{children}</div>;
}
