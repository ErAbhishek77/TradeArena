import { motion } from "framer-motion";

export function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string; tone?: "default" | "positive" | "danger" }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 rounded-[8px] bg-[var(--sidebar)] p-[3px]">
      {options.map((option) => {
        const active = option.value === value;
        const toneClass =
          option.tone === "positive"
            ? "text-[var(--green)]"
            : option.tone === "danger"
              ? "text-[var(--red)]"
              : "text-[var(--text)]";

        return (
          <motion.button
            key={option.value}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(option.value)}
            className={`relative min-h-[44px] rounded-[8px] text-sm font-semibold transition ${active ? toneClass : "text-[var(--muted)]"}`}
          >
            {active ? (
              <motion.span
                layoutId="segmented-active"
                className={`absolute inset-0 rounded-[8px] ${
                  option.tone === "positive"
                    ? "bg-[rgba(34,197,94,0.15)]"
                    : option.tone === "danger"
                      ? "bg-[rgba(239,68,68,0.15)]"
                      : "bg-white/[0.06]"
                }`}
              />
            ) : null}
            <span className="relative z-10">{option.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
