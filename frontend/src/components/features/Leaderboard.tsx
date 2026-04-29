import { motion } from "framer-motion";
import { Trophy, Medal, Crown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const rankIcons = {
  1: <Crown size={24} className="text-yellow-400" />,
  2: <Medal size={24} className="text-gray-300" />,
  3: <Medal size={24} className="text-amber-600" />,
};

const rankGradients = {
  1: "from-yellow-400/20 to-yellow-600/5 border-yellow-400/30",
  2: "from-gray-300/20 to-gray-400/5 border-gray-300/30",
  3: "from-amber-600/20 to-amber-700/5 border-amber-600/30",
};

export function Leaderboard({
  podium,
  rows,
}: {
  podium: { key: string; rank: number; address: string; returnPct: string; prize: string }[];
  rows: { key: string; rank: number; address: string; returnPct: string; trades: string; prize: string; highlight?: boolean }[];
}) {
  return (
    <div className="space-y-6">
      {/* Podium */}
      <div className="grid gap-4 md:grid-cols-3 md:gap-2">
        {podium.map((entry) => (
          <motion.div
            key={entry.key}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
              "relative rounded-2xl border bg-gradient-to-b p-5",
              rankGradients[entry.rank as keyof typeof rankGradients] || "from-gray-500/20 to-gray-600/5 border-gray-500/30"
            )}
          >
            {/* Rank Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2",
                entry.rank === 1 ? "border-yellow-400 bg-yellow-400/20" :
                entry.rank === 2 ? "border-gray-300 bg-gray-300/20" :
                "border-amber-600 bg-amber-600/20"
              )}>
                {rankIcons[entry.rank as keyof typeof rankIcons] || <Trophy size={20} />}
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
                {entry.rank === 1 ? "Champion" : entry.rank === 2 ? "2nd Place" : "3rd Place"}
              </p>
              <p className="mt-3 break-all text-sm font-semibold text-[var(--text)]">{entry.address}</p>
              <p className="mt-2 font-mono text-xl font-bold text-[var(--primary)]">{entry.returnPct}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{entry.prize}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--panel)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--sidebar)]">
              <tr>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Rank</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Address</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Return %</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Trades</th>
                <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Prize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((row, index) => (
                <motion.tr
                  layout
                  key={row.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "transition-colors",
                    row.highlight ? "bg-[var(--primary)]/10" : "hover:bg-white/[0.02]"
                  )}
                >
                  <td className={cn(
                    "px-4 py-4 font-semibold",
                    row.highlight ? "border-l-[3px] border-[var(--primary)] pl-3" : ""
                  )}>
                    <span className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                      row.rank <= 3 ? "bg-yellow-400/20 text-yellow-400" : "bg-[var(--sidebar)] text-[var(--muted)]"
                    )}>
                      {row.rank}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[var(--text)]">{row.address}</td>
                  <td className="px-4 py-4 font-mono font-semibold text-[var(--primary)]">{row.returnPct}</td>
                  <td className="px-4 py-4 text-[var(--muted)]">{row.trades}</td>
                  <td className="px-4 py-4 font-mono text-[var(--text)]">{row.prize}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
