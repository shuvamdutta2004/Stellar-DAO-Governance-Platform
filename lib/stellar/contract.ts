/**
 * Treasury Contract interaction layer.
 * Handles building, simulating, and submitting Soroban transactions.
 */
import {
  Contract,
  rpc,
  TransactionBuilder,
  BASE_FEE,
  xdr,
  Address,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";

import {
  getSorobanServer,
  getNetworkPassphrase,
  getContractId,
  getNativeTokenAddress,
} from "./client";

import type {
  Proposal,
  ProposalStatus,
  TreasuryState,
  CreateProposalParams,
  VoteParams,
  ExecuteProposalParams,
  DepositParams,
} from "@/types/contract";

// ─── XDR helpers ─────────────────────────────────────────────────────────────

function addressToScVal(address: string): xdr.ScVal {
  return Address.fromString(address).toScVal();
}

function symbolToScVal(value: string): xdr.ScVal {
  return xdr.ScVal.scvSymbol(Buffer.from(value));
}

function parseProposalStatus(raw: unknown): ProposalStatus {
  if (typeof raw === "object" && raw !== null) {
    const key = Object.keys(raw)[0];
    if (key) return key as ProposalStatus;
  }
  return "Pending";
}

function parseProposal(raw: Record<string, unknown>): Proposal {
  return {
    id: Number(raw.id ?? 0),
    proposer: String(raw.proposer ?? ""),
    recipient: String(raw.recipient ?? ""),
    amount: BigInt(String(raw.amount ?? 0)),
    description: String(raw.description ?? ""),
    status: parseProposalStatus(raw.status),
    approveCount: Number(raw.approve_count ?? 0),
    rejectCount: Number(raw.reject_count ?? 0),
    createdAt: Number(raw.created_at ?? 0),
    executedAt: Number(raw.executed_at ?? 0),
  };
}

// ─── Contract Read Operations ─────────────────────────────────────────────────

/**
 * Read treasury state: balance, threshold, signers, proposal count.
 */
export async function fetchTreasuryState(): Promise<TreasuryState> {
  const server = getSorobanServer();
  const contractId = getContractId();

  if (!contractId) {
    return { balance: 0n, threshold: 0, signers: [], proposalCount: 0 };
  }

  const contract = new Contract(contractId);
  const account = await server.getAccount(
    "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN"
  ).catch(() => null);

  if (!account) {
    // Return empty state when we can't get a fee-bumping account
    return { balance: 0n, threshold: 0, signers: [], proposalCount: 0 };
  }

  const passphrase = getNetworkPassphrase();

  async function simulateView(methodName: string, args: xdr.ScVal[] = []): Promise<unknown> {
    const tx = new TransactionBuilder(account!, {
      fee: BASE_FEE,
      networkPassphrase: passphrase,
    })
      .addOperation(contract.call(methodName, ...args))
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(sim)) {
      throw new Error(`Simulation failed for ${methodName}: ${sim.error}`);
    }
    const result = (sim as rpc.Api.SimulateTransactionSuccessResponse)
      .result?.retval;
    if (!result) return null;
    return scValToNative(result);
  }

  const [balance, threshold, signers, proposalCount] = await Promise.all([
    simulateView("get_balance"),
    simulateView("get_threshold"),
    simulateView("get_signers"),
    simulateView("get_proposal_count"),
  ]);

  return {
    balance: BigInt(String(balance ?? 0)),
    threshold: Number(threshold ?? 0),
    signers: (signers as string[] | null) ?? [],
    proposalCount: Number(proposalCount ?? 0),
  };
}

/**
 * Fetch all proposals from the contract.
 */
export async function fetchProposals(): Promise<Proposal[]> {
  const server = getSorobanServer();
  const contractId = getContractId();
  if (!contractId) return [];

  const contract = new Contract(contractId);
  const passphrase = getNetworkPassphrase();

  const account = await server
    .getAccount("GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN")
    .catch(() => null);
  if (!account) return [];

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(contract.call("get_proposals"))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    console.error("get_proposals simulation error:", sim.error);
    return [];
  }
  const retval = (sim as rpc.Api.SimulateTransactionSuccessResponse)
    .result?.retval;
  if (!retval) return [];

  const raw = scValToNative(retval) as Record<string, unknown>[];
  return raw.map(parseProposal);
}

/**
 * Check if a wallet address is a registered signer.
 */
export async function checkIsSigner(address: string): Promise<boolean> {
  const server = getSorobanServer();
  const contractId = getContractId();
  if (!contractId) return false;

  const contract = new Contract(contractId);
  const passphrase = getNetworkPassphrase();

  const account = await server
    .getAccount("GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN")
    .catch(() => null);
  if (!account) return false;

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(contract.call("is_signer", addressToScVal(address)))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) return false;

  const retval = (sim as rpc.Api.SimulateTransactionSuccessResponse)
    .result?.retval;
  if (!retval) return false;

  return Boolean(scValToNative(retval));
}

/**
 * Check if an address has already voted on a specific proposal.
 */
export async function checkHasVoted(
  voterAddress: string,
  proposalId: number
): Promise<boolean> {
  const server = getSorobanServer();
  const contractId = getContractId();
  if (!contractId) return false;

  const contract = new Contract(contractId);
  const passphrase = getNetworkPassphrase();

  const account = await server
    .getAccount("GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN")
    .catch(() => null);
  if (!account) return false;

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: passphrase,
  })
    .addOperation(
      contract.call(
        "has_voted",
        addressToScVal(voterAddress),
        nativeToScVal(proposalId, { type: "u32" })
      )
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) return false;

  const retval = (sim as rpc.Api.SimulateTransactionSuccessResponse)
    .result?.retval;
  if (!retval) return false;

  return Boolean(scValToNative(retval));
}

// ─── Transaction Builders ────────────────────────────────────────────────────

/**
 * Build a Soroban transaction XDR for create_proposal.
 * The caller must sign and submit this via StellarWalletsKit.
 */
export async function buildCreateProposalTx(
  params: CreateProposalParams
): Promise<string> {
  const server = getSorobanServer();
  const contractId = getContractId();
  const contract = new Contract(contractId);
  const passphrase = getNetworkPassphrase();

  const account = await server.getAccount(params.proposer);

  const tx = new TransactionBuilder(account, {
    fee: String(100_000),
    networkPassphrase: passphrase,
  })
    .addOperation(
      contract.call(
        "create_proposal",
        addressToScVal(params.proposer),
        addressToScVal(params.recipient),
        nativeToScVal(params.amount, { type: "i128" }),
        symbolToScVal(params.description),
        addressToScVal(params.tokenAddress)
      )
    )
    .setTimeout(300)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation error: ${sim.error}`);
  }

  const assembled = rpc.assembleTransaction(
    tx,
    sim as rpc.Api.SimulateTransactionSuccessResponse
  ).build();
  return assembled.toXDR();
}

/**
 * Build a transaction XDR for casting a vote.
 */
export async function buildVoteTx(params: VoteParams): Promise<string> {
  const server = getSorobanServer();
  const contractId = getContractId();
  const contract = new Contract(contractId);
  const passphrase = getNetworkPassphrase();

  const account = await server.getAccount(params.voter);

  const tx = new TransactionBuilder(account, {
    fee: String(100_000),
    networkPassphrase: passphrase,
  })
    .addOperation(
      contract.call(
        "vote",
        addressToScVal(params.voter),
        nativeToScVal(params.proposalId, { type: "u32" }),
        nativeToScVal(params.approve, { type: "bool" })
      )
    )
    .setTimeout(300)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation error: ${sim.error}`);
  }

  const assembled = rpc.assembleTransaction(
    tx,
    sim as rpc.Api.SimulateTransactionSuccessResponse
  ).build();
  return assembled.toXDR();
}

/**
 * Build a transaction XDR for executing an approved proposal.
 */
export async function buildExecuteProposalTx(
  params: ExecuteProposalParams
): Promise<string> {
  const server = getSorobanServer();
  const contractId = getContractId();
  const contract = new Contract(contractId);
  const passphrase = getNetworkPassphrase();

  const account = await server.getAccount(params.executor);

  const tx = new TransactionBuilder(account, {
    fee: String(100_000),
    networkPassphrase: passphrase,
  })
    .addOperation(
      contract.call(
        "execute_proposal",
        addressToScVal(params.executor),
        nativeToScVal(params.proposalId, { type: "u32" }),
        addressToScVal(params.tokenAddress)
      )
    )
    .setTimeout(300)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation error: ${sim.error}`);
  }

  const assembled = rpc.assembleTransaction(
    tx,
    sim as rpc.Api.SimulateTransactionSuccessResponse
  ).build();
  return assembled.toXDR();
}

/**
 * Build a transaction XDR for depositing XLM into the treasury.
 */
export async function buildDepositTx(params: DepositParams): Promise<string> {
  const server = getSorobanServer();
  const contractId = getContractId();
  const contract = new Contract(contractId);
  const passphrase = getNetworkPassphrase();

  const account = await server.getAccount(params.from);

  const tx = new TransactionBuilder(account, {
    fee: String(100_000),
    networkPassphrase: passphrase,
  })
    .addOperation(
      contract.call(
        "deposit",
        addressToScVal(params.from),
        addressToScVal(params.tokenAddress),
        nativeToScVal(params.amount, { type: "i128" })
      )
    )
    .setTimeout(300)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation error: ${sim.error}`);
  }

  const assembled = rpc.assembleTransaction(
    tx,
    sim as rpc.Api.SimulateTransactionSuccessResponse
  ).build();
  return assembled.toXDR();
}

/**
 * Submit a signed XDR transaction to the network.
 * Returns the transaction hash.
 */
export async function submitTransaction(signedXdr: string): Promise<string> {
  const server = getSorobanServer();
  const { TransactionBuilder } = await import("@stellar/stellar-sdk");
  const tx = TransactionBuilder.fromXDR(signedXdr, getNetworkPassphrase());
  const sendResult = await server.sendTransaction(tx);

  if (sendResult.status === "ERROR") {
    throw new Error(`Transaction failed: ${JSON.stringify(sendResult.errorResult)}`);
  }

  const hash = sendResult.hash;

  // Poll for completion
  let attempts = 0;
  while (attempts < 30) {
    await new Promise((r) => setTimeout(r, 2000));
    const status = await server.getTransaction(hash);

    if (status.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return hash;
    }
    if (status.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction failed on-chain. Hash: ${hash}`);
    }
    attempts++;
  }

  throw new Error(`Transaction timed out. Hash: ${hash}`);
}
