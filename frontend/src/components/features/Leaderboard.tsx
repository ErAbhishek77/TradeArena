import { motion } from "framer-motion";

export function Leaderboard({
  podium,
  rows,
}: {
  podium: { key: string; rank: number; address: string; returnPct: string; prize: string }[];
  rows: { key: string; rank: number; address: string; returnPct: string; trades: string; prize: string; highlight?: boolean }[];
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        {podium.map((entry) => (
          <motion.div
            key={entry.key}
            layout
            className={`rounded-[16px] bg-[var(--panel)] p-5 ${entry.rank === 1 ? "md:-translate-y-4" : ""}`}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
              #{entry.rank}
            </p>
            <p className="mt-3 text-lg font-semibold text-[var(--text)]">{entry.address}</p>
            <p className="mt-2 font-mono text-[var(--text)]">{entry.returnPct}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{entry.prize}</p>
          </motion.div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[16px] bg-[var(--panel)] p-4">
        <table className="min-w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
            <tr>
              <th className="py-3">Rank</th>
              <th className="py-3">Address</th>
              <th className="py-3">Return %</th>
              <th className="py-3">Trades</th>
              <th className="py-3">Prize</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.map((row) => (
              <motion.tr
                layout
                key={row.key}
                className={row.highlight ? "bg-[var(--primary-dim)]" : ""}
              >
                <td className={`py-4 ${row.highlight ? "border-l-[3px] border-[var(--primary)] pl-3" : ""}`}>{row.rank}</td>
                <td className="py-4 text-[var(--text)]">{row.address}</td>
                <td className="py-4 font-mono text-[var(--text)]">{row.returnPct}</td>
                <td className="py-4 text-[var(--muted)]">{row.trades}</td>
                <td className="py-4 font-mono text-[var(--text)]">{row.prize}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
