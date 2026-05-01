import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { LiveArenaSnapshot } from "@/components/features/LiveArenaSnapshot";
import { QuickActions, type QuickActionItem } from "@/components/features/QuickActions";
import { StepCards } from "@/components/features/StepCards";
import { UserStatusCard } from "@/components/features/UserStatusCard";
import { cn } from "@/lib/utils";

const staggerCards = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

export function HomePage({
  livePriceValue,
  livePriceLabel,
  livePriceChangeLabel,
  walletLabel,
  walletDetail,
  walletStatusLabel,
  walletConnected,
  heroPrimaryLabel,
  onHeroPrimary,
  onHeroSecondary,
  heroStats,
  snapshotTournamentName,
  snapshotTournamentPrice,
  snapshotBtcPrice,
  snapshotPlayersJoined,
  snapshotPrizePool,
  snapshotTimeLeft,
  snapshotStatusLabel,
  snapshotStatusKind,
  userStatusConnected,
  userStatusBalance,
  userStatusJoined,
  userStatusRank,
  userStatusReturn,
  userStatusVaultValue,
  userStatusHelper,
  userStatusActionLabel,
  onUserStatusAction,
  quickActions,
}: {
  livePriceValue: bigint;
  livePriceLabel: string;
  livePriceChangeLabel: string;
  walletLabel: string;
  walletDetail: string;
  walletStatusLabel: string;
  walletConnected: boolean;
  heroPrimaryLabel: string;
  onHeroPrimary: () => void;
  onHeroSecondary: () => void;
  heroStats: { label: string; value: string }[];
  snapshotTournamentName: string;
  snapshotTournamentPrice: string;
  snapshotBtcPrice: string;
  snapshotPlayersJoined: string;
  snapshotPrizePool: string;
  snapshotTimeLeft: string;
  snapshotStatusLabel: string;
  snapshotStatusKind: "live" | "soon" | "ended" | "settled" | "settling" | "claim";
  userStatusConnected: boolean;
  userStatusBalance: string;
  userStatusJoined: string;
  userStatusRank: string;
  userStatusReturn: string;
  userStatusVaultValue: string;
  userStatusHelper: string;
  userStatusActionLabel: string;
  onUserStatusAction: () => void;
  quickActions: QuickActionItem[];
}) {
  return (
    <motion.div variants={staggerCards} className="space-y-6">
      <MarketBar
        livePriceValue={livePriceValue}
        livePriceLabel={livePriceLabel}
        livePriceChangeLabel={livePriceChangeLabel}
        walletLabel={walletLabel}
        walletDetail={walletDetail}
        walletStatusLabel={walletStatusLabel}
        walletConnected={walletConnected}
      />

      <motion.section
        variants={{
          hidden: { opacity: 0, y: 18 },
          show: { opacity: 1, y: 0, transition: { duration: 0.36 } },
        }}
        className="product-card overflow-hidden p-6 sm:p-7 lg:p-8"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
              Simple BTC Tournament Game
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-[var(--text)] sm:text-5xl">
              Pick a tournament, predict BTC, and track your score
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
              Start with practice money, follow the BTC price, and compete for real rewards.
            </p>
            <p className="mt-3 text-sm font-medium text-[var(--subtle)]">
              No real trading. Your tournament score updates live.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button variant="primary" onClick={onHeroPrimary} fullWidth className="sm:w-auto">
                {heroPrimaryLabel}
              </Button>
              <Button variant="secondary" onClick={onHeroSecondary} fullWidth className="sm:w-auto">
                View Leaderboard
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {heroStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * index, duration: 0.24 }}
                className="rounded-[10px] border border-[var(--border-soft)] bg-[var(--panel)] p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--subtle)]">
                  {stat.label}
                </p>
                <p className="mt-3 text-lg font-semibold text-[var(--text)]">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <QuickActions actions={quickActions} />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <UserStatusCard
          connected={userStatusConnected}
          balance={userStatusBalance}
          joinedStatus={userStatusJoined}
          currentRank={userStatusRank}
          returnPercent={userStatusReturn}
          vaultValue={userStatusVaultValue}
          helperText={userStatusHelper}
          actionLabel={userStatusActionLabel}
          onAction={onUserStatusAction}
        />
        <LiveArenaSnapshot
          tournamentName={snapshotTournamentName}
          tournamentPrice={snapshotTournamentPrice}
          btcPrice={snapshotBtcPrice}
          playersJoined={snapshotPlayersJoined}
          prizePool={snapshotPrizePool}
          timeLeft={snapshotTimeLeft}
          statusLabel={snapshotStatusLabel}
          statusKind={snapshotStatusKind}
        />
      </div>

      <motion.section
        variants={{
          hidden: { opacity: 0, y: 16 },
          show: { opacity: 1, y: 0, transition: { duration: 0.32 } },
        }}
        className="product-card p-5 sm:p-6"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--subtle)]">
          How It Works
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">Three simple steps</h2>
        <div className="mt-5">
          <StepCards />
        </div>
      </motion.section>
    </motion.div>
  );
}

function MarketBar({
  livePriceValue,
  livePriceLabel,
  livePriceChangeLabel,
  walletLabel,
  walletDetail,
  walletStatusLabel,
  walletConnected,
}: {
  livePriceValue: bigint;
  livePriceLabel: string;
  livePriceChangeLabel: string;
  walletLabel: string;
  walletDetail: string;
  walletStatusLabel: string;
  walletConnected: boolean;
}) {
  const previous = useRef<bigint | null>(null);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (previous.current === null) {
      previous.current = livePriceValue;
      return;
    }
    if (previous.current === livePriceValue) return;

    setFlash(livePriceValue > previous.current ? "up" : "down");
    previous.current = livePriceValue;
    const id = window.setTimeout(() => setFlash(null), 550);
    return () => window.clearTimeout(id);
  }, [livePriceValue]);

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
      }}
      className={cn(
        "flex flex-col gap-4 rounded-[10px] border px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between",
        flash === "up"
          ? "border-[rgba(36,201,139,0.24)] bg-[rgba(36,201,139,0.08)]"
          : flash === "down"
            ? "border-[rgba(255,93,108,0.24)] bg-[rgba(255,93,108,0.08)]"
            : "border-[var(--border-soft)] bg-[rgba(7,16,29,0.82)]",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="h-2.5 w-2.5 rounded-full bg-[var(--long)] shadow-[0_0_14px_rgba(36,201,139,0.7)]"
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--subtle)]">
            Live BTC Price
          </span>
        </div>
        <div className="rounded-full border border-[var(--border-soft)] bg-[var(--panel)] px-3 py-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">
            BTC/USD
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-3 lg:justify-center">
        <motion.p
          key={livePriceLabel}
          initial={{ opacity: 0.85, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "font-mono text-2xl font-semibold tabular-nums sm:text-[28px]",
            flash === "up"
              ? "text-[var(--long)]"
              : flash === "down"
                ? "text-[var(--short)]"
                : "text-[var(--text)]",
          )}
        >
          {livePriceLabel}
        </motion.p>
        <span className={cn("rounded-full px-3 py-1 font-mono text-sm", getChangeStyles(livePriceChangeLabel))}>
          {livePriceChangeLabel}
        </span>
      </div>

      <div className="flex justify-start lg:justify-end">
        <div className="flex min-w-0 items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", walletConnected ? "bg-[var(--primary)]" : "bg-[var(--subtle)]")} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text)]">{walletLabel}</p>
            <p className="truncate text-xs text-[var(--muted)]">
              {walletStatusLabel} · {walletDetail}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function getChangeStyles(value: string) {
  if (value.startsWith("+")) {
    return "bg-[rgba(36,201,139,0.12)] text-[var(--long)]";
  }
  if (value.startsWith("-")) {
    return "bg-[rgba(255,93,108,0.12)] text-[var(--short)]";
  }
  return "bg-white/[0.04] text-[var(--muted)]";
}
