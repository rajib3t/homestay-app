import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import PropertiesHeader from '@/properties/components/header'
import { List } from 'lucide-react'

import { useForm } from '@tanstack/react-form'
import PropertyForm from '@/properties/components/form/form'
import type { PropertyDTO } from '@/types/property'
import { getVendorsQuery } from '@/vendors/queries';
import { useQuery } from '@tanstack/react-query';
import type { UserData } from '@/types/user';
import { getCitiesQuery, getCountriesQuery, getLocationsQuery } from '@/locations/queries'
import { fetchCities, fetchCountries, fetchLocations } from '@/services/location'
import type { SearchParams } from '@/types/common'
import { useDebounce } from '@/hooks/use-debounce'
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
})
function RouteComponent() {
    const [vendorOptions, setVendorOptions] = React.useState<{ value: string | number; label: string }[]>([])
    const [countryOptions, setCountryOptions] = React.useState<{ value: string | number; label: string }[]>([])
    const [cityOptions, setCityOptions] = React.useState<{ value: string | number; label: string }[]>([])
    const [locationOptions, setLocationOptions] = React.useState<{ value: string | number; label: string }[]>([])
    const propertyForm = useForm({
        defaultValues: propertyFormInitialValues(),
    })
    
    // Debounce country and city values to prevent rapid API calls
    const debouncedCountry = useDebounce(propertyForm.state.values.country, 500)
    const debouncedCity = useDebounce(propertyForm.state.values.city, 500)
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

    React.useEffect(() => {
        if (queryData?.data) {
            setVendorOptions(queryData.data.map((vendor: UserData) => ({ value: vendor.id, label: vendor.first_name + ' ' + vendor.last_name })));
        }
    }, [queryData]);

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

    React.useEffect(() => {
        let abortController = new AbortController();
        const selectedCountry = debouncedCountry;

        if (!selectedCountry) {
            setCityOptions([]);
            setLocationOptions([]);
            return () => { abortController.abort(); };
        }

        (async () => {
            try {
                const filterObj = { filter: [{ search_field: 'country', search_value: selectedCountry }] } as SearchParams;
                const opts = getCitiesQuery(1, 100, '', '', filterObj)();
                const res = opts && typeof opts.queryFn === 'function' ? await (opts.queryFn as any)() : await fetchCities(1, 100, '', '', filterObj);
                if (!abortController.signal.aborted) {
                    const items = res?.data ?? [];
                    setCityOptions(items.map((c: any) => ({ value: c.id, label: c.name })));
                }
            } catch {
                if (!abortController.signal.aborted) {
                    setCityOptions([]);
                }
            }
        })();

        return () => { abortController.abort(); };
    }, [debouncedCountry]);

    React.useEffect(() => {
        let abortController = new AbortController();
        const selectedCity = debouncedCity;

        if (!selectedCity) {
            setLocationOptions([]);
            return () => { abortController.abort(); };
        }

        (async () => {
            try {
                const filterObj = { filter: [{ search_field: 'city', search_value: selectedCity }] } as SearchParams;
                const opts = getLocationsQuery(1, 100, '', '', filterObj)();
                const res = opts && typeof opts.queryFn === 'function' ? await (opts.queryFn as any)() : await fetchLocations(1, 100, '', '', filterObj);
                if (!abortController.signal.aborted) {
                    const items = res?.data ?? [];
                    setLocationOptions(items.map((location: any) => ({ value: location.id, label: location.name })));
                }
            } catch {
                if (!abortController.signal.aborted) {
                    setLocationOptions([]);
                }
            }
        })();

        return () => { abortController.abort(); };
    }, [debouncedCity]);

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
            icon= <List className="w-4 h-4" />
            />
            

        <PropertyForm
            form={propertyForm}
            vendorOptions={vendorOptions}
            countryOptions={countryOptions}
            cityOptions={cityOptions}
            locationOptions={locationOptions}
        />
     </React.Fragment>
  )
}
