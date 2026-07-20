export interface WalletState {
  isConnected: boolean;
  address: string | null;
  publicKey: string | null;
  walletId: string | null;
  networkType: "testnet" | "mainnet" | "futurenet";
}

export interface WalletBalance {
  xlm: string;   // formatted string
  raw: bigint;   // in stroops
}

export type WalletError =
  | "NOT_INSTALLED"
  | "USER_REJECTED"
  | "INSUFFICIENT_BALANCE"
  | "NETWORK_MISMATCH"
  | "UNKNOWN";

export interface WalletErrorInfo {
  type: WalletError;
  message: string;
}
