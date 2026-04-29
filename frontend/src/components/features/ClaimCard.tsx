import { Gift, SealCheck, Trophy, Medal, Crown, ArrowRight, CurrencyCircleDollar, ChartLine, Star } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
      ? "border-[var(--long)]/30 bg-gradient-to-br from-[var(--panel)] to-[var(--long)]/5"
      : tone === "warning"
        ? "border-[var(--warning)]/30 bg-gradient-to-br from-[var(--panel)] to-[var(--warning)]/5"
        : "border-[var(--border-soft)] bg-[var(--panel)]";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 transition-all hover:shadow-xl",
        accent,
        tone === "claimable" && "hover:shadow-[var(--long)]/20",
        tone === "warning" && "hover:shadow-[var(--warning)]/20"
      )}
    >
      {/* Background glow effect */}
      {tone === "claimable" && (
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--long)]/10 blur-3xl" />
      )}
      {tone === "warning" && (
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--warning)]/10 blur-3xl" />
      )}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy size={14} className={cn(
                "text-[var(--subtle)]",
                tone === "claimable" && "text-[var(--long)]",
                tone === "warning" && "text-[var(--warning)]"
              )} />
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--subtle)]">
                Rewards
              </p>
            </div>
            <p className="mt-3 text-xl font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">{title}</p>
          </div>
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl border shadow-lg transition-all group-hover:scale-110",
            tone === "claimable" 
              ? "border-[var(--long)]/30 bg-[var(--long)]/10 text-[var(--long)]" 
              : tone === "warning"
                ? "border-[var(--warning)]/30 bg-[var(--warning)]/10 text-[var(--warning)]"
                : "border-[var(--border)] bg-[var(--sidebar)] text-[var(--primary)]"
          )}>
            {tone === "claimable" ? <Gift size={24} weight="fill" /> : <SealCheck size={24} />}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Metric 
            label="Rank" 
            value={rank} 
            icon={getRankIcon(rank)}
            iconClassName={rank === "1" ? "text-[#FFD700]" : rank === "2" ? "text-[#C0C0C0]" : rank === "3" ? "text-[#CD7F32]" : "text-[var(--subtle)]"}
          />
          <Metric 
            label="Return %" 
            value={returnPct} 
            icon={<ChartLine size={14} />}
            iconClassName="text-[var(--long)]"
          />
          <Metric 
            label="Reward" 
            value={reward} 
            icon={<CurrencyCircleDollar size={14} />}
            iconClassName="text-[var(--warning)]"
          />
        </div>
        
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
            {tone === "claimable" && <Star size={14} className="text-[var(--long)]" />}
            {status}
          </p>
          {action}
        </div>
      </div>
    </motion.div>
  );
}

function getRankIcon(rank: string) {
  if (rank === "1") return <Crown size={14} />;
  if (rank === "2") return <Medal size={14} />;
  if (rank === "3") return <Medal size={14} />;
  return <Trophy size={14} />;
}

function Metric({ label, value, icon, iconClassName }: { label: string; value: string; icon?: React.ReactNode; iconClassName?: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="rounded-xl border border-[var(--border-soft)] bg-gradient-to-br from-[var(--sidebar)] to-[var(--panel)] px-4 py-3 transition-all hover:border-[var(--primary)]/20"
    >
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--subtle)]">
        {icon && <span className={iconClassName}>{icon}</span>}
        {label}
      </p>
      <p className="mt-2 font-mono text-sm font-bold tabular-nums text-[var(--text)]">{value}</p>
    </motion.div>
  );
}
