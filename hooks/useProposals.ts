"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProposals } from "@/lib/stellar/contract";

const POLL_INTERVAL = Number(
  process.env.NEXT_PUBLIC_EVENT_POLL_INTERVAL ?? 10000
);

export function useProposals() {
  const query = useQuery({
    queryKey: ["proposals"],
    queryFn: fetchProposals,
    refetchInterval: POLL_INTERVAL,
    staleTime: 5000,
    retry: 2,
  });

  return {
    proposals: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
