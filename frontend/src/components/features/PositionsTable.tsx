import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function PositionsTable({
  openRows,
  historyRows,
}: {
  openRows: { key: string; direction: string; size: string; entry: string; current: string; pnl: string; onClose?: () => void }[];
  historyRows: { key: string; action: string; price: string; pnl: string; timestamp: string }[];
}) {
  const [tab, setTab] = useState<"open" | "history">("open");

  return (
    <div className="rounded-[16px] bg-[var(--panel)] p-5">
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-4">
        <button
          type="button"
          onClick={() => setTab("open")}
          className={`rounded-[10px] px-3 py-2 text-sm font-medium ${tab === "open" ? "bg-white/[0.06] text-[var(--text)]" : "text-[var(--muted)]"}`}
        >
          Open Positions
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={`rounded-[10px] px-3 py-2 text-sm font-medium ${tab === "history" ? "bg-white/[0.06] text-[var(--text)]" : "text-[var(--muted)]"}`}
        >
          Trade History
        </button>
      </div>

      {tab === "open" ? (
        openRows.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
                <tr>
                  <th className="py-3">Direction</th>
                  <th className="py-3">Size</th>
                  <th className="py-3">Entry</th>
                  <th className="py-3">Current</th>
                  <th className="py-3">PnL</th>
                  <th className="py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {openRows.map((row) => (
                  <tr key={row.key}>
                    <td className="py-4 text-[var(--text)]">{row.direction}</td>
                    <td className="py-4 font-mono text-[var(--text)]">{row.size}</td>
                    <td className="py-4 font-mono text-[var(--text)]">{row.entry}</td>
                    <td className="py-4 font-mono text-[var(--text)]">{row.current}</td>
                    <td className="py-4 font-mono text-[var(--text)]">{row.pnl}</td>
                    <td className="py-4 text-right">
                      {row.onClose ? (
                        <Button variant="secondary" onClick={row.onClose}>
                          Close
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty text="No open positions" />
        )
      ) : historyRows.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
              <tr>
                <th className="py-3">Trade</th>
                <th className="py-3">Price</th>
                <th className="py-3">PnL</th>
                <th className="py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {historyRows.map((row) => (
                <tr key={row.key}>
                  <td className="py-4 text-[var(--text)]">{row.action}</td>
                  <td className="py-4 font-mono text-[var(--text)]">{row.price}</td>
                  <td className="py-4 font-mono text-[var(--text)]">{row.pnl}</td>
                  <td className="py-4 text-[var(--muted)]">{row.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty text="No trade history yet" />
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="py-14 text-center text-sm text-[var(--muted)]">{text}</div>;
}
