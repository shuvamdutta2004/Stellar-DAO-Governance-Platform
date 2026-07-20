"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { buildCreateProposalTx, submitTransaction } from "@/lib/stellar/contract";
import { signTransaction, parseWalletError } from "@/lib/stellar/wallet";
import { useTransactionStore } from "@/store/transactionStore";
import { getNativeTokenAddress } from "@/lib/stellar/client";
import type { CreateProposalParams } from "@/types/contract";

export function useCreateProposal() {
  const queryClient = useQueryClient();
  const { addTransaction, updateTransaction } = useTransactionStore();

  const mutation = useMutation({
    mutationFn: async ({
      params,
      address,
    }: {
      params: Omit<CreateProposalParams, "tokenAddress">;
      address: string;
    }) => {
      const fullParams: CreateProposalParams = {
        ...params,
        tokenAddress: getNativeTokenAddress(),
      };

      const label = `Create Proposal: ${params.description}`;
      const txId = addTransaction(label);
      const toastId = toast.loading("Preparing proposal...", { id: label });

      try {
        const xdr = await buildCreateProposalTx(fullParams);

        toast.loading("Waiting for wallet signature...", { id: toastId });
        const signedXdr = await signTransaction(xdr, address);

        toast.loading("Submitting to network...", { id: toastId });
        const hash = await submitTransaction(signedXdr);

        updateTransaction(txId, { hash, status: "success" });
        toast.success("Proposal created!", {
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
        toast.error("Proposal creation failed", {
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
    createProposal: (
      params: Omit<CreateProposalParams, "tokenAddress">,
      address: string
    ) => mutation.mutate({ params, address }),
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
  };
}
