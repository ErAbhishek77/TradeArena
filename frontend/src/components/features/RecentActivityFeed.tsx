import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendUp, TrendDown, Clock, Star, ArrowRight, CurrencyCircleDollar, Trophy, WarningCircle, Info } from "@phosphor-icons/react";

export type ActivityFeedItem = {
  id: string;
  title: string;
  detail: string;
  timeLabel: string;
  tone?: "neutral" | "positive" | "negative" | "live";
};

export function RecentActivityFeed({
  items,
}: {
  items: ActivityFeedItem[];
}) {
  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.32 } },
      }}
      className="product-card p-5 sm:p-6"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--subtle)]">
        Recent Activity
      </p>
      <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">Live arena feed</h2>

      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.24 }}
            whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.1)" }}
            className="group relative flex items-start gap-3 rounded-2xl border border-[var(--border-soft)] bg-gradient-to-br from-[var(--sidebar)] to-[var(--panel)] p-4 transition-colors"
          >
            {/* Icon based on tone */}
            <div className={cn(
              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
              getToneIconBg(item.tone ?? "neutral")
            )}>
              {getToneIcon(item.tone ?? "neutral")}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
                <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">
                  <Clock size={10} />
                  {item.timeLabel}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.detail}</p>
            </div>
            
            {/* Hover arrow indicator */}
            <ArrowRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 text-[var(--muted)]" />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function getToneDot(tone: ActivityFeedItem["tone"]) {
  if (tone === "positive") return "bg-[var(--long)]";
  if (tone === "negative") return "bg-[var(--short)]";
  if (tone === "live") return "bg-[var(--primary)] shadow-[0_0_14px_rgba(74,217,255,0.7)]";
  return "bg-[var(--muted)]";
}

function getToneIcon(tone: ActivityFeedItem["tone"]) {
  if (tone === "positive") return <TrendUp size={16} className="text-[var(--long)]" />;
  if (tone === "negative") return <TrendDown size={16} className="text-[var(--short)]" />;
  if (tone === "live") return <CurrencyCircleDollar size={16} className="text-[var(--primary)]" />;
  return <Info size={16} className="text-[var(--muted)]" />;
}

function getToneIconBg(tone: ActivityFeedItem["tone"]) {
  if (tone === "positive") return "bg-[var(--long)]/10 border-[var(--long)]/20";
  if (tone === "negative") return "bg-[var(--short)]/10 border-[var(--short)]/20";
  if (tone === "live") return "bg-[var(--primary)]/10 border-[var(--primary)]/20 animate-pulse";
  return "bg-[var(--border)]/50 border-[var(--border)]";
}
