import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function UserStatusCard({
  connected,
  balance,
  joinedStatus,
  currentRank,
  returnPercent,
  vaultValue,
  helperText,
  actionLabel,
  onAction,
}: {
  connected: boolean;
  balance: string;
  joinedStatus: string;
  currentRank: string;
  returnPercent: string;
  vaultValue: string;
  helperText: string;
  actionLabel: string;
  onAction: () => void;
}) {
  const stats = [
    { label: "Wallet balance", value: balance },
    { label: "Joined tournament", value: joinedStatus },
    { label: "Current rank", value: currentRank },
    { label: "Return %", value: returnPercent, tone: getReturnTone(returnPercent) },
    { label: "Current vault value", value: vaultValue },
  ];

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.32 } },
      }}
      className="product-card p-5 sm:p-6"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--subtle)]">
        Your Status
      </p>
      <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">
        {connected ? "Your arena profile" : "Connect to see your profile"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{helperText}</p>

      {connected ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.24 }}
              className={cn(
                "rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-4",
                stat.label === "Current vault value" ? "sm:col-span-2" : "",
              )}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--subtle)]">
                {stat.label}
              </p>
              <p
                className={cn(
                  "mt-3 text-base font-semibold sm:text-lg",
                  stat.tone === "positive"
                    ? "text-[var(--long)]"
                    : stat.tone === "negative"
                      ? "text-[var(--short)]"
                      : "text-[var(--text)]",
                )}
              >
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[16px] border border-dashed border-white/[0.12] bg-white/[0.02] p-5">
          <p className="text-sm text-[var(--muted)]">
            Connect wallet to see your tournament status
          </p>
        </div>
      )}

      <div className="mt-5">
        <Button variant="primary" onClick={onAction} fullWidth className="sm:w-auto">
          {actionLabel}
        </Button>
      </div>
    </motion.section>
  );
}

function getReturnTone(value: string) {
  if (value.startsWith("+")) return "positive";
  if (value.startsWith("-")) return "negative";
  return "default";
}
