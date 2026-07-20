"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { buildExecuteProposalTx, submitTransaction } from "@/lib/stellar/contract";
import { signTransaction, parseWalletError } from "@/lib/stellar/wallet";
import { useTransactionStore } from "@/store/transactionStore";
import { getNativeTokenAddress } from "@/lib/stellar/client";
import type { ExecuteProposalParams } from "@/types/contract";

export function useExecuteProposal() {
  const queryClient = useQueryClient();
  const { addTransaction, updateTransaction } = useTransactionStore();

  const mutation = useMutation({
    mutationFn: async ({
      proposalId,
      address,
    }: {
      proposalId: number;
      address: string;
    }) => {
      const params: ExecuteProposalParams = {
        executor: address,
        proposalId,
        tokenAddress: getNativeTokenAddress(),
      };

      const label = `Execute Proposal #${proposalId}`;
      const txId = addTransaction(label);
      const toastId = toast.loading("Preparing execution...", { id: label });

      try {
        const xdr = await buildExecuteProposalTx(params);

        toast.loading("Waiting for wallet signature...", { id: toastId });
        const signedXdr = await signTransaction(xdr, address);

        toast.loading("Executing on-chain...", { id: toastId });
        const hash = await submitTransaction(signedXdr);

        updateTransaction(txId, { hash, status: "success" });
        toast.success(`Proposal #${proposalId} executed! 💸`, {
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
        toast.error("Execution failed", {
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
    executeProposal: (proposalId: number, address: string) =>
      mutation.mutate({ proposalId, address }),
    isPending: mutation.isPending,
  };
}
