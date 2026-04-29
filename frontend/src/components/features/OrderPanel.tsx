import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Clock, CurrencyCircleDollar, TrendUp, TrendDown, Warning, ShieldCheck } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function OrderPanel({
  tournamentName,
  timeLeft,
  prizePool,
  direction,
  onDirectionChange,
  size,
  onSizeChange,
  availableBalance,
  entryPrice,
  currentPrice,
  estimatedPnl,
  actionLabel,
  onAction,
  actionVariant,
  actionDisabled,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryDisabled,
  activePositionSummary,
  stopLossPrice,
  onStopLossChange,
  takeProfitPrice,
  onTakeProfitChange,
  riskControlsHelper,
  helper,
  warning,
}: {
  tournamentName?: string;
  timeLeft?: string;
  prizePool?: string;
  direction: "Long" | "Short";
  onDirectionChange: (direction: "Long" | "Short") => void;
  size: string;
  onSizeChange: (value: string) => void;
  availableBalance: string;
  entryPrice: string;
  currentPrice: string;
  estimatedPnl: { value: string; tone: "default" | "positive" | "negative" };
  actionLabel: string;
  onAction: () => void;
  actionVariant: "positive" | "danger";
  actionDisabled?: boolean;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryDisabled?: boolean;
  activePositionSummary?: {
    direction: string;
    size: string;
    entryPrice: string;
  } | null;
  stopLossPrice: string;
  onStopLossChange: (value: string) => void;
  takeProfitPrice: string;
  onTakeProfitChange: (value: string) => void;
  riskControlsHelper?: ReactNode;
  helper?: ReactNode;
  warning?: ReactNode;
}) {
  const hasOpenPosition = Boolean(activePositionSummary);
  const riskConfigured = Boolean(stopLossPrice.trim() || takeProfitPrice.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--panel)] shadow-xl"
    >
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-gradient-to-r from-[var(--panel)] to-[var(--sidebar)]/50 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            direction === "Long" ? "bg-[var(--long)]/15" : "bg-[var(--short)]/15"
          )}>
            {direction === "Long" ? (
              <TrendUp size={18} className="text-[var(--long)]" />
            ) : (
              <TrendDown size={18} className="text-[var(--short)]" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">
              Order
            </p>
            <p className="mt-0.5 text-lg font-bold text-[var(--text)]">
              {tournamentName ?? "Tournament Order"}
            </p>
          </div>
        </div>
        {(timeLeft || prizePool) ? (
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
            {timeLeft && (
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {timeLeft}
              </span>
            )}
            {prizePool && (
              <span className="flex items-center gap-1.5">
                <CurrencyCircleDollar size={12} className="text-[var(--primary)]" />
                Prize pool {prizePool}
              </span>
            )}
          </div>
        ) : null}
      </div>

      <div className="space-y-5 p-5">
        {/* Direction Selector */}
        <SegmentedControl
          value={direction}
          onChange={(value) => onDirectionChange(value as "Long" | "Short")}
          disabled={hasOpenPosition || actionDisabled}
          options={[
            { label: "LONG", value: "Long", tone: "positive" },
            { label: "SHORT", value: "Short", tone: "danger" },
          ]}
        />

        {/* Size Input */}
        <label className="block">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">
            <CurrencyCircleDollar size={12} />
            Size
          </span>
          <div className="mt-2 flex min-h-[48px] items-center rounded-xl border border-[var(--border-soft)] bg-[var(--sidebar)] px-4 transition-all focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--primary)]/20">
            <input
              value={size}
              onChange={(event) => onSizeChange(event.target.value)}
              disabled={hasOpenPosition || actionDisabled}
              className="w-full bg-transparent text-[15px] font-semibold text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
              placeholder="100"
            />
            <span className="text-[12px] font-medium text-[var(--label)]">USDT</span>
          </div>
        </label>

        {/* Order Info */}
        <div className="space-y-2 rounded-xl border border-[var(--border-soft)] bg-gradient-to-br from-[var(--sidebar)] to-[var(--panel-soft)] p-4">
          <InfoRow label="Available" value={availableBalance} icon={<CurrencyCircleDollar size={12} />} />
          <InfoRow label="Tournament Price" value={entryPrice} icon={<TrendUp size={12} />} />
          <InfoRow label="Live BTC Price" value={currentPrice} icon={<TrendDown size={12} />} />
          <div className="my-1 h-px bg-[var(--border)]" />
          <InfoRow
            label="Live Preview P/L"
            value={
              <motion.span
                key={estimatedPnl.value}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "font-mono text-[14px] font-bold tabular-nums",
                  estimatedPnl.tone === "positive" && "text-[var(--long)]",
                  estimatedPnl.tone === "negative" && "text-[var(--short)]",
                  estimatedPnl.tone === "default" && "text-[var(--text)]"
                )}
              >
                {estimatedPnl.value}
              </motion.span>
            }
          />
        </div>

        {/* Risk Controls */}
        <details
          className="rounded-xl border border-[var(--border-soft)] bg-[var(--sidebar)] p-4 transition-colors"
          open={riskConfigured}
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[var(--primary)]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">
                  Risk Controls
                </p>
                <p className="mt-1 text-[12px] text-[var(--muted)]">
                  Optional Stop Loss and Take Profit levels.
                </p>
              </div>
            </div>
            <span className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
              riskConfigured 
                ? "bg-[var(--primary)]/15 text-[var(--primary)]" 
                : "bg-[var(--border)] text-[var(--muted)]"
            )}>
              {riskConfigured ? "Configured" : "Optional"}
            </span>
          </summary>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--short)]">
                <TrendDown size={12} />
                Stop Loss
              </span>
              <div className="mt-2 flex min-h-[48px] items-center rounded-xl border border-[var(--border-soft)] bg-[var(--panel-soft)] px-4 transition-all focus-within:border-[var(--short)] focus-within:ring-2 focus-within:ring-[var(--short)]/20">
                <span className="text-[12px] font-medium text-[var(--label)]">$</span>
                <input
                  value={stopLossPrice}
                  onChange={(event) => onStopLossChange(event.target.value)}
                  disabled={hasOpenPosition || actionDisabled}
                  className="w-full bg-transparent px-2 text-[14px] font-semibold text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                  placeholder="58,500"
                  inputMode="decimal"
                />
              </div>
            </label>
            <label className="block">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--long)]">
                <TrendUp size={12} />
                Take Profit
              </span>
              <div className="mt-2 flex min-h-[48px] items-center rounded-xl border border-[var(--border-soft)] bg-[var(--panel-soft)] px-4 transition-all focus-within:border-[var(--long)] focus-within:ring-2 focus-within:ring-[var(--long)]/20">
                <span className="text-[12px] font-medium text-[var(--label)]">$</span>
                <input
                  value={takeProfitPrice}
                  onChange={(event) => onTakeProfitChange(event.target.value)}
                  disabled={hasOpenPosition || actionDisabled}
                  className="w-full bg-transparent px-2 text-[14px] font-semibold text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                  placeholder="63,000"
                  inputMode="decimal"
                />
              </div>
            </label>
          </div>
          {riskControlsHelper ? (
            <div className="mt-3 flex items-start gap-2 text-[12px] text-[var(--muted)]">
              <ShieldCheck size={14} className="mt-0.5 shrink-0" />
              {riskControlsHelper}
            </div>
          ) : null}
        </details>

        {/* Active Position Summary */}
        {activePositionSummary ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-[var(--primary)]/30 bg-gradient-to-br from-[var(--primary)]/10 to-transparent p-4"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[var(--primary)]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
                Open Position
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <InfoRow label="Direction" value={activePositionSummary.direction} />
              <InfoRow label="Size" value={activePositionSummary.size} />
              <InfoRow label="Entry Price" value={activePositionSummary.entryPrice} />
            </div>
          </motion.div>
        ) : null}

        {/* Warning & Helper */}
        {warning && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2 rounded-lg border border-[var(--short)]/30 bg-[var(--short)]/10 p-3 text-[12px] text-[var(--short)]"
          >
            <Warning size={16} className="mt-0.5 shrink-0" />
            {warning}
          </motion.div>
        )}
        {helper && (
          <div className="flex items-start gap-2 text-[12px] text-[var(--muted)]">
            <ShieldCheck size={14} className="mt-0.5 shrink-0" />
            {helper}
          </div>
        )}

        {/* Action Buttons */}
        {!activePositionSummary ? (
          <Button variant={actionVariant} fullWidth onClick={onAction} disabled={actionDisabled} className="h-12 text-sm font-bold">
            {actionLabel}
          </Button>
        ) : null}
        {secondaryActionLabel && onSecondaryAction ? (
          <Button variant="secondary" fullWidth onClick={onSecondaryAction} disabled={secondaryDisabled} className="h-11 text-sm font-semibold">
            {secondaryActionLabel}
          </Button>
        ) : null}
      </div>
    </motion.div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">
        {icon}
        {label}
      </span>
      <span className="font-mono text-[13px] font-semibold tabular-nums text-[var(--text)]">{value}</span>
    </div>
  );
}
