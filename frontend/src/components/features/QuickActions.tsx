import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "@phosphor-icons/react";

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
            Start Here
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">Choose the next step</h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.24 }}
            whileHover={{ y: -2 }}
            className={`group relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--panel)] p-5 transition-all hover:border-[var(--primary)]/30 ${index === 0 ? "xl:col-span-2" : ""}`}
          >
            <div className="relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--primary)]">
                {action.icon}
              </div>
              <p className="mt-5 text-base font-semibold text-[var(--text)]">{action.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{action.description}</p>
              <div className="mt-5">
                <Button
                  variant={action.variant ?? "secondary"}
                  onClick={action.onClick}
                  fullWidth
                  className="sm:w-auto"
                >
                  {action.buttonLabel}
                  <ArrowRight size={14} className="ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
