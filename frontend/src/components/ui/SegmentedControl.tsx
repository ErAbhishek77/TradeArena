import { motion } from "framer-motion";

export function SegmentedControl({
  value,
  options,
  onChange,
  disabled = false,
}: {
  value: string;
  options: { label: string; value: string; tone?: "default" | "positive" | "danger" }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-2 rounded-[8px] bg-[var(--sidebar)] p-[3px] ${
        disabled ? "opacity-60" : ""
      }`}
    >
      {options.map((option) => {
        const active = option.value === value;
        const toneClass =
          option.tone === "positive"
            ? "text-[var(--long)]"
            : option.tone === "danger"
              ? "text-[var(--short)]"
              : "text-[var(--text)]";

        return (
            <motion.button
              key={option.value}
              type="button"
              whileTap={{ scale: 0.97 }}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`relative min-h-[40px] rounded-[6px] text-[12px] font-semibold transition disabled:cursor-not-allowed ${active ? toneClass : "text-[var(--label)]"}`}
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
