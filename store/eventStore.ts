import { create } from "zustand";
import type { ContractEvent, EventFeedItem } from "@/types/events";
import { toFeedItem } from "@/lib/stellar/events";

interface EventStore {
  events: EventFeedItem[];
  lastLedger: number;
  addEvents: (newEvents: ContractEvent[]) => void;
  setLastLedger: (ledger: number) => void;
  clearEvents: () => void;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  lastLedger: 0,

  addEvents: (newEvents) => {
    const existing = get().events;
    const existingIds = new Set(existing.map((e) => e.id));
    const fresh = newEvents
      .filter((e) => !existingIds.has(e.id))
      .map(toFeedItem);

    if (fresh.length === 0) return;

    set((s) => ({
      events: [...fresh, ...s.events].slice(0, 200), // keep last 200
    }));
  },

  setLastLedger: (ledger) => set({ lastLedger: ledger }),

  clearEvents: () => set({ events: [], lastLedger: 0 }),
}));
