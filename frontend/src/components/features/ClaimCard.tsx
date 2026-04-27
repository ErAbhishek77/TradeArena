import { Gift, SealCheck } from "@phosphor-icons/react";
import type { ReactNode } from "react";

export function ClaimCard({
  title,
  status,
  reward,
  rank,
  returnPct,
  action,
  tone = "default",
}: {
  title: string;
  status: string;
  reward: string;
  rank: string;
  returnPct: string;
  action?: ReactNode;
  tone?: "default" | "claimable" | "warning";
}) {
  const accent =
    tone === "claimable"
      ? "border-[rgba(34,197,94,0.18)] bg-[var(--panel)]"
      : tone === "warning"
        ? "border-[rgba(245,158,11,0.18)] bg-[var(--panel)]"
        : "border-[var(--border-soft)] bg-[var(--panel)]";

  return (
    <div className={`rounded-[12px] border p-4 ${accent}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">
            Rewards
          </p>
          <p className="mt-2 text-[18px] font-semibold text-[var(--text)]">{title}</p>
        </div>
        <div className="rounded-[8px] border border-[var(--border-soft)] bg-[var(--sidebar)] p-2 text-[var(--primary)]">
          {tone === "claimable" ? <Gift size={18} weight="fill" /> : <SealCheck size={18} />}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Rank" value={rank} />
        <Metric label="Return %" value={returnPct} />
        <Metric label="Reward" value={reward} />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">{status}</p>
        {action}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[var(--border-soft)] bg-[var(--sidebar)] px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">{label}</p>
      <p className="mt-2 font-mono text-sm font-semibold tabular-nums text-[var(--text)]">{value}</p>
    </div>
  );
}
