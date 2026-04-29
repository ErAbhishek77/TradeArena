import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { TrendUp, TrendDown, ArrowsDownUp, CurrencyCircleDollar, Clock, X, Table } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function PositionsTable({
  openRows,
  historyRows,
}: {
  openRows: { key: string; direction: string; size: string; entry: string; current: string; pnl: string; onClose?: () => void }[];
  historyRows: { key: string; action: string; price: string; pnl: string; timestamp: string }[];
}) {
  const [tab, setTab] = useState<"open" | "history">("open");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--panel)] shadow-xl"
    >
      {/* Header with Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--border)] bg-gradient-to-r from-[var(--panel)] to-[var(--sidebar)] p-1">
        <TabButton 
          active={tab === "open"} 
          onClick={() => setTab("open")}
          icon={<Table size={14} />}
          label="Open Positions"
          count={openRows.length}
        />
        <TabButton 
          active={tab === "history"} 
          onClick={() => setTab("history")}
          icon={<Clock size={14} />}
          label="Trade History"
          count={historyRows.length}
        />
      </div>

      <AnimatePresence mode="wait">
        {tab === "open" ? (
          <motion.div
            key="open"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="p-4"
          >
            {openRows.length ? (
              <div className="overflow-x-auto rounded-xl border border-[var(--border-soft)]">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[var(--sidebar)] text-[10px] uppercase tracking-[0.12em] text-[var(--label)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Direction</th>
                      <th className="px-4 py-3 font-semibold">Size</th>
                      <th className="px-4 py-3 font-semibold">Entry</th>
                      <th className="px-4 py-3 font-semibold">Current</th>
                      <th className="px-4 py-3 font-semibold">PnL</th>
                      <th className="px-4 py-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {openRows.map((row) => (
                      <motion.tr
                        key={row.key}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-[var(--sidebar)]/50"
                      >
                        <td className="px-4 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold",
                            row.direction.toLowerCase() === "long" 
                              ? "bg-[var(--long)]/15 text-[var(--long)]" 
                              : "bg-[var(--short)]/15 text-[var(--short)]"
                          )}>
                            {row.direction.toLowerCase() === "long" ? (
                              <TrendUp size={12} />
                            ) : (
                              <TrendDown size={12} />
                            )}
                            {row.direction}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono text-[13px] font-semibold text-[var(--text)]">{row.size}</td>
                        <td className="px-4 py-4 font-mono text-[13px] text-[var(--text)]">{row.entry}</td>
                        <td className="px-4 py-4 font-mono text-[13px] text-[var(--text)]">{row.current}</td>
                        <td className="px-4 py-4 font-mono text-[13px] font-semibold text-[var(--text)]">{row.pnl}</td>
                        <td className="px-4 py-4 text-right">
                          {row.onClose ? (
                            <Button 
                              variant="secondary" 
                              onClick={row.onClose}
                              className="h-8 px-3 text-xs"
                            >
                              <X size={12} className="mr-1" />
                              Close
                            </Button>
                          ) : null}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty 
                icon={<ArrowsDownUp size={32} className="text-[var(--muted)]" />}
                text="No open positions" 
                subtext="Open a position to start trading"
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="p-4"
          >
            {historyRows.length ? (
              <div className="overflow-x-auto rounded-xl border border-[var(--border-soft)]">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[var(--sidebar)] text-[10px] uppercase tracking-[0.12em] text-[var(--label)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Trade</th>
                      <th className="px-4 py-3 font-semibold">Price</th>
                      <th className="px-4 py-3 font-semibold">PnL</th>
                      <th className="px-4 py-3 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {historyRows.map((row) => (
                      <motion.tr
                        key={row.key}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-[var(--sidebar)]/50"
                      >
                        <td className="px-4 py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold",
                            row.action.toLowerCase() === "long" || row.action.toLowerCase() === "buy"
                              ? "bg-[var(--long)]/15 text-[var(--long)]" 
                              : "bg-[var(--short)]/15 text-[var(--short)]"
                          )}>
                            {row.action.toLowerCase() === "long" || row.action.toLowerCase() === "buy" ? (
                              <TrendUp size={12} />
                            ) : (
                              <TrendDown size={12} />
                            )}
                            {row.action}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono text-[13px] text-[var(--text)]">{row.price}</td>
                        <td className="px-4 py-4 font-mono text-[13px] font-semibold text-[var(--text)]">{row.pnl}</td>
                        <td className="px-4 py-4 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                          <Clock size={12} />
                          {row.timestamp}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty 
                icon={<CurrencyCircleDollar size={32} className="text-[var(--muted)]" />}
                text="No trade history yet" 
                subtext="Your completed trades will appear here"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TabButton({ 
  active, 
  onClick, 
  icon, 
  label,
  count 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
        active 
          ? "bg-[var(--primary)] text-[var(--panel)] shadow-lg shadow-[var(--primary)]/25" 
          : "text-[var(--muted)] hover:bg-[var(--sidebar)] hover:text-[var(--text)]"
      )}
    >
      {icon}
      <span>{label}</span>
      {!active && count > 0 && (
        <span className="ml-1 rounded-full bg-[var(--border)] px-1.5 py-0.5 text-[10px]">
          {count}
        </span>
      )}
    </button>
  );
}

function Empty({ icon, text, subtext }: { icon: React.ReactNode; text: string; subtext: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--sidebar)]">
        {icon}
      </div>
      <p className="text-sm font-semibold text-[var(--text)]">{text}</p>
      <p className="mt-1 text-xs text-[var(--muted)]">{subtext}</p>
    </div>
  );
}
