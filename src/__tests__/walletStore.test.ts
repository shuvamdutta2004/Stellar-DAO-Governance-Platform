/**
 * @file walletStore.test.ts
 * Tests for the Zustand wallet store.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { useWalletStore } from "@/store/walletStore";

const TEST_ADDRESS = "GBUX3IHQTAIRN3BXVBWZMKFW2CF6FE4QKQWYEDHYGQXL6OQ3YFMN5R3N";
const TEST_WALLET_ID = "freighter";

describe("useWalletStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    act(() => {
      useWalletStore.getState().setDisconnected();
    });
  });

  it("starts disconnected", () => {
    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.address).toBeNull();
    expect(state.walletId).toBeNull();
  });

  it("setConnected updates state correctly", () => {
    act(() => {
      useWalletStore.getState().setConnected(TEST_ADDRESS, TEST_WALLET_ID);
    });

    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(true);
    expect(state.address).toBe(TEST_ADDRESS);
    expect(state.walletId).toBe(TEST_WALLET_ID);
  });

  it("setDisconnected resets state correctly", () => {
    act(() => {
      useWalletStore.getState().setConnected(TEST_ADDRESS, TEST_WALLET_ID);
    });
    act(() => {
      useWalletStore.getState().setDisconnected();
    });

    const state = useWalletStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.address).toBeNull();
    expect(state.walletId).toBeNull();
  });

  it("networkType defaults to testnet", () => {
    const state = useWalletStore.getState();
    expect(state.networkType).toBe("testnet");
  });
});
