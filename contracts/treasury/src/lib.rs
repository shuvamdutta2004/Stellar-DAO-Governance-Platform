#![no_std]

mod types;

use soroban_sdk::{
    contract, contractimpl, contractmeta,
    log,
    token,
    Address, Env, Symbol, Vec,
};

use types::{DataKey, Proposal, ProposalStatus, VoteRecord};

// ─── Contract Metadata ──────────────────────────────────────────────────────

contractmeta!(
    key = "Description",
    val = "Stellar DAO Governance: decentralized on-chain governance with collective proposal voting and execution"
);

contractmeta!(key = "Version", val = "1.0.0");

// ─── Contract ───────────────────────────────────────────────────────────────

#[contract]
pub struct DaoGovernanceContract;

// ─── Events ─────────────────────────────────────────────────────────────────

fn emit_dao_initialized(env: &Env, threshold: u32, member_count: u32) {
    let topics = (Symbol::new(env, "dao_initialized"),);
    env.events().publish(topics, (threshold, member_count));
}

fn emit_funds_received(env: &Env, from: &Address, amount: i128) {
    let topics = (Symbol::new(env, "funds_received"), from.clone());
    env.events().publish(topics, amount);
}

fn emit_proposal_created(env: &Env, proposal_id: u32, proposer: &Address, amount: i128) {
    let topics = (Symbol::new(env, "proposal_created"), proposer.clone());
    env.events().publish(topics, (proposal_id, amount));
}

fn emit_vote_cast(env: &Env, proposal_id: u32, voter: &Address, approve: bool) {
    let topics = (Symbol::new(env, "vote_cast"), voter.clone());
    env.events().publish(topics, (proposal_id, approve));
}

fn emit_proposal_approved(env: &Env, proposal_id: u32) {
    let topics = (Symbol::new(env, "proposal_approved"),);
    env.events().publish(topics, proposal_id);
}

fn emit_proposal_rejected(env: &Env, proposal_id: u32) {
    let topics = (Symbol::new(env, "proposal_rejected"),);
    env.events().publish(topics, proposal_id);
}

fn emit_proposal_executed(env: &Env, proposal_id: u32, executor: &Address, amount: i128) {
    let topics = (Symbol::new(env, "proposal_executed"), executor.clone());
    env.events().publish(topics, (proposal_id, amount));
}

// ─── Helpers ────────────────────────────────────────────────────────────────

fn require_signer(env: &Env, addr: &Address) {
    let signers: Vec<Address> = env
        .storage()
        .persistent()
        .get(&DataKey::Signers)
        .expect("Not initialized");
    let is_signer = signers.iter().any(|s| s == addr.clone());
    if !is_signer {
        panic!("Not a signer");
    }
}

fn get_proposal(env: &Env, proposal_id: u32) -> Proposal {
    env.storage()
        .persistent()
        .get(&DataKey::Proposal(proposal_id))
        .expect("Proposal not found")
}

fn save_proposal(env: &Env, proposal: &Proposal) {
    env.storage()
        .persistent()
        .set(&DataKey::Proposal(proposal.id), proposal);
}

// ─── Implementation ─────────────────────────────────────────────────────────

#[contractimpl]
impl DaoGovernanceContract {
    /// Initialize the DAO with a set of members and an approval threshold.
    /// Can only be called once. threshold must be <= members.len().
    pub fn initialize(env: Env, signers: Vec<Address>, threshold: u32) {
        if env
            .storage()
            .persistent()
            .has(&DataKey::Initialized)
        {
            panic!("Already initialized");
        }

        if threshold == 0 || threshold > signers.len() {
            panic!("Invalid threshold");
        }

        if signers.len() == 0 {
            panic!("No signers");
        }

        let signer_count = signers.len();

        env.storage()
            .persistent()
            .set(&DataKey::Signers, &signers);
        env.storage()
            .persistent()
            .set(&DataKey::Threshold, &threshold);
        env.storage()
            .persistent()
            .set(&DataKey::Balance, &0_i128);
        env.storage()
            .persistent()
            .set(&DataKey::ProposalCount, &0_u32);
        env.storage()
            .persistent()
            .set(&DataKey::Initialized, &true);

        emit_dao_initialized(&env, threshold, signer_count);
        log!(&env, "DAO initialized: threshold={}, members={}", threshold, signer_count);
    }

    /// Deposit native XLM into the treasury.
    /// `token_address` should be the native token address for the network.
    pub fn deposit(env: Env, from: Address, token_address: Address, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("Amount must be positive");
        }

        // Transfer tokens from depositor to contract
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&from, &env.current_contract_address(), &amount);

        // Update tracked balance
        let current_balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance)
            .unwrap_or(0);
        env.storage()
            .persistent()
            .set(&DataKey::Balance, &(current_balance + amount));

        emit_funds_received(&env, &from, amount);
        log!(&env, "Funds received: from={:?}, amount={}", from, amount);
    }

    /// Create a new governance proposal. Only DAO members can propose.
    /// Returns the new proposal ID.
    pub fn create_proposal(
        env: Env,
        proposer: Address,
        recipient: Address,
        amount: i128,
        description: Symbol,
        token_address: Address,
    ) -> u32 {
        proposer.require_auth();
        require_signer(&env, &proposer);

        if amount <= 0 {
            panic!("Amount must be positive");
        }

        let balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance)
            .unwrap_or(0);

        if amount > balance {
            panic!("Insufficient treasury balance");
        }

        let count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::ProposalCount)
            .unwrap_or(0);

        let proposal_id = count;
        let now = env.ledger().timestamp();

        let proposal = Proposal {
            id: proposal_id,
            proposer: proposer.clone(),
            recipient,
            amount,
            description,
            status: ProposalStatus::Pending,
            approve_count: 0,
            reject_count: 0,
            created_at: now,
            executed_at: 0,
        };

        save_proposal(&env, &proposal);
        env.storage()
            .persistent()
            .set(&DataKey::ProposalCount, &(count + 1));

        emit_proposal_created(&env, proposal_id, &proposer, amount);
        log!(&env, "Proposal {} created by {:?}", proposal_id, proposer);

        proposal_id
    }

    /// Cast a vote on a proposal. Only signers can vote; one vote per signer per proposal.
    pub fn vote(env: Env, voter: Address, proposal_id: u32, approve: bool) {
        voter.require_auth();
        require_signer(&env, &voter);

        // Check voter hasn't already voted
        let vote_key = DataKey::VoterVoted(proposal_id, voter.clone());
        if env.storage().persistent().has(&vote_key) {
            panic!("Already voted");
        }

        let mut proposal = get_proposal(&env, proposal_id);

        if proposal.status != ProposalStatus::Pending {
            panic!("Proposal is not pending");
        }

        // Record vote
        env.storage().persistent().set(&vote_key, &true);

        if approve {
            proposal.approve_count += 1;
        } else {
            proposal.reject_count += 1;
        }

        // Check threshold
        let threshold: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::Threshold)
            .expect("Not initialized");

        let signers: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::Signers)
            .expect("Not initialized");

        if proposal.approve_count >= threshold {
            proposal.status = ProposalStatus::Approved;
            emit_proposal_approved(&env, proposal_id);
        } else if proposal.reject_count > signers.len() - threshold {
            // Can no longer reach threshold — definitively rejected
            proposal.status = ProposalStatus::Rejected;
            emit_proposal_rejected(&env, proposal_id);
        }

        save_proposal(&env, &proposal);
        emit_vote_cast(&env, proposal_id, &voter, approve);
        log!(&env, "Vote cast on proposal {}: approve={}, voter={:?}", proposal_id, approve, voter);
    }

    /// Execute an approved proposal. Can be called by any signer.
    /// Transfers funds from treasury to recipient.
    pub fn execute_proposal(env: Env, executor: Address, proposal_id: u32, token_address: Address) {
        executor.require_auth();
        require_signer(&env, &executor);

        let mut proposal = get_proposal(&env, proposal_id);

        if proposal.status != ProposalStatus::Approved {
            panic!("Proposal is not approved");
        }

        // Check treasury still has sufficient balance
        let balance: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::Balance)
            .unwrap_or(0);

        if proposal.amount > balance {
            panic!("Insufficient treasury balance for execution");
        }

        // Transfer tokens to recipient
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(
            &env.current_contract_address(),
            &proposal.recipient,
            &proposal.amount,
        );

        // Update balance
        env.storage()
            .persistent()
            .set(&DataKey::Balance, &(balance - proposal.amount));

        // Mark executed
        proposal.status = ProposalStatus::Executed;
        proposal.executed_at = env.ledger().timestamp();
        save_proposal(&env, &proposal);

        emit_proposal_executed(&env, proposal_id, &executor, proposal.amount);
        log!(&env, "Proposal {} executed by {:?}, amount={}", proposal_id, executor, proposal.amount);
    }

    /// Cancel a pending proposal. Only the original proposer can cancel.
    pub fn cancel_proposal(env: Env, proposer: Address, proposal_id: u32) {
        proposer.require_auth();

        let mut proposal = get_proposal(&env, proposal_id);

        if proposal.proposer != proposer {
            panic!("Only proposer can cancel");
        }
        if proposal.status != ProposalStatus::Pending {
            panic!("Only pending proposals can be cancelled");
        }

        proposal.status = ProposalStatus::Cancelled;
        save_proposal(&env, &proposal);
        log!(&env, "Proposal {} cancelled by {:?}", proposal_id, proposer);
    }

    // ─── View Functions ───────────────────────────────────────────────────

    /// Get a single proposal by ID
    pub fn get_proposal(env: Env, proposal_id: u32) -> Proposal {
        get_proposal(&env, proposal_id)
    }

    /// Get all proposals (returns vec of proposals)
    pub fn get_proposals(env: Env) -> Vec<Proposal> {
        let count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::ProposalCount)
            .unwrap_or(0);

        let mut proposals = Vec::new(&env);
        for i in 0..count {
            if let Some(p) = env.storage().persistent().get(&DataKey::Proposal(i)) {
                proposals.push_back(p);
            }
        }
        proposals
    }

    /// Get all registered signers
    pub fn get_signers(env: Env) -> Vec<Address> {
        env.storage()
            .persistent()
            .get(&DataKey::Signers)
            .unwrap_or(Vec::new(&env))
    }

    /// Get the treasury XLM balance (tracked amount, in stroops)
    pub fn get_balance(env: Env) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance)
            .unwrap_or(0)
    }

    /// Get the approval threshold
    pub fn get_threshold(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::Threshold)
            .unwrap_or(0)
    }

    /// Get the total number of proposals
    pub fn get_proposal_count(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::ProposalCount)
            .unwrap_or(0)
    }

    /// Check if an address is a registered signer
    pub fn is_signer(env: Env, addr: Address) -> bool {
        let signers: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::Signers)
            .unwrap_or(Vec::new(&env));
        signers.iter().any(|s| s == addr.clone())
    }

    /// Check if a voter has already voted on a proposal
    pub fn has_voted(env: Env, voter: Address, proposal_id: u32) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::VoterVoted(proposal_id, voter))
    }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, Symbol, Vec};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, DaoGovernanceContract);
        let client = TreasuryContractClient::new(&env, &contract_id);

        let signer1 = Address::generate(&env);
        let signer2 = Address::generate(&env);
        let signer3 = Address::generate(&env);

        let mut signers = Vec::new(&env);
        signers.push_back(signer1.clone());
        signers.push_back(signer2.clone());
        signers.push_back(signer3.clone());

        client.initialize(&signers, &2);

        assert_eq!(client.get_threshold(), 2);
        assert_eq!(client.get_signers().len(), 3);
        assert_eq!(client.get_balance(), 0);
        assert!(client.is_signer(&signer1));
    }

    #[test]
    fn test_proposal_lifecycle() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, DaoGovernanceContract);
        let client = TreasuryContractClient::new(&env, &contract_id);

        let signer1 = Address::generate(&env);
        let signer2 = Address::generate(&env);
        let signer3 = Address::generate(&env);
        let recipient = Address::generate(&env);

        let mut signers = Vec::new(&env);
        signers.push_back(signer1.clone());
        signers.push_back(signer2.clone());
        signers.push_back(signer3.clone());

        client.initialize(&signers, &2);

        // Set some balance directly for testing
        env.as_contract(&contract_id, || {
            env.storage()
                .persistent()
                .set(&DataKey::Balance, &1000_i128);
        });

        // Create proposal (use a dummy token address)
        let token = Address::generate(&env);
        let desc = Symbol::new(&env, "test_payment");
        let proposal_id = client.create_proposal(&signer1, &recipient, &100, &desc, &token);
        assert_eq!(proposal_id, 0);

        // Vote approve by signer1 and signer2 → should reach threshold
        client.vote(&signer1, &0, &true);
        client.vote(&signer2, &0, &true);

        let proposal = client.get_proposal(&0);
        assert_eq!(proposal.status, ProposalStatus::Approved);
    }
}
