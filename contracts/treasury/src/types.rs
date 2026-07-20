use soroban_sdk::{contracttype, Address, Symbol, Vec};

/// Proposal status
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum ProposalStatus {
    Pending,
    Approved,
    Rejected,
    Executed,
    Cancelled,
}

/// A single spend proposal in the treasury
#[contracttype]
#[derive(Clone, Debug)]
pub struct Proposal {
    pub id: u32,
    pub proposer: Address,
    pub recipient: Address,
    pub amount: i128,
    pub description: Symbol,
    pub status: ProposalStatus,
    pub approve_count: u32,
    pub reject_count: u32,
    pub created_at: u64,
    pub executed_at: u64,
}

/// Vote record for a signer on a proposal
#[contracttype]
#[derive(Clone, Debug)]
pub struct VoteRecord {
    pub voter: Address,
    pub proposal_id: u32,
    pub approve: bool,
    pub voted_at: u64,
}

/// Storage keys for contract data
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Signers,
    Threshold,
    Balance,
    ProposalCount,
    Proposal(u32),
    VoterVoted(u32, Address), // (proposal_id, voter)
    Initialized,
}
