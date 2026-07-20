/**
 * Contract event polling using Soroban RPC getEvents API.
 */
import { rpc, scValToNative } from "@stellar/stellar-sdk";
import { getSorobanServer, getContractId } from "./client";
import type { ContractEvent, ContractEventType, EventFeedItem } from "@/types/events";
import { formatAddress } from "@/lib/utils";

const STROOPS_PER_XLM = 10_000_000;

/**
 * Fetch contract events starting from a given ledger.
 * Uses Soroban RPC getEvents with contract filter.
 */
export async function fetchContractEvents(
  startLedger?: number
): Promise<ContractEvent[]> {
  const server = getSorobanServer();
  const contractId = getContractId();
  if (!contractId) return [];

  // Default to ledger 1 if not provided (get recent events)
  const ledger = startLedger ?? Math.max(1, (await server.getLatestLedger()).sequence - 200);

  try {
    const response = await server.getEvents({
      startLedger: ledger,
      filters: [
        {
          type: "contract",
          contractIds: [contractId],
        },
      ],
      limit: 100,
    });

    return response.events.map(parseEvent);
  } catch (err) {
    console.error("Error fetching contract events:", err);
    return [];
  }
}

/**
 * Parse a raw Soroban event into our ContractEvent shape.
 */
function parseEvent(raw: rpc.Api.EventResponse): ContractEvent {
  const topicValues = raw.topic.map((t) => {
    try {
      return scValToNative(t);
    } catch {
      return null;
    }
  });

  // First topic is typically the event type symbol
  const eventType = (topicValues[0] as string) ?? "unknown";
  // Second topic is often the actor address
  const actor = typeof topicValues[1] === "string" ? topicValues[1] : null;

  let data: Record<string, unknown> = {};
  try {
    const parsed = scValToNative(raw.value);
    if (typeof parsed === "object" && parsed !== null) {
      data = parsed as Record<string, unknown>;
    } else {
      data = { value: parsed };
    }
  } catch {
    data = {};
  }

  return {
    id: raw.id,
    type: eventType as ContractEventType,
    ledger: raw.ledger,
    ledgerClosedAt: raw.ledgerClosedAt,
    txHash: raw.txHash,
    contractId: raw.contractId ? (typeof raw.contractId === "string" ? raw.contractId : (raw.contractId as any).contractId?.() || String(raw.contractId)) : "",
    actor,
    data,
    timestamp: new Date(raw.ledgerClosedAt).getTime(),
  };
}

/**
 * Convert a ContractEvent to an EventFeedItem with human-readable labels.
 */
export function toFeedItem(event: ContractEvent): EventFeedItem {
  let label = "";
  let description = "";

  switch (event.type) {
    case "treasury_initialized":
      label = "Treasury Initialized";
      description = `Threshold: ${event.data.threshold}, Signers: ${event.data.signer_count}`;
      break;
    case "deposit_received":
      label = "Deposit Received";
      {
        const xlm = event.data.value
          ? (Number(event.data.value) / STROOPS_PER_XLM).toFixed(2)
          : "?";
        description = `${xlm} XLM from ${formatAddress(event.actor ?? "")}`;
      }
      break;
    case "proposal_created":
      label = "Proposal Created";
      {
        const [proposalId, amount] = Array.isArray(event.data.value)
          ? event.data.value
          : [event.data.proposal_id ?? "?", event.data.amount ?? 0];
        const xlm = (Number(amount) / STROOPS_PER_XLM).toFixed(2);
        description = `Proposal #${proposalId} for ${xlm} XLM by ${formatAddress(event.actor ?? "")}`;
      }
      break;
    case "vote_cast":
      label = "Vote Cast";
      {
        const [proposalId, approve] = Array.isArray(event.data.value)
          ? event.data.value
          : [event.data.proposal_id ?? "?", event.data.approve ?? false];
        description = `${formatAddress(event.actor ?? "")} voted ${approve ? "✅ Approve" : "❌ Reject"} on #${proposalId}`;
      }
      break;
    case "proposal_approved":
      label = "Proposal Approved 🎉";
      description = `Proposal #${event.data.value ?? event.data.proposal_id} reached threshold`;
      break;
    case "proposal_rejected":
      label = "Proposal Rejected";
      description = `Proposal #${event.data.value ?? event.data.proposal_id} was rejected`;
      break;
    case "proposal_executed":
      label = "Proposal Executed 💸";
      {
        const [proposalId, amount] = Array.isArray(event.data.value)
          ? event.data.value
          : [event.data.proposal_id ?? "?", event.data.amount ?? 0];
        const xlm = (Number(amount) / STROOPS_PER_XLM).toFixed(2);
        description = `${xlm} XLM transferred. Executed by ${formatAddress(event.actor ?? "")}`;
      }
      break;
    default:
      label = event.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      description = JSON.stringify(event.data).slice(0, 80);
  }

  return { ...event, label, description };
}
