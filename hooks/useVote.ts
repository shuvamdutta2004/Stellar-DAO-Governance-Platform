"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { buildVoteTx, submitTransaction } from "@/lib/stellar/contract";
import { signTransaction, parseWalletError } from "@/lib/stellar/wallet";
import { useTransactionStore } from "@/store/transactionStore";
import { getNativeTokenAddress } from "@/lib/stellar/client";
import type { VoteParams } from "@/types/contract";

export function useVote() {
  const queryClient = useQueryClient();
  const { addTransaction, updateTransaction } = useTransactionStore();

  const mutation = useMutation({
    mutationFn: async ({
      params,
      address,
    }: {
      params: VoteParams;
      address: string;
    }) => {
      const label = `Vote ${params.approve ? "Approve" : "Reject"} — Proposal #${params.proposalId}`;
      const txId = addTransaction(label);
      const toastId = toast.loading(`Preparing vote...`, { id: label });

      try {
        // Build transaction
        const xdr = await buildVoteTx(params);

        // Sign with wallet
        toast.loading("Waiting for wallet signature...", { id: toastId });
        const signedXdr = await signTransaction(xdr, address);

        // Submit
        toast.loading("Submitting to network...", { id: toastId });
        const hash = await submitTransaction(signedXdr);

        updateTransaction(txId, { hash, status: "success" });
        toast.success("Vote submitted!", {
          id: toastId,
          description: `TX: ${hash.slice(0, 16)}...`,
          action: {
            label: "View",
            onClick: () =>
              window.open(
                `https://stellar.expert/explorer/testnet/tx/${hash}`,
                "_blank"
              ),
          },
        });

        return hash;
      } catch (err) {
        const parsed = parseWalletError(err);
        updateTransaction(txId, { status: "failed", error: parsed.message });
        toast.error("Vote failed", {
          id: toastId,
          description: parsed.message,
        });
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["treasury-state"] });
    },
  });

  return {
    vote: (params: VoteParams, address: string) =>
      mutation.mutate({ params, address }),
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
}
