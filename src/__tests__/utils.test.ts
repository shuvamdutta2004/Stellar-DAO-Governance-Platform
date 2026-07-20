/**
 * @file utils.test.ts
 * Tests for the utility functions in lib/utils.ts
 */
import { describe, it, expect } from "vitest";
import {
  cn,
  stroopsToXlm,
  xlmToStroops,
  formatAddress,
  formatRelativeTime,
  formatLedgerTimestamp,
  generateId,
  getTxExplorerUrl,
  getAccountExplorerUrl,
  getStatusColor,
  getEventEmoji,
} from "@/lib/utils";

describe("cn (class name merge)", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "skipped", "included")).toBe("base included");
  });

  it("resolves Tailwind conflicts correctly", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });
});

describe("stroopsToXlm", () => {
  it("converts 10_000_000 stroops to 1.00 XLM", () => {
    expect(stroopsToXlm(BigInt(10_000_000))).toBe("1.00");
  });

  it("converts 0 stroops to 0.00 XLM", () => {
    expect(stroopsToXlm(BigInt(0))).toBe("0.00");
  });

  it("converts 100_000_000 stroops to 10.00 XLM", () => {
    expect(stroopsToXlm(BigInt(100_000_000))).toBe("10.00");
  });

  it("supports custom decimal places", () => {
    expect(stroopsToXlm(BigInt(10_000_000), 4)).toBe("1.0000");
  });
});

describe("xlmToStroops", () => {
  it("converts 1 XLM to 10_000_000 stroops", () => {
    expect(xlmToStroops(1)).toBe(BigInt(10_000_000));
  });

  it("converts 0.5 XLM to 5_000_000 stroops", () => {
    expect(xlmToStroops(0.5)).toBe(BigInt(5_000_000));
  });

  it("converts 0 XLM to 0 stroops", () => {
    expect(xlmToStroops(0)).toBe(BigInt(0));
  });
});

describe("formatAddress", () => {
  const addr = "GBUX3IHQTAIRN3BXVBWZMKFW2CF6FE4QKQWYEDHYGQXL6OQ3YFMN5R3N";

  it("truncates a full Stellar address", () => {
    const result = formatAddress(addr);
    expect(result).toMatch(/^G.{4}\.{3}.{4}$/);
    expect(result.length).toBeLessThan(addr.length);
  });

  it("returns address unchanged if too short", () => {
    expect(formatAddress("GABC", 4)).toBe("GABC");
  });

  it("returns empty string unchanged", () => {
    expect(formatAddress("")).toBe("");
  });
});

describe("getTxExplorerUrl", () => {
  it("generates correct testnet tx URL", () => {
    const hash = "abc123";
    expect(getTxExplorerUrl(hash)).toBe(
      "https://stellar.expert/explorer/testnet/tx/abc123"
    );
  });
});

describe("getAccountExplorerUrl", () => {
  it("generates correct testnet account URL", () => {
    const addr = "GABC";
    expect(getAccountExplorerUrl(addr)).toBe(
      "https://stellar.expert/explorer/testnet/account/GABC"
    );
  });
});

describe("getStatusColor", () => {
  it("returns yellow for Pending", () => {
    expect(getStatusColor("Pending")).toContain("yellow");
  });

  it("returns cyan for Approved", () => {
    expect(getStatusColor("Approved")).toContain("cyan");
  });

  it("returns emerald for Executed", () => {
    expect(getStatusColor("Executed")).toContain("emerald");
  });

  it("returns red for Rejected", () => {
    expect(getStatusColor("Rejected")).toContain("red");
  });

  it("returns gray for Cancelled", () => {
    expect(getStatusColor("Cancelled")).toContain("gray");
  });

  it("returns gray for unknown status", () => {
    expect(getStatusColor("Unknown")).toContain("gray");
  });
});

describe("getEventEmoji", () => {
  it("returns correct emoji for deposit_received", () => {
    expect(getEventEmoji("deposit_received")).toBe("💰");
  });

  it("returns correct emoji for proposal_created", () => {
    expect(getEventEmoji("proposal_created")).toBe("📋");
  });

  it("returns correct emoji for vote_cast", () => {
    expect(getEventEmoji("vote_cast")).toBe("🗳️");
  });

  it("returns correct emoji for proposal_executed", () => {
    expect(getEventEmoji("proposal_executed")).toBe("💸");
  });

  it("returns fallback emoji for unknown event", () => {
    expect(getEventEmoji("unknown_event")).toBe("📡");
  });
});

describe("generateId", () => {
  it("generates a non-empty string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, generateId));
    expect(ids.size).toBe(100);
  });
});

describe("formatLedgerTimestamp", () => {
  it("returns '—' for falsy timestamp", () => {
    expect(formatLedgerTimestamp(0)).toBe("—");
  });

  it("returns a date string for valid unix timestamp", () => {
    // Unix timestamp for a known date
    const result = formatLedgerTimestamp(1_700_000_000);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
