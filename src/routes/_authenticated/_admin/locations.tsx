import React, { useCallback, useEffect, useMemo, useState } from "react"
import { createFileRoute } from '@tanstack/react-router'
import { HeaderLocation } from '@/locations/location/components/header'
import type { CreateLocationDTO } from "@/types/location"
import { parseValidationErrors } from '@/lib/utils'
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { createLocation, updateLocation } from "@/services/location"
import { getLocationsQuery, getLocationQuery } from "@/locations/queries"
import { LocationList } from "@/locations/location/components/list"
import type { Location } from "@/types/location"
export const Route = createFileRoute('/_authenticated/_admin/locations')({
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
    title: "Manage Locations",
    meta: [
      {
        name: "description",
        content:
          "Admin interface to manage locations. Add, edit, or remove locations from the system.",
      },
       {
        property: 'og:title',
        content: 'Manage Locations',
      },
    ],
  }),
  component: RouteComponent,
})

function RouteComponent() {
    const [openNewLocationModal, setOpenNewLocationModal] = useState(false)
    const [openEditLocationModal, setOpenEditLocationModal] = useState(false)
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
    const queryClient = useQueryClient();
    const navigate = Route.useNavigate();
    
    const { page, limit, sort, sort_order, filter } = Route.useSearch();
    const searchFilter = filter ? { filter } : undefined;
    const { data: queryData, isLoading } = useQuery({
    ...getLocationsQuery(page, limit, sort, sort_order, searchFilter)(),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const locations = queryData?.data ?? [];
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
          getLocationsQuery(page + 1, limit)()
        );
      }
    }, [page, totalPages, limit, queryClient]);
    const { mutateAsync: createLocationMutate } = useMutation({
        mutationFn: createLocation,
      
        onMutate: async (newLocation) => {
            await queryClient.cancelQueries({ queryKey: ["GET_LOCATIONS", page, limit] })
      
            const previous = queryClient.getQueryData(["GET_LOCATIONS", page, limit])
      
            queryClient.setQueryData(
            ["GET_LOCATIONS", page, limit],
                (old: any) => ({
                ...old,
                data: [newLocation, ...(old?.data || [])],
                })
            )
      
          return { previous }
        },
      
        onError: (_err, _new, context) => {
          queryClient.setQueryData(
            ["GET_LOCATIONS", page, limit],
            context?.previous
          )
        },
      
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["GET_LOCATIONS", page, limit] })
        },
      })
    const handleAddNewLocation = useCallback(
          async (payload: CreateLocationDTO) => {
            setValidationErrors({})
            try {

              await createLocationMutate(payload)
              setValidationErrors({})
            } catch (err: any) {
              const map = parseValidationErrors(err)
              if (Object.keys(map).length) setValidationErrors(map)
              throw err
            }
          },
          [createLocationMutate]
        );
 
    const handleOpenEditLocationModal = useCallback(
       async (location: Location) => {
        // open modal and try to fetch latest data if we have an id
        setOpenEditLocationModal(true);

        const id = (location && (location.id ?? (location as any)._id ?? (location as any).location_id));
        if (!id) {
          console.warn("handleOpenEditLocationModal: no id found on location", location);
          return location;
        }

        try {
          console.log("Fetching latest data for location ID:", id);
          const res = await queryClient.fetchQuery(
            getLocationQuery(String(id))()
          );

          return res?.data ?? location;
        } catch (err) {
          return location;
        }
      },
      [queryClient])
    const handleUpdateLocation = useCallback(
     async (updatedLocation: Location) => {
       setValidationErrors({})
       try {
         await updateLocation(updatedLocation.id, updatedLocation as Partial<Location>);
         queryClient.invalidateQueries({ queryKey: ["GET_LOCATIONS", page, limit] });
         setOpenEditLocationModal(false);
       } catch (err: any) {
         const map = parseValidationErrors(err)
         if (Object.keys(map).length) setValidationErrors(map)
         console.error(err);
         throw err
       }
     },
     [queryClient, page, limit]
    );
  return (
    <React.Fragment>
        <HeaderLocation openNewLocationModal={openNewLocationModal} setOpenNewLocationModal={setOpenNewLocationModal} onAddNewLocation={handleAddNewLocation} validationErrors={validationErrors} />
        <LocationList
        data={locations}
        isLoading={isLoading}
        meta={meta ?? undefined}
        onPageChange={handlePageChange}
        openEditLocationModal={openEditLocationModal}
        setOpenEditLocationModal={setOpenEditLocationModal}
        
        onUpdateLocation={handleUpdateLocation}
        // openStatusChangeModal={openStatusChangeModal}
        onSortChange={(col, order) => {
          navigate({
            search: (prev) => ({
              ...prev,
              page: 1,
              sort: col,
              sort_order: order,
            }),
          })
        } }
        currentSort={sort ?? null}
        currentOrder={sort_order ?? null}
        onEditModalOpen={handleOpenEditLocationModal}
               />
    </React.Fragment>
  )
}
