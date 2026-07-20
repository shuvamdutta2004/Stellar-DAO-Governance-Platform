export type TransactionStatus = "pending" | "success" | "failed" | "submitting";

export interface TrackedTransaction {
  id: string;              // uuid
  hash: string | null;     // stellar tx hash (null until submitted)
  status: TransactionStatus;
  label: string;           // e.g. "Create Proposal: Pay dev team"
  error: string | null;
  createdAt: number;       // JS timestamp
  updatedAt: number;
}
