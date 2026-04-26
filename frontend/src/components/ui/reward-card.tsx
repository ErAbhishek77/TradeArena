import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = useReducedMotion();

  return (
    <ArenaCard glow={claimable} className="min-h-[220px]">
      {claimable ? (
        <motion.div
          aria-hidden
          animate={reduceMotion ? undefined : { x: ["-120%", "140%"] }}
          transition={reduceMotion ? undefined : { duration: 3.2, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-[linear-gradient(90deg,transparent,rgba(103,247,177,0.14),transparent)]"
        />
      ) : null}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">Claimable Reward</p>
          <p className="mt-2 text-xl font-semibold text-[var(--text)]">{title}</p>
        </div>
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-soft)] p-2 text-[var(--primary-strong)]">
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
    <div className="rounded-xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">{label}</p>
      <p className={`mt-2 font-mono text-sm font-semibold tabular-nums ${strong ? "text-[var(--primary-strong)]" : "text-[var(--text)]"}`}>
        {value}
      </p>
    </div>
  );
}
