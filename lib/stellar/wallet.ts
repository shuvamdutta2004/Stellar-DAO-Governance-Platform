/**
 * StellarWalletsKit initialization and signing helper.
 * Handles multi-wallet support: Freighter, xBull, ALBEDO, Lobstr, Rabet.
 */

import type { WalletErrorInfo } from "@/types/wallet";

// Kit is initialized client-side only
let _kit: unknown = null;

export async function getWalletsKit() {
  if (typeof window === "undefined") return null;
  if (_kit) return _kit as import("@creit.tech/stellar-wallets-kit").StellarWalletsKit;

  const {
    StellarWalletsKit,
    WalletNetwork,
    FREIGHTER_ID,
    XBULL_ID,
    LOBSTR_ID,
    AlbedoModule,
    FreighterModule,
    xBullModule,
    LobstrModule,
  } = await import("@creit.tech/stellar-wallets-kit");

  const network =
    process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet"
      ? WalletNetwork.PUBLIC
      : WalletNetwork.TESTNET;

  _kit = new StellarWalletsKit({
    network,
    selectedWalletId: FREIGHTER_ID,
    modules: [
      new FreighterModule(),
      new xBullModule(),
      new LobstrModule(),
      new AlbedoModule(),
    ],
  });

  return _kit as import("@creit.tech/stellar-wallets-kit").StellarWalletsKit;
}

export async function openWalletModal(onConnected: (address: string, walletId: string) => void) {
  const kit = await getWalletsKit();
  if (!kit) return;

  await kit.openModal({
    onWalletSelected: async (option) => {
      kit.setWallet(option.id);
      try {
        const { address } = await kit.getAddress();
        onConnected(address, option.id);
      } catch (err) {
        console.error("Failed to get address after wallet selection:", err);
      }
    },
  });
}

export async function signTransaction(xdr: string, address: string): Promise<string> {
  const kit = await getWalletsKit();
  if (!kit) throw new Error("Wallet kit not initialized");

  const networkPassphrase =
    process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ||
    "Test SDF Network ; September 2015";

  const { signedTxXdr } = await kit.signTransaction(xdr, {
    address,
    networkPassphrase,
  });

  return signedTxXdr;
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    const kit = await getWalletsKit();
    if (!kit) return null;
    const { address } = await kit.getAddress();
    return address;
  } catch {
    return null;
  }
}

export function parseWalletError(err: unknown): WalletErrorInfo {
  const msg = err instanceof Error ? err.message : String(err);

  if (
    msg.includes("not installed") ||
    msg.includes("not found") ||
    msg.includes("Extension is not installed")
  ) {
    return {
      type: "NOT_INSTALLED",
      message:
        "Wallet extension not found. Please install Freighter or another Stellar wallet.",
    };
  }

  if (
    msg.includes("rejected") ||
    msg.includes("User declined") ||
    msg.includes("cancelled")
  ) {
    return {
      type: "USER_REJECTED",
      message: "Transaction was rejected. Please try again.",
    };
  }

  if (msg.includes("insufficient") || msg.includes("balance")) {
    return {
      type: "INSUFFICIENT_BALANCE",
      message: "Insufficient XLM balance to complete this transaction.",
    };
  }

  if (msg.includes("network") || msg.includes("passphrase")) {
    return {
      type: "NETWORK_MISMATCH",
      message: "Network mismatch. Please switch your wallet to Testnet.",
    };
  }

  return {
    type: "UNKNOWN",
    message: msg || "An unexpected error occurred.",
  };
}
