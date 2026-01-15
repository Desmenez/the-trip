"use client";

import { format } from "date-fns";
import { CalendarIcon, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CommissionFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  createdAtFrom: string;
  createdAtTo: string;
  onCreatedAtFromChange: (value: string) => void;
  onCreatedAtToChange: (value: string) => void;
  onDateRangeChange?: (from: string, to: string) => void;
}

export function CommissionFilter({
  search,
  onSearchChange,
  createdAtFrom,
  createdAtTo,
  onCreatedAtFromChange,
  onCreatedAtToChange,
  onDateRangeChange,
}: CommissionFilterProps) {
  const handleClearFilters = () => {
    onSearchChange("");
    onCreatedAtFromChange("");
    onCreatedAtToChange("");
  };

  const hasActiveFilters = search || createdAtFrom || createdAtTo;

  return (
    <div className="flex flex-col items-end justify-end gap-4 lg:flex-row">
      <div className="flex w-full flex-col gap-4 lg:w-auto lg:flex-row">
        {/* Filter: Commission created date range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal lg:w-[320px]",
                !createdAtFrom && !createdAtTo && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {createdAtFrom || createdAtTo ? (
                <span className="truncate">
                  {createdAtFrom ? format(new Date(createdAtFrom), "dd MMM yyyy") : "..."} -{" "}
                  {createdAtTo ? format(new Date(createdAtTo), "dd MMM yyyy") : "..."}
                </span>
              ) : (
                "Commission created date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              captionLayout="dropdown"
              mode="range"
              numberOfMonths={2}
              selected={{
                from: createdAtFrom ? new Date(createdAtFrom) : undefined,
                to: createdAtTo ? new Date(createdAtTo) : undefined,
              }}
              onSelect={(range) => {
                const from = range?.from ? format(range.from, "yyyy-MM-dd") : "";
                const to = range?.to ? format(range.to, "yyyy-MM-dd") : "";
                // Update both dates together for better UX
                if (onDateRangeChange) {
                  onDateRangeChange(from, to);
                } else {
                  onCreatedAtFromChange(from);
                  onCreatedAtToChange(to);
                }
              }}
              fromYear={2000}
              toYear={2100}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Search */}
      <div className="relative w-full flex-1 lg:max-w-sm">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search by sales user name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pr-9 pl-9 lg:w-full lg:max-w-sm"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
            onClick={() => onSearchChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={handleClearFilters} className="h-10">
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
