import { Trophy, TrendUp, Wallet } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const steps = [
  {
    id: "01",
    title: "Join",
    body: "Pick a tournament. Pay the entry fee in VARA.",
    icon: Wallet,
  },
  {
    id: "02",
    title: "Trade",
    body: "Go long or short on BTC with virtual balance.",
    icon: TrendUp,
  },
  {
    id: "03",
    title: "Win",
    body: "Highest Return % wins the on-chain prize pool.",
    icon: Trophy,
  },
];

export function StepCards() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: index * 0.08 }}
            className="rounded-[10px] border border-white/[0.06] bg-[var(--sidebar)] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
                {step.id}
              </span>
              <Icon size={16} className="text-[var(--primary)]" />
            </div>
            <p className="mt-4 text-sm font-bold text-[var(--text)]">{step.title}</p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{step.body}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
