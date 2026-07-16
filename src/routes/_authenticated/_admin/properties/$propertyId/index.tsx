import React from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

import PropertiesHeader from '@/properties/components/header'
import PropertyForm from '@/properties/components/form/form'
import { getPropertyByIdQuery } from '@/properties/queries'
import type { PropertyDTO, PropertyResponseDTO } from '@/types/property'
import { getVendorsQuery } from '@/vendors/queries'
import { getAmenitiesQuery, getBedTypesQuery, getFacilitiesQuery } from '@/attributes/queries'
import type { Amenity, BedType, Facility } from '@/types/attribute/index.'
import type { UserData } from '@/types/user'
import { getCountriesQuery } from '@/locations/queries'
import { fetchCountries } from '@/services/location'
import { parseValidationErrors } from '@/lib/utils'
import { normalizePropertyPayload, updateProperty } from '@/services/property'
import type { SearchParams } from '@/types/common'
import { queryClient } from '@/lib/query-client'

export const Route = createFileRoute('/_authenticated/_admin/properties/$propertyId/')({
  loader: async ({ params, context }) => {
    const queryClient = context.queryClient
    return queryClient.ensureQueryData(getPropertyByIdQuery(params.propertyId)())
  },
  head: () => ({
    title: 'Edit Property',
    meta: [
      {
        name: 'description',
        content: 'Edit an existing property in the system.',
      },
      {
        property: 'og:title',
        content: 'Edit Property',
      },
    ],
  }),
  component: RouteComponent,
})

const getPropertyInitialValues = (property?: Partial<PropertyResponseDTO>): PropertyDTO => ({
  vendor: property?.vendor ?? '',
  name: property?.name ?? '',
  description: property?.description ?? '',
  country: property?.country ?? '',
  city: property?.city ?? '',
  location: property?.location ?? '',
  address: property?.address ?? '',
  latitude: property?.latitude ?? 0,
  longitude: property?.longitude ?? 0,
  is_published: property?.is_published ?? false,
  feature_image: property?.feature_image ?? '',
  cover_image: property?.cover_image ?? '',
  gallery_images: property?.gallery_images ?? [],
  food_options: property?.food_options ?? [],
  amenities: property?.amenities ?? [],
  facilities: property?.facilities ?? [],
  rooms: property?.rooms ?? [],
  trade_license: property?.trade_license ?? '',
  trade_license_number: property?.trade_license_number ?? '',
  listing_price: property?.listing_price ?? 0,
  sale_price: property?.sale_price ?? 0,
  is_featured: property?.is_featured ?? false,
  star_rating: property?.star_rating ?? '',
  tax_name: property?.tax_name ?? '',
  tax_percentage: property?.tax_percentage ?? 0,
  check_in_time: property?.check_in_time ?? '',
  checkout_time: property?.checkout_time ?? '',
})

function RouteComponent() {
  const propertyResponse = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const propertyId = Route.useParams().propertyId

  const [vendorOptions, setVendorOptions] = React.useState<{ value: string | number; label: string }[]>([])
  const [countryOptions, setCountryOptions] = React.useState<{ value: string | number; label: string }[]>([])
  const [amenities, setAmenities] = React.useState<{ value: string | number; label: string }[]>([])
  const [facilities, setFacilities] = React.useState<{ value: string | number; label: string }[]>([])
  const [roomTypes, setRoomTypes] = React.useState<{ value: string | number; label: string }[]>([])
  const [foodOptions, setFoodOptions] = React.useState<{ value: string | number; label: string }[]>([])
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string[]>>({})

  const propertyForm = useForm({
    defaultValues: getPropertyInitialValues(propertyResponse.data),
    onSubmit: async ({ value }) => {
      try {
        setValidationErrors({})
        await updatePropertyMutation.mutateAsync(normalizePropertyPayload(value))
        toast.success('Property updated successfully')
        navigate({
          to: '/properties',
          search: () => ({
            page: 1,
            limit: 5,
            sort: undefined,
            sort_order: undefined,
            filter: undefined,
          }),
        })
      } catch (error) {
        const map = parseValidationErrors(error)
        if (Object.keys(map).length) setValidationErrors(map)
        toast.error('Failed to update property')
        throw error
      }
    },
  })

  const defaultFilter = [
    {
      search_field: 'user_type',
      search_value: 'vendor',
    },
  ]

  const amenityFilter = [{ search_field: 'status', search_value: true }]
  const facilityFilter = [{ search_field: 'status', search_value: true }]
  const roomTypeFilter = [{ search_field: 'status', search_value: true }]

  const { data: vendorData } = useQuery({
    ...getVendorsQuery(1, 5, 'created_at', 'desc', { filter: defaultFilter })(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
  const { data: amenitiesData } = useQuery({
    ...getAmenitiesQuery(1, 100, '', '', { filter: amenityFilter })(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
  const { data: facilitiesData } = useQuery({
    ...getFacilitiesQuery(1, 100, '', '', { filter: facilityFilter })(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
  const { data: roomTypesData } = useQuery({
    ...getBedTypesQuery(1, 100, '', '', { filter: roomTypeFilter })(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const updatePropertyMutation = useMutation({
    mutationFn: (data: PropertyDTO) => updateProperty(propertyId, data),
    onMutate: async (updatedProperty: PropertyDTO) => {
      if (!updatedProperty) return
          await queryClient.resetQueries({ queryKey: ["GET_PROPERTIES", 1, 5] })
           await queryClient.resetQueries({ queryKey: ["GET_PROPERTY_BY_ID", propertyId] })
    },
  })

  React.useEffect(() => {
    if (vendorData?.data) {
      setVendorOptions(
        vendorData.data.map((vendor: UserData) => ({
          value: vendor.id,
          label: `${vendor.first_name} ${vendor.last_name}`,
        })),
      )
    }
    if (amenitiesData?.data) {
      setAmenities(amenitiesData.data.map((amenity: Amenity) => ({ value: amenity.id, label: amenity.name })))
    }
    if (facilitiesData?.data) {
      setFacilities(facilitiesData.data.map((facility: Facility) => ({ value: facility.id, label: facility.name })))
    }
    if (roomTypesData?.data) {
      setRoomTypes(roomTypesData.data.map((roomType: BedType) => ({ value: roomType.id, label: roomType.name })))
    }
    setFoodOptions([
      { value: 'breakfast', label: 'Breakfast' },
      { value: 'lunch', label: 'Lunch' },
      { value: 'evening_snacks', label: 'Evening Snacks' },
      { value: 'dinner', label: 'Dinner' },
    ])
  }, [vendorData, amenitiesData, facilitiesData, roomTypesData])

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const filterObj = { filter: [{ search_field: 'status', search_value: true }] } as SearchParams
        const opts = getCountriesQuery(1, 100, '', '', filterObj)()
        const res =
          opts && typeof opts.queryFn === 'function'
            ? await (opts.queryFn as any)()
            : await fetchCountries(1, 100, '', '', filterObj)

        if (!mounted) return
        const items = res?.data ?? []
        setCountryOptions(items.map((c: any) => ({ value: c.id, label: c.name })))
      } catch {
        // ignore country loading errors and keep the form usable
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <React.Fragment>
      <PropertiesHeader
        title="Edit Property"
        description="Update the property details below."
        addLabel="Back to Properties"
        setOpenAddModal={() => {}}
        addButton={true}
        addButtonType="link"
        addUrl="/properties"
        icon={<ArrowLeft className="h-4 w-4" />}
      />

      <PropertyForm
        form={propertyForm}
        vendorOptions={vendorOptions}
        countryOptions={countryOptions}
        amenities={amenities}
        facilities={facilities}
        roomTypes={roomTypes}
        foodOptions={foodOptions}
        isLoading={updatePropertyMutation.isPending}
        validationErrors={validationErrors}
        error={updatePropertyMutation.error ? 'Failed to update property' : null}
        buttonText="Update Property"
        buttonTextLoading="Updating Property..."
      />
    </React.Fragment>
  )
}
