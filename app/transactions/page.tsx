"use client";

import { History, Trash2 } from "lucide-react";
import TransactionStatus from "@/components/transactions/TransactionStatus";
import { useTransactionStore } from "@/store/transactionStore";

export default function TransactionsPage() {
  const { transactions, clearAll } = useTransactionStore();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-stellar-400" />
            Transaction History
          </h1>
          <p className="text-muted-foreground mt-1">
            All contract interactions from this session
          </p>
        </div>
        {transactions.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-400 transition-colors"
            id="clear-transactions-btn"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: transactions.length, color: "text-foreground" },
          {
            label: "Successful",
            value: transactions.filter((t) => t.status === "success").length,
            color: "text-emerald-400",
          },
          {
            label: "Failed",
            value: transactions.filter((t) => t.status === "failed").length,
            color: "text-red-400",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Explorer note */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border/40">
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">Note:</span> Transaction history is stored in memory for this
          session only. Use{" "}
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stellar-400 hover:underline"
          >
            Stellar Expert
          </a>{" "}
          for a permanent on-chain record.
        </p>
      </div>

      {/* Transaction list */}
      {transactions.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto">
            <History className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-muted-foreground">No transactions yet</p>
          <p className="text-sm text-muted-foreground/60">
            Your transactions will appear here as you interact with the treasury
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <TransactionStatus key={tx.id} tx={tx} />
          ))}
        </div>
      )}
    </div>
  );
}
