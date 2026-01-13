import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "../types";

// Query key factory
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (search?: string) => [...userKeys.lists(), search] as const,
};

// Fetch users function
async function fetchUsers(search?: string): Promise<User[]> {
  const params = new URLSearchParams();
  if (search && search.trim()) {
    params.set("search", search.trim());
  }
  const queryString = params.toString();
  const url = queryString ? `/api/users?${queryString}` : "/api/users";

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  return res.json();
}

// Hook to fetch users
export function useUsers(search?: string) {
  return useQuery({
    queryKey: userKeys.list(search),
    queryFn: () => fetchUsers(search),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to invalidate users queries
export function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: userKeys.all });
  };
}
