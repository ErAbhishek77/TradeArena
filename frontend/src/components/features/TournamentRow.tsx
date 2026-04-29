import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import type { TournamentView } from "@/lib/arena";
import { Users, Clock, CurrencyCircleDollar, CalendarCheck } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const statusColors = {
  live: "bg-green-500/15 text-green-400 border-green-500/20",
  soon: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  ended: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  settled: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  settling: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  claim: "bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/20",
};

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
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group grid gap-3 rounded-xl border px-4 py-4 transition-all duration-200 lg:grid-cols-[minmax(0,1.4fr)_0.8fr_0.8fr_0.7fr_0.8fr_auto] lg:items-center lg:gap-4 lg:px-5",
        active
          ? "border-[var(--primary)] bg-gradient-to-r from-[var(--primary)]/5 to-transparent shadow-lg shadow-[var(--primary)]/10"
          : "border-[var(--border-soft)] bg-[var(--panel)] hover:border-[var(--border)] hover:shadow-md"
      )}
    >
      {/* Tournament Info */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="truncate text-sm font-semibold text-[var(--text)]">{tournament.name}</p>
          <span className={cn(
            "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            statusColors[statusKind]
          )}>
            {statusLabel}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-[var(--muted)]">
          <CalendarCheck size={12} />
          <span> Tournament #{tournament.tournament_id}</span>
        </div>
      </div>

      {/* Entry Fee */}
      <Cell 
        icon={<CurrencyCircleDollar size={14} className="text-[var(--muted)]" />}
        label="Entry Fee" 
        value={entryFee} 
      />

      {/* Prize Pool */}
      <Cell 
        icon={<CurrencyCircleDollar size={14} className="text-[var(--primary)]" />}
        label="Prize Pool" 
        value={prizePool} 
        emphasis 
      />

      {/* Players */}
      <Cell 
        icon={<Users size={14} className="text-[var(--muted)]" />}
        label="Players" 
        value={players} 
      />

      {/* Time Left */}
      <Cell 
        icon={<Clock size={14} className="text-[var(--muted)]" />}
        label="Time Left" 
        value={timeLeft} 
        sub={endsAt} 
      />

      {/* Actions */}
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <Button 
          variant="primary" 
          onClick={onPrimary} 
          className="min-h-[36px] px-4 py-2 text-xs font-semibold"
        >
          {primaryLabel}
        </Button>
        {onSecondary && secondaryLabel ? (
          <Button
            variant="secondary"
            onClick={onSecondary}
            disabled={secondaryDisabled}
            title={secondaryTitle}
            className="min-h-[36px] px-3 py-2 text-xs"
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
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  emphasis?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="lg:py-1">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]">
        {icon}
        {label}
      </p>
      <p className={cn(
        "mt-1.5 text-[13px] font-bold tabular-nums lg:font-semibold", 
        emphasis ? "text-[var(--primary)]" : "text-[var(--text)]"
      )}>
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--muted)]">
          <Clock size={10} />
          {sub}
        </p>
      )}
    </div>
  );
}
