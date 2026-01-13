import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface TasksQuery {
  page: number;
  pageSize: number;
  customerId?: string;
  status?: string;
  contact?: string;
  userId?: string;
}

export function mapTasksParamsToQuery(params: {
  page: number;
  pageSize: number;
  customerId?: string;
  status?: string;
  contact?: string;
  userId?: string;
}): TasksQuery {
  return {
    page: params.page,
    pageSize: params.pageSize,
    customerId: params.customerId,
    status: params.status,
    contact: params.contact,
    userId: params.userId,
  };
}

export function useTasksParams() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = useMemo(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) : 1;
  }, [searchParams]);

  const pageSize = useMemo(() => {
    const ps = searchParams.get("pageSize");
    return ps ? parseInt(ps, 10) : 10;
  }, [searchParams]);

  const customerId = useMemo(() => {
    return searchParams.get("customerId") || undefined;
  }, [searchParams]);

  const status = useMemo(() => {
    return searchParams.get("status") || undefined;
  }, [searchParams]);

  const contact = useMemo(() => {
    return searchParams.get("contact") || undefined;
  }, [searchParams]);

  const userId = useMemo(() => {
    return searchParams.get("userId") || undefined;
  }, [searchParams]);

  const setParams = useCallback(
    (updates: Partial<{
      page: number;
      pageSize: number;
      customerId?: string;
      status?: string;
      contact?: string;
      userId?: string;
    }>) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.page !== undefined) {
        if (updates.page === 1) {
          params.delete("page");
        } else {
          params.set("page", updates.page.toString());
        }
      }

      if (updates.pageSize !== undefined) {
        if (updates.pageSize === 10) {
          params.delete("pageSize");
        } else {
          params.set("pageSize", updates.pageSize.toString());
        }
      }

      if (updates.customerId !== undefined) {
        if (!updates.customerId) {
          params.delete("customerId");
        } else {
          params.set("customerId", updates.customerId);
        }
      }

      if (updates.status !== undefined) {
        if (!updates.status) {
          params.delete("status");
        } else {
          params.set("status", updates.status);
        }
      }

      if (updates.contact !== undefined) {
        if (!updates.contact) {
          params.delete("contact");
        } else {
          params.set("contact", updates.contact);
        }
      }

      if (updates.userId !== undefined) {
        if (!updates.userId) {
          params.delete("userId");
        } else {
          params.set("userId", updates.userId);
        }
      }

      const newUrl = params.toString() ? `?${params.toString()}` : "";
      router.push(`/dashboard/tasks${newUrl}`, { scroll: false });
    },
    [searchParams, router]
  );

  return {
    page,
    pageSize,
    customerId,
    status,
    contact,
    userId,
    setParams,
  };
}
