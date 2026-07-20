"use client";

interface VotingProgressProps {
  approveCount: number;
  rejectCount: number;
  threshold: number;
  signerCount: number;
}

export default function VotingProgress({
  approveCount,
  rejectCount,
  threshold,
  signerCount,
}: VotingProgressProps) {
  const total = Math.max(signerCount, 1);
  const approvePercent = Math.min((approveCount / total) * 100, 100);
  const rejectPercent = Math.min((rejectCount / total) * 100, 100);
  const thresholdPercent = (threshold / total) * 100;

  return (
    <div className="space-y-2">
      {/* Bar */}
      <div className="relative h-2.5 bg-secondary/60 rounded-full overflow-hidden">
        {/* Approve fill */}
        <div
          className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${approvePercent}%` }}
        />
        {/* Reject fill (right-aligned) */}
        <div
          className="absolute right-0 top-0 h-full bg-red-500/70 rounded-full transition-all duration-500"
          style={{ width: `${rejectPercent}%` }}
        />
        {/* Threshold marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-yellow-400/80"
          style={{ left: `${thresholdPercent}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{approveCount} Approve</span>
        </div>
        <div className="text-muted-foreground font-mono text-center">
          {approveCount}/{threshold} needed
        </div>
        <div className="flex items-center gap-1.5 text-red-400">
          <span>{rejectCount} Reject</span>
          <span className="w-2 h-2 rounded-full bg-red-500/70" />
        </div>
      </div>
    </div>
  );
}
