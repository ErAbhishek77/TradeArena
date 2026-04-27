import { motion } from "framer-motion";
import { StatusPill } from "@/components/ui/StatusPill";

export function MarketHeader({
  title,
  livePrice,
  tournamentPrice,
  syncStatus,
  timeLeft,
  statusKind,
  statusLabel,
  priceSourceLabel,
  sourceNotice,
}: {
  title: string;
  livePrice: string;
  tournamentPrice: string;
  syncStatus: string;
  timeLeft: string;
  statusKind: "live" | "soon" | "ended" | "settled" | "settling" | "claim";
  statusLabel: string;
  priceSourceLabel: string;
  sourceNotice?: string;
}) {
  return (
    <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">{title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-[var(--text)]">BTC/USD</h2>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
              <motion.span
                animate={{ opacity: [0.45, 1, 0.45], scale: [1, 1.12, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                className="h-2 w-2 rounded-full bg-[var(--long)]"
              />
              Live
            </div>
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Trades use tournament price for fair scoring.
          </p>
          <p className="mt-2 text-[11px] font-medium text-[var(--muted)]">
            {priceSourceLabel}
          </p>
          {sourceNotice ? (
            <p className="mt-1 text-[11px] font-medium text-amber-300">{sourceNotice}</p>
          ) : null}
        </div>
        <StatusPill kind={statusKind} label={statusLabel} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <HeaderCell label="Live BTC Price" value={livePrice} mono tone="primary" />
        <HeaderCell label="Tournament Price" value={tournamentPrice} mono />
        <HeaderCell label="Sync Status" value={syncStatus} />
        <HeaderCell label="Time Left" value={timeLeft} />
        <HeaderCell label="Status" value={statusLabel} />
      </div>
    </div>
  );
}

function HeaderCell({
  label,
  value,
  mono = false,
  tone = "default",
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "default" | "primary";
}) {
  return (
    <div className="rounded-[8px] border border-[var(--border-soft)] bg-[var(--panel-soft)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">{label}</p>
      <p
        className={`mt-2 text-[13px] font-semibold ${
          tone === "primary" ? "text-[var(--primary)]" : "text-[var(--text)]"
        } ${mono ? "font-mono tabular-nums" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
