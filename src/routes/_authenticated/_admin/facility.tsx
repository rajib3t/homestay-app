import AddFacility from '@/attributes/facilities/components/add'
import { FacilitiesHeader } from '@/attributes/facilities/components/header'
import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import {
  createFacility as createFacilityService,
  updateFacility as updateFacilityService,
  statusChangeFacility as statusChangeFacilityService,
} from '@/services/attribute'
import type { Facility, FacilityDTO } from '@/types/attribute/index.'
import { parseValidationErrors } from '@/lib/utils'
import ListFacility from '@/attributes/facilities/components/list'
import { getFacilitiesQuery } from '@/attributes/queries'
import EditFacility from '@/attributes/facilities/components/edit'
import ConfirmFacilityModal from '@/attributes/facilities/components/confirm'
import FacilitiesSearch from '@/attributes/facilities/components/search'
export const Route = createFileRoute('/_authenticated/_admin/facility')({
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
        title: "Manage Facilities",
        meta: [
        {
            name: "description",
            content:
            "Admin interface to manage facilities. Add, edit, or remove facilities from the system.",
        },
        {
            property: 'og:title',
            content: 'Manage Facilities',
        },
        ],
    }),
  component: RouteComponent,
})

function RouteComponent() {
  const [openNewFacilityModal, setOpenNewFacilityModal] = useState(false)
  const [openEditAmenityModal, setOpenEditAmenityModal] = useState(false)
  const [isOpenStatusChangeModal, setIsOpenStatusChangeModal] = useState(false)
  const [statusChangeFacility, setStatusChangeFacility] = useState<Facility | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const queryClient = useQueryClient();
  const { page, limit, sort, sort_order, filter } = Route.useSearch();
  const searchFilter = filter ? { filter } : undefined;
  const navigate = Route.useNavigate();
     const { data: queryData, isLoading } = useQuery({
    ...getFacilitiesQuery(page, limit, sort, sort_order, searchFilter)(),
    //placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
    const facilities = queryData?.data ?? [];
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
              getFacilitiesQuery(page + 1, limit, sort, sort_order, searchFilter)()
            );
          }
        }, [page, totalPages, limit, sort, sort_order, searchFilter, queryClient]);
  const { mutateAsync: createFacility } = useMutation({
        mutationFn: createFacilityService,
        onMutate: async (newFacility) => {
            await queryClient.cancelQueries({ queryKey: ["GET_FACILITIES", page, limit] })
            const previous = await queryClient.getQueryData(["GET_FACILITIES", page, limit])
            queryClient.setQueryData(["GET_FACILITIES", page, limit], (old?: any) => {
                const newData = {
                    id: `temp-id-${Math.random()}`,
                    ...newFacility,
                }
                if (!old?.data) return { data: [newData], meta: { total: 1 } }
                return {
                    ...old,
                    data: [newData, ...old.data],
                    meta: {
                        ...old.meta,
                        total: old.meta.total + 1,
                    },
                }
            })
            return { previous }
        },
        onError: (_err, _new, context) => {
          queryClient.setQueryData(
            ["GET_FACILITIES", page, limit],
            context?.previous
          )
        },
    
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["GET_FACILITIES", page, limit] })
          //queryClient.invalidateQueries({ queryKey: ["GET_COUNTRIES"] })
        },
    })
  const createForm = useForm({
    defaultValues: {
      name: '',
      icon: '',
    },
    onSubmit: async ({value}) => {
      try {
        await createFacility(value as FacilityDTO);
        setOpenNewFacilityModal(false);
        createForm.reset();
        setValidationErrors({});
      } catch (err: any) {
        const map = parseValidationErrors(err)
                    if (Object.keys(map).length) setValidationErrors(map)
                    throw err
      }
    },
  })
  const handleOpenEditFacilityModal = (facility: Facility) => {
    editForm.setFieldValue('id', facility.id);
    editForm.setFieldValue('name', facility.name);
    editForm.setFieldValue('icon', facility.icon);
    setOpenEditAmenityModal(true);
  };

  const { mutateAsync: updateFacility } = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FacilityDTO }) =>
      updateFacilityService(id, values),
    onMutate: async ({ id, values }) => {
      await queryClient.cancelQueries({ queryKey: ["GET_FACILITIES", page, limit] })
      const previous = await queryClient.getQueryData(["GET_FACILITIES", page, limit])
      queryClient.setQueryData(["GET_FACILITIES", page, limit], (old?: any) => {
        if (!old?.data) return old;
        const newData = old.data.map((item: Facility) => {
          if (item.id === id) {
            return { ...item, ...values };
          }
          return item;
        });
        return {
          ...old,
          data: newData,
        }
      })
      return { previous }
    },
    onError: (_err, _new, context) => {
      queryClient.setQueryData(
        ["GET_FACILITIES", page, limit],
        context?.previous
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_FACILITIES", page, limit] })
    },
  })
  
   const openStatusChangeModal = useCallback((facility: Facility) => {
        setStatusChangeFacility(facility)
        setIsOpenStatusChangeModal(true)
      }, [])

  const editForm = useForm({
    defaultValues: {
      id: '',
      name: '',
      icon: '',
    },
    onSubmit: async ({value}) => {
      try {
        const { id, ...facilityValues } = value;
        await updateFacility({
          id,
          values: facilityValues as FacilityDTO,
        });
        setOpenEditAmenityModal(false);
        editForm.reset();
        setValidationErrors({});
      } catch (err: any) {
        const map = parseValidationErrors(err)
        if (Object.keys(map).length) setValidationErrors(map)
        throw err
      }
    },
  })
  const { mutateAsync: confirmStatusChangeMutation , isPending: statusChanging } = useMutation({
      mutationFn: (vars: { id: string; status: boolean }) => statusChangeFacilityService(vars.id, vars.status),
      onMutate: async (facility) => {
          await queryClient.cancelQueries({ queryKey: ["GET_FACILITIES", page, limit] })
          const previous = await queryClient.getQueryData(["GET_FACILITIES", page, limit])
          queryClient.setQueryData(["GET_FACILITIES", page, limit], (old?: any) => {
              if (!old?.data) return old
              return {
                  ...old,
                  data: old.data.map((a: Facility) =>
                      a.id === facility.id ? { ...a, status: facility.status } : a
                  ),
              }
          })
          return { previous }
      },
      onError: (_err, _new, context) => {
        queryClient.setQueryData(
          ["GET_FACILITIES", page, limit],
          context?.previous
        )
      },
  
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["GET_FACILITIES", page, limit] })
      },
    })
  const confirmStatusChange = useCallback(async () => {
    if (!statusChangeFacility) return
    try {
      await confirmStatusChangeMutation({
        id: statusChangeFacility.id,
        status: !statusChangeFacility.status,
      })
      setIsOpenStatusChangeModal(false)
      setStatusChangeFacility(null)
    } catch (err) {
      // keep modal open so user can retry or inspect errors
      throw err
    }
  }, [statusChangeFacility, confirmStatusChangeMutation])
  return (
    <React.Fragment>
      <FacilitiesHeader onAddFacility={setOpenNewFacilityModal} />
      <AddFacility
        open={openNewFacilityModal}
        onOpenChange={setOpenNewFacilityModal}
        form={createForm}
        validationErrors={validationErrors}
      />
       <div className="py-4">
      <FacilitiesSearch 
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
      {/* Facility list and other components will go here */}
      <ListFacility
        data={facilities}
        isLoading={isLoading}
          meta={meta as PaginatedMeta}
          onPageChange={handlePageChange}
          onEditFacility={handleOpenEditFacilityModal}
          openStatusChangeModal={openStatusChangeModal}
      />

      <EditFacility
        data={editForm.state.values as Facility}
        open={openEditAmenityModal}
        onOpenChange={setOpenEditAmenityModal}
        form={editForm}
        validationErrors={validationErrors}
      />
      <ConfirmFacilityModal
        open={isOpenStatusChangeModal}
        onOpenChange={setIsOpenStatusChangeModal}
        facility={statusChangeFacility}
        onConfirm={confirmStatusChange}
        isLoading={statusChanging }
      />
     </React.Fragment>
   
  )
}
