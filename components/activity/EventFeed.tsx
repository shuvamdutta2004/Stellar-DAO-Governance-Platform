"use client";

import { Activity, RefreshCw } from "lucide-react";
import EventItem from "./EventItem";
import { useContractEvents } from "@/hooks/useContractEvents";

interface EventFeedProps {
  limit?: number;
}

export default function EventFeed({ limit }: EventFeedProps) {
  const { events, isLoading, isFetching, refetch } = useContractEvents();

  const displayed = limit ? events.slice(0, limit) : events;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-stellar-400" />
          <h3 className="text-sm font-semibold">Live Activity</h3>
          {isFetching && (
            <span className="w-1.5 h-1.5 rounded-full bg-stellar-400 animate-pulse" />
          )}
        </div>
        <button
          onClick={() => refetch()}
          className="p-1.5 rounded-lg hover:bg-secondary/60 transition-colors text-muted-foreground hover:text-foreground"
          title="Refresh events"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 skeleton-pulse rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && displayed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
            <Activity className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No events yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Contract interactions will appear here in real time
          </p>
        </div>
      )}

      {/* Events list */}
      {!isLoading && displayed.length > 0 && (
        <div className="space-y-2">
          {displayed.map((event, i) => (
            <EventItem key={event.id} event={event} isNew={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
