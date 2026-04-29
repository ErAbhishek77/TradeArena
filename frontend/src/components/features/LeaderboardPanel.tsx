import { motion } from "framer-motion";
import { Trophy, Medal, Crown, User, CurrencyCircleDollar, TrendUp, TrendDown, Warning } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const rankIcons: Record<number, React.ReactNode> = {
  1: <Crown size={24} className="text-yellow-400" />,
  2: <Medal size={20} className="text-gray-300" />,
  3: <Medal size={20} className="text-amber-600" />,
};

const rankStyles: Record<number, string> = {
  1: "bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 border-yellow-500/30",
  2: "bg-gradient-to-br from-gray-400/15 to-gray-500/5 border-gray-400/30",
  3: "bg-gradient-to-br from-amber-600/15 to-amber-700/5 border-amber-600/30",
};

export function LeaderboardPanel({
  podium,
  rows,
  inactiveRows = [],
}: {
  podium: { key: string; rank: number; address: string; returnPct: string; prize: string; highlight?: boolean }[];
  rows: {
    key: string;
    rank: number;
    address: string;
    returnPct: string;
    pnl: string;
    vault: string;
    highlight?: boolean;
    positive?: boolean;
    negative?: boolean;
    note?: string;
  }[];
  inactiveRows?: {
    key: string;
    address: string;
    note: string;
    highlight?: boolean;
  }[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--panel)] shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] bg-gradient-to-r from-[var(--panel)] to-[var(--sidebar)] px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]/10">
          <Trophy size={18} className="text-[var(--primary)]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)]">Leaderboard</h2>
          <p className="text-xs text-[var(--muted)]">Top traders by return percentage</p>
        </div>
      </div>

      {/* Podium */}
      {podium.length ? (
        <div className="grid gap-4 border-b border-[var(--border)] bg-[var(--sidebar)]/30 p-5 md:grid-cols-3">
          {podium.map((entry) => (
            <motion.div
              key={entry.key}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: entry.rank * 0.1 }}
              className={cn(
                "relative rounded-xl border p-5 text-center transition-all hover:scale-[1.02]",
                rankStyles[entry.rank] || "border-[var(--border-soft)] bg-[var(--panel-soft)]"
              )}
            >
              {/* Rank Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  entry.rank === 1 && "border-yellow-500 bg-yellow-500/20",
                  entry.rank === 2 && "border-gray-400 bg-gray-400/20",
                  entry.rank === 3 && "border-amber-600 bg-amber-600/20"
                )}>
                  {rankIcons[entry.rank] || <span className="text-xs font-bold">#{entry.rank}</span>}
                </div>
              </div>
              
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">
                Rank #{entry.rank}
              </p>
              <p className="mt-4 flex items-center justify-center gap-2 text-sm font-bold text-[var(--text)]">
                <User size={14} className="text-[var(--muted)]" />
                {entry.address}
              </p>
              <p className={cn(
                "mt-3 font-mono text-xl font-bold tabular-nums",
                entry.rank === 1 ? "text-yellow-400" : entry.rank === 2 ? "text-gray-300" : "text-amber-500"
              )}>
                {entry.returnPct}
              </p>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[var(--muted)]">
                <CurrencyCircleDollar size={12} className="text-[var(--primary)]" />
                {entry.prize}
              </div>
            </motion.div>
          ))}
        </div>
      ) : null}

      {/* Table Header */}
      <div className="hidden grid-cols-[56px_1.2fr_0.9fr_0.9fr_0.9fr] gap-3 border-b border-[var(--border)] bg-[var(--sidebar)]/50 px-4 py-2.5 md:grid">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">Rank</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">Trader</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">Return</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">P/L</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">Vault</span>
      </div>

      {/* Rows */}
      <div className={cn("space-y-2 p-4", podium.length && "pt-4")}>
        {rows.map((row) => (
          <motion.div
            key={row.key}
            layout
            whileHover={{ x: 4 }}
            className={cn(
              "group grid gap-3 rounded-xl border px-4 py-3 transition-all md:grid-cols-[56px_1.2fr_0.9fr_0.9fr_0.9fr] md:items-center",
              row.highlight
                ? "border-l-[3px] border-l-[var(--primary)] border-[var(--border-soft)] bg-[var(--primary)]/5"
                : "border-[var(--border-soft)] bg-[var(--panel-soft)] hover:border-[var(--border)] hover:shadow-md"
            )}
          >
            <p className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--sidebar)] font-mono text-xs font-bold text-[var(--muted)] tabular-nums">
              {row.rank}
            </p>
            <div className="flex items-center gap-2">
              <User size={14} className="text-[var(--muted)]" />
              <p className="text-sm font-semibold text-[var(--text)]">{row.address}</p>
            </div>
            <p className={cn(
              "flex items-center gap-1.5 font-mono text-sm font-bold tabular-nums",
              row.positive && "text-[var(--long)]",
              row.negative && "text-[var(--short)]",
              !row.positive && !row.negative && "text-[var(--text)]"
            )}>
              {row.positive && <TrendUp size={14} />}
              {row.negative && <TrendDown size={14} />}
              {row.returnPct}
            </p>
            <p className="font-mono text-sm text-[var(--muted)] tabular-nums">{row.pnl}</p>
            <p className="font-mono text-sm text-[var(--muted)] tabular-nums">{row.vault}</p>
          </motion.div>
        ))}
      </div>

      {/* Inactive Rows */}
      {inactiveRows.length ? (
        <div className="border-t border-[var(--border)] bg-[var(--panel-soft)] p-5">
          <div className="flex items-center gap-2">
            <Warning size={14} className="text-[var(--muted)]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">
              Not Qualified
            </p>
          </div>
          <div className="mt-4 space-y-2">
            {inactiveRows.map((row) => (
              <motion.div
                key={row.key}
                layout
                whileHover={{ x: 4 }}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all",
                  row.highlight
                    ? "border-l-[3px] border-l-[var(--primary)] border-[var(--border-soft)] bg-[var(--primary)]/5"
                    : "border-[var(--border-soft)] bg-[var(--panel)] hover:border-[var(--border)]"
                )}
              >
                <div className="flex items-center gap-2">
                  <User size={14} className="text-[var(--muted)]" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{row.address}</p>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{row.note}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-[var(--border)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                  Inactive
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
