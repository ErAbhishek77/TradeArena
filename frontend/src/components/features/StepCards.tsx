import { Trophy, TrendUp, Wallet, ArrowRight, NumberOne, NumberTwo, NumberThree } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "01",
    title: "Join Arena",
    body: "Pick a BTC tournament and enter with a simple VARA fee.",
    icon: Wallet,
    numberIcon: NumberOne,
  },
  {
    id: "02",
    title: "Trade BTC",
    body: "Use virtual balance to open Long or Short positions on BTC.",
    icon: TrendUp,
    numberIcon: NumberTwo,
  },
  {
    id: "03",
    title: "Win VARA",
    body: "Finish near the top of Return % and earn from the prize pool.",
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
            whileHover={{ y: -6, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-gradient-to-br from-[var(--sidebar)] via-[var(--panel)] to-[var(--sidebar)] p-5 transition-all hover:border-[var(--primary)]/30 hover:shadow-xl hover:shadow-[var(--primary)]/10"
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <NumberIcon size={14} className="text-[var(--primary)]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--subtle)]">
                    Step {step.id}
                  </span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-soft)] shadow-lg text-[var(--primary)] group-hover:border-[var(--primary)]/30 group-hover:scale-110 transition-all">
                  <Icon size={20} />
                </div>
              </div>
              <p className="mt-5 text-base font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">{step.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.body}</p>
              
              {/* Arrow indicator on hover */}
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--primary)] opacity-0 transition-all group-hover:opacity-100">
                <span>Learn more</span>
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
            
            {/* Step connector line */}
            {index < steps.length - 1 && (
              <div className="absolute -right-2 top-1/2 z-20 hidden h-px w-4 bg-[var(--border)] md:block" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
