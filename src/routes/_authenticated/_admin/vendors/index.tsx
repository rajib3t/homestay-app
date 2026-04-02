import { createFileRoute } from '@tanstack/react-router'
import React, { useEffect, useMemo, useState } from 'react'
import VendorHeader from '@/vendors/components/header'
import AddVendor from '@/vendors/components/add'
import { useForm } from '@tanstack/react-form'
import { parseValidationErrors } from '@/lib/utils'
import { useMutation, useQueryClient , useQuery} from '@tanstack/react-query'
import { createUser as createVendorService } from '@/services/user'
import type { CreateUserData, UserData } from '@/types/user'
import { getVendorsQuery } from '@/vendors/queries'

import VendorList from '@/vendors/components/list'

export const Route = createFileRoute('/_authenticated/_admin/vendors/')({
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
        title: "Manage Vendors ",
        meta: [
        {
            name: "description",
            content:
            "Admin interface to manage vendors. Add, edit, or remove vendors from the system.",
        },
        {
            property: 'og:title',
            content: 'Manage Vendors',
        },
        ],
    }),
    component: RouteComponent,
})

function RouteComponent() {
    const [openNewVendorModal, setOpenNewVendorModal] = useState(false)
     const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
     const { page, limit, sort, sort_order, filter } = Route.useSearch();
    const defaultFilter = [
        {
            search_field: "user_type",
            search_value: "vendor",
        },
    ];

    const mergedFilter = filter
    ? [...defaultFilter, ...filter]
    : defaultFilter;

    const searchFilter = { filter: mergedFilter };
    const queryClient = useQueryClient();
    const navigate = Route.useNavigate();
    const { data: queryData, isLoading } = useQuery({
    ...getVendorsQuery(page, limit, sort, sort_order, searchFilter)(),
    //placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
    const vendors = queryData?.data ?? [];
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
                  getVendorsQuery(page + 1, limit, sort, sort_order, searchFilter)()
                );
              }
            }, [page, totalPages, limit, sort, sort_order, searchFilter, queryClient]);
    
    const { mutateAsync: createVendor } = useMutation({
            mutationFn: createVendorService,
            onMutate: async (newVendor: Partial<CreateUserData>) => {
                await queryClient.cancelQueries({ queryKey: ["GET_VENDORS", page, limit] })
                const previous = await queryClient.getQueryData(["GET_VENDORS", page, limit])
                queryClient.setQueryData(["GET_VENDORS", page, limit], (old?: any) => {
                    const newData = {
                        id: `temp-id-${Math.random()}`,
                        ...newVendor,
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
                ["GET_VENDORS", page, limit],
                context?.previous
              )
            },
        
            onSettled: () => {
              queryClient.invalidateQueries({ queryKey: ["GET_VENDORS", page, limit] })
              //queryClient.invalidateQueries({ queryKey: ["GET_COUNTRIES"] })
            },
        })

    const createVendorForm = useForm({
        defaultValues: {
            username: '',
            firstName: '',
            lastName: '',
            contactEmail: '',
            phoneNumber: '',
            password: '',
            confirmPassword: ''
        },
         onSubmit: async ({ value }) => {
               // Implement edit vendor logic here, similar to createVendor
               try {

               
                   await createVendor({ username: value.username, first_name: value.firstName, last_name: value.lastName, user_type: 'vendor', email: value.contactEmail, mobile: value.phoneNumber , password: value.password })
                   setOpenNewVendorModal(false)
                   //setValidationErrors({})
                   createVendorForm.reset()
               } catch (error) {
                   const map = parseValidationErrors(error)
                   if (Object.keys(map).length) setValidationErrors(map)
                   throw error
               }
           },
    })

    const handleEditVendor = (user: UserData) => {
        // Implement edit vendor logic here, similar to createVendor
        // You can create a separate form and modal for editing, or reuse the create form with some adjustments
        console.log("Edit vendor:", user)
       navigate({
                to: '/vendors/$vendorID/edit',
                params: { vendorID: user.id },
            }) // Example navigation to an edit page
      }
     

    return (
        <React.Fragment>
            <VendorHeader setOpenNewVendorModal={setOpenNewVendorModal} />
            <AddVendor open={openNewVendorModal} onOpenChange={setOpenNewVendorModal} form={createVendorForm}  validationErrors={validationErrors} />
            <VendorList
                            data={vendors}
                            isLoading={isLoading}
                            meta={meta as PaginatedMeta}
                            onPageChange={handlePageChange}
                            onEditVendor={handleEditVendor}  // ← change this
                            
                        />
        </React.Fragment>
    )
}
