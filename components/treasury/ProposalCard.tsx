"use client";

import {
  ThumbsUp,
  ThumbsDown,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ExternalLink,
} from "lucide-react";
import { formatAddress, stroopsToXlm, formatLedgerTimestamp, getStatusColor, getTxExplorerUrl } from "@/lib/utils";
import VotingProgress from "./VotingProgress";
import type { Proposal } from "@/types/contract";
import { cn } from "@/lib/utils";

const STATUS_ICONS: Record<string, React.ReactNode> = {
  Pending: <Clock className="w-3.5 h-3.5" />,
  Approved: <CheckCircle2 className="w-3.5 h-3.5" />,
  Executed: <Zap className="w-3.5 h-3.5" />,
  Rejected: <XCircle className="w-3.5 h-3.5" />,
  Cancelled: <MinusCircle className="w-3.5 h-3.5" />,
};

interface ProposalCardProps {
  proposal: Proposal;
  threshold: number;
  signerCount: number;
  isSigner: boolean;
  hasVoted?: boolean;
  onApprove: () => void;
  onReject: () => void;
  onExecute: () => void;
  isPending: boolean;
}

export default function ProposalCard({
  proposal,
  threshold,
  signerCount,
  isSigner,
  hasVoted,
  onApprove,
  onReject,
  onExecute,
  isPending,
}: ProposalCardProps) {
  const xlm = stroopsToXlm(proposal.amount);
  const statusColor = getStatusColor(proposal.status);
  const statusIcon = STATUS_ICONS[proposal.status];
  const canVote = isSigner && proposal.status === "Pending" && !hasVoted;
  const canExecute = isSigner && proposal.status === "Approved";

  return (
    <div className="glass-card-hover p-5 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">#{proposal.id}</span>
            <h3 className="font-semibold text-foreground truncate">
              {proposal.description}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <span>by</span>
            <span className="font-mono text-stellar-400">{formatAddress(proposal.proposer)}</span>
            <span>·</span>
            <span>{formatLedgerTimestamp(proposal.createdAt)}</span>
          </div>
        </div>
        <span className={cn("status-badge shrink-0", statusColor)}>
          {statusIcon}
          {proposal.status}
        </span>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-xl">
        <div>
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="text-lg font-bold text-cyan-400">{xlm} XLM</p>
        </div>
        <div className="h-8 w-px bg-border/50" />
        <div>
          <p className="text-xs text-muted-foreground">Recipient</p>
          <p className="font-mono text-sm text-foreground">{formatAddress(proposal.recipient, 6)}</p>
        </div>
        {proposal.status === "Executed" && (
          <>
            <div className="h-8 w-px bg-border/50" />
            <div>
              <p className="text-xs text-muted-foreground">Executed</p>
              <p className="text-sm text-emerald-400">{formatLedgerTimestamp(proposal.executedAt)}</p>
            </div>
          </>
        )}
      </div>

      {/* Voting Progress */}
      <VotingProgress
        approveCount={proposal.approveCount}
        rejectCount={proposal.rejectCount}
        threshold={threshold}
        signerCount={signerCount}
      />

      {/* Action buttons */}
      {(canVote || canExecute) && (
        <div className="flex items-center gap-2 pt-1">
          {canVote && (
            <>
              <button
                onClick={onApprove}
                disabled={isPending}
                id={`approve-proposal-${proposal.id}`}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ThumbsUp className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={onReject}
                disabled={isPending}
                id={`reject-proposal-${proposal.id}`}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </button>
            </>
          )}
          {canExecute && (
            <button
              onClick={onExecute}
              disabled={isPending}
              id={`execute-proposal-${proposal.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-stellar-600/20 hover:bg-stellar-600/30 text-stellar-300 hover:text-stellar-200 border border-stellar-500/20 hover:border-stellar-500/40 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" />
              Execute Transfer
            </button>
          )}
        </div>
      )}

      {hasVoted && proposal.status === "Pending" && (
        <p className="text-xs text-center text-muted-foreground italic">
          You have already voted on this proposal
        </p>
      )}
    </div>
  );
}
