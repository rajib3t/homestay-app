import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import PropertiesHeader from '@/properties/components/header'
import { List } from 'lucide-react'

import { useForm } from '@tanstack/react-form'
import PropertyForm from '@/properties/components/form/form'
import type { PropertyDTO } from '@/types/property'
import { getVendorsQuery } from '@/vendors/queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { UserData } from '@/types/user';
import { getCountriesQuery } from '@/locations/queries'
import { createProperty, normalizePropertyPayload } from '@/services/property'
import { fetchCountries } from '@/services/location'
import type { SearchParams } from '@/types/common'
import { getAmenitiesQuery, getFacilitiesQuery, getBedTypesQuery } from '@/attributes/queries'
import type { Amenity, BedType, Facility } from '@/types/attribute/index.'
import { queryClient } from '@/lib/query-client'
export const Route = createFileRoute('/_authenticated/_admin/properties/add')({
    head: () => ({
        title: "Add Property",
        meta: [
        {
            name: "description",
            content:
            "Admin interface to manage properties. Add, edit, or remove properties from the system.",
        },
        {
            property: 'og:title',
            content: 'Add Property',
        },
        ],
    }),
  component: RouteComponent,
})
const propertyFormInitialValues = () : PropertyDTO => ({
    vendor: '',
    name: '',
    description: '',
    country: '',
    city: '',
    location: '',
    address: '',
    latitude: 0,
    longitude: 0,
    is_published: false,
    feature_image: '',
    cover_image: '',
    gallery_images: [],
    food_options: [],
    amenities: [],
    facilities: [],
    rooms: [],
    trade_license: '',
    trade_license_number: '',
    listing_price: 0,
    sale_price: 0,
    is_featured: false,
    star_rating: '',
    tax_name: '',
    tax_percentage: 0,
    check_in_time: '',
    checkout_time: '',
})
function RouteComponent() {
    const [vendorOptions, setVendorOptions] = React.useState<{ value: string | number; label: string }[]>([])
    const [countryOptions, setCountryOptions] = React.useState<{ value: string | number; label: string }[]>([])
    const[amenities, setAmenities] = React.useState<{ value: string | number; label: string }[]>([])
    const[facilities, setFacilities] = React.useState<{ value: string | number; label: string }[]>([])
    const[roomTypes, setRoomTypes] = React.useState<{ value: string | number; label: string }[]>([])
    const[foodOptions, setFoodOptions] = React.useState<{ value: string | number; label: string }[]>([])

    const propertyForm = useForm({
        defaultValues: propertyFormInitialValues(),
        onSubmit: async ({ value }) => {
            createPropertyMutation.mutate(normalizePropertyPayload(value));
        },
    })
    
    const defaultFilter = [
        {
            search_field: "user_type",
            search_value: "vendor",
        },
    ];

    const page = 1;
    const limit = 5;
    const sort = "created_at";
    const sort_order = "desc";
    const { data: queryData } = useQuery({
        ...getVendorsQuery(page, limit, sort, sort_order, { filter: defaultFilter })(),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
    const amenityFilter = [
        {
            search_field: 'status',
            search_value: true,
        }
    ]
    const {data: AmenitiesData} = useQuery({
        ...getAmenitiesQuery(1, 100, '', '', { filter: amenityFilter })(),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
     const facilityFilter = [
        {
            search_field: 'status',
            search_value: true,
        }
    ]
    
    const {data: FacilitiesData} = useQuery({
        ...getFacilitiesQuery(1, 100, '', '', { filter: facilityFilter })(),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
     const roomTypeFilter = [
        {
            search_field: 'status',
            search_value: true,
        }
    ]

    const {data: RoomTypesData} = useQuery({
        ...getBedTypesQuery(1, 100, '', '', { filter: roomTypeFilter })(),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });

    const createPropertyMutation = useMutation({
        mutationFn: (data: PropertyDTO) => createProperty(data),
        onSuccess: async () => {
            // Reset form after successful submission
            propertyForm.reset();
            await queryClient.resetQueries({ queryKey: ["GET_PROPERTIES", 1, 5] })
            // Handle success - e.g., redirect to properties list
            console.log('Property created successfully');
        },
        onError: (error: any) => {
            // Handle error
            console.error('Error creating property:', error);
        },
    });

    React.useEffect(() => {
        if (queryData?.data) {
            setVendorOptions(queryData.data.map((vendor: UserData) => ({ value: vendor.id, label: vendor.first_name + ' ' + vendor.last_name })));
        }
        if (AmenitiesData?.data) {
            setAmenities(AmenitiesData.data.map((amenity: Amenity) => ({ value: amenity.id, label: amenity.name })));
        }
        if (FacilitiesData?.data) {
            setFacilities(FacilitiesData.data.map((facility: Facility) => ({ value: facility.id, label: facility.name })));
        }
        if (RoomTypesData?.data) {
            setRoomTypes(RoomTypesData.data.map((roomType: BedType) => ({ value: roomType.id, label: roomType.name })));
        }
        // Static food options
        setFoodOptions([
            { value: 'breakfast', label: 'Breakfast' },
            { value: 'lunch', label: 'Lunch' },
            { value: 'evening_snacks', label: 'Evening Snacks' },
            { value: 'dinner', label: 'Dinner' },
        ]);
    }, [queryData,AmenitiesData,FacilitiesData,RoomTypesData]);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const filterObj = { filter: [{ search_field: 'status', search_value: true }] } as SearchParams;
                const opts = getCountriesQuery(1, 100, '', '', filterObj)();
                const res = opts && typeof opts.queryFn === 'function' ? await (opts.queryFn as any)() : await fetchCountries(1, 100, '', '', filterObj);
                if (!mounted) return;
                const items = res?.data ?? [];
                setCountryOptions(items.map((c: any) => ({ value: c.id, label: c.name })));
            } catch {
                // ignore
            }
        })();
        return () => { mounted = false; };
    }, []);

    return (
     <React.Fragment>
      <PropertiesHeader
            title="Add Property"
            description="Add a new property to the system."
            addLabel="List Property"
            setOpenAddModal={() => {}}
            addButton={true}
            addButtonType="link"
            addUrl="/properties"
            icon= {<List className="w-4 h-4" />}
            />
            

        <PropertyForm
            form={propertyForm}
            vendorOptions={vendorOptions}
            countryOptions={countryOptions}
            amenities={amenities}
            facilities={facilities}
            roomTypes={roomTypes}
            foodOptions={foodOptions}
            isLoading={createPropertyMutation.isPending}
            error={createPropertyMutation.error ? (createPropertyMutation.error as any)?.message || 'Failed to create property' : null}
            buttonText="Create Property"
            buttonTextLoading="Creating Property..."
        />
     </React.Fragment>
  )
}
 
