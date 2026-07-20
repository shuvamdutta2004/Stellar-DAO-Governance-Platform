import { create } from "zustand";
import type { TrackedTransaction, TransactionStatus } from "@/types/transactions";
import { generateId } from "@/lib/utils";

interface TransactionStore {
  transactions: TrackedTransaction[];
  addTransaction: (label: string) => string;
  updateTransaction: (
    id: string,
    updates: Partial<Pick<TrackedTransaction, "hash" | "status" | "error">>
  ) => void;
  clearTransaction: (id: string) => void;
  clearAll: () => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],

  addTransaction: (label) => {
    const id = generateId();
    const tx: TrackedTransaction = {
      id,
      hash: null,
      status: "submitting",
      label,
      error: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ transactions: [tx, ...s.transactions] }));
    return id;
  },

  updateTransaction: (id, updates) =>
    set((s) => ({
      transactions: s.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates, updatedAt: Date.now() } : tx
      ),
    })),

  clearTransaction: (id) =>
    set((s) => ({
      transactions: s.transactions.filter((tx) => tx.id !== id),
    })),

  clearAll: () => set({ transactions: [] }),
}));
