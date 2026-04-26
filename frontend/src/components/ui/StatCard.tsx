import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  meta,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  meta?: string;
  tone?: "default" | "positive" | "negative";
  icon?: ReactNode;
}) {
  const valueClass =
    tone === "positive"
      ? "text-[var(--green)]"
      : tone === "negative"
        ? "text-[var(--red)]"
        : "text-[var(--text)]";

  return (
    <div className="rounded-[16px] bg-[var(--panel)] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
          {label}
        </p>
        {icon}
      </div>
      <p className={`mt-3 font-mono text-[28px] font-semibold ${valueClass}`}>{value}</p>
      {meta ? <p className="mt-2 text-sm text-[var(--muted)]">{meta}</p> : null}
    </div>
  );
}
