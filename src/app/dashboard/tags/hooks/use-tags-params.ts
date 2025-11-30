"use client";

import { useListQueryParams } from "@/hooks/use-list-query-params";

export type ListQueryDefaults = Record<string, string | number>;

const tagsDefaults = {
  page: 1,
  pageSize: 10,
  search: "",
} satisfies ListQueryDefaults;

export type TagsListParams = typeof tagsDefaults;
export function useTagsParams() {
  return useListQueryParams(tagsDefaults);
}

export function mapTagsParamsToQuery(params: TagsListParams) {
  const { page, pageSize, search } = params;

  return {
    page,
    pageSize,
    search: search || undefined,
  };
}
