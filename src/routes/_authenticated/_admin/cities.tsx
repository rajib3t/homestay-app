import React, {useCallback, useEffect, useMemo, useState} from 'react'

import { createFileRoute } from '@tanstack/react-router'
import  {CityHeader} from '@/locations/cities/components/header'
import { useMutation , useQueryClient, useQuery} from '@tanstack/react-query'
import { createCity, updateCity as updateCityService } from '@/services/location'
import type { CreateCityDTO, City, UpdateCityDTO } from '@/types/location'
import { parseValidationErrors } from '@/lib/utils'
import { getCitiesQuery, getCityQuery } from '@/locations/queries'
import { CityList } from '@/locations/cities/components/list'
import CitiesSearch from '@/locations/cities/components/search'
export const Route = createFileRoute('/_authenticated/_admin/cities')({
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
    title: "Manage Cities",
    meta: [
      {
        name: "description",
        content:
          "Admin interface to manage cities. Add, edit, or remove cities from the system.",
      },
       {
        property: 'og:title',
        content: 'Manage Cities',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const [openNewCityModal, setOpenNewCityModal] = useState(false)
  const [openEditCityModal, setOpenEditCityModal] = useState(false)
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const queryClient = useQueryClient();
    const { page, limit, sort, sort_order, filter } = Route.useSearch();
    const searchFilter = filter ? { filter } : undefined;

     const navigate = Route.useNavigate();
    const { data: queryData, isLoading } = useQuery({
    ...getCitiesQuery(page, limit, sort, sort_order, searchFilter)(),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const cities = queryData?.data ?? [];
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
          getCitiesQuery(page + 1, limit, sort, sort_order, searchFilter)()
        );
      }
    }, [page, totalPages, limit, sort, sort_order, searchFilter, queryClient]);


  const { mutateAsync: addNewCity } = useMutation({
    mutationFn: createCity,
  
    onMutate: async (newCity) => {
      await queryClient.cancelQueries({ queryKey: ["GET_CITIES", page, limit] })
      await queryClient.cancelQueries({ queryKey: ["GET_COUNTRIES"] })
      const previous = queryClient.getQueryData(["GET_CITIES", page, limit])
  
      queryClient.setQueryData(
        ["GET_CITIES", page, limit],
        (old: any) => ({
          ...old,
          data: [newCity, ...(old?.data || [])],
        })
      )
  
      return { previous }
    },
  
    onError: (_err, _new, context) => {
      queryClient.setQueryData(
        ["GET_CITIES", page, limit],
        context?.previous
      )
    },
  
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_CITIES", page, limit] })
      queryClient.invalidateQueries({ queryKey: ["GET_COUNTRIES"] })
    },
  })

   const handleAddNewCity = useCallback(
      async (payload: CreateCityDTO) => {
        setValidationErrors({})
        try {
          await addNewCity(payload)
          setValidationErrors({})
        } catch (err: any) {
          const map = parseValidationErrors(err)
          if (Object.keys(map).length) setValidationErrors(map)
          throw err
        }
      },
      [addNewCity]
    );

   const handleOpenEditCityModal = useCallback(
  async (city: City) => {
    setOpenEditCityModal(true);

    try {
      const res = await queryClient.fetchQuery(
        getCityQuery(city.id)()
      );

      return res?.data ?? city;
    } catch (err) {
      return city;
    }
  },
  [queryClient]
);

const {
  mutateAsync: updateCityMutation 
} = useMutation({
  mutationFn: ({ id, payload }: { id: string; payload: UpdateCityDTO }) => updateCityService(id, payload),
  
  onMutate: async ({ id, payload }) => {
    await queryClient.cancelQueries({ queryKey: ["GET_CITIES", page, limit] })
    const previous = queryClient.getQueryData(["GET_CITIES", page, limit])

    queryClient.setQueryData(
      ["GET_CITIES", page, limit],
      (old: any) => ({
        ...old,
        data: old?.data?.map((c: City) => c.id === id ? { ...c, ...payload } : c) || [],
      })
    )

    return { previous }
  },
  
  onError: (_err, _new, context) => {
    queryClient.setQueryData(
      ["GET_CITIES", page, limit],
      context?.previous
    )
  },
  
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["GET_CITIES", page, limit] })
    queryClient.invalidateQueries({ queryKey: ["GET_COUNTRIES"] })
  },
})

    const handleUpdateCity = useCallback(
      async (updatedCity: City) => {
        setValidationErrors({})
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...payload } = updatedCity;
          await updateCityMutation({ id, payload })
          setOpenEditCityModal(false)
        } catch (err: any) {
          const map = parseValidationErrors(err)
          if (Object.keys(map).length) setValidationErrors(map)
          throw err
        }
      },
      [updateCityMutation]
    );
  return (
    <React.Fragment>
      <CityHeader
        openNewCityModal={openNewCityModal}
        setOpenNewCityModal={setOpenNewCityModal}
        onAddNewCity={handleAddNewCity}

        validationErrors={validationErrors}
      />
      <div className="py-4">
        <CitiesSearch
          initialField={filter?.[0]?.search_field ?? "name"}
          initialValue={filter?.[0]?.search_value ?? ""}
          initialSort={`${sort ?? "name"}:${sort_order ?? "asc"}`}
          onSearch={(f) => {
            navigate({
              search: (prev) => ({
                ...prev,
                page: 1,
                filter:
                  f && f.search_value
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
      <CityList
        data={cities}
        isLoading={isLoading}
        meta={meta ?? undefined}
        onPageChange={handlePageChange}
        openEditCityModal={openEditCityModal}
        setOpenEditCityModal={setOpenEditCityModal}
        onEditModalOpen={handleOpenEditCityModal}
        onUpdateCity={handleUpdateCity}
        validationErrors={validationErrors}
        //openStatusChangeModal={handleOpenStatusChangeModal}

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
    </React.Fragment>
  )
}
