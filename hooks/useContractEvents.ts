"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchContractEvents } from "@/lib/stellar/events";
import { useEventStore } from "@/store/eventStore";

const POLL_INTERVAL = Number(
  process.env.NEXT_PUBLIC_EVENT_POLL_INTERVAL ?? 5000
);

export function useContractEvents() {
  const { events, lastLedger, addEvents, setLastLedger } = useEventStore();

  const query = useQuery({
    queryKey: ["contract-events", lastLedger],
    queryFn: async () => {
      const newEvents = await fetchContractEvents(lastLedger || undefined);
      if (newEvents.length > 0) {
        addEvents(newEvents);
        const maxLedger = Math.max(...newEvents.map((e) => e.ledger));
        if (maxLedger > lastLedger) {
          setLastLedger(maxLedger);
        }
      }
      return newEvents;
    },
    refetchInterval: POLL_INTERVAL,
    staleTime: POLL_INTERVAL / 2,
    retry: 2,
  });

  return {
    events,
    isLoading: query.isLoading && events.length === 0,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
