"use client";

import { useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Plus, Pencil, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { AirlineAndAirportFilter } from "./_components/airline-and-airport-filter";
import { Loading } from "@/components/page/loading";

import {
  useAirlineAndAirports,
  type AirlineAndAirport,
} from "./hooks/use-airline-and-airports";
import {
  mapAirlineAndAirportParamsToQuery,
  useAirlineAndAirportParams,
} from "./hooks/use-airline-and-airports-params";

// --------------------
// columns
// --------------------
const airlineAndAirportColumns: ColumnDef<AirlineAndAirport>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.code}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return <div>{row.original.name}</div>;
    },
  },
  {
    accessorKey: "trips",
    header: "Used in Trips",
    cell: ({ row }) => {
      const tripCount = row.original._count?.trips || 0;
      return <div>{tripCount} {tripCount === 1 ? "trip" : "trips"}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        <Link href={`/dashboard/airline-and-airports/${row.original.id}`}>
          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
        <Link href={`/dashboard/airline-and-airports/${row.original.id}/edit`}>
          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    ),
  },
];

export default function AirlineAndAirportsPage() {
  // --------------------
  // params
  // --------------------
  const { page, pageSize, search, setParams } = useAirlineAndAirportParams();

  const airlineAndAirportQuery = mapAirlineAndAirportParamsToQuery({
    page,
    pageSize,
    search,
  });

  // --------------------
  // data fetching
  // --------------------
  const { data, isLoading, error } = useAirlineAndAirports(airlineAndAirportQuery);

  const airlineAndAirports = data?.data ?? [];
  const total = data?.total ?? 0;

  const pageCount = useMemo(() => {
    if (!total || !pageSize) return 0;
    return Math.ceil(total / pageSize);
  }, [total, pageSize]);

  // --------------------
  // table instance
  // --------------------
  const table = useDataTableInstance({
    data: airlineAndAirports,
    columns: airlineAndAirportColumns,
    enableRowSelection: false,
    manualPagination: true,
    pageCount,
    defaultPageSize: pageSize,
    defaultPageIndex: page - 1,
    getRowId: (row) => row.id,
  });

  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      setParams({ page: newPageIndex + 1 });
    },
    [setParams],
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setParams({ pageSize: newPageSize, page: 1 });
    },
    [setParams],
  );

  // --------------------
  // states
  // --------------------
  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Failed to load airline and airports. Please try again.</p>
        </div>
      </div>
    );
  }

  // --------------------
  // render
  // --------------------
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Airlines & Airports</h2>
          <p className="text-muted-foreground">Manage IATA codes for airlines and airports.</p>
        </div>
        <Link href="/dashboard/airline-and-airports/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </Link>
      </div>

      {/* Filter & Search form */}
      <AirlineAndAirportFilter />

      <div className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-md border">
          <DataTable table={table} columns={airlineAndAirportColumns} />
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
