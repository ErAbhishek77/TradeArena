import { Trophy, TrendUp, Wallet, NumberOne, NumberTwo, NumberThree } from "@phosphor-icons/react";
import { motion } from "framer-motion";

const steps = [
  {
    id: "01",
    title: "Join a game",
    body: "Choose a BTC tournament and pay the entry fee.",
    icon: Wallet,
    numberIcon: NumberOne,
  },
  {
    id: "02",
    title: "Choose up or down",
    body: "Use practice money to predict whether BTC will rise or fall.",
    icon: TrendUp,
    numberIcon: NumberTwo,
  },
  {
    id: "03",
    title: "Track your rank",
    body: "If your score finishes near the top, you earn from the reward pool.",
    icon: Trophy,
    numberIcon: NumberThree,
  },
];

export function StepCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const NumberIcon = step.numberIcon;
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className="group relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--panel)] p-5 transition-all hover:border-[var(--primary)]/30"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <NumberIcon size={14} className="text-[var(--primary)]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--subtle)]">
                    Step {step.id}
                  </span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--primary)]">
                  <Icon size={20} />
                </div>
              </div>
              <p className="mt-5 text-base font-bold text-[var(--text)]">{step.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.body}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="absolute -right-2 top-1/2 z-20 hidden h-px w-4 bg-[var(--border)] md:block" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
