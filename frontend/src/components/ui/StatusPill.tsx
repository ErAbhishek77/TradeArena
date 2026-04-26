type StatusKind =
  | "live"
  | "soon"
  | "ended"
  | "settled"
  | "admin"
  | "active"
  | "idle"
  | "settling"
  | "claim";

const styles: Record<StatusKind, string> = {
  live: "bg-[rgba(28,203,120,0.14)] text-[var(--primary-strong)]",
  soon: "bg-[rgba(103,247,177,0.1)] text-[var(--accent)]",
  ended: "bg-white/[0.05] text-[var(--muted)]",
  settled: "bg-[rgba(103,247,177,0.1)] text-[var(--accent)]",
  settling: "bg-[rgba(244,201,93,0.14)] text-[var(--warning)]",
  claim: "bg-[rgba(28,203,120,0.14)] text-[var(--primary-strong)]",
  admin: "bg-[rgba(103,247,177,0.1)] text-[var(--primary)]",
  active: "bg-[rgba(28,203,120,0.14)] text-[var(--primary-strong)]",
  idle: "bg-white/[0.05] text-[var(--muted)]",
};

export function StatusPill({
  kind,
  label,
}: {
  kind: StatusKind;
  label: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-[9px] py-[3px] text-[10px] font-semibold uppercase tracking-[0.12em] ${styles[kind]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
