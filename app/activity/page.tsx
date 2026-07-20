"use client";

import { Activity, Radio } from "lucide-react";
import EventFeed from "@/components/activity/EventFeed";
import { useContractEvents } from "@/hooks/useContractEvents";

export default function ActivityPage() {
  const { events } = useContractEvents();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-stellar-400" />
            Activity Feed
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time contract events from the Soroban treasury contract
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-stellar-600/10 border border-stellar-500/20">
          <Radio className="w-3.5 h-3.5 text-stellar-400 animate-pulse" />
          <span className="text-xs font-medium text-stellar-400">Live</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Events", value: events.length },
          {
            label: "Votes Cast",
            value: events.filter((e) => e.type === "vote_cast").length,
          },
          {
            label: "Executed",
            value: events.filter((e) => e.type === "proposal_executed").length,
          },
        ].map(({ label, value }) => (
          <div key={label} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-stellar-300">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* How polling works */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border/40">
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">Real-time polling:</span> Events are fetched from the Soroban RPC{" "}
          <code className="text-stellar-300 bg-stellar-900/30 px-1 rounded">getEvents</code> endpoint every 5 seconds.
          New events appear automatically without page refresh.
        </p>
      </div>

      {/* Feed */}
      <div className="glass-card p-6">
        <EventFeed />
      </div>
    </div>
  );
}
