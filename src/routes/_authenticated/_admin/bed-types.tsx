import BedTypesHeader from '@/attributes/bed-types/header'
import { createFileRoute } from '@tanstack/react-router'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useForm } from '@tanstack/react-form'
import  AddBedType from '@/attributes/bed-types/add'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'

import { createBedType, updateBedType, statusChangeBedType as changeBedTypeStatus } from '@/services/attribute'
import { getBedTypesQuery } from '@/attributes/queries'
import { parseValidationErrors } from '@/lib/utils'
import { BedTypeList } from '@/attributes/bed-types/list'
import EditBedType from '@/attributes/bed-types/edit'
import type { BedType, BedTypeDTO } from '@/types/attribute/index.'
import ConfirmBedTypeModal from '@/attributes/bed-types/confirm'
import type { PaginatedMeta } from '@/types/common'
export const Route = createFileRoute('/_authenticated/_admin/bed-types')({
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
        title: "Manage Bed Types",
        meta: [
        {
            name: "description",
            content:
            "Admin interface to manage bed types. Add, edit, or remove bed types from the system.",
        },
        {
            property: 'og:title',
            content: 'Manage Bed Types',
        },
        ],
    }),
  component: RouteComponent,
})



function RouteComponent() {
  const [openNewBedTypeModal, setOpenNewBedTypeModal] = useState(false)
 const [openEditBedTypeModal, setOpenEditBedTypeModal] = useState(false)
 const [isOpenStatusChangeModal, setIsOpenStatusChangeModal] = useState(false)
   const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
       const [selectedBedTypeForStatusChange, setSelectedBedTypeForStatusChange] = useState<BedType | null>(null)
   const { page, limit, sort, sort_order, filter } = Route.useSearch();
  const searchFilter = filter ? { filter } : undefined;
   const queryClient = useQueryClient();
    const navigate = Route.useNavigate();
   const { data: queryData, isLoading } = useQuery({
    ...getBedTypesQuery(page, limit, sort, sort_order, searchFilter)(),
    //placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
    const bedTypes = queryData?.data ?? [];
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
              getBedTypesQuery(page + 1, limit, sort, sort_order, searchFilter)()
            );
          }
        }, [page, totalPages, limit, sort, sort_order, searchFilter, queryClient]);
   const { mutateAsync: createBedTypeMutation } = useMutation({
           mutationFn: createBedType,
           onMutate: async (newBedType) => {
               await queryClient.cancelQueries({ queryKey: ["GET_BED_TYPES", page, limit] })
               const previous = await queryClient.getQueryData(["GET_BED_TYPES", page, limit])
               queryClient.setQueryData(["GET_BED_TYPES", page, limit], (old?: any) => {
                   const newData = {
                       id: `temp-id-${Math.random()}`,
                       ...newBedType,
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
               ["GET_BED_TYPES", page, limit],
               context?.previous
             )
           },
       
           onSettled: () => {
             queryClient.invalidateQueries({ queryKey: ["GET_BED_TYPES", page, limit] })
             //queryClient.invalidateQueries({ queryKey: ["GET_COUNTRIES"] })
           },
       })
      
  const createForm = useForm({
    defaultValues: {
      name: '',
      capacity: null as number | null,
    },
   onSubmit: async ({ value }) => {
           // Implement edit amenity logic here, similar to createAmenity
           try {
               await createBedTypeMutation(value)
               setOpenNewBedTypeModal(false)
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
     mutateAsync: editBedTypeMutation,
   } = useMutation({
     mutationFn: (vars: { id: string } & BedTypeDTO) => updateBedType(vars.id, vars),
     onMutate: async (updatedBedType) => {
         await queryClient.cancelQueries({ queryKey: ["GET_BED_TYPES", page, limit] })
         const previous = await queryClient.getQueryData(["GET_BED_TYPES", page, limit])
         queryClient.setQueryData(["GET_BED_TYPES", page, limit], (old?: any) => {
             if (!old?.data) return old
             return {
                 ...old,
                 data: old.data.map((bedType: BedType) =>
                     bedType.id === updatedBedType.id ? { ...bedType, ...updatedBedType } : bedType
                 ),
             }
         })
         return { previous }
     },
     onError: (_err, _new, context) => {
       queryClient.setQueryData(
         ["GET_BED_TYPES", page, limit],
         context?.previous
       )
     },
 
     onSettled: () => {
       queryClient.invalidateQueries({ queryKey: ["GET_BED_TYPES", page, limit] })
       //queryClient.invalidateQueries({ queryKey: ["GET_COUNTRIES"] })
     },
   })    
   const editForm = useForm({
    defaultValues: {
      id: '',
      name: '',
      capacity: null as number | null,
    },
   onSubmit: async ({ value }) => {
           // Implement edit amenity logic here, similar to createAmenity
           try {
           await editBedTypeMutation(value)
               setOpenEditBedTypeModal(false)
               setValidationErrors({})
               editForm.reset()
           } catch (error) {
               const map = parseValidationErrors(error)
               if (Object.keys(map).length) setValidationErrors(map)
               throw error
           }
       },
  })
   const handleOpenEditBedTypeModal = (bedType: BedType) => {
      editForm.setFieldValue('id', bedType.id)
      editForm.setFieldValue('name', bedType.name)
      editForm.setFieldValue('capacity', bedType.capacity || null)
      setOpenEditBedTypeModal(true)
    }

        const { mutateAsync: confirmStatusChangeMutation , isPending: statusChanging } = useMutation({
          mutationFn: (vars: { id: string; status: boolean }) => changeBedTypeStatus(vars.id, vars.status),
            onMutate: async (bedType) => {
                await queryClient.cancelQueries({ queryKey: ["GET_BED_TYPES", page, limit] })
                const previous = await queryClient.getQueryData(["GET_BED_TYPES", page, limit])
                queryClient.setQueryData(["GET_BED_TYPES", page, limit], (old?: any) => {
                    if (!old?.data) return old
                    return {
                        ...old,
                        data: old.data.map((a: BedType) =>
                            a.id === bedType.id ? { ...a, status: bedType.status } : a
                        ),
                    }
                })
                return { previous }
            },
            onError: (_err, _new, context) => {
              queryClient.setQueryData(
                ["GET_BED_TYPES", page, limit],
                context?.previous
              )
            },
        
            onSettled: () => {
              queryClient.invalidateQueries({ queryKey: ["GET_BED_TYPES", page, limit] })
            },
          }) // Implement the mutation for confirming status change (activate/deactivate) of a bed type
        
          const openStatusChangeModal = useCallback((bedType: BedType) => {
              setSelectedBedTypeForStatusChange(bedType)
              setIsOpenStatusChangeModal(true)
            }, [])
        
        const confirmStatusChange = useCallback(async () => {
          if (!selectedBedTypeForStatusChange) return
          try {
            await confirmStatusChangeMutation({
              id: selectedBedTypeForStatusChange.id,
              status: !selectedBedTypeForStatusChange.status,
            })
            setIsOpenStatusChangeModal(false)
            setSelectedBedTypeForStatusChange(null)
          } catch (err) {
            // keep modal open so user can retry or inspect errors
            throw err
          }
        }, [selectedBedTypeForStatusChange, confirmStatusChangeMutation])

  return (
    <React.Fragment>
      <BedTypesHeader
        setOpenNewBedTypeModal={setOpenNewBedTypeModal}
      />
      <AddBedType
        open={openNewBedTypeModal}
        onOpenChange={setOpenNewBedTypeModal}
        form={createForm}
        validationErrors={validationErrors}
      />
      <BedTypeList
        data={bedTypes}
        isLoading={isLoading}
        meta={meta as PaginatedMeta}
        onPageChange={handlePageChange}
        onEditBedType={handleOpenEditBedTypeModal}
        openStatusChangeModal={openStatusChangeModal}
      />  
      <EditBedType
        data={editForm.state.values as BedType}
        open={openEditBedTypeModal}
        onOpenChange={setOpenEditBedTypeModal}
        form={editForm}
        validationErrors={validationErrors}
      />
      <ConfirmBedTypeModal
            open={isOpenStatusChangeModal}
            onOpenChange={setIsOpenStatusChangeModal}

        bedType={selectedBedTypeForStatusChange}
            onConfirm={confirmStatusChange}
            isLoading={statusChanging } // You can manage loading state as needed
          />
    </React.Fragment>
  )
}
   
    

