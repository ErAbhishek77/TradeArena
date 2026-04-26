import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function PositionCard({
  direction,
  size,
  entryPrice,
  currentPrice,
  unrealizedPnl,
  returnPct,
  hasPosition,
  onClose,
  closePending,
}: {
  direction?: string | null;
  size?: string | null;
  entryPrice?: string | null;
  currentPrice?: string | null;
  unrealizedPnl?: { label: string; positive: boolean; negative: boolean; key: string } | null;
  returnPct?: { label: string; positive: boolean; negative: boolean; key: string } | null;
  hasPosition: boolean;
  onClose?: () => void;
  closePending?: boolean;
}) {
  if (!hasPosition) {
    return (
      <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel)] p-4">
        <p className="text-sm font-semibold text-[var(--text)]">No open position</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Open a Long or Short position to start tracking live tournament Profit / Loss.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel)] p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569]">
            Position
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--text)]">{direction} BTC/USD</p>
        </div>
        {onClose ? (
          <Button variant="secondary" onClick={onClose} disabled={closePending}>
            {closePending ? "Closing..." : "Close Position"}
          </Button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Stat label="Size" value={size ?? "—"} />
        <Stat label="Entry Price" value={entryPrice ?? "—"} mono />
        <Stat label="Current Tournament Price" value={currentPrice ?? "—"} mono />
        <AnimatedStat label="Unrealized Profit / Loss" value={unrealizedPnl} />
        <AnimatedStat label="Return %" value={returnPct} />
      </div>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-[8px] bg-[var(--panel-soft)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569]">{label}</p>
      <p className={`mt-2 text-sm font-semibold text-[var(--text)] ${mono ? "font-mono tabular-nums" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function AnimatedStat({
  label,
  value,
}: {
  label: string;
  value?: { label: string; positive: boolean; negative: boolean; key: string } | null;
}) {
  const tone = value?.positive
    ? "text-[var(--long)]"
    : value?.negative
      ? "text-[var(--short)]"
      : "text-[var(--text)]";

  return (
    <div className="rounded-[8px] bg-[var(--panel-soft)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569]">{label}</p>
      <motion.p
        key={value?.key ?? label}
        initial={{ opacity: 0.85, scale: 0.98 }}
        animate={{ opacity: 1, scale: [1, 1.04, 1] }}
        transition={{ duration: 0.22 }}
        className={`mt-2 font-mono text-sm font-semibold tabular-nums ${tone}`}
      >
        {value?.label ?? "—"}
      </motion.p>
    </div>
  );
}
