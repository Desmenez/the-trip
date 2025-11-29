import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Interaction {
  id: string;
  type: string;
  content: string;
  date: string;
  agent: { name: string };
}

interface InteractionsResponse {
  data: Interaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Query key factory
export const interactionKeys = {
  all: ["interactions"] as const,
  lists: () => [...interactionKeys.all, "list"] as const,
  list: (customerId: string, page: number, pageSize: number) =>
    [...interactionKeys.lists(), customerId, page, pageSize] as const,
};

// Fetch interactions function
async function fetchInteractions(
  customerId: string,
  page: number = 1,
  pageSize: number = 5
): Promise<InteractionsResponse> {
  const res = await fetch(`/api/interactions?customerId=${customerId}&page=${page}&pageSize=${pageSize}`);
  if (!res.ok) {
    throw new Error("Failed to fetch interactions");
  }
  return res.json();
}

// Create interaction function
async function createInteraction(data: {
  customerId: string;
  type: string;
  content: string;
}): Promise<Interaction> {
  const res = await fetch("/api/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create interaction");
  }

  return res.json();
}

// Hook to fetch interactions with pagination
export function useInteractions(customerId: string | undefined, page: number, pageSize: number) {
  return useQuery({
    queryKey: interactionKeys.list(customerId!, page, pageSize),
    queryFn: () => fetchInteractions(customerId!, page, pageSize),
    enabled: !!customerId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to create an interaction
export function useCreateInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInteraction,
    onSuccess: (data, variables) => {
      // Invalidate all interaction queries for this customer
      queryClient.invalidateQueries({
        queryKey: [...interactionKeys.all, "list", variables.customerId],
      });
      toast.success("Interaction logged successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log interaction");
    },
  });
}

// Export types
export type { Interaction, InteractionsResponse };

