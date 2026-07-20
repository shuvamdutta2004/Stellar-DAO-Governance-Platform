"use client";

import { formatRelativeTime, getEventEmoji } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import type { EventFeedItem } from "@/types/events";
import { cn } from "@/lib/utils";
import { getTxExplorerUrl } from "@/lib/utils";

const EVENT_COLORS: Record<string, string> = {
  treasury_initialized: "text-stellar-400 bg-stellar-500/15 border-stellar-500/20",
  deposit_received: "text-cyan-400 bg-cyan-500/15 border-cyan-500/20",
  proposal_created: "text-yellow-400 bg-yellow-500/15 border-yellow-500/20",
  vote_cast: "text-blue-400 bg-blue-500/15 border-blue-500/20",
  proposal_approved: "text-emerald-400 bg-emerald-500/15 border-emerald-500/20",
  proposal_rejected: "text-red-400 bg-red-500/15 border-red-500/20",
  proposal_executed: "text-purple-400 bg-purple-500/15 border-purple-500/20",
  proposal_cancelled: "text-gray-400 bg-gray-500/15 border-gray-500/20",
};

interface EventItemProps {
  event: EventFeedItem;
  isNew?: boolean;
}

export default function EventItem({ event, isNew }: EventItemProps) {
  const colorClass = EVENT_COLORS[event.type] ?? "text-muted-foreground bg-secondary/30 border-border/50";
  const emoji = getEventEmoji(event.type);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border transition-all duration-300",
        "hover:bg-secondary/30",
        isNew ? "border-stellar-500/30 bg-stellar-500/5 animate-fade-in" : "border-border/40 bg-card/30"
      )}
    >
      {/* Icon */}
      <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center text-base shrink-0", colorClass)}>
        {emoji}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground">{event.label}</p>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatRelativeTime(event.timestamp)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {event.description}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-mono text-xs text-muted-foreground/70">
            Ledger #{event.ledger}
          </span>
          {event.txHash && (
            <a
              href={getTxExplorerUrl(event.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-stellar-400 hover:text-stellar-300 transition-colors"
            >
              <ExternalLink className="w-2.5 h-2.5" />
              {event.txHash.slice(0, 8)}...
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
