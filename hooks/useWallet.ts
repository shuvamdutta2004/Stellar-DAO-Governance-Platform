"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useWalletStore } from "@/store/walletStore";
import { openWalletModal, parseWalletError } from "@/lib/stellar/wallet";

export function useWallet() {
  const { isConnected, address, walletId, setConnected, setDisconnected } =
    useWalletStore();

  const connect = useCallback(async () => {
    try {
      await openWalletModal((addr, wId) => {
        setConnected(addr, wId);
        toast.success("Wallet connected!", {
          description: `${addr.slice(0, 6)}...${addr.slice(-4)}`,
        });
      });
    } catch (err) {
      const parsed = parseWalletError(err);
      toast.error(parsed.message, { description: `Error: ${parsed.type}` });
    }
  }, [setConnected]);

  const disconnect = useCallback(() => {
    setDisconnected();
    toast.info("Wallet disconnected");
  }, [setDisconnected]);

  return {
    isConnected,
    address,
    walletId,
    connect,
    disconnect,
  };
}
