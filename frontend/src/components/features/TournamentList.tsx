import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Trophy } from "@phosphor-icons/react";

export function TournamentList({
  header,
  rows,
}: {
  header?: ReactNode;
  rows: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--panel)]"
    >
      {/* Header Section */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] bg-gradient-to-r from-[var(--panel)] to-[var(--sidebar)] px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary)]/10">
          <Trophy size={18} className="text-[var(--primary)]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)]">Tournaments</h2>
          <p className="text-xs text-[var(--muted)]">Active and upcoming trading competitions</p>
        </div>
      </div>

      {/* Column Headers */}
      {header ? (
        <div className="hidden grid-cols-[minmax(0,1.4fr)_0.8fr_0.8fr_0.7fr_0.8fr_auto] gap-4 border-b border-[var(--border)] bg-[var(--sidebar)]/50 px-5 py-2.5 lg:grid">
          {header}
        </div>
      ) : null}

      {/* Rows */}
      <div className="divide-y divide-[var(--border)]">{rows}</div>
    </motion.div>
  );
}
