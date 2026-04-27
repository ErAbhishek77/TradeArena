import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Radio } from "lucide-react";
import type { ReactNode } from "react";
import { ArenaCard } from "@/components/ui/arena-card";

export function VaultPositionCard({
  title,
  side,
  entryPrice,
  currentPrice,
  pnlPercent,
  endsAt,
  status,
  action,
}: {
  title: string;
  side: "long" | "short";
  entryPrice: string;
  currentPrice: string;
  pnlPercent: string;
  endsAt: string;
  status: "open" | "closed" | "settled";
  action?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const positive = !pnlPercent.startsWith("-");

  return (
    <ArenaCard glow={status === "open"} className="min-h-[200px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">Position</p>
          <p className="mt-2 text-[16px] font-semibold text-[var(--text)]">{title}</p>
        </div>
        <div className={`rounded-[8px] border border-[var(--border-soft)] bg-[var(--sidebar)] p-2 ${side === "long" ? "text-[var(--long)]" : "text-[var(--short)]"}`}>
          {side === "long" ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {status === "open" ? (
          <motion.span
            animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
            transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity }}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--long)]"
          >
            <Radio size={12} />
            Live
          </motion.span>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{status}</span>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MiniStat label="Entry Price" value={entryPrice} />
        <MiniStat label="Current Price" value={currentPrice} />
        <MiniStat
          label="PnL %"
          value={pnlPercent}
          tone={positive ? "positive" : "negative"}
        />
        <MiniStat label="Ends" value={endsAt} />
      </div>
      {action ? <div className="mt-5">{action}</div> : null}
    </ArenaCard>
  );
}

function MiniStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
}) {
  return (
    <div className="rounded-[8px] border border-[var(--border-soft)] bg-[var(--sidebar)] px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">{label}</p>
      <p className={`mt-2 font-mono text-sm font-semibold tabular-nums ${
        tone === "positive"
          ? "text-[var(--long)]"
          : tone === "negative"
            ? "text-[var(--short)]"
            : "text-[var(--text)]"
      }`}>
        {value}
      </p>
    </div>
  );
}
