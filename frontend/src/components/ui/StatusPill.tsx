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
  live: "bg-[rgba(34,197,94,0.12)] text-[#22C55E]",
  soon: "bg-[rgba(59,130,246,0.12)] text-[#60A5FA]",
  ended: "bg-[rgba(148,163,184,0.08)] text-[#64748B]",
  settled: "bg-[rgba(148,163,184,0.08)] text-[#64748B]",
  settling: "bg-[rgba(59,130,246,0.12)] text-[#60A5FA]",
  claim: "bg-[rgba(34,211,238,0.12)] text-[#22D3EE]",
  admin: "bg-[rgba(34,211,238,0.12)] text-[#22D3EE]",
  active: "bg-[rgba(34,197,94,0.12)] text-[#22C55E]",
  idle: "bg-[rgba(148,163,184,0.08)] text-[#64748B]",
};

export function StatusPill({
  kind,
  label,
}: {
  kind: StatusKind;
  label: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-[9px] py-[3px] text-[10px] font-semibold uppercase tracking-[0.05em] ${styles[kind]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
