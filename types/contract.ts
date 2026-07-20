// Contract data types mirroring the Soroban contract structs

export type ProposalStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Executed"
  | "Cancelled";

export interface Proposal {
  id: number;
  proposer: string;
  recipient: string;
  amount: bigint;
  description: string;
  status: ProposalStatus;
  approveCount: number;
  rejectCount: number;
  createdAt: number;   // Unix timestamp (ledger)
  executedAt: number;
}

export interface TreasuryState {
  balance: bigint;
  threshold: number;
  signers: string[];
  proposalCount: number;
}

export interface VoteRecord {
  voter: string;
  proposalId: number;
  approve: boolean;
  votedAt: number;
}

export interface CreateProposalParams {
  proposer: string;
  recipient: string;
  amount: bigint;
  description: string;
  tokenAddress: string;
}

export interface VoteParams {
  voter: string;
  proposalId: number;
  approve: boolean;
}

export interface ExecuteProposalParams {
  executor: string;
  proposalId: number;
  tokenAddress: string;
}

export interface DepositParams {
  from: string;
  tokenAddress: string;
  amount: bigint;
}
