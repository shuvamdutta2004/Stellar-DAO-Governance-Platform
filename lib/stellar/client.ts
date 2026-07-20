/**
 * Stellar/Soroban RPC client singleton
 */
import { rpc, Networks } from "@stellar/stellar-sdk";

const RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ||
  "https://soroban-testnet.stellar.org";

let _server: rpc.Server | null = null;

export function getSorobanServer(): rpc.Server {
  if (!_server) {
    _server = new rpc.Server(RPC_URL, { allowHttp: false });
  }
  return _server;
}

export function getNetworkPassphrase(): string {
  return (
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
    Networks.TESTNET
  );
}

export function getContractId(): string {
  const id = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID;
  if (!id || id === "CONTRACT_ADDRESS_HERE") {
    console.warn(
      "Treasury contract ID not set. Set NEXT_PUBLIC_TREASURY_CONTRACT_ID in .env.local"
    );
    return "";
  }
  return id;
}

export function getNativeTokenAddress(): string {
  return (
    process.env.NEXT_PUBLIC_NATIVE_TOKEN_ADDRESS ||
    "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
  );
}

export function getHorizonUrl(): string {
  return (
    process.env.NEXT_PUBLIC_HORIZON_URL ||
    "https://horizon-testnet.stellar.org"
  );
}

export function getExplorerUrl(type: "tx" | "account" | "contract", value: string): string {
  const base = "https://stellar.expert/explorer/testnet";
  if (type === "tx") return `${base}/tx/${value}`;
  if (type === "account") return `${base}/account/${value}`;
  if (type === "contract") return `${base}/contract/${value}`;
  return base;
}
