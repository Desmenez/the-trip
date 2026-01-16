import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { User } from "../types";
import { UserFormValues } from "./use-users";

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

// Create user function
async function createUser(data: UserFormValues): Promise<User> {
  const body = {
    ...data,
    commissionPerHead: data.commissionPerHead ? parseFloat(data.commissionPerHead) : null,
  };

  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    const errorWithField = new Error(error) as Error & { field?: string };
    
    // Map API errors to form fields
    if (error.toLowerCase().includes("email") && error.toLowerCase().includes("already exists")) {
      errorWithField.field = "email";
    } else if (error.toLowerCase().includes("phone") && error.toLowerCase().includes("already exists")) {
      errorWithField.field = "phoneNumber";
    }
    
    throw errorWithField;
  }

  return res.json();
}

// Update user function
async function updateUser({ id, data }: { id: string; data: UserFormValues }): Promise<User> {
  const body = {
    ...data,
    commissionPerHead: data.commissionPerHead ? parseFloat(data.commissionPerHead) : null,
  };

  const res = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    const errorWithField = new Error(error) as Error & { field?: string };
    
    // Map API errors to form fields
    if (error.toLowerCase().includes("email") && error.toLowerCase().includes("already exists")) {
      errorWithField.field = "email";
    } else if (error.toLowerCase().includes("phone") && error.toLowerCase().includes("already exists")) {
      errorWithField.field = "phoneNumber";
    }
    
    throw errorWithField;
  }

  return res.json();
}

// Hook to create a user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User created successfully");
    },
    onError: (error: Error & { field?: string }) => {
      // Only show toast if error doesn't have a field (field errors are shown in form)
      if (!error.field) {
        toast.error(error.message || "Failed to create user");
      }
    },
  });
}

// Hook to update a user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User updated successfully");
    },
    onError: (error: Error & { field?: string }) => {
      // Only show toast if error doesn't have a field (field errors are shown in form)
      if (!error.field) {
        toast.error(error.message || "Failed to update user");
      }
    },
  });
}
