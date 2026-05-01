import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Trophy, CurrencyCircleDollar, Users, Clock, Star, ChartLine, CheckCircle, Timer } from "@phosphor-icons/react";

type SnapshotStatusKind = "live" | "soon" | "ended" | "settled" | "settling" | "claim";

export function LiveArenaSnapshot({
  tournamentName,
  tournamentPrice,
  btcPrice,
  playersJoined,
  prizePool,
  timeLeft,
  statusLabel,
  statusKind,
}: {
  tournamentName: string;
  tournamentPrice: string;
  btcPrice: string;
  playersJoined: string;
  prizePool: string;
  timeLeft: string;
  statusLabel: string;
  statusKind: SnapshotStatusKind;
}) {
  const metrics = [
    { label: "Live BTC price", value: btcPrice, tone: "default" as const },
    { label: "Players", value: playersJoined, tone: "default" as const },
    { label: "Prize pool", value: prizePool, tone: "positive" as const },
    { label: "Time left", value: timeLeft, tone: "default" as const },
  ];

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.32 } },
      }}
      className="product-card overflow-hidden rounded-2xl p-5 sm:p-6"
    >
      <div className="relative flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-[var(--primary)]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--subtle)]">
              Current Tournament
            </p>
          </div>
          <h2 className="mt-3 text-xl font-bold text-[var(--text)]">{tournamentName}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-[var(--muted)]">
            <CurrencyCircleDollar size={14} className="text-[var(--primary)]" />
            Game price <span className="font-mono font-semibold text-[var(--text)]">{tournamentPrice}</span>
          </p>
        </div>
        
        <span className={cn(
          "relative z-10 inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all",
          getStatusStyles(statusKind)
        )}>
          {getStatusIcon(statusKind)}
          {statusLabel}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * index, duration: 0.24 }}
            whileHover={{ y: -2 }}
            className="group relative overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--sidebar)] p-4 transition-all hover:border-[var(--primary)]/20"
          >
            <div className="relative z-10">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--subtle)]">
                {getMetricIcon(metric.label)}
                {metric.label}
              </p>
              <p
                className={cn(
                  "mt-3 text-base font-bold sm:text-lg",
                  metric.tone === "positive" ? "text-[var(--long)]" : "text-[var(--text)]",
                )}
              >
                {metric.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

function getStatusStyles(kind: SnapshotStatusKind) {
  if (kind === "live") {
    return "border-[var(--long)]/30 bg-[var(--long)]/10 text-[var(--long)] shadow-lg shadow-[var(--long)]/20";
  }

  if (kind === "soon") {
    return "border-[#60A5FA]/30 bg-[#60A5FA]/10 text-[#60A5FA]";
  }

  if (kind === "claim") {
    return "border-[var(--warning)]/30 bg-[var(--warning)]/10 text-[var(--warning)]";
  }

  return "border-[var(--border)] bg-[var(--panel-soft)] text-[var(--muted)]";
}

function getStatusIcon(kind: SnapshotStatusKind) {
  if (kind === "live") return <Timer size={12} className="animate-pulse" />;
  if (kind === "soon") return <Clock size={12} />;
  if (kind === "claim") return <CurrencyCircleDollar size={12} />;
  if (kind === "settled" || kind === "settling") return <CheckCircle size={12} />;
  return <Star size={12} />;
}

function getMetricIcon(label: string) {
  if (label.includes("BTC")) return <ChartLine size={12} className="text-[var(--primary)]" />;
  if (label.includes("Players")) return <Users size={12} className="text-[var(--primary)]" />;
  if (label.includes("Prize")) return <Trophy size={12} className="text-[var(--warning)]" />;
  if (label.includes("Time")) return <Clock size={12} className="text-[var(--primary)]" />;
  if (label.includes("status")) return <Star size={12} className="text-[var(--subtle)]" />;
  return null;
}
