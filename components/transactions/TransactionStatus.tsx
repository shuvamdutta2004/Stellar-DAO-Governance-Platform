"use client";

import { CheckCircle2, XCircle, Clock, Loader2, ExternalLink, Copy } from "lucide-react";
import { cn, getTxExplorerUrl } from "@/lib/utils";
import type { TrackedTransaction } from "@/types/transactions";
import { useTransactionStore } from "@/store/transactionStore";
import { toast } from "sonner";

const STATUS_CONFIG = {
  submitting: {
    icon: <Loader2 className="w-4 h-4 animate-spin text-stellar-400" />,
    color: "border-stellar-500/30 bg-stellar-500/10",
    label: "Submitting",
  },
  pending: {
    icon: <Clock className="w-4 h-4 text-yellow-400" />,
    color: "border-yellow-500/30 bg-yellow-500/10",
    label: "Pending",
  },
  success: {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    color: "border-emerald-500/30 bg-emerald-500/10",
    label: "Success",
  },
  failed: {
    icon: <XCircle className="w-4 h-4 text-red-400" />,
    color: "border-red-500/30 bg-red-500/10",
    label: "Failed",
  },
};

interface TransactionStatusProps {
  tx: TrackedTransaction;
}

export default function TransactionStatus({ tx }: TransactionStatusProps) {
  const { clearTransaction } = useTransactionStore();
  const config = STATUS_CONFIG[tx.status];

  const handleCopyHash = () => {
    if (tx.hash) {
      navigator.clipboard.writeText(tx.hash);
      toast.success("Hash copied!");
    }
  };

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all duration-200 animate-slide-up",
        config.color
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground truncate">{tx.label}</p>
            <span className="text-xs text-muted-foreground shrink-0">
              {new Date(tx.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <span
            className={cn(
              "text-xs font-medium mt-0.5 inline-block",
              tx.status === "success"
                ? "text-emerald-400"
                : tx.status === "failed"
                ? "text-red-400"
                : tx.status === "submitting"
                ? "text-stellar-400"
                : "text-yellow-400"
            )}
          >
            {config.label}
          </span>

          {tx.hash && (
            <div className="flex items-center gap-2 mt-2">
              <p className="font-mono text-xs text-muted-foreground truncate">
                {tx.hash.slice(0, 20)}...
              </p>
              <button
                onClick={handleCopyHash}
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title="Copy hash"
              >
                <Copy className="w-3 h-3 text-muted-foreground" />
              </button>
              <a
                href={getTxExplorerUrl(tx.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-white/10 transition-colors"
                title="View on Explorer"
              >
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            </div>
          )}

          {tx.error && (
            <p className="text-xs text-red-400 mt-1 line-clamp-2">{tx.error}</p>
          )}
        </div>

        {(tx.status === "success" || tx.status === "failed") && (
          <button
            onClick={() => clearTransaction(tx.id)}
            className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            <XCircle className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
