import { useMemo } from "react";
import type { MouseEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface LeaderboardUser {
  id: string;
  address: string;
  pnl: number;
  returnPct: number;
  vault: number;
  rank: number;
  isMe?: boolean;
}

export function ProLeaderboard({
  users,
  title = "Leaderboard",
  subtitle = "Ranked by Return % from equal virtual balances.",
}: {
  users: LeaderboardUser[];
  title?: string;
  subtitle?: string;
}) {
  const orderedUsers = useMemo(
    () => [...users].sort((left, right) => left.rank - right.rank),
    [users],
  );

  const podiumUsers = orderedUsers.slice(0, 3);
  const rankedUsers = orderedUsers.slice(3);

  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.88)] dark:border-[rgba(255,255,255,0.08)] dark:bg-[var(--panel)] dark:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.42)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-[var(--subtle)]">
            Arena Ranking
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-[var(--text)]">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-[var(--muted)]">
            {subtitle}
          </p>
        </div>
        <div className="rounded-full border-2 border-black bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.82)] dark:border-[rgba(255,255,255,0.08)] dark:bg-[var(--panel-soft)] dark:text-[var(--muted)] dark:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.34)]">
          {orderedUsers.length} traders
        </div>
      </div>

      {podiumUsers.length ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {podiumUsers.map((user) => (
            <LeaderboardCard key={user.id} user={user} variant="podium" />
          ))}
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        {rankedUsers.map((user) => (
          <LeaderboardCard key={user.id} user={user} variant="row" />
        ))}
      </div>
    </section>
  );
}

function LeaderboardCard({
  user,
  variant,
}: {
  user: LeaderboardUser;
  variant: "podium" | "row";
}) {
  const reduceMotion = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 180, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 20 });
  const transform = useMotionTemplate`perspective(1200px) rotateX(${springX}deg) rotateY(${springY}deg)`;

  const positive = user.pnl >= 0;
  const pnlLabel = `${positive ? "+" : ""}${formatCompactNumber(user.pnl)}`;
  const returnLabel = `${user.returnPct >= 0 ? "+" : ""}${user.returnPct.toFixed(2)}%`;
  const vaultLabel = formatCompactNumber(user.vault);
  const rankTone =
    user.rank === 1
      ? "from-amber-200/35 to-amber-500/5 dark:from-amber-300/12 dark:to-transparent"
      : user.rank === 2
        ? "from-slate-200/35 to-slate-500/5 dark:from-slate-300/12 dark:to-transparent"
        : user.rank === 3
          ? "from-orange-200/35 to-orange-500/5 dark:from-orange-300/12 dark:to-transparent"
          : "from-transparent to-transparent";

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    const rotateAroundY = ((x / bounds.width) - 0.5) * 10;
    const rotateAroundX = -((y / bounds.height) - 0.5) * 10;
    rotateX.set(rotateAroundX);
    rotateY.set(rotateAroundY);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={reduceMotion ? undefined : { transformStyle: "preserve-3d", transform }}
      className={cn(
        "relative overflow-hidden rounded-xl border-2 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] dark:border-[rgba(255,255,255,0.08)] dark:bg-[var(--panel)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.36)]",
        user.isMe &&
          "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-transparent",
        variant === "podium" ? "min-h-[210px]" : "min-h-[176px]",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          rankTone,
        )}
      />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-bold text-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.82)] dark:border-[rgba(255,255,255,0.08)] dark:bg-[var(--surface-3)] dark:text-[var(--text)] dark:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.26)]">
              #{user.rank}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-[var(--text)]">
                {shortAddress(user.address)}
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-[var(--muted)]">
                {user.isMe ? "You" : "Arena trader"}
              </p>
            </div>
          </div>

          <motion.div
            animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
            transition={{ duration: 0.28 }}
            className={cn(
              "rounded-full border-2 border-black px-3 py-1 text-xs font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] dark:border-[rgba(255,255,255,0.08)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.26)]",
              positive
                ? "bg-emerald-100 text-emerald-900 dark:bg-[rgba(28,203,120,0.18)] dark:text-[var(--primary-strong)]"
                : "bg-rose-100 text-rose-900 dark:bg-[rgba(255,107,107,0.16)] dark:text-[var(--short)]",
            )}
          >
            {pnlLabel}
          </motion.div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MetricPill label="Return %" value={returnLabel} tone={positive ? "positive" : "negative"} />
          <MetricPill label="Vault" value={vaultLabel} />
          <MetricPill label="PnL" value={pnlLabel} tone={positive ? "positive" : "negative"} />
        </div>

        {variant === "podium" ? (
          <div className="mt-5 rounded-xl border-2 border-black bg-slate-50 px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.82)] dark:border-[rgba(255,255,255,0.08)] dark:bg-[var(--panel-soft)] dark:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.24)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-[var(--subtle)]">
              Prize Position
            </p>
            <p className="mt-2 text-sm text-slate-700 dark:text-[var(--muted)]">
              {user.rank === 1
                ? "Top payout slot"
                : user.rank === 2
                  ? "Second reward slot"
                  : user.rank === 3
                    ? "Third reward slot"
                    : "Leaderboard position"}
            </p>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

function MetricPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "negative";
}) {
  return (
    <div className="rounded-lg border-2 border-black bg-slate-50 px-3 py-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.82)] dark:border-[rgba(255,255,255,0.08)] dark:bg-[var(--panel-soft)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.22)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-[var(--subtle)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-mono text-sm font-semibold tabular-nums text-slate-950 dark:text-[var(--text)]",
          tone === "positive" && "text-emerald-700 dark:text-[var(--primary-strong)]",
          tone === "negative" && "text-rose-700 dark:text-[var(--short)]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function shortAddress(address: string): string {
  if (address.length <= 14) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: Math.abs(value) >= 1000 ? 0 : 2,
  }).format(value);
}
