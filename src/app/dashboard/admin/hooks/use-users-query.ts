import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "../types";

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Query key factory
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (page: number, pageSize: number, search?: string, role?: string) =>
    [...userKeys.lists(), page, pageSize, search, role] as const,
};

// Fetch users function
async function fetchUsers(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  role?: string
): Promise<UsersResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (search && search.trim()) {
    params.set("search", search.trim());
  }
  if (role && role !== "ALL") {
    params.set("role", role);
  }
  const url = `/api/users?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  return res.json();
}

// Hook to fetch users
export function useUsers(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  role?: string
) {
  return useQuery({
    queryKey: userKeys.list(page, pageSize, search, role),
    queryFn: () => fetchUsers(page, pageSize, search, role),
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
