import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "positive" | "danger" | "ghost";

const styles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-black hover:bg-[#67e8f9] disabled:bg-slate-700 disabled:text-slate-400",
  secondary:
    "border border-[rgba(255,255,255,0.1)] bg-transparent text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text)] disabled:border-[var(--border)] disabled:text-slate-500",
  positive:
    "bg-[var(--long)] text-white hover:bg-[#16a34a] disabled:bg-slate-700 disabled:text-slate-400",
  danger:
    "bg-[var(--short)] text-white hover:bg-[#dc2626] disabled:bg-slate-700 disabled:text-slate-400",
  ghost:
    "bg-white/[0.03] text-[var(--text)] hover:bg-[rgba(255,255,255,0.04)] disabled:text-slate-500",
};

type ButtonProps = HTMLMotionProps<"button"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

export function Button({
  children,
  className = "",
  fullWidth = false,
  variant = "secondary",
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`inline-flex min-h-[40px] items-center justify-center rounded-[8px] px-4 py-2 text-[13px] font-semibold transition ${fullWidth ? "w-full" : ""} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
