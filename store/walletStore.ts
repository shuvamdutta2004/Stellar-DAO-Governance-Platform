import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WalletStore {
  isConnected: boolean;
  address: string | null;
  walletId: string | null;
  networkType: string;
  setConnected: (address: string, walletId: string) => void;
  setDisconnected: () => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      isConnected: false,
      address: null,
      walletId: null,
      networkType: process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet",
      setConnected: (address, walletId) =>
        set({ isConnected: true, address, walletId }),
      setDisconnected: () =>
        set({ isConnected: false, address: null, walletId: null }),
    }),
    {
      name: "stellar-wallet",
      partialize: (state) => ({
        address: state.address,
        walletId: state.walletId,
        isConnected: state.isConnected,
      }),
    }
  )
);
