import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GlowTable({
  header,
  rows,
  emptyState,
}: {
  header: ReactNode;
  rows: {
    key: string;
    content: ReactNode;
    highlight?: boolean;
    podium?: 1 | 2 | 3;
  }[];
  emptyState?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="space-y-3">
      <div className="grid gap-3 rounded-2xl border border-[var(--border-soft)] bg-[rgba(8,20,15,0.72)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">
        {header}
      </div>
      {rows.length ? (
        rows.map((row, index) => (
          <motion.div
            key={row.key}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={reduceMotion ? undefined : { y: -3 }}
            transition={{ duration: 0.22, delay: index * 0.03 }}
            className={cn(
              "relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--panel)] px-4 py-4",
              row.highlight && "shadow-[0_0_0_1px_rgba(103,247,177,0.24),0_18px_36px_rgba(28,203,120,0.12)]",
            )}
          >
            {row.podium ? (
              <div
                className={cn(
                  "pointer-events-none absolute inset-x-0 top-0 h-12 opacity-70",
                  row.podium === 1
                    ? "bg-[radial-gradient(circle_at_top,rgba(244,201,93,0.16),transparent_72%)]"
                    : row.podium === 2
                      ? "bg-[radial-gradient(circle_at_top,rgba(226,232,240,0.14),transparent_72%)]"
                      : "bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.14),transparent_72%)]",
                )}
              />
            ) : null}
            <div className="relative">{row.content}</div>
          </motion.div>
        ))
      ) : (
        emptyState
      )}
    </div>
  );
}
