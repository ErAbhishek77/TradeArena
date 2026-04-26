import { motion } from "framer-motion";

type ProgressStep = {
  id: string;
  title: string;
  copy: string;
  done?: boolean;
  active?: boolean;
};

export function ProgressTracker({ steps }: { steps: ProgressStep[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: index * 0.06 }}
          className={`product-card-soft p-4 ${
            step.active ? "ring-1 ring-[var(--border-hi)]" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                step.done
                  ? "bg-[rgba(28,203,120,0.18)] text-[var(--primary-strong)]"
                  : step.active
                    ? "bg-[rgba(103,247,177,0.12)] text-[var(--primary)]"
                    : "bg-white/[0.04] text-[var(--muted)]"
              }`}
            >
              {step.id}
            </span>
            <p className="text-sm font-semibold text-[var(--text)]">{step.title}</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{step.copy}</p>
        </motion.div>
      ))}
    </div>
  );
}
