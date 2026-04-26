import { motion, type HTMLMotionProps, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ArenaCard({
  children,
  className,
  glow = false,
  highlight = false,
  ...props
}: HTMLMotionProps<"div"> & {
  children: ReactNode;
  glow?: boolean;
  highlight?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 180, damping: 22 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 22 });
  const transform = useMotionTemplate`perspective(1200px) rotateX(${springX}deg) rotateY(${springY}deg)`;

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    rotateY.set(((x / bounds.width) - 0.5) * 8);
    rotateX.set(-((y / bounds.height) - 0.5) * 8);
  };

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={reduceMotion ? undefined : { transformStyle: "preserve-3d", transform }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-[var(--panel)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.28)]",
        "border-[var(--border-soft)]",
        glow && "shadow-[0_18px_44px_rgba(28,203,120,0.14)]",
        highlight && "ring-1 ring-[var(--border-hi)]",
        className,
      )}
      {...props}
    >
      {glow ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(28,203,120,0.18),transparent_72%)]" />
      ) : null}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
