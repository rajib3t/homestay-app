import React, { useCallback, useMemo, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CountryHeader } from "@/locations/countries/components/header";
import { CountryList } from "@/locations/countries/components/list";

import type { CreateCountryDTO, Country } from "@/types/location";

import { createCountry as createCountryService, updateCountry as updateCountryService, statusChangeCountry as statusChangeCountryService } from "@/services/location";
import { parseValidationErrors } from '@/lib/utils'
import { getCountriesQuery } from "@/locations/queries";
import ConfirmCountryModal from '@/locations/countries/components/confirm'
import CountriesSearch from '@/locations/countries/components/search'

export const Route = createFileRoute("/_authenticated/_admin/countries")({
  validateSearch: (search: RouteSearch) => ({
    page: Number(search.page ?? 1),
    limit: Number(search.limit ?? 5),
    sort: typeof search.sort === 'string' ? search.sort : undefined,
    sort_order: typeof search.sort_order === 'string' ? search.sort_order : undefined,
    filter: (() => {
      const raw = search.filter as any;
      if (!raw || typeof raw !== 'object') return undefined;
      const arr = Array.isArray(raw) ? raw : [raw];
      return arr.map((f: any) => ({
        search_field: typeof f?.search_field === 'string' ? f.search_field : undefined,
        search_value: typeof f?.search_value === 'string' ? f.search_value : undefined,
      }));
    })(),
  }),

  head: () => ({
    title: "Manage Countries",
    meta: [
      {
        name: "description",
        content:
          "Admin interface to manage countries. Add, edit, or remove countries from the system.",
      },
       {
        property: 'og:title',
        content: 'Manage Countries',
      },
    ],
  }),

  component: RouteComponent,
});

function RouteComponent() {
  const [openNewCountryModal, setOpenNewCountryModal] = useState(false)
  const [openEditCountryModal, setOpenEditCountryModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const [isOpenStatusChangeModal, setIsOpenStatusChangeModal] = useState(false)
  const [statusChangeCountry, setStatusChangeCountry] = useState<Country | null>(null)
  const [statusChanging, setStatusChanging] = useState(false)
  const queryClient = useQueryClient();

  const { page, limit, sort, sort_order, filter } = Route.useSearch();
  const navigate = Route.useNavigate();

  const searchFilter = filter ? { filter } : undefined;

  const { data: queryData, isLoading } = useQuery({
    ...getCountriesQuery(page, limit, sort, sort_order, searchFilter)(),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
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
useEffect(() => {
    if (page < totalPages) {
      queryClient.prefetchQuery(
        getCountriesQuery(page + 1, limit)()
      );
    }
  }, [page, totalPages, limit, queryClient]);
 

  

  const { mutateAsync: createCountry } = useMutation({
  mutationFn: createCountryService,

  onMutate: async (newCountry) => {
    await queryClient.cancelQueries({ queryKey: ["GET_COUNTRIES", page, limit] })

    const previous = queryClient.getQueryData(["GET_COUNTRIES", page, limit])

    queryClient.setQueryData(
      ["GET_COUNTRIES", page, limit],
      (old: any) => ({
        ...old,
        data: [newCountry, ...(old?.data || [])],
      })
    )

    return { previous }
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["GET_COUNTRIES", page, limit] })
  },

  onError: (_err, _new, context) => {
    queryClient.setQueryData(
      ["GET_COUNTRIES", page, limit],
      context?.previous
    )
  },

  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["GET_COUNTRIES", page, limit] })
  },
})

  const { mutateAsync: updateCountry } = useMutation({
    mutationFn: ({ id, payload }: any) => updateCountryService(id, payload),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["GET_COUNTRIES", page, limit] });

      const previous = queryClient.getQueryData(["GET_COUNTRIES", page, limit]);

      queryClient.setQueryData(["GET_COUNTRIES", page, limit], (old: any) => ({
        ...old,
        data: (old?.data || []).map((c: any) => (String(c.id) === String(variables.id) ? { ...c, ...variables.payload } : c)),
      }));

      return { previous };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["GET_COUNTRIES", page, limit], context?.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_COUNTRIES", page, limit] });
    },
  });

  const handleAddNewCountry = useCallback(
    async (payload: CreateCountryDTO) => {
      setValidationErrors({})
      try {
        await createCountry(payload)
        setValidationErrors({})
      } catch (err: any) {
        const map = parseValidationErrors(err)
        if (Object.keys(map).length) setValidationErrors(map)
        throw err
      }
    },
    [createCountry]
  );

  const handleUpdateCountry = useCallback(
    async (country: any) => {
      setValidationErrors({});
      try {
        const payload = {
          name: country.name,
          code: country.code,
          dial_code: typeof country.dial_code === 'string' ? country.dial_code.replace("+", "") : country.dial_code,
        };

        await updateCountry({ id: String(country.id), payload });
      } catch (err: any) {
        const map = parseValidationErrors(err);
        if (Object.keys(map).length) setValidationErrors(map);
        throw err;
      }
    },
    [updateCountry]
  );

  const openStatusChangeModal = useCallback((country: Country) => {
    setStatusChangeCountry(country)
    setIsOpenStatusChangeModal(true)
  }, [])

  const { mutateAsync: confirmStatusChangeMutation } = useMutation({
    mutationFn: async () => {
      if (!statusChangeCountry) return Promise.reject(new Error("No country selected"));
      return statusChangeCountryService(String(statusChangeCountry.id), !statusChangeCountry.status);
    },
    
    onMutate: async () => {
      if (!statusChangeCountry) return
      setStatusChanging(true)

      await queryClient.cancelQueries({ queryKey: ["GET_COUNTRIES", page, limit] });

      const previous = queryClient.getQueryData(["GET_COUNTRIES", page, limit]);

      queryClient.setQueryData(["GET_COUNTRIES", page, limit], (old: any) => ({
        ...old,
        data: (old?.data || []).map((c: any) => (String(c.id) === String(statusChangeCountry.id) ? { ...c, status: !statusChangeCountry.status } : c)),
      }));

      return { previous };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["GET_COUNTRIES", page, limit], context?.previous);
    },

    onSettled: () => {
      setStatusChanging(false)
      setIsOpenStatusChangeModal(false)
      setStatusChangeCountry(null)
      queryClient.invalidateQueries({ queryKey: ["GET_COUNTRIES", page, limit] });
    },
  })
  const confirmStatusChange = useCallback(async () => {
    if (!statusChangeCountry) return
    setStatusChanging(true)
    try {
      await confirmStatusChangeMutation()
      setIsOpenStatusChangeModal(false)
      setStatusChangeCountry(null)
    } catch (err) {
      // keep modal open so user can retry or inspect errors
      throw err
    } finally {
      setStatusChanging(false)
    }
  }, [statusChangeCountry, confirmStatusChangeMutation])





  return (
    <React.Fragment>
      <CountryHeader openNewCountryModal={openNewCountryModal} setOpenNewCountryModal={setOpenNewCountryModal} onAddNewCountry={handleAddNewCountry} validationErrors={validationErrors} />

      <div className="py-4">
        <CountriesSearch
            initialField={filter?.[0]?.search_field ?? 'name'}
            initialValue={filter?.[0]?.search_value ?? ''}
          initialSort={`${sort ?? 'name'}:${sort_order ?? 'asc'}`}
          onSearch={(f) => {
            navigate({
              search: (prev) => ({
                ...prev,
                page: 1,
                  filter: f && f.search_value
                    ? [{ search_field: f.search_field, search_value: f.search_value }]
                    : undefined,
              }),
            })
          }}
          onSortChange={(val) => {
            const [s, order] = String(val).split(":")
            navigate({
              search: (prev) => ({
                ...prev,
                page: 1,
                sort: s,
                sort_order: order,
              }),
            })
          }}
        />
      </div>

      <CountryList
        data={countries}
        isLoading={isLoading}
        meta={meta ?? undefined}
        onPageChange={handlePageChange}
        openEditCountryModal={openEditCountryModal}
        setOpenEditCountryModal={setOpenEditCountryModal}
        onUpdateCountry={handleUpdateCountry}
        openStatusChangeModal={openStatusChangeModal}
        onSortChange={(col, order) => {
          navigate({
            search: (prev) => ({
              ...prev,
              page: 1,
              sort: col,
              sort_order: order,
            }),
          })
        }}
        currentSort={sort ?? null}
        currentOrder={sort_order ?? null}
       />

      <ConfirmCountryModal
        open={isOpenStatusChangeModal}
        onOpenChange={(open) => {
          setIsOpenStatusChangeModal(open)
          if (!open) setStatusChangeCountry(null)
        }}
        country={statusChangeCountry}
        onConfirm={confirmStatusChange}
        isLoading={statusChanging}
      />

      
    </React.Fragment>
  );
}