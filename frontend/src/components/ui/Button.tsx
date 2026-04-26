import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "positive" | "danger" | "ghost";

const styles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-[#03140b] hover:bg-[var(--primary-strong)] disabled:bg-slate-700 disabled:text-slate-400 shadow-[0_12px_32px_rgba(28,203,120,0.22)]",
  secondary:
    "border border-[var(--border-hi)] bg-transparent text-[var(--text)] hover:bg-[rgba(103,247,177,0.06)] disabled:border-[var(--border)] disabled:text-slate-500",
  positive:
    "bg-[var(--long)] text-[#03140b] hover:bg-[var(--primary-strong)] disabled:bg-slate-700 disabled:text-slate-400",
  danger:
    "bg-[var(--short)] text-white hover:bg-[#ff8686] disabled:bg-slate-700 disabled:text-slate-400",
  ghost:
    "bg-white/[0.03] text-[var(--text)] hover:bg-[rgba(103,247,177,0.06)] disabled:text-slate-500",
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
      className={`inline-flex min-h-[44px] items-center justify-center rounded-[8px] px-4 py-2.5 text-sm font-bold transition ${fullWidth ? "w-full" : ""} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
