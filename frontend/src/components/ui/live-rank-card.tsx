import { Trophy, TrendingUp, Wallet, Waves } from "lucide-react";
import { ArenaCard } from "@/components/ui/arena-card";
import { AnimatedStat } from "@/components/ui/animated-stat";

export function LiveRankCard({
  label,
  value,
  tone = "default",
  caption,
  kind = "rank",
}: {
  label: string;
  value: number;
  tone?: "default" | "positive" | "negative" | "warning";
  caption?: string;
  kind?: "rank" | "pnl" | "trades" | "wallet";
}) {
  const Icon =
    kind === "rank" ? Trophy : kind === "pnl" ? TrendingUp : kind === "trades" ? Waves : Wallet;

  return (
    <ArenaCard className="min-h-[160px]" glow={tone === "positive"} highlight={tone === "warning"}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--subtle)]">{label}</p>
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--panel-soft)] p-2 text-[var(--primary-strong)]">
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-6">
        <AnimatedStat label={label} value={value} tone={tone} caption={caption} />
      </div>
    </ArenaCard>
  );
}
