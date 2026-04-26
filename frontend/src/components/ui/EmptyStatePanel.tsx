import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function EmptyStatePanel({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow?: string;
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="product-card px-5 py-6 text-left"
    >
      {eyebrow ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">
          {eyebrow}
        </p>
      ) : null}
      <p className="mt-2 text-lg font-semibold text-[var(--text)]">{title}</p>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">{copy}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </motion.div>
  );
}
