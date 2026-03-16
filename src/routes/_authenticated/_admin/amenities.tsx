import AddAmenity from '@/attributes/amenities/components/add'
import AmenitiesHeader from '@/attributes/amenities/components/header'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAmenity as createAmenityService, updateAmenity as updateAmenityService, statusChangeAmenity as statusChangeAmenityService } from '@/services/attribute'
import { parseValidationErrors } from '@/lib/utils'
import { getAmenitiesQuery } from '@/attributes/queries'
import { AmenityList } from '@/attributes/amenities/components/list'
import EditAmenity from '@/attributes/amenities/components/edit'
import type { Amenity , UpdateAmenityDTO} from '@/types/attribute/index.'
import ConfirmAmenityModal from '@/attributes/amenities/components/confirm'
import AmenitiesSearch from '@/attributes/amenities/components/search'

export const Route = createFileRoute('/_authenticated/_admin/amenities')({
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
        title: "Manage Amenities",
        meta: [
        {
            name: "description",
            content:
            "Admin interface to manage amenities. Add, edit, or remove amenities from the system.",
        },
        {
            property: 'og:title',
            content: 'Manage Amenities',
        },
        ],
    }),
    component: RouteComponent,
})



function RouteComponent() {
    const [openNewAmenityModal, setOpenNewAmenityModal] = useState(false)
    const [openEditAmenityModal, setOpenEditAmenityModal] = useState(false)
    const [isOpenStatusChangeModal, setIsOpenStatusChangeModal] = useState(false)
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
    const [statusChangeAmenity, setStatusChangeAmenity] = useState<Amenity | null>(null)
    const { page, limit, sort, sort_order, filter } = Route.useSearch();
    const searchFilter = filter ? { filter } : undefined;
    const queryClient = useQueryClient();
    const navigate = Route.useNavigate();
     const { data: queryData, isLoading } = useQuery({
    ...getAmenitiesQuery(page, limit, sort, sort_order, searchFilter)(),
    //placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
    const amenities = queryData?.data ?? [];
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
              getAmenitiesQuery(page + 1, limit, sort, sort_order, searchFilter)()
            );
          }
        }, [page, totalPages, limit, sort, sort_order, searchFilter, queryClient]);
    

    const { mutateAsync: createAmenity } = useMutation({
        mutationFn: createAmenityService,
        onMutate: async (newAmenity) => {
            await queryClient.cancelQueries({ queryKey: ["GET_AMENITIES", page, limit] })
            const previous = await queryClient.getQueryData(["GET_AMENITIES", page, limit])
            queryClient.setQueryData(["GET_AMENITIES", page, limit], (old?: any) => {
                const newData = {
                    id: `temp-id-${Math.random()}`,
                    ...newAmenity,
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
            ["GET_AMENITIES", page, limit],
            context?.previous
          )
        },
    
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["GET_AMENITIES", page, limit] })
          //queryClient.invalidateQueries({ queryKey: ["GET_COUNTRIES"] })
        },
    })
    const createForm = useForm({
    defaultValues: {
      name: '',
      icon: '',
    },
    onSubmit: async ({ value }) => {
        setValidationErrors({})
        try {
            await createAmenity(value)
            setOpenNewAmenityModal(false)
            setValidationErrors({})
            createForm.reset()
        } catch (error) {
            const map = parseValidationErrors(error)
            if (Object.keys(map).length) setValidationErrors(map)
            throw error
        }
        
    },
  })

  const {
    mutateAsync: updateAmenityMutation,
  } = useMutation({
    mutationFn: (vars: { id: string } & UpdateAmenityDTO) => updateAmenityService(vars.id, vars),
    onMutate: async (updatedAmenity) => {
        await queryClient.cancelQueries({ queryKey: ["GET_AMENITIES", page, limit] })
        const previous = await queryClient.getQueryData(["GET_AMENITIES", page, limit])
        queryClient.setQueryData(["GET_AMENITIES", page, limit], (old?: any) => {
            if (!old?.data) return old
            return {
                ...old,
                data: old.data.map((amenity: Amenity) =>
                    amenity.id === updatedAmenity.id ? { ...amenity, ...updatedAmenity } : amenity
                ),
            }
        })
        return { previous }
    },
    onError: (_err, _new, context) => {
      queryClient.setQueryData(
        ["GET_AMENITIES", page, limit],
        context?.previous
      )
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_AMENITIES", page, limit] })
      //queryClient.invalidateQueries({ queryKey: ["GET_COUNTRIES"] })
    },
  })    
  const editForm = useForm({
    defaultValues: {
      id: '',
      name: '',
      icon: '',
    },
    onSubmit: async ({ value }) => {
        // Implement edit amenity logic here, similar to createAmenity
        try {
            await updateAmenityMutation(value)
            setOpenEditAmenityModal(false)
            setValidationErrors({})
            editForm.reset()
        } catch (error) {
            const map = parseValidationErrors(error)
            if (Object.keys(map).length) setValidationErrors(map)
            throw error
        }
    },
  })

  const handleOpenEditAmenityModal = (amenity: Amenity) => {
    editForm.setFieldValue('id', amenity.id)
    editForm.setFieldValue('name', amenity.name)
    editForm.setFieldValue('icon', amenity.icon || '')
    setOpenEditAmenityModal(true)
  }

  const { mutateAsync: confirmStatusChangeMutation , isPending: statusChanging } = useMutation({
    mutationFn: (vars: { id: string; status: boolean }) => statusChangeAmenityService(vars.id, vars.status),
    onMutate: async (amenity) => {
        await queryClient.cancelQueries({ queryKey: ["GET_AMENITIES", page, limit] })
        const previous = await queryClient.getQueryData(["GET_AMENITIES", page, limit])
        queryClient.setQueryData(["GET_AMENITIES", page, limit], (old?: any) => {
            if (!old?.data) return old
            return {
                ...old,
                data: old.data.map((a: Amenity) =>
                    a.id === amenity.id ? { ...a, status: amenity.status } : a
                ),
            }
        })
        return { previous }
    },
    onError: (_err, _new, context) => {
      queryClient.setQueryData(
        ["GET_AMENITIES", page, limit],
        context?.previous
      )
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["GET_AMENITIES", page, limit] })
    },
  }) // Implement the mutation for confirming status change (activate/deactivate) of an amenity

  const openStatusChangeModal = useCallback((amenity: Amenity) => {
      setStatusChangeAmenity(amenity)
      setIsOpenStatusChangeModal(true)
    }, [])

const confirmStatusChange = useCallback(async () => {
  if (!statusChangeAmenity) return
  try {
    await confirmStatusChangeMutation({
      id: statusChangeAmenity.id,
      status: !statusChangeAmenity.status,
    })
    setIsOpenStatusChangeModal(false)
    setStatusChangeAmenity(null)
  } catch (err) {
    // keep modal open so user can retry or inspect errors
    throw err
  }
}, [statusChangeAmenity, confirmStatusChangeMutation])

    return (
        <React.Fragment>
            <AmenitiesHeader setOpenNewAmenityModal={setOpenNewAmenityModal} />
            <AddAmenity 
                open={openNewAmenityModal} 
                onOpenChange={(open) => {
                    setOpenNewAmenityModal(open)
                    if (!open) setValidationErrors({})
                }}
                form={createForm}
                validationErrors={validationErrors}
            
            />
            <div className="py-4">
                <AmenitiesSearch
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
            <AmenityList
                data={amenities}
                isLoading={isLoading}
                meta={meta as PaginatedMeta}
                onPageChange={handlePageChange}
                onEditAmenity={handleOpenEditAmenityModal}  // ← change this
                openStatusChangeModal={openStatusChangeModal}
            />
            <EditAmenity 
                data={editForm.state.values as Amenity}
                open={openEditAmenityModal}
                onOpenChange={(open) => {
                    if (!open) setOpenEditAmenityModal(false)
                }}
                form={editForm}
                validationErrors={validationErrors}
             />
          {/* Implement ConfirmAmenityModal for status change confirmation */}
          <ConfirmAmenityModal
            open={isOpenStatusChangeModal}
            onOpenChange={setIsOpenStatusChangeModal}

            amenity={statusChangeAmenity}
            onConfirm={confirmStatusChange}
            isLoading={statusChanging } // You can manage loading state as needed
          />
        </React.Fragment>
    )
}
