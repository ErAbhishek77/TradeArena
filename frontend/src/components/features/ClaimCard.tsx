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
      ? "border-[rgba(103,247,177,0.28)] bg-[linear-gradient(180deg,rgba(28,203,120,0.14),rgba(12,27,20,0.94))]"
      : tone === "warning"
        ? "border-[rgba(244,201,93,0.28)] bg-[linear-gradient(180deg,rgba(244,201,93,0.08),rgba(12,27,20,0.94))]"
        : "border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(17,39,29,0.96),rgba(12,27,20,0.94))]";

  return (
    <div className={`rounded-[18px] border p-5 shadow-[0_16px_44px_rgba(0,0,0,0.24)] ${accent}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">
            Rewards
          </p>
          <p className="mt-2 text-xl font-semibold text-[var(--text)]">{title}</p>
        </div>
        <div className="rounded-full bg-[rgba(103,247,177,0.12)] p-2 text-[var(--primary-strong)]">
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
    <div className="rounded-[12px] border border-[var(--border-soft)] bg-[rgba(8,20,15,0.66)] px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">{label}</p>
      <p className="mt-2 font-mono text-sm font-semibold tabular-nums text-[var(--text)]">{value}</p>
    </div>
  );
}
