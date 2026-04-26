export function QualificationBadge({
  qualified,
  label,
}: {
  qualified: boolean;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
        qualified
          ? "bg-[rgba(28,203,120,0.14)] text-[var(--primary-strong)]"
          : "bg-[rgba(244,201,93,0.12)] text-[var(--warning)]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? (qualified ? "Qualified" : "Not qualified")}
    </span>
  );
}
