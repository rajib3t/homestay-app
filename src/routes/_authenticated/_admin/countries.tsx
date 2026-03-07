import React, { useCallback, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CountryHeader } from "@/locations/countries/components/header";
import { CountryList } from "@/locations/countries/components/list";

import type { CreateCountryDTO } from "@/types/location";

import { createCountry as createCountryService } from "@/services/location";
import { getCountriesQuery } from "@/locations/queries";

export const Route = createFileRoute("/_authenticated/_admin/countries")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page ?? 1),
  }),

  head: () => ({
    title: "Manage Countries",
    meta: [
      {
        name: "description",
        content:
          "Admin interface to manage countries. Add, edit, or remove countries from the system.",
      },
    ],
  }),

  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();

  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();

  const limit = 5;

  const { data: queryData, isLoading } = useQuery({
    ...getCountriesQuery(page, limit)(),
    placeholderData: (prev) => prev,
  });

  const countries = queryData?.data ?? [];
  const meta = queryData?.meta;

  const totalPages = useMemo(() => {
    if (!meta?.total) return 1;
    return Math.ceil(meta.total / limit);
  }, [meta, limit]);

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: newPage,
      }),
    });
  };

  const { mutate: createCountry } = useMutation({
    mutationFn: (payload: CreateCountryDTO) =>
      createCountryService(payload),

    onSuccess() {
      // invalidate ALL paginated queries
      queryClient.invalidateQueries({
        queryKey: ["GET_COUNTRIES"],
      });
    },

    onError(error) {
      console.error("Failed to create country", error);
    },
  });

  const handleAddNewCountry = useCallback(
    (payload: CreateCountryDTO) => {
      createCountry(payload);
    },
    [createCountry]
  );

  return (
    <>
      <CountryHeader onAddNewCountry={handleAddNewCountry} />

      <CountryList
        data={countries}
        isLoading={isLoading}
        meta={meta ?? undefined}
        onPageChange={handlePageChange}
      />
    </>
  );
}