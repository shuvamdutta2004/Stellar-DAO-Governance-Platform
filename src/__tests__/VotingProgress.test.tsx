/**
 * @file VotingProgress.test.tsx
 * Tests for the VotingProgress component.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import VotingProgress from "@/components/treasury/VotingProgress";

describe("VotingProgress", () => {
  it("renders approve and reject counts", () => {
    render(
      <VotingProgress
        approveCount={2}
        rejectCount={1}
        threshold={3}
        signerCount={5}
      />
    );

    expect(screen.getByText(/2 Approve/i)).toBeInTheDocument();
    expect(screen.getByText(/1 Reject/i)).toBeInTheDocument();
  });

  it("shows correct threshold label", () => {
    render(
      <VotingProgress
        approveCount={1}
        rejectCount={0}
        threshold={2}
        signerCount={3}
      />
    );

    expect(screen.getByText("1/2 needed")).toBeInTheDocument();
  });

  it("renders with zero votes", () => {
    render(
      <VotingProgress
        approveCount={0}
        rejectCount={0}
        threshold={2}
        signerCount={3}
      />
    );

    expect(screen.getByText(/0 Approve/i)).toBeInTheDocument();
    expect(screen.getByText(/0 Reject/i)).toBeInTheDocument();
    expect(screen.getByText("0/2 needed")).toBeInTheDocument();
  });

  it("renders approve bar with correct width style", () => {
    const { container } = render(
      <VotingProgress
        approveCount={2}
        rejectCount={0}
        threshold={2}
        signerCount={4}
      />
    );

    // 2/4 signers = 50%
    const approveFill = container.querySelector(".bg-emerald-500");
    expect(approveFill).toHaveStyle({ width: "50%" });
  });

  it("caps approve percent at 100%", () => {
    const { container } = render(
      <VotingProgress
        approveCount={10}
        rejectCount={0}
        threshold={2}
        signerCount={3}
      />
    );

    const approveFill = container.querySelector(".bg-emerald-500");
    expect(approveFill).toHaveStyle({ width: "100%" });
  });
});
