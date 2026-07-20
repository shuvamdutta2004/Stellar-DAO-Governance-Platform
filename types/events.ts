export type ContractEventType =
  | "treasury_initialized"
  | "deposit_received"
  | "proposal_created"
  | "vote_cast"
  | "proposal_approved"
  | "proposal_rejected"
  | "proposal_executed"
  | "proposal_cancelled";

export interface ContractEvent {
  id: string;              // event unique id (ledger + txIndex + eventIndex)
  type: ContractEventType;
  ledger: number;
  ledgerClosedAt: string;  // ISO timestamp
  txHash: string;
  contractId: string;
  actor: string | null;    // primary address involved (proposer, voter, etc.)
  data: Record<string, unknown>;
  timestamp: number;       // JS timestamp (ms)
}

export interface EventFeedItem extends ContractEvent {
  label: string;       // Human-readable label, e.g. "Proposal #3 Created"
  description: string; // e.g. "50 XLM → GBXYZ..."
}
