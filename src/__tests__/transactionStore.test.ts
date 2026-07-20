/**
 * @file transactionStore.test.ts
 * Tests for the Zustand transaction store.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { useTransactionStore } from "@/store/transactionStore";

describe("useTransactionStore", () => {
  beforeEach(() => {
    act(() => {
      useTransactionStore.getState().clearAll();
    });
  });

  it("starts with an empty transaction list", () => {
    const { transactions } = useTransactionStore.getState();
    expect(transactions).toHaveLength(0);
  });

  it("addTransaction creates a transaction with submitting status", () => {
    let id: string;
    act(() => {
      id = useTransactionStore.getState().addTransaction("Create Proposal");
    });

    const { transactions } = useTransactionStore.getState();
    expect(transactions).toHaveLength(1);
    expect(transactions[0].label).toBe("Create Proposal");
    expect(transactions[0].status).toBe("submitting");
    expect(transactions[0].hash).toBeNull();
    expect(transactions[0].id).toBe(id!);
  });

  it("updateTransaction updates status and hash", () => {
    let id: string;
    act(() => {
      id = useTransactionStore.getState().addTransaction("Vote on Proposal");
    });
    act(() => {
      useTransactionStore
        .getState()
        .updateTransaction(id!, { status: "success", hash: "abc123hash" });
    });

    const { transactions } = useTransactionStore.getState();
    expect(transactions[0].status).toBe("success");
    expect(transactions[0].hash).toBe("abc123hash");
  });

  it("updateTransaction sets failed status with error message", () => {
    let id: string;
    act(() => {
      id = useTransactionStore.getState().addTransaction("Execute Proposal");
    });
    act(() => {
      useTransactionStore.getState().updateTransaction(id!, {
        status: "failed",
        error: "User rejected transaction",
      });
    });

    const { transactions } = useTransactionStore.getState();
    expect(transactions[0].status).toBe("failed");
    expect(transactions[0].error).toBe("User rejected transaction");
  });

  it("clearTransaction removes a transaction by ID", () => {
    let id: string;
    act(() => {
      id = useTransactionStore.getState().addTransaction("Deposit");
    });
    act(() => {
      useTransactionStore.getState().clearTransaction(id!);
    });

    const { transactions } = useTransactionStore.getState();
    expect(transactions).toHaveLength(0);
  });

  it("clearAll removes all transactions", () => {
    act(() => {
      useTransactionStore.getState().addTransaction("Tx 1");
      useTransactionStore.getState().addTransaction("Tx 2");
      useTransactionStore.getState().addTransaction("Tx 3");
    });
    act(() => {
      useTransactionStore.getState().clearAll();
    });

    expect(useTransactionStore.getState().transactions).toHaveLength(0);
  });

  it("transactions are stored newest first", () => {
    act(() => {
      useTransactionStore.getState().addTransaction("First");
      useTransactionStore.getState().addTransaction("Second");
    });

    const { transactions } = useTransactionStore.getState();
    expect(transactions[0].label).toBe("Second");
    expect(transactions[1].label).toBe("First");
  });
});
