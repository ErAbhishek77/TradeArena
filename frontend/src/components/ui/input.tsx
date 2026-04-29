import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { WarningCircle } from "@phosphor-icons/react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, leftElement, rightElement, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex h-10 w-full rounded-lg border bg-[var(--sidebar)] px-3 py-2 text-sm text-[var(--text)] transition-all",
              "placeholder:text-[var(--muted)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                : "border-[rgba(255,255,255,0.07)]",
              leftElement && "pl-10",
              rightElement && "pr-10",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
            <WarningCircle size={12} />
            <span>{error}</span>
          </div>
        )}
        {helper && !error && (
          <p className="mt-1.5 text-xs text-[var(--muted)]">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helper, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border bg-[var(--sidebar)] px-3 py-2 text-sm text-[var(--text)] transition-all",
            "placeholder:text-[var(--muted)]",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-none",
            error
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
              : "border-[rgba(255,255,255,0.07)]",
            className
          )}
          {...props}
        />
        {error && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
            <WarningCircle size={12} />
            <span>{error}</span>
          </div>
        )}
        {helper && !error && (
          <p className="mt-1.5 text-xs text-[var(--muted)]">{helper}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helper, options, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--label)]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-lg border bg-[var(--sidebar)] px-3 py-2 text-sm text-[var(--text)] transition-all",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
              : "border-[rgba(255,255,255,0.07)]",
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
            <WarningCircle size={12} />
            <span>{error}</span>
          </div>
        )}
        {helper && !error && (
          <p className="mt-1.5 text-xs text-[var(--muted)]">{helper}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";