import React from 'react';
import { getPropertiesQuery } from '@/properties/queries';
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {Plus} from 'lucide-react';
import PropertiesHeader from '@/properties/components/header';
import { PropertyList } from '@/properties/components/list';

export const Route = createFileRoute('/_authenticated/_admin/properties/')({
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
        title: "Manage Properties",
        meta: [
        {
            name: "description",
            content:
            "Admin interface to manage properties. Add, edit, or remove properties from the system.",
        },
        {
            property: 'og:title',
            content: 'Manage Properties',
        },
        ],
    }),
  component: RouteComponent,
})

function RouteComponent() {
   const { page, limit, sort, sort_order, filter } = Route.useSearch();
    const searchFilter = filter ? { filter } : undefined;
  const navigate = Route.useNavigate();
     const { data: queryData, isLoading } = useQuery({
    ...getPropertiesQuery(page, limit, sort, sort_order, searchFilter)(),
    //placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });


  console.log('isLoading', isLoading);
console.log('queryData', queryData);
  return (
     <React.Fragment>
      <PropertiesHeader
            title="Manage Properties"
            description="List of all properties in the system. You can add, edit, or remove properties as needed."
            addLabel="Add Property"
            setOpenAddModal={() => {}}
            addButton={true}
            addButtonType="link"
            addUrl="/properties/add"
            icon= <Plus className="w-4 h-4" />
            />

        <PropertyList 
          data={queryData?.data || []}
          isLoading={isLoading}
          meta={queryData?.meta || { total: 0, page: 1, size: 5 }}
          onPageChange={(newPage) => {
            console.log('newPage', newPage);
          }}
          onEditProperty={(property) => {
            navigate({
              to: '/properties/$propertyId',
              params: { propertyId: property.id },
            });
          }}
          openStatusChangeModal={(property) => {
            console.log('openStatusChangeModal', property);
            
          }}
        />
     </React.Fragment>
  )


}
