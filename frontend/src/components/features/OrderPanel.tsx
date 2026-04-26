import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

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
  helper?: ReactNode;
  warning?: ReactNode;
}) {
  return (
    <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel)] p-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569]">
          Order
        </p>
        <p className="mt-2 text-lg font-semibold text-[var(--text)]">
          {tournamentName ?? "Tournament Order"}
        </p>
        {(timeLeft || prizePool) ? (
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            {timeLeft ? <span>{timeLeft}</span> : null}
            {prizePool ? <span>Prize pool {prizePool}</span> : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        <SegmentedControl
          value={direction}
          onChange={(value) => onDirectionChange(value as "Long" | "Short")}
          options={[
            { label: "LONG", value: "Long", tone: "positive" },
            { label: "SHORT", value: "Short", tone: "danger" },
          ]}
        />

        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569]">
            Size
          </span>
          <div className="mt-2 flex min-h-[44px] items-center rounded-[7px] border border-[var(--border-soft)] bg-[var(--sidebar)] px-4">
            <input
              value={size}
              onChange={(event) => onSizeChange(event.target.value)}
              className="w-full bg-transparent text-sm text-[var(--text)] outline-none"
              placeholder="100"
            />
            <span className="text-sm text-[var(--muted)]">USDT</span>
          </div>
        </label>

        <div className="space-y-3 rounded-[8px] bg-[var(--sidebar)] p-4 text-sm">
          <InfoRow label="Available" value={availableBalance} />
          <InfoRow label="Entry Price" value={entryPrice} />
          <InfoRow label="Current Price" value={currentPrice} />
          <InfoRow
            label="Est. Profit / Loss"
            value={
              <motion.span
                key={estimatedPnl.value}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 0.2 }}
                className={`font-mono ${
                  estimatedPnl.tone === "positive"
                    ? "text-[var(--green)]"
                    : estimatedPnl.tone === "negative"
                      ? "text-[var(--red)]"
                      : "text-[var(--text)]"
                }`}
              >
                {estimatedPnl.value}
              </motion.span>
            }
          />
        </div>

        {warning ? <div className="text-sm text-[var(--red)]">{warning}</div> : null}
        {helper ? <div className="text-sm text-[var(--muted)]">{helper}</div> : null}

        <Button variant={actionVariant} fullWidth onClick={onAction} disabled={actionDisabled}>
          {actionLabel}
        </Button>
        {secondaryActionLabel && onSecondaryAction ? (
          <Button variant="secondary" fullWidth onClick={onSecondaryAction} disabled={secondaryDisabled}>
            {secondaryActionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="font-mono tabular-nums text-[var(--text)]">{value}</span>
    </div>
  );
}
