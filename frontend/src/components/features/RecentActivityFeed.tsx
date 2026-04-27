import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
            className="flex items-start gap-3 rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", getToneDot(item.tone ?? "neutral"))} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">
                  {item.timeLabel}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.detail}</p>
            </div>
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
