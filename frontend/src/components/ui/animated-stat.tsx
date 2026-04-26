import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function AnimatedStat({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  tone = "default",
  caption,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  tone?: "default" | "positive" | "negative" | "warning";
  caption?: string;
}) {
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(value);
  const rounded = useTransform(motionValue, (current) =>
    current.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }),
  );

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration: 0.55,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [motionValue, reduceMotion, value]);

  const toneClass =
    tone === "positive"
      ? "text-[var(--primary-strong)]"
      : tone === "negative"
        ? "text-[var(--short)]"
        : tone === "warning"
          ? "text-[var(--warning)]"
          : "text-[var(--text)]";

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">{label}</p>
      <motion.p
        key={`${label}-${value}`}
        animate={reduceMotion ? undefined : { scale: [1, 1.03, 1] }}
        transition={{ duration: 0.24 }}
        className={cn("font-mono text-2xl font-semibold tabular-nums", toneClass)}
      >
        {prefix}
        <motion.span>{rounded}</motion.span>
        {suffix}
      </motion.p>
      {caption ? <p className="text-xs text-[var(--muted)]">{caption}</p> : null}
    </div>
  );
}
