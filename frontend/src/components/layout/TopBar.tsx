import type { ReactNode } from "react";

export function TopBar({
  title,
  right,
}: {
  title: string;
  right: ReactNode;
}) {
  return (
    <header className="flex min-h-[56px] items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <h1 className="truncate text-[24px] font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-[28px]">
        {title}
      </h1>
      <div className="shrink-0">{right}</div>
    </header>
  );
}
