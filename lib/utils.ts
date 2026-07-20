import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STROOPS_PER_XLM = 10_000_000n;

/**
 * Convert stroops (bigint) to XLM string with given decimal places.
 */
export function stroopsToXlm(stroops: bigint, decimals = 2): string {
  const xlm = Number(stroops) / Number(STROOPS_PER_XLM);
  return xlm.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Convert XLM number to stroops bigint.
 */
export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * Number(STROOPS_PER_XLM)));
}

/**
 * Truncate a Stellar address for display: GABCD...WXYZ
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 3) return address;
  return `${address.slice(0, chars + 1)}...${address.slice(-chars)}`;
}

/**
 * Format a ledger timestamp to relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(timestamp: number): string {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return "unknown";
  }
}

/**
 * Format a ledger unix timestamp (seconds) to locale date string.
 */
export function formatLedgerTimestamp(unixSeconds: number): string {
  if (!unixSeconds) return "—";
  return new Date(unixSeconds * 1000).toLocaleString();
}

/**
 * Generate a unique ID for tracking transactions locally.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Get the Stellar Expert explorer URL for a transaction.
 */
export function getTxExplorerUrl(hash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

/**
 * Get the Stellar Expert explorer URL for an account.
 */
export function getAccountExplorerUrl(address: string): string {
  return `https://stellar.expert/explorer/testnet/account/${address}`;
}

/**
 * Determine the color class for a proposal status badge.
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "Pending":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Approved":
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    case "Executed":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "Rejected":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "Cancelled":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
}

/**
 * Map event type to an emoji for the activity feed.
 */
export function getEventEmoji(type: string): string {
  const map: Record<string, string> = {
    treasury_initialized: "🏛️",
    deposit_received: "💰",
    proposal_created: "📋",
    vote_cast: "🗳️",
    proposal_approved: "✅",
    proposal_rejected: "❌",
    proposal_executed: "💸",
    proposal_cancelled: "🚫",
  };
  return map[type] ?? "📡";
}
