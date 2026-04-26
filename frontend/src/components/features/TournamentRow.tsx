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
      className={`grid gap-4 rounded-[10px] border px-4 py-[14px] lg:grid-cols-[minmax(0,1.4fr)_0.8fr_0.8fr_0.7fr_0.8fr_auto] lg:items-center ${
        active
          ? "border-[var(--border-hi)] bg-[linear-gradient(180deg,rgba(17,39,29,0.96),rgba(12,27,20,0.96))] shadow-[0_14px_36px_rgba(28,203,120,0.08)]"
          : "border-[var(--border-soft)] bg-[var(--panel)]"
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-[var(--text)]">{tournament.name}</p>
          <StatusPill kind={statusKind} label={statusLabel} />
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">Tournament #{tournament.tournament_id}</p>
      </div>
      <Cell label="Entry Fee" value={entryFee} />
      <Cell label="Prize Pool" value={prizePool} emphasis />
      <Cell label="Players" value={players} />
      <Cell label="Time Left" value={timeLeft} sub={endsAt} />
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <Button variant="primary" onClick={onPrimary}>
          {primaryLabel}
        </Button>
        {onSecondary && secondaryLabel ? (
          <Button
            variant="secondary"
            onClick={onSecondary}
            disabled={secondaryDisabled}
            title={secondaryTitle}
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
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#475569]">
        {label}
      </p>
      <p className={`mt-2 font-mono text-sm font-semibold tabular-nums ${emphasis ? "text-[var(--text)]" : "text-[var(--text)]"}`}>
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-[var(--muted)]">{sub}</p> : null}
    </div>
  );
}
