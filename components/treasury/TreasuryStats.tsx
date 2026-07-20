"use client";

import { Coins, Users, ShieldCheck, Hash } from "lucide-react";
import { stroopsToXlm } from "@/lib/utils";
import type { TreasuryState } from "@/types/contract";

interface TreasuryStatsProps {
  state: TreasuryState | undefined;
  isLoading: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="glass-card p-5 relative overflow-hidden group">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${color} bg-opacity-5`} />
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl ${color} bg-opacity-15`}>
          <Icon className={`w-5 h-5`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 skeleton-pulse rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 skeleton-pulse rounded" />
          <div className="h-6 w-32 skeleton-pulse rounded" />
        </div>
      </div>
    </div>
  );
}

export default function TreasuryStats({ state, isLoading }: TreasuryStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const balance = state?.balance ?? 0n;
  const threshold = state?.threshold ?? 0;
  const signerCount = state?.signers.length ?? 0;
  const proposalCount = state?.proposalCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        icon={Coins}
        label="Treasury Balance"
        value={`${stroopsToXlm(balance)} XLM`}
        sub="Available to spend"
        color="text-cyan-400 bg-cyan-500"
      />
      <StatCard
        icon={Users}
        label="Total Signers"
        value={String(signerCount)}
        sub="Registered members"
        color="text-stellar-400 bg-stellar-500"
      />
      <StatCard
        icon={ShieldCheck}
        label="Threshold"
        value={`${threshold} of ${signerCount}`}
        sub="Required approvals"
        color="text-emerald-400 bg-emerald-500"
      />
      <StatCard
        icon={Hash}
        label="Proposals"
        value={String(proposalCount)}
        sub="Total created"
        color="text-yellow-400 bg-yellow-500"
      />
    </div>
  );
}
