"use client";

import { useState } from "react";
import { Plus, Filter, RefreshCw, AlertTriangle, Wallet } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useTreasury } from "@/hooks/useTreasury";
import { useProposals } from "@/hooks/useProposals";
import { useVote } from "@/hooks/useVote";
import { useCreateProposal } from "@/hooks/useCreateProposal";
import { useExecuteProposal } from "@/hooks/useExecuteProposal";
import TreasuryStats from "@/components/treasury/TreasuryStats";
import ProposalCard from "@/components/treasury/ProposalCard";
import CreateProposalForm from "@/components/treasury/CreateProposalForm";
import type { ProposalStatus } from "@/types/contract";

type FilterType = "All" | ProposalStatus;
const FILTERS: FilterType[] = ["All", "Pending", "Approved", "Executed", "Rejected", "Cancelled"];

export default function TreasuryPage() {
  const { isConnected, address, connect } = useWallet();
  const { treasuryState, isLoading: stateLoading, isSigner } = useTreasury();
  const { proposals, isLoading: proposalsLoading, isFetching, refetch } = useProposals();
  const { vote, isPending: votePending } = useVote();
  const { createProposal, isPending: createPending } = useCreateProposal();
  const { executeProposal, isPending: executePending } = useExecuteProposal();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<FilterType>("All");

  const filtered =
    filter === "All" ? proposals : proposals.filter((p) => p.status === filter);

  const isPending = votePending || createPending || executePending;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Treasury</h1>
          <p className="text-muted-foreground mt-1">
            Propose, vote, and execute on-chain spend decisions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg hover:bg-secondary/60 transition-colors text-muted-foreground"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          {isConnected && isSigner && (
            <button
              onClick={() => setShowForm((v) => !v)}
              id="new-proposal-btn"
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Proposal
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <TreasuryStats state={treasuryState} isLoading={stateLoading} />

      {/* Not connected */}
      {!isConnected && (
        <div className="glass-card p-8 text-center space-y-4">
          <Wallet className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-lg font-semibold">Connect Wallet to Interact</p>
          <p className="text-muted-foreground">
            You can view proposals without connecting, but voting and creating proposals requires a wallet.
          </p>
          <button onClick={connect} className="btn-primary px-6 py-2.5" id="treasury-connect-btn">
            Connect Wallet
          </button>
        </div>
      )}

      {/* Not a signer warning */}
      {isConnected && !isSigner && !stateLoading && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400">Observer Mode</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your connected address is not a registered signer. You can view proposals but cannot vote or create proposals.
            </p>
          </div>
        </div>
      )}

      {/* Create proposal form */}
      {showForm && isConnected && isSigner && address && (
        <CreateProposalForm
          proposerAddress={address}
          onSubmit={(params) => {
            createProposal(params, address);
            setShowForm(false);
          }}
          onClose={() => setShowForm(false)}
          isPending={createPending}
        />
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              filter === f
                ? "bg-stellar-600/30 text-stellar-300 border border-stellar-500/30"
                : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/50"
            }`}
          >
            {f}
            {f !== "All" && (
              <span className="ml-1 opacity-60">
                ({proposals.filter((p) => p.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Proposals */}
      {proposalsLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 skeleton-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-muted-foreground">No proposals found</p>
          <p className="text-sm text-muted-foreground/60">
            {filter === "All"
              ? "Be the first to create a spend proposal"
              : `No ${filter.toLowerCase()} proposals`}
          </p>
          {isConnected && isSigner && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary px-4 py-2 text-sm flex items-center gap-2 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Create Proposal
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              threshold={treasuryState?.threshold ?? 1}
              signerCount={treasuryState?.signers.length ?? 1}
              isSigner={isSigner}
              hasVoted={false} // Optimistically false; real check is on-chain
              onApprove={() =>
                address && vote({ voter: address, proposalId: proposal.id, approve: true }, address)
              }
              onReject={() =>
                address && vote({ voter: address, proposalId: proposal.id, approve: false }, address)
              }
              onExecute={() => address && executeProposal(proposal.id, address)}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
