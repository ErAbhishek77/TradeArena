import { motion } from "framer-motion";
import { PriceTicker } from "@/components/ui/PriceTicker";
import { LivePriceChart } from "@/components/live-price-chart";
import { ArrowsDownUp, ChartLine } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function TradingChart({
  livePrice,
  liveChange,
  tournamentPrice,
  priceHistory,
  tournamentPriceValue,
  entryPriceValue,
  liveLabel,
  tournamentLabel,
}: {
  livePrice: string;
  liveChange: string;
  tournamentPrice: string;
  priceHistory: { price: number; timestamp: number }[];
  tournamentPriceValue?: bigint;
  entryPriceValue?: bigint | null;
  liveLabel?: string;
  tournamentLabel?: string;
}) {
  // Calculate price change percentage
  const priceChangePercent = priceHistory.length > 1 
    ? ((priceHistory[priceHistory.length - 1]?.price - priceHistory[0]?.price) / priceHistory[0]?.price * 100).toFixed(2)
    : "0.00";
  
  const isPositive = parseFloat(priceChangePercent) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--panel)]"
    >
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--panel)] to-[var(--sidebar)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10">
              <ChartLine size={20} className="text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">
                BTC/USD Market
              </p>
              <p className="mt-1 font-mono text-xl font-bold text-[var(--text)] tabular-nums">
                {livePrice}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Price Change Badge */}
            <div className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold",
              isPositive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
            )}>
              <ArrowsDownUp size={14} className={isPositive ? "" : "rotate-180"} />
              <span>{isPositive ? "+" : ""}{priceChangePercent}%</span>
            </div>
            
            <PriceTicker label="Live" price={livePrice} change={liveChange} />
            <PriceTicker label="Tournament" price={tournamentPrice} />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <LivePriceChart
          priceHistory={priceHistory}
          tournamentPrice={tournamentPriceValue}
          entryPrice={entryPriceValue}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 border-t border-[var(--border)] bg-[var(--sidebar)]/50 px-4 py-3">
        <LegendChip label={liveLabel ?? "Live BTC"} tone="cyan" />
        <LegendChip label={tournamentLabel ?? "Tournament price"} tone="purple" />
        {entryPriceValue ? <LegendChip label="Entry price" tone="green" /> : null}
      </div>
    </motion.div>
  );
}

function LegendChip({
  label,
  tone,
}: {
  label: string;
  tone: "cyan" | "purple" | "green";
}) {
  const dotColors = {
    cyan: "bg-[var(--primary)] shadow-[var(--primary)]/50",
    purple: "bg-[var(--accent)] shadow-[var(--accent)]/50",
    green: "bg-[var(--long)] shadow-[var(--long)]/50",
  };
  
  const borderColors = {
    cyan: "border-[var(--primary)]/20",
    purple: "border-[var(--accent)]/20",
    green: "border-[var(--long)]/20",
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-full border bg-[var(--panel)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors",
      borderColors[tone],
      "text-[var(--muted)] hover:bg-[var(--sidebar)]"
    )}>
      <span className={cn("h-2 w-2 rounded-full shadow-sm", dotColors[tone])} />
      {label}
    </div>
  );
}
