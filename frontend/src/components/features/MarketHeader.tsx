import { StatusPill } from "@/components/ui/StatusPill";

export function MarketHeader({
  title,
  livePrice,
  tournamentPrice,
  syncStatus,
  timeLeft,
  statusKind,
  statusLabel,
}: {
  title: string;
  livePrice: string;
  tournamentPrice: string;
  syncStatus: string;
  timeLeft: string;
  statusKind: "live" | "soon" | "ended" | "settled" | "settling" | "claim";
  statusLabel: string;
}) {
  return (
    <div className="rounded-[12px] border border-[var(--border-soft)] bg-[var(--panel)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">{title}</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">BTC/USD</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Trades use tournament price for fair scoring.
          </p>
        </div>
        <StatusPill kind={statusKind} label={statusLabel} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <HeaderCell label="Live BTC" value={livePrice} mono />
        <HeaderCell label="Tournament Price" value={tournamentPrice} mono />
        <HeaderCell label="Price Sync" value={syncStatus} />
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
