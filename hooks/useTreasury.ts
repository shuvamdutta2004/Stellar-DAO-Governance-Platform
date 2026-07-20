"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTreasuryState } from "@/lib/stellar/contract";
import { checkIsSigner } from "@/lib/stellar/contract";
import { useWalletStore } from "@/store/walletStore";

const POLL_INTERVAL = Number(
  process.env.NEXT_PUBLIC_EVENT_POLL_INTERVAL ?? 10000
);

export function useTreasury() {
  const { address } = useWalletStore();

  const treasuryQuery = useQuery({
    queryKey: ["treasury-state"],
    queryFn: fetchTreasuryState,
    refetchInterval: POLL_INTERVAL,
    staleTime: 5000,
    retry: 2,
  });

  const signerQuery = useQuery({
    queryKey: ["is-signer", address],
    queryFn: () => (address ? checkIsSigner(address) : Promise.resolve(false)),
    enabled: !!address,
    staleTime: 30000,
    retry: 1,
  });

  return {
    treasuryState: treasuryQuery.data,
    isLoading: treasuryQuery.isLoading,
    isError: treasuryQuery.isError,
    error: treasuryQuery.error,
    refetch: treasuryQuery.refetch,
    isSigner: signerQuery.data ?? false,
    isSignerLoading: signerQuery.isLoading,
  };
}
