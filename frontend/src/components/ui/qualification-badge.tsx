import { CheckCircle2, CircleSlash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function QualificationBadge({
  qualified,
  label,
}: {
  qualified: boolean;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        qualified
          ? "border-[rgba(34,197,94,0.18)] bg-[rgba(34,197,94,0.12)] text-[var(--long)]"
          : "border-[rgba(244,201,93,0.28)] bg-[rgba(244,201,93,0.12)] text-[var(--warning)]",
      )}
    >
      {qualified ? <CheckCircle2 size={12} /> : <CircleSlash2 size={12} />}
      {label ?? (qualified ? "Qualified" : "Not Qualified")}
    </span>
  );
}
