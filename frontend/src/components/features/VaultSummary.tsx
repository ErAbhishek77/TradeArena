import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { TrendUp, TrendDown, CurrencyCircleDollar, Wallet, ChartLine, Clock } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function VaultStats({
  cards,
  aside,
}: {
  cards: { label: string; value: string; tone?: "default" | "positive" | "negative"; meta?: string }[];
  aside?: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--sidebar)] p-4 transition-all hover:border-[var(--border)] hover:shadow-lg"
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            <div className="relative">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">
                {card.label === "Total P/L" && <TrendUp size={12} className="text-[var(--primary)]" />}
                {card.label === "Win Rate" && <ChartLine size={12} className="text-[var(--primary)]" />}
                {card.label === "Total Trades" && <CurrencyCircleDollar size={12} className="text-[var(--primary)]" />}
                {card.label === "Active Tournaments" && <Wallet size={12} className="text-[var(--primary)]" />}
                {card.label === "Time in Position" && <Clock size={12} className="text-[var(--primary)]" />}
                {card.label}
              </p>
              <p
                className={cn(
                  "mt-3 font-mono text-xl font-bold tabular-nums",
                  card.tone === "positive" && "text-[var(--long)]",
                  card.tone === "negative" && "text-[var(--short)]",
                  card.tone === "default" || !card.tone && "text-[var(--text)]"
                )}
              >
                {card.value}
              </p>
              {card.meta && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--muted)]">
                  {card.tone === "positive" && <TrendUp size={10} />}
                  {card.tone === "negative" && <TrendDown size={10} />}
                  {card.meta}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      {aside}
    </div>
  );
}
