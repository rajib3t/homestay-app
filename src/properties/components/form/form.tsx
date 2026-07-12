import React, { useState, useRef, useEffect } from "react";

import type { ReactFormExtendedApi } from "@tanstack/react-form";
import type { PropertyDTO } from "@/types/property";
import type { SearchParams } from "@/types/common";
import { Card, CardContent } from "@/components/ui/card";
import { type AnyFieldApi } from "@tanstack/react-form";
import { FormFieldWrapper } from "@/components/form-field-wrapper";
import UploadImage from "@/components/upload-image";
import SearchableSelect from "@/components/ui/searchable-select";
import { getCitiesQuery, getCountriesQuery, getLocationsQuery } from "@/locations/queries";
import { fetchCities, fetchCountries, fetchLocations } from "@/services/location";
import { getVendorsQuery } from "@/vendors/queries";
import { fetchUsers } from "@/services/user";
import { env } from "@/lib/env";
import { useDebounce } from "@/hooks/use-debounce";

declare global {
  interface Window {
    google?: any;
  }
}

interface PropertyFormProps {
  form: ReactFormExtendedApi<PropertyDTO, any, any, any, any, any, any, any, any, any, any, any>;
  validationErrors?: Record<string, string[]>;
  vendorOptions?: { value: string | number; label: string }[];
  countryOptions?: { value: string | number; label: string }[];
  cityOptions?: { value: string | number; label: string }[];
  locationOptions?: { value: string | number; label: string }[];
}



const GOOGLE_MAPS_API_KEY = env.get("GOOGLE_MAPS_API_KEY") as string;

function useGooglePlacesScript() {
  const [loaded, setLoaded] = useState(() => !!window.google?.maps?.places);

  useEffect(() => {
    if (loaded) return;

    const existing = document.getElementById("google-maps-script");
    if (existing) {
      existing.addEventListener("load", () => setLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async&libraries=places,geocoding`;
    script.async = true;
    script.defer = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
  }, []);

  return loaded;
}

interface AddressAutocompleteProps {
  onBlur: () => void;
  onPlaceSelect: (lat: number, lng: number, address: string) => void;
  placeholder?: string;
  className?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  onBlur,
  onPlaceSelect,
  placeholder,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLInputElement>(null);
  const isGoogleLoaded = useGooglePlacesScript();
  const widgetMounted = useRef(false);
  const [webComponentReady, setWebComponentReady] = useState(false);

  useEffect(() => {
    if (!isGoogleLoaded || !containerRef.current || widgetMounted.current) return;

    const PlacesLib = (window.google?.maps?.places) as any;

    if (PlacesLib?.PlaceAutocompleteElement) {
      widgetMounted.current = true;

      const autocompleteEl = new PlacesLib.PlaceAutocompleteElement({
        types: ["geocode", "establishment"],
      }) as HTMLElement;

      containerRef.current.appendChild(autocompleteEl);

      autocompleteEl.addEventListener("gmp-placeselect", async (event: any) => {
        const place = event.place;

        try {
          // Try the new API first
          await place.fetchFields({
            fields: ["displayName", "formattedAddress", "location"],
          });

          const lat = place.location?.lat();
          const lng = place.location?.lng();
          const address = place.formattedAddress ?? place.displayName ?? "";

          if (lat !== undefined && lng !== undefined) {
            onPlaceSelect(lat, lng, address);
          }
        } catch {
          // Fallback: use Geocoder with placeId (works on demo keys)
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ placeId: place.id }, (results: any, status: any) => {
            if (status === "OK" && results?.[0]) {
              const loc = results[0].geometry.location;
              const address = results[0].formatted_address ?? place.displayName ?? "";
              onPlaceSelect(loc.lat(), loc.lng(), address);
            } else {
              console.warn("Geocoder failed:", status);
            }
          });
        }
      });

      autocompleteEl.addEventListener("blur", onBlur);
      setWebComponentReady(true);

    } else if (PlacesLib?.Autocomplete) {
      // Legacy fallback
      widgetMounted.current = true;

      if (!fallbackRef.current) return;
      const ac = new PlacesLib.Autocomplete(fallbackRef.current, {
        types: ["geocode", "establishment"],
      });

      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();
        const address = place.formatted_address ?? fallbackRef.current?.value ?? "";
        if (lat !== undefined && lng !== undefined) {
          onPlaceSelect(lat, lng, address);
        }
      });
    }
  }, [isGoogleLoaded]);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="w-full"
        style={{ display: webComponentReady ? "block" : "none" }}
      />
      <input
        ref={fallbackRef}
        type="text"
        onBlur={onBlur}
        className={className}
        placeholder={placeholder ?? "Search address..."}
        autoComplete="off"
        style={{ display: webComponentReady ? "none" : "block", width: "100%" }}
      />
    </div>
  );
};

const PropertyForm: React.FC<PropertyFormProps> = ({
  form,
  validationErrors,
  vendorOptions = [],
  countryOptions = [],
  cityOptions = [],
  locationOptions = [],
}) => {
  const [mainLogo, setMainLogo] = useState<string | null>(null);
  const [managedCountryOptions, setManagedCountryOptions] = useState(countryOptions);
  const [managedCityOptions, setManagedCityOptions] = useState(cityOptions);
  const [managedLocationOptions, setManagedLocationOptions] = useState(locationOptions);
  
  // Debounce country and city values to prevent rapid API calls
  const debouncedCountry = useDebounce(form.state.values.country, 500);
  const debouncedCity = useDebounce(form.state.values.city, 500);

  useEffect(() => {
    setManagedCountryOptions(countryOptions);
  }, [countryOptions]);

  useEffect(() => {
    setManagedCityOptions(cityOptions);
  }, [cityOptions]);

  useEffect(() => {
    setManagedLocationOptions(locationOptions);
  }, [locationOptions]);

  // Debounced effect for loading cities when country changes
  useEffect(() => {
    let abortController = new AbortController();
    
    const loadCitiesForCountryWithAbort = async (selectedCountry: string | number) => {
      if (!selectedCountry) {
        setManagedCityOptions([]);
        setManagedLocationOptions([]);
        return;
      }

      try {
        const filterObj = { filter: [{ search_field: 'country', search_value: selectedCountry }] } as SearchParams;
        const opts = getCitiesQuery(1, 100, undefined, undefined, filterObj)();
        const res = opts && typeof opts.queryFn === 'function' ? await (opts.queryFn as any)() : await fetchCities(1, 100, undefined, undefined, filterObj);
        if (!abortController.signal.aborted) {
          const items = res?.data ?? [];
          setManagedCityOptions(items.map((c: any) => ({ value: c.id, label: c.name })));
          setManagedLocationOptions([]);
        }
      } catch {
        if (!abortController.signal.aborted) {
          setManagedCityOptions([]);
          setManagedLocationOptions([]);
        }
      }
    };

    if (debouncedCountry) {
      loadCitiesForCountryWithAbort(debouncedCountry);
    } else {
      setManagedCityOptions([]);
      setManagedLocationOptions([]);
    }

    return () => {
      abortController.abort();
    };
  }, [debouncedCountry]);

  // Debounced effect for loading locations when city changes
  useEffect(() => {
    let abortController = new AbortController();
    
    const loadLocationsForCityWithAbort = async (selectedCity: string | number) => {
      if (!selectedCity) {
        setManagedLocationOptions([]);
        return;
      }

      try {
        const filterObj = { filter: [{ search_field: 'city', search_value: selectedCity }] } as SearchParams;
        const opts = getLocationsQuery(1, 100, undefined, undefined, filterObj)();
        const res = opts && typeof opts.queryFn === 'function' ? await (opts.queryFn as any)() : await fetchLocations(1, 100, undefined, undefined, filterObj);
        if (!abortController.signal.aborted) {
          const items = res?.data ?? [];
          setManagedLocationOptions(items.map((location: any) => ({ value: location.id, label: location.name })));
        }
      } catch {
        if (!abortController.signal.aborted) {
          setManagedLocationOptions([]);
        }
      }
    };

    if (debouncedCity) {
      loadLocationsForCityWithAbort(debouncedCity);
    } else {
      setManagedLocationOptions([]);
    }

    return () => {
      abortController.abort();
    };
  }, [debouncedCity]);

  return (
    <React.Fragment>
      <Card className="p-4">
        <CardContent className="p-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="flex gap-6">
              {/* LEFT: Image Upload */}
              <div className="w-[340px] shrink-0">
                <p className="text-sm font-medium mb-2">
                  Image <span className="text-red-500">*</span>
                </p>
                <form.Field
                  name="feature_image"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="">
                        <UploadImage
                          id={field.name}
                          name={field.name}
                          preview={mainLogo}
                          onPreviewChange={(preview) => setMainLogo(preview ?? "")}
                          onValueChange={(value: string) => field.handleChange(value)}
                          onBlur={field.handleBlur}
                          alt="Property image"
                          emptyText="Property image"
                          buttonText="Upload Image"
                          previewWrapperClassName="h-[200px] w-full rounded-lg overflow-hidden"
                          previewImageClassName="h-full w-full object-cover"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Supported Files: <strong>.png, .jpg, .jpeg.</strong>{" "}
                          Image will be resized into <strong>340x200px</strong>
                        </p>
                      </FormFieldWrapper>
                    );
                  }}
                />
              </div>

              {/* RIGHT: Form Fields Grid */}
              <div className="flex-1 grid grid-cols-3 gap-x-6 gap-y-4">

                {/* Row 1: Name, Star Rating */}
                <form.Field 
                  name="vendor"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="Vendor">
                        <SearchableSelect
                        options={vendorOptions}
                        value={field.state.value}
                        onChange={(v) => field.handleChange(v)}
                        placeholder="Select One"
                        onSearch={async (q: string) => {
                        try {
                            
                         let filterObj: SearchParams | undefined;
                            if (q) {
                            const parts = q.trim().split(' ');
                            if (parts.length > 1) {
                                filterObj = { filter: [ { search_field: 'first_name', search_value: parts[0] }, { search_field: 'last_name', search_value: parts[1] }, { search_field: 'user_type', search_value: 'vendor' } ] };
                            } else {
                                filterObj = { filter: [ { search_field: 'first_name', search_value: q }, { search_field: 'user_type', search_value: 'vendor' } ] };
                            }
                            } else {
                            filterObj = { filter: [ { search_field: 'user_type', search_value: 'vendor' } ] };
                            }
                            const opts = getVendorsQuery(1, 5, undefined, undefined, filterObj)();
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const res = opts && typeof opts.queryFn === 'function' ? await (opts.queryFn as any)() : await fetchUsers(1, 5, undefined, undefined, filterObj);
                            const items = res?.data ?? [];
                            return items.map((c: any) => ({ value: c.id, label: c.first_name + ' ' + c.last_name }));
                        } catch (err) {
                            return [];
                        }
                        }}
                    />
                      </FormFieldWrapper>
                    );
                  }}
                />
                <form.Field
                  name="name"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="Name">
                        <input
                          id={field.name}
                          name={field.name}
                          value={field.state.value ?? ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Property name"
                        />
                      </FormFieldWrapper>
                    );
                  }}
                />

                <form.Field
                  name="star_rating"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="Star Rating">
                        <select
                          id={field.name}
                          name={field.name}
                          value={field.state.value ?? ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Select rating</option>
                          <option value="1">1 Star</option>
                          <option value="2">2 Star</option>
                          <option value="3">3 Star</option>
                          <option value="4">4 Star</option>
                          <option value="5">5 Star</option>
                        </select>
                      </FormFieldWrapper>
                    );
                  }}
                />

                {/* Empty third column */}
                <div />

                {/* Row 2: Address — full width */}
                <form.Field
                  name="address"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <div className="col-span-3">
                        <FormFieldWrapper field={field} apiErrors={apiErrors} label="Address">
                          <AddressAutocomplete
                            onBlur={field.handleBlur}
                            onPlaceSelect={(lat, lng, address) => {
                              field.handleChange(address);
                              form.setFieldValue("latitude", lat);
                              form.setFieldValue("longitude", lng);
                            }}
                            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search and select address..."
                          />
                        </FormFieldWrapper>
                      </div>
                    );
                  }}
                />

                {/* Row 3: Latitude, Longitude, Country */}
                <form.Field
                  name="latitude"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="Latitude">
                        <input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="0.000001"
                          value={field.state.value ?? ""}
                          onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                          onBlur={field.handleBlur}
                          className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.000000"
                          readOnly
                        />
                      </FormFieldWrapper>
                    );
                  }}
                />

                <form.Field
                  name="longitude"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="Longitude">
                        <input
                          id={field.name}
                          name={field.name}
                          type="number"
                          step="0.000001"
                          value={field.state.value ?? ""}
                          onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                          onBlur={field.handleBlur}
                          className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.000000"
                          readOnly
                        />
                      </FormFieldWrapper>
                    );
                  }}
                />

                <form.Field
                  name="country"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="Country">
                        <SearchableSelect
                          options={managedCountryOptions}
                          value={field.state.value ?? ""}
                          onChange={(v) => {
                            field.handleChange(v);
                            form.setFieldValue("city", "");
                            form.setFieldValue("location", "");
                          }}
                          placeholder="Select One"
                          className="w-full"
                          onSearch={async (q: string) => {
                            try {
                              let filterObj: SearchParams | undefined;
                              if (q) {
                                filterObj = { filter: [{ search_field: 'name', search_value: q }, { search_field: 'status', search_value: true }] };
                              } else {
                                filterObj = { filter: [{ search_field: 'status', search_value: true }] };
                              }

                              const opts = getCountriesQuery(1, 100, undefined, undefined, filterObj)();
                              const res = opts && typeof opts.queryFn === 'function' ? await (opts.queryFn as any)() : await fetchCountries(1, 100, undefined, undefined, filterObj);
                              const items = res?.data ?? [];
                              setManagedCountryOptions(items.map((c: any) => ({ value: c.id, label: c.name })));
                              return items.map((c: any) => ({ value: c.id, label: c.name }));
                            } catch {
                              setManagedCountryOptions([]);
                              return [];
                            }
                          }}
                        />
                      </FormFieldWrapper>
                    );
                  }}
                />

                {/* Row 4: City, Location, Tax Name */}
                <form.Field
                  name="city"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="City">
                        <SearchableSelect
                          options={managedCityOptions}
                          value={field.state.value ?? ""}
                          onChange={(v) => {
                            field.handleChange(v);
                            form.setFieldValue("location", "");
                          }}
                          placeholder="Select One"
                          className="w-full"
                          onSearch={async (q: string) => {
                            try {
                              const countryFilterValue = form.state.values.country;
                              if (!countryFilterValue) {
                                return [];
                              }

                              let filterObj: SearchParams | undefined;
                              if (q) {
                                filterObj = { filter: [{ search_field: 'name', search_value: q }, { search_field: 'country', search_value: countryFilterValue }] };
                              } else {
                                filterObj = { filter: [{ search_field: 'country', search_value: countryFilterValue }] };
                              }

                              const opts = getCitiesQuery(1, 100, undefined, undefined, filterObj)();
                              const res = opts && typeof opts.queryFn === 'function' ? await (opts.queryFn as any)() : await fetchCities(1, 100, undefined, undefined, filterObj);
                              const items = res?.data ?? [];
                              setManagedCityOptions(items.map((c: any) => ({ value: c.id, label: c.name })));
                              return items.map((c: any) => ({ value: c.id, label: c.name }));
                            } catch {
                              setManagedCityOptions([]);
                              return [];
                            }
                          }}
                        />
                      </FormFieldWrapper>
                    );
                  }}
                />

                <form.Field
                  name="location"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="Location">
                        <SearchableSelect
                          options={managedLocationOptions}
                          value={field.state.value ?? ""}
                          onChange={(v) => {
                            field.handleChange(v);
                          }}
                          placeholder="Select One"
                          className="w-full"
                          onSearch={async (q: string) => {
                            try {
                              const cityFilterValue = form.state.values.city;
                              if (!cityFilterValue) {
                                return [];
                              }

                              let filterObj: SearchParams | undefined;
                              if (q) {
                                filterObj = { filter: [{ search_field: 'name', search_value: q }, { search_field: 'city', search_value: cityFilterValue }] };
                              } else {
                                filterObj = { filter: [{ search_field: 'city', search_value: cityFilterValue }] };
                              }

                              const opts = getLocationsQuery(1, 100, undefined, undefined, filterObj)();
                              const res = opts && typeof opts.queryFn === 'function' ? await (opts.queryFn as any)() : await fetchLocations(1, 100, undefined, undefined, filterObj);
                              const items = res?.data ?? [];
                              setManagedLocationOptions(items.map((location: any) => ({ value: location.id, label: location.name })));
                              return items.map((location: any) => ({ value: location.id, label: location.name }));
                            } catch {
                              setManagedLocationOptions([]);
                              return [];
                            }
                          }}
                        />
                      </FormFieldWrapper>
                    );
                  }}
                />

                <form.Field
                  name="tax_name"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="Tax Name">
                        <input
                          id={field.name}
                          name={field.name}
                          value={field.state.value ?? ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tax name"
                        />
                      </FormFieldWrapper>
                    );
                  }}
                />

                {/* Row 5: Tax Percentage, Check In Time, Checkout Time */}
                <form.Field
                  name="tax_percentage"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="Tax Percentage">
                        <div className="relative">
                          <input
                            id={field.name}
                            name={field.name}
                            type="number"
                            step="0.01"
                            value={field.state.value ?? ""}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            className="w-full border rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            %
                          </span>
                        </div>
                      </FormFieldWrapper>
                    );
                  }}
                />

                <form.Field
                  name="check_in_time"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="Check In Time">
                        <input
                          id={field.name}
                          name={field.name}
                          type="time"
                          value={field.state.value ?? ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </FormFieldWrapper>
                    );
                  }}
                />

                <form.Field
                  name="checkout_time"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="Checkout Time">
                        <input
                          id={field.name}
                          name={field.name}
                          type="time"
                          value={field.state.value ?? ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </FormFieldWrapper>
                    );
                  }}
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

export default PropertyForm;