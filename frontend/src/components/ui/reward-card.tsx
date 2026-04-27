import { Gift, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { ArenaCard } from "@/components/ui/arena-card";

export function RewardCard({
  title,
  amount,
  rank,
  pnlPercent,
  status,
  action,
  claimable = false,
}: {
  title: string;
  amount: string;
  rank: string;
  pnlPercent: string;
  status: string;
  action?: ReactNode;
  claimable?: boolean;
}) {
  return (
    <ArenaCard glow={claimable} className="min-h-[200px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">Claimable Reward</p>
          <p className="mt-2 text-[18px] font-semibold text-[var(--text)]">{title}</p>
        </div>
        <div className="rounded-[8px] border border-[var(--border-soft)] bg-[var(--sidebar)] p-2 text-[var(--primary)]">
          {claimable ? <Gift size={18} /> : <ShieldCheck size={18} />}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MiniStat label="Reward" value={amount} strong />
        <MiniStat label="Rank" value={rank} />
        <MiniStat label="PnL %" value={pnlPercent} />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">{status}</p>
        {action}
      </div>
    </ArenaCard>
  );
}

function MiniStat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-[8px] border border-[var(--border-soft)] bg-[var(--sidebar)] px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">{label}</p>
      <p className={`mt-2 font-mono text-sm font-semibold tabular-nums ${strong ? "text-[var(--primary)]" : "text-[var(--text)]"}`}>
        {value}
      </p>
    </div>
  );
}
