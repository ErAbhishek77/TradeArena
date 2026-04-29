import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Lightning, Wallet, Trophy, ChartLine, Users, Gear, Star } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type QuickActionItem = {
  id: string;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  icon: ReactNode;
  variant?: "primary" | "secondary" | "positive" | "danger" | "ghost";
};

export function QuickActions({
  actions,
}: {
  actions: QuickActionItem[];
}) {
  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.32 } },
      }}
      className="product-card p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--subtle)]">
            Quick Actions
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">Move fast inside the arena</h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.24 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-gradient-to-br from-[var(--sidebar)] via-[var(--panel)] to-[var(--sidebar)] p-5 transition-all hover:border-[var(--primary)]/30 hover:shadow-xl hover:shadow-[var(--primary)]/5"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            <div className="relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] shadow-lg text-[var(--primary)] group-hover:border-[var(--primary)]/30 group-hover:text-[var(--primary)] transition-colors">
                {action.icon}
              </div>
              <p className="mt-5 text-base font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">{action.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{action.description}</p>
              <div className="mt-5">
                <Button
                  variant={action.variant ?? "secondary"}
                  onClick={action.onClick}
                  fullWidth
                  className="sm:w-auto group-hover:shadow-lg group-hover:shadow-[var(--primary)]/20"
                >
                  {action.buttonLabel}
                  <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
