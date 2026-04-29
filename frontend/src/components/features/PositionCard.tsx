import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { TrendUp, TrendDown, CurrencyCircleDollar, ShieldCheck, Warning, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function PositionCard({
  direction,
  size,
  entryPrice,
  livePrice,
  tournamentPrice,
  livePreviewPnl,
  tournamentPnl,
  returnPct,
  riskControls,
  hasPosition,
  onClose,
  closePending,
}: {
  direction?: string | null;
  size?: string | null;
  entryPrice?: string | null;
  livePrice?: string | null;
  tournamentPrice?: string | null;
  livePreviewPnl?: { label: string; positive: boolean; negative: boolean; key: string } | null;
  tournamentPnl?: { label: string; positive: boolean; negative: boolean; key: string } | null;
  returnPct?: { label: string; positive: boolean; negative: boolean; key: string } | null;
  riskControls?: {
    stopLossPrice?: string | null;
    takeProfitPrice?: string | null;
  } | null;
  hasPosition: boolean;
  onClose?: () => void;
  closePending?: boolean;
}) {
  if (!hasPosition) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel)] p-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--sidebar)]">
            <CurrencyCircleDollar size={24} className="text-[var(--muted)]" />
          </div>
          <div>
            <p className="text-base font-semibold text-[var(--text)]">No open position</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Open a Long or Short position to start tracking live and official Profit / Loss.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const isLong = direction?.toLowerCase() === "long";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--panel)] shadow-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-gradient-to-r from-[var(--panel)] to-[var(--sidebar)]/50 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            isLong ? "bg-[var(--long)]/15" : "bg-[var(--short)]/15"
          )}>
            {isLong ? (
              <TrendUp size={20} className="text-[var(--long)]" />
            ) : (
              <TrendDown size={20} className="text-[var(--short)]" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">
              Position
            </p>
            <p className="mt-0.5 text-base font-bold text-[var(--text)]">{direction} BTC/USD</p>
          </div>
        </div>
        {onClose ? (
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={closePending}
            className="h-9 px-4 text-xs font-semibold"
          >
            {closePending ? (
              <>
                <span className="mr-1.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Closing...
              </>
            ) : (
              <>
                <X size={14} className="mr-1.5" />
                Close Position
              </>
            )}
          </Button>
        ) : null}
      </div>

      {/* Live Preview P/L */}
      <div className="bg-gradient-to-br from-[var(--sidebar)] to-[var(--panel-soft)] p-5">
        <div className="flex items-center gap-2">
          <CurrencyCircleDollar size={14} className="text-[var(--label)]" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">
            Live Preview P/L
          </p>
        </div>
        <motion.p
          key={livePreviewPnl?.key ?? "preview"}
          initial={{ opacity: 0.85, scale: 0.98 }}
          animate={{ opacity: 1, scale: [1, 1.04, 1] }}
          transition={{ duration: 0.24 }}
          className={cn(
            "mt-3 font-mono text-[28px] font-bold tabular-nums",
            livePreviewPnl?.positive && "text-[var(--long)]",
            livePreviewPnl?.negative && "text-[var(--short)]",
            !livePreviewPnl?.positive && !livePreviewPnl?.negative && "text-[var(--text)]"
          )}
        >
          {livePreviewPnl?.label ?? "—"}
        </motion.p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted)]">
          <Warning size={12} />
          Live Preview uses Binance price. Official score uses tournament price synced on-chain.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 p-5 pt-0 sm:grid-cols-2">
        <Stat label="Size" value={size ?? "—"} icon={<CurrencyCircleDollar size={12} />} />
        <Stat label="Entry Price" value={entryPrice ?? "—"} mono icon={<TrendUp size={12} />} />
        <Stat label="Live BTC Price" value={livePrice ?? "—"} mono icon={<TrendDown size={12} />} />
        <Stat label="Tournament Price" value={tournamentPrice ?? "—"} mono icon={<CurrencyCircleDollar size={12} />} />
        <AnimatedStat label="Official Tournament P/L" value={tournamentPnl} />
        <AnimatedStat label="Return %" value={returnPct} />
      </div>

      {/* Risk Controls */}
      {riskControls?.stopLossPrice || riskControls?.takeProfitPrice ? (
        <div className="border-t border-[var(--border)] bg-[var(--panel-soft)] p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[var(--primary)]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">
              Risk Controls
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Stat 
              label="Stop Loss" 
              value={riskControls.stopLossPrice ?? "Not set"} 
              mono 
              variant={riskControls.stopLossPrice ? "danger" : "default"}
            />
            <Stat 
              label="Take Profit" 
              value={riskControls.takeProfitPrice ?? "Not set"} 
              mono 
              variant={riskControls.takeProfitPrice ? "success" : "default"}
            />
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs text-[var(--muted)]">
            <ShieldCheck size={12} className="mt-0.5 shrink-0" />
            Stop Loss and Take Profit are enforced by the tournament keeper on tournament price sync.
          </p>
        </div>
      ) : null}
    </motion.div>
  );
}

function Stat({
  label,
  value,
  mono = false,
  icon,
  variant = "default",
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "danger";
}) {
  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all",
      variant === "success" && "border-[var(--long)]/30 bg-[var(--long)]/5",
      variant === "danger" && "border-[var(--short)]/30 bg-[var(--short)]/5",
      variant === "default" && "border-[var(--border-soft)] bg-[var(--sidebar)]"
    )}>
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">
        {icon}
        {label}
      </p>
      <p className={cn(
        "mt-2 text-[14px] font-bold",
        mono && "font-mono tabular-nums",
        variant === "success" && "text-[var(--long)]",
        variant === "danger" && "text-[var(--short)]",
        variant === "default" && "text-[var(--text)]"
      )}>
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
    <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--sidebar)] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">{label}</p>
      <motion.p
        key={value?.key ?? label}
        initial={{ opacity: 0.85, scale: 0.98 }}
        animate={{ opacity: 1, scale: [1, 1.04, 1] }}
        transition={{ duration: 0.22 }}
        className={cn("mt-2 font-mono text-[14px] font-bold tabular-nums", tone)}
      >
        {value?.label ?? "—"}
      </motion.p>
    </div>
  );
}
