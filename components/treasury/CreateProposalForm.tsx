"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { xlmToStroops } from "@/lib/utils";

const schema = z.object({
  recipient: z
    .string()
    .min(56, "Invalid Stellar address (must be 56 characters)")
    .max(56, "Invalid Stellar address")
    .regex(/^G[A-Z2-7]{55}$/, "Must be a valid Stellar public key (starts with G)"),
  amount: z
    .number({ invalid_type_error: "Amount is required" })
    .positive("Amount must be greater than 0")
    .max(1_000_000, "Amount too large"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters")
    .max(32, "Description max 32 characters (Soroban Symbol limit)"),
});

type FormValues = z.infer<typeof schema>;

interface CreateProposalFormProps {
  proposerAddress: string;
  onSubmit: (params: { recipient: string; amount: bigint; description: string; proposer: string }) => void;
  onClose: () => void;
  isPending: boolean;
}

export default function CreateProposalForm({
  proposerAddress,
  onSubmit,
  onClose,
  isPending,
}: CreateProposalFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onValid = (data: FormValues) => {
    onSubmit({
      proposer: proposerAddress,
      recipient: data.recipient,
      amount: xlmToStroops(data.amount),
      description: data.description,
    });
    reset();
  };

  return (
    <div className="glass-card p-6 space-y-5 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Plus className="w-4 h-4 text-stellar-400" />
          New Spend Proposal
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-secondary/60 transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onValid)} className="space-y-4" id="create-proposal-form">
        {/* Recipient */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Recipient Address
          </label>
          <input
            {...register("recipient")}
            placeholder="GABCD..."
            className="input-field font-mono text-sm"
            id="proposal-recipient"
          />
          {errors.recipient && (
            <p className="text-xs text-red-400">{errors.recipient.message}</p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Amount (XLM)
          </label>
          <div className="relative">
            <input
              {...register("amount", { valueAsNumber: true })}
              type="number"
              step="0.0000001"
              min="0.0000001"
              placeholder="100"
              className="input-field pr-14"
              id="proposal-amount"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
              XLM
            </span>
          </div>
          {errors.amount && (
            <p className="text-xs text-red-400">{errors.amount.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Description <span className="text-muted-foreground/60">(max 32 chars)</span>
          </label>
          <input
            {...register("description")}
            placeholder="e.g. dev_team_q1"
            className="input-field"
            maxLength={32}
            id="proposal-description"
          />
          <p className="text-xs text-muted-foreground/60">
            Use underscores for spaces. Stored as Soroban Symbol on-chain.
          </p>
          {errors.description && (
            <p className="text-xs text-red-400">{errors.description.message}</p>
          )}
        </div>

        {/* Proposer info */}
        <div className="p-3 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground">Proposer</p>
          <p className="font-mono text-sm text-stellar-300 truncate">{proposerAddress}</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          id="submit-proposal-btn"
          className="w-full btn-primary flex items-center justify-center gap-2 py-3"
        >
          {isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Create Proposal
            </>
          )}
        </button>
      </form>
    </div>
  );
}
