"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, Search, X } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { withDndColumn } from "@/components/data-table/table-utils";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useTags, useDeleteTag, useReorderTags } from "./hooks/use-tags";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

interface Tag {
  id: string;
  name: string;
  order: number;
  _count?: {
    customers: number;
  };
}

export default function TagsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // Get pagination and search from URL params
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const searchQuery = searchParams.get("search") || "";

  // Local state for search input
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  // Ref to prevent flicker when clearing
  const isClearing = useRef(false);

  // Function to update URL params
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
      router.push(`/dashboard/tags${newUrl}`, { scroll: false });
    },
    [searchParams, router]
  );

  // Sync debounced search to URL (skip when clearing)
  useEffect(() => {
    if (isClearing.current) {
      return;
    }
    if (debouncedSearch !== searchQuery) {
      updateSearchParams({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch, searchQuery, updateSearchParams]);

  // Sync URL search to input (for back/forward)
  useEffect(() => {
    if (!isClearing.current && searchQuery !== searchInput) {
      setSearchInput(searchQuery);
    }
    if (isClearing.current && searchQuery === "") {
      isClearing.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const columns: ColumnDef<Tag>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
      },
      {
        accessorKey: "usage",
        header: "Usage",
        cell: ({ row }) => {
          const count = row.original._count?.customers || 0;
          return `${count} ${count === 1 ? "customer" : "customers"}`;
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Link href={`/dashboard/tags/${row.original.id}`}>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/dashboard/tags/${row.original.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDeletingId(row.original.id);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="text-destructive h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  // Use TanStack Query to fetch tags
  const { data: tagsResponse, isLoading, error } = useTags(
    page,
    pageSize,
    searchQuery || undefined
  );
  const deleteTagMutation = useDeleteTag();
  const reorderTagsMutation = useReorderTags();

  const tags = useMemo(() => tagsResponse?.data ?? [], [tagsResponse?.data]);
  const total = tagsResponse?.total ?? 0;

  // Calculate page count
  const pageCount = useMemo(() => {
    if (total > 0 && pageSize > 0) {
      return Math.ceil(total / pageSize);
    }
    return 0;
  }, [total, pageSize]);

  const table = useDataTableInstance({
    data: tags,
    columns: withDndColumn(columns),
    enableRowSelection: false,
    defaultPageSize: pageSize,
    defaultPageIndex: page - 1,
    getRowId: (row) => row.id,
  });

  // Set manual pagination mode
  useEffect(() => {
    table.setOptions((prev) => ({
      ...prev,
      manualPagination: true,
      pageCount,
      data: tags,
    }));
  }, [pageCount, tags, table]);

  // Handlers for pagination changes
  const handlePageChange = React.useCallback(
    (newPageIndex: number) => {
      updateSearchParams({ page: newPageIndex + 1 });
    },
    [updateSearchParams]
  );

  const handlePageSizeChange = React.useCallback(
    (newPageSize: number) => {
      updateSearchParams({ pageSize: newPageSize, page: 1 }); // Reset to page 1 when changing page size
    },
    [updateSearchParams]
  );

  async function handleDelete(id: string) {
    try {
      await deleteTagMutation.mutateAsync(id);
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      // Error is already handled in the mutation's onError
      console.error(error);
    }
  }

  async function handleReorder(newTags: Tag[]) {
    try {
      // Update order based on new position
      const tagsWithNewOrder = newTags.map((tag, index) => ({
        id: tag.id,
        order: index,
      }));

      await reorderTagsMutation.mutateAsync(tagsWithNewOrder);
    } catch (error) {
      // Error is already handled in the mutation's onError
      console.error(error);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading tags...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Failed to load tags. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tags</h2>
          <p className="text-muted-foreground">Manage customer tags for better organization.</p>
        </div>
        <Link href="/dashboard/tags/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Tag
          </Button>
        </Link>
      </div>

      {/* Search form */}
      <div className="flex items-center justify-end gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tags..."
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
          <DataTable table={table} columns={withDndColumn(columns)} dndEnabled={true} onReorder={handleReorder} />
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the tag and remove it from all customers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={deleteTagMutation.isPending}
            >
              {deleteTagMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
