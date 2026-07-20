/**
 * @file AddressDisplay.test.tsx
 * Tests for the AddressDisplay wallet component.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AddressDisplay from "@/components/wallet/AddressDisplay";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

const FULL_ADDRESS = "GBUX3IHQTAIRN3BXVBWZMKFW2CF6FE4QKQWYEDHYGQXL6OQ3YFMN5R3N";

describe("AddressDisplay", () => {
  beforeEach(() => {
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders a truncated address", () => {
    render(<AddressDisplay address={FULL_ADDRESS} />);
    // Should NOT show the full address
    expect(screen.queryByText(FULL_ADDRESS)).not.toBeInTheDocument();
    // Should show a truncated version with ellipsis
    expect(screen.getByText(/GBUX3\.\.\./i)).toBeInTheDocument();
  });

  it("shows copy button by default", () => {
    render(<AddressDisplay address={FULL_ADDRESS} />);
    const copyBtn = screen.getByTitle("Copy address");
    expect(copyBtn).toBeInTheDocument();
  });

  it("hides copy button when showCopy=false", () => {
    render(<AddressDisplay address={FULL_ADDRESS} showCopy={false} />);
    expect(screen.queryByTitle("Copy address")).not.toBeInTheDocument();
  });

  it("calls clipboard.writeText when copy button is clicked", async () => {
    render(<AddressDisplay address={FULL_ADDRESS} />);
    const copyBtn = screen.getByTitle("Copy address");
    fireEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(FULL_ADDRESS);
  });

  it("supports custom chars truncation length", () => {
    render(<AddressDisplay address={FULL_ADDRESS} chars={6} />);
    // formatAddress with chars=6 produces "GBUX3IH...MN5R3N" (7-char prefix = chars+1)
    const span = screen.getByText(/GBUX3IH\.\.\./i);
    expect(span).toBeInTheDocument();
  });
});
