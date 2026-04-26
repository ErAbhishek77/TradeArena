import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { CurrencyBtc } from "@phosphor-icons/react";

export function PriceTicker({
  label,
  price,
  change,
}: {
  label: string;
  price: string;
  change?: string;
}) {
  const previous = useRef(price);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (previous.current === price) return;
    const prev = Number(previous.current.replace(/[^0-9.-]/g, ""));
    const next = Number(price.replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(prev) && Number.isFinite(next)) {
      setFlash(next >= prev ? "up" : "down");
      const id = window.setTimeout(() => setFlash(null), 600);
      previous.current = price;
      return () => window.clearTimeout(id);
    }
    previous.current = price;
  }, [price]);

  const flashClass =
    flash === "up" ? "text-[var(--primary-strong)]" : flash === "down" ? "text-[var(--short)]" : "text-[var(--text)]";
  const flashBackground =
    flash === "up"
      ? "bg-[rgba(28,203,120,0.14)]"
      : flash === "down"
        ? "bg-[rgba(255,107,107,0.14)]"
        : "bg-[var(--panel)]";
  const arrow = flash === "up" ? "↑" : flash === "down" ? "↓" : "•";

  return (
    <motion.div
      animate={{ scale: flash ? [1, 1.02, 1] : 1 }}
      transition={{ duration: 0.22 }}
      className={`inline-flex min-h-[36px] items-center gap-3 rounded-full border border-[var(--border-hi)] px-[14px] py-[6px] transition-colors duration-300 ${flashBackground}`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(247,147,26,0.18)] text-[#F7931A]">
        <CurrencyBtc size={11} weight="bold" />
      </span>
      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
        {label}
      </span>
      <motion.span
        key={price}
        initial={{ opacity: 0.85, y: 2, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={`font-mono text-sm font-semibold ${flashClass}`}
      >
        {price}
      </motion.span>
      <motion.span
        key={`${arrow}-${change ?? ""}`}
        initial={{ opacity: 0.6, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        className={`font-mono text-sm ${flashClass}`}
      >
        {arrow}
      </motion.span>
      {change ? (
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-xs ${
            flash === "up"
              ? "bg-[rgba(28,203,120,0.14)] text-[var(--primary-strong)]"
              : flash === "down"
                ? "bg-[rgba(255,107,107,0.14)] text-[var(--short)]"
                : "bg-white/[0.04] text-[var(--muted)]"
          }`}
        >
          {change}
        </span>
      ) : null}
    </motion.div>
  );
}
