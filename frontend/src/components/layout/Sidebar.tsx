import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { CurrencyBtc } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type ShellNavItem = {
  key: string;
  label: string;
  badge?: string;
  onClick: () => void;
  icon?: ReactNode;
};

export function Sidebar({
  items,
  activeKey,
  footer,
  collapsed = false,
  onToggle,
}: {
  items: ShellNavItem[];
  activeKey: string;
  footer?: ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 hidden shrink-0 border-r border-[var(--border)] bg-[var(--sidebar)] px-3 py-5 transition-all duration-300 lg:flex lg:flex-col",
        collapsed ? "w-[72px]" : "w-[240px]",
      )}
    >
      <div className="flex items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[rgba(34,211,238,0.14)] text-[var(--primary)]">
            <CurrencyBtc size={16} weight="bold" />
          </div>
          {!collapsed ? (
            <p className="text-sm font-semibold tracking-[-0.02em] text-[var(--text)]">TradeVault</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="hidden rounded-[8px] p-1.5 text-[var(--muted)] transition hover:bg-white/[0.04] hover:text-[var(--text)] lg:inline-flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="mt-8 space-y-1.5">
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className={cn(
                "relative flex min-h-[40px] w-full items-center justify-between gap-2 rounded-[8px] px-3 py-[9px] text-left text-[13px] font-medium transition",
                active
                  ? "bg-[rgba(34,211,238,0.10)] text-[var(--primary)]"
                  : "text-[var(--muted)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text)]",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="activeNav"
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[var(--primary)]"
                />
              ) : null}
              <span className={cn("flex items-center gap-3", collapsed ? "pl-2" : "pl-3")}>
                <span className="text-current">{item.icon}</span>
                {!collapsed ? <span>{item.label}</span> : null}
              </span>
              {!collapsed && item.badge ? (
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
      {!collapsed && footer ? <div className="mt-auto">{footer}</div> : null}
    </aside>
  );
}
