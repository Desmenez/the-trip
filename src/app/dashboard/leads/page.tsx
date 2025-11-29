"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, Pencil, Search, X } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useLeads, type Lead } from "./hooks/use-leads";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const searchQuery = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(searchQuery);
  const debouncedSearch = useDebounce(searchInput, 500);
  const isClearing = useRef(false);

  const updateSearchParams = useCallback(
    (updates: { page?: number; pageSize?: number; search?: string }) => {
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

      if (updates.search !== undefined) {
        if (updates.search === "") {
          params.delete("search");
        } else {
          params.set("search", updates.search);
        }
      }

      const newUrl = params.toString() ? `?${params.toString()}` : "";
      router.push(`/dashboard/leads${newUrl}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Sync debounced search to URL
  useEffect(() => {
    if (isClearing.current) {
      return;
    }
    if (debouncedSearch !== searchQuery) {
      updateSearchParams({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, searchQuery, updateSearchParams]);

  // Sync URL search to input
  useEffect(() => {
    if (!isClearing.current && searchQuery !== searchInput) {
      setSearchInput(searchQuery);
    }
    if (isClearing.current && searchQuery === "") {
      isClearing.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-500";
      case "QUOTED":
        return "bg-yellow-500";
      case "FOLLOW_UP":
        return "bg-purple-500";
      case "CLOSED_WON":
        return "bg-green-500";
      case "CLOSED_LOST":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const columns: ColumnDef<Lead>[] = useMemo(
    () => [
      {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => {
          const customer = row.original.customer;
          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {customer.firstNameTh} {customer.lastNameTh}
              </span>
              <span className="text-xs text-muted-foreground">
                ({customer.firstNameEn} {customer.lastNameEn})
              </span>
              <span className="text-xs text-muted-foreground">
                {customer.email || "-"}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge className={getStatusColor(row.original.status)}>
            {row.original.status.replace("_", " ")}
          </Badge>
        ),
      },
      {
        accessorKey: "destinationInterest",
        header: "Destination",
        cell: ({ row }) => row.original.destinationInterest || "-",
      },
      {
        accessorKey: "potentialValue",
        header: "Value",
        cell: ({ row }) =>
          row.original.potentialValue
            ? new Intl.NumberFormat("th-TH", {
                style: "currency",
                currency: "THB",
              }).format(row.original.potentialValue)
            : "-",
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => row.original.source,
      },
      {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ row }) =>
          format(new Date(row.original.updatedAt), "dd MMM yyyy"),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Link href={`/dashboard/leads/${row.original.id}`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/dashboard/leads/${row.original.id}/edit`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  const { data: leadsResponse, isLoading, error } = useLeads(
    page,
    pageSize,
    searchQuery || undefined
  );

  const leads = useMemo(
    () => leadsResponse?.data ?? [],
    [leadsResponse?.data]
  );
  const total = leadsResponse?.total ?? 0;

  const pageCount = useMemo(() => {
    if (total > 0 && pageSize > 0) {
      return Math.ceil(total / pageSize);
    }
    return 0;
  }, [total, pageSize]);

  const table = useDataTableInstance({
    data: leads,
    columns,
    enableRowSelection: false,
    defaultPageSize: pageSize,
    defaultPageIndex: page - 1,
    getRowId: (row) => row.id,
  });

  useEffect(() => {
    table.setOptions((prev) => ({
      ...prev,
      manualPagination: true,
      pageCount,
      data: leads,
    }));
  }, [pageCount, leads, table]);

  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      updateSearchParams({ page: newPageIndex + 1 });
    },
    [updateSearchParams]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      updateSearchParams({ pageSize: newPageSize, page: 1 });
    },
    [updateSearchParams]
  );

  if (isLoading) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">
            Failed to load leads. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Pipeline</h2>
          <p className="text-muted-foreground">
            Track and manage your sales leads.
          </p>
        </div>
        <Link href="/dashboard/leads/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Lead
          </Button>
        </Link>
      </div>

      {/* Search form */}
      <div className="flex items-center justify-end gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search customer name (TH/EN)..."
            className="pl-9 pr-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => {
                isClearing.current = true;
                setSearchInput("");
                updateSearchParams({ search: "", page: 1 });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-md border">
          <DataTable
            table={table}
            columns={columns}
            onRowClick={(row) => router.push(`/dashboard/leads/${row.id}`)}
          />
        </div>
        <DataTablePagination
          table={table}
          total={total}
          pageSize={pageSize}
          pageIndex={page - 1}
          pageCount={pageCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
