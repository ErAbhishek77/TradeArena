import type { ReactNode } from "react";

export function TournamentList({
  header,
  rows,
}: {
  header?: ReactNode;
  rows: ReactNode;
}) {
  return (
    <div className="rounded-[16px] bg-[var(--panel)] p-4">
      {header ? <div className="mb-4 hidden grid-cols-[minmax(0,1.4fr)_0.8fr_0.8fr_0.7fr_0.8fr_auto] gap-4 border-b border-[var(--border)] pb-3 lg:grid">{header}</div> : null}
      <div className="space-y-3">{rows}</div>
    </div>
  );
}
