import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  const baseStyles = "animate-pulse bg-[rgba(255,255,255,0.06)]";
  
  const variantStyles = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-[var(--border-soft)] bg-[var(--panel)] p-4", className)}>
      <Skeleton variant="text" className="w-1/3 mb-3" />
      <Skeleton variant="text" className="w-2/3 mb-2" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 p-3 border-b border-[var(--border)]">
        <Skeleton variant="text" className="flex-1" />
        <Skeleton variant="text" className="w-20" />
        <Skeleton variant="text" className="w-24" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3">
          <Skeleton variant="text" className="flex-1" />
          <Skeleton variant="text" className="w-20" />
          <Skeleton variant="text" className="w-24" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return (
    <Skeleton
      variant="rectangular"
      className={cn("min-h-[40px] rounded-lg", className)}
    />
  );
}

export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("relative rounded-xl bg-[var(--panel)] p-4", className)}>
      <div className="flex justify-between mb-4">
        <Skeleton variant="text" className="w-24 h-6" />
        <Skeleton variant="text" className="w-16 h-6" />
      </div>
      <div className="flex items-end gap-1 h-32">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            className="flex-1"
          />
        ))}
      </div>
    </div>
  );
}

export function LoadingOverlay({ 
  message = "Loading...",
  visible 
}: { 
  message?: string;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        <span className="text-sm text-[var(--muted)]">{message}</span>
      </div>
    </motion.div>
  );
}