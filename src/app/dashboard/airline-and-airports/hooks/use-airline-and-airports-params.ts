"use client";

import { useListQueryParams } from "@/hooks/use-list-query-params";

export type ListQueryDefaults = Record<string, string | number>;

const airlineAndAirportDefaults = {
  page: 1,
  pageSize: 10,
  search: "",
} satisfies ListQueryDefaults;

export type AirlineAndAirportListParams = typeof airlineAndAirportDefaults;
export function useAirlineAndAirportParams() {
  return useListQueryParams(airlineAndAirportDefaults);
}

export function mapAirlineAndAirportParamsToQuery(params: AirlineAndAirportListParams) {
  const { page, pageSize, search } = params;

  return {
    page,
    pageSize,
    search: search || undefined,
  };
}
