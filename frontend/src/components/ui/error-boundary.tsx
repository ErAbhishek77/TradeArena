import { Component, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { WarningCircle, ArrowClockwise } from "@phosphor-icons/react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[200px] items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex max-w-md flex-col items-center gap-4 text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
              <WarningCircle size={24} className="text-yellow-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text)]">
                Something went wrong
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={this.handleReset}
              className="flex items-center gap-2"
            >
              <ArrowClockwise size={16} />
              Try again
            </Button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorCard({
  title = "Error",
  message,
  onRetry,
}: ErrorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-red-500/20 bg-red-500/5 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10">
          <WarningCircle size={18} className="text-red-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-400">{title}</h4>
          <p className="mt-1 text-xs text-[var(--muted)]">{message}</p>
          {onRetry && (
            <Button
              variant="ghost"
              onClick={onRetry}
              className="mt-3 text-xs h-8 px-3"
            >
              <ArrowClockwise size={14} className="mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface ToastProps {
  id: number;
  tone: "success" | "error" | "info";
  message: string;
  onDismiss: (id: number) => void;
}

export function Toast({ id, tone, message, onDismiss }: ToastProps) {
  const colors = {
    success: "border-green-500/30 bg-green-500/10 text-green-400",
    error: "border-red-500/30 bg-red-500/10 text-red-400",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${colors[tone]}`}
    >
      <span className="text-lg">{icons[tone]}</span>
      <p className="text-sm">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="ml-2 text-xs opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </motion.div>
  );
}