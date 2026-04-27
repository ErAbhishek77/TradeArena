import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import type { TournamentView } from "@/lib/arena";

export function TournamentRow({
  tournament,
  statusLabel,
  statusKind,
  entryFee,
  prizePool,
  players,
  timeLeft,
  endsAt,
  primaryLabel,
  onPrimary,
  onSecondary,
  secondaryLabel,
  secondaryDisabled,
  secondaryTitle,
  active,
}: {
  tournament: TournamentView;
  statusLabel: string;
  statusKind: "live" | "soon" | "ended" | "settled" | "settling" | "claim";
  entryFee: string;
  prizePool: string;
  players: string;
  timeLeft: string;
  endsAt: string;
  primaryLabel: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  secondaryLabel?: string;
  secondaryDisabled?: boolean;
  secondaryTitle?: string;
  active?: boolean;
}) {
  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className={`grid gap-[12px] rounded-[10px] border px-[16px] py-[14px] lg:grid-cols-[minmax(0,1.4fr)_0.8fr_0.8fr_0.7fr_0.8fr_auto] lg:items-center ${
        active
          ? "border-[var(--primary)] bg-[var(--panel)] shadow-sm"
          : "border-[var(--border-soft)] bg-[var(--panel)]"
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[13px] font-semibold text-[var(--text)]">{tournament.name}</p>
          <StatusPill kind={statusKind} label={statusLabel} />
        </div>
        <p className="mt-1 text-[11px] text-[var(--muted)]">Tournament #{tournament.tournament_id}</p>
      </div>
      <Cell label="Entry Fee" value={entryFee} />
      <Cell label="Prize Pool" value={prizePool} emphasis />
      <Cell label="Players" value={players} />
      <Cell label="Time Left" value={timeLeft} sub={endsAt} />
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <Button variant="primary" onClick={onPrimary} className="min-h-[36px] py-[6px] text-xs">
          {primaryLabel}
        </Button>
        {onSecondary && secondaryLabel ? (
          <Button
            variant="secondary"
            onClick={onSecondary}
            disabled={secondaryDisabled}
            title={secondaryTitle}
            className="min-h-[36px] py-[6px] text-xs"
          >
            {secondaryLabel}
          </Button>
        ) : null}
      </div>
    </motion.div>
  );
}

function Cell({
  label,
  value,
  sub,
  emphasis = false,
}: {
  label: string;
  value: string;
  sub?: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">
        {label}
      </p>
      <p className={`mt-1 text-[13px] font-semibold tabular-nums ${emphasis ? "text-[var(--primary)]" : "text-[var(--text)]"}`}>
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-[11px] text-[var(--muted)]">{sub}</p> : null}
    </div>
  );
}
