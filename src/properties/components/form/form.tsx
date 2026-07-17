import React, { useState, useRef, useEffect, useCallback } from "react";

import type { ReactFormExtendedApi } from "@tanstack/react-form";
import type { PropertyDTO } from "@/types/property";
import type { SearchParams } from "@/types/common";
import { Card, CardContent } from "@/components/ui/card";
import { type AnyFieldApi, useStore } from "@tanstack/react-form";
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
  amenities?: { value: string | number; label: string }[];
  facilities?: { value: string | number; label: string }[];
  roomTypes?: { value: string | number; label: string }[];
  foodOptions?: { value: string | number; label: string }[];
  isLoading?: boolean;
  error?: string | null;
  buttonText?: string;
  buttonTextLoading?: string;
}

const GOOGLE_MAPS_API_KEY = env.get("GOOGLE_MAPS_API_KEY") as string;
const API_BASE_URL = env.getApiUrl();

/* -----------------------------------------------------------------------
 * Shared style tokens
 * Centralizing these keeps every field visually consistent and means a
 * single edit (e.g. changing the focus ring color) updates the whole form.
 * --------------------------------------------------------------------- */
const styles = {
  input:
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 " +
    "placeholder:text-gray-400 transition-shadow focus:outline-none focus:ring-2 " +
    "focus:ring-blue-500 focus:border-blue-500",
  inputReadOnly:
    "w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 " +
    "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
  select:
    "w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm " +
    "text-gray-900 transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
  sectionCard: "rounded-xl border border-gray-200 bg-gray-50 p-6",
  sectionTitle: "mb-4 border-b border-gray-200 pb-2 text-lg font-medium text-gray-900",
  checkboxLabel:
    "flex cursor-pointer select-none items-center space-x-3 rounded-lg border border-transparent " +
    "p-2 transition-colors hover:border-gray-200 hover:bg-gray-100",
  checkbox: "h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500",
  fieldGrid: "grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3",
} as const;

/* -----------------------------------------------------------------------
 * Small structural helper: a titled section used for Amenities, Facilities
 * and Rooms, so the three blocks share one consistent frame.
 * --------------------------------------------------------------------- */
const FormSection: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({
  title,
  children,
  action,
}) => (
  <section className="col-span-full mt-8">
    <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-2">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

const resolveImagePreview = (value?: string | null) => {
  if (!value) return null;
  if (/^(blob:|data:|https?:\/\/)/i.test(value)) return value;

  const normalizedBase = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${normalizedBase}${normalizedPath}`;
};

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

    const PlacesLib = window.google?.maps?.places as any;

    if (PlacesLib?.PlaceAutocompleteElement) {
      widgetMounted.current = true;

      const autocompleteEl = new PlacesLib.PlaceAutocompleteElement({
        types: ["geocode", "establishment"],
      }) as HTMLElement;

      containerRef.current.appendChild(autocompleteEl);

      autocompleteEl.addEventListener("gmp-select", async (event: any) => {
        const placePrediction = event.placePrediction;
        const place = placePrediction?.toPlace ? placePrediction.toPlace() : event.place;

        if (!place) return;

        try {
          await place.fetchFields({
            fields: ["displayName", "formattedAddress", "location"],
          });

          const lat = place.location?.lat();
          const lng = place.location?.lng();
          const address = place.formattedAddress ?? place.displayName ?? "";

          if (lat !== undefined && lng !== undefined) {
            onPlaceSelect(lat, lng, address);
          }
        } catch (err) {
          console.error("[places] fetchFields error:", err);
        }
      });

      autocompleteEl.addEventListener("blur", onBlur);
      setWebComponentReady(true);
    } else if (PlacesLib?.Autocomplete) {
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
      <div ref={containerRef} className="w-full" style={{ display: webComponentReady ? "block" : "none" }} />
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
  amenities = [],
  facilities = [],
  roomTypes = [],
  foodOptions = [],
  isLoading = false,
  error = null,
  buttonText = "Submit",
  buttonTextLoading = "Submitting...",
}) => {
  const [mainLogo, setMainLogo] = useState<string | null>(null);
  const [coverLogo, setCoverLogo] = useState<string | null>(null);
  const [tradeLicensePreview, setTradeLicensePreview] = useState<string | null>(null);
  const [galleryImagesState, setGalleryImagesState] = useState<Record<number, string>>({});
  const [managedCountryOptions, setManagedCountryOptions] = useState(countryOptions);
  const [managedCityOptions, setManagedCityOptions] = useState<{ value: string | number; label: string }[]>([]);
  const [managedLocationOptions, setManagedLocationOptions] = useState<{ value: string | number; label: string }[]>(
    [],
  );

  const currentCountry = useStore(form.store, (state) => state.values.country);
  const currentCity = useStore(form.store, (state) => state.values.city);

  // Debounce country and city values to prevent rapid API calls
  const debouncedCountry = useDebounce(currentCountry, 500);
  const debouncedCity = useDebounce(currentCity, 500);

  useEffect(() => {
    setManagedCountryOptions(countryOptions);
  }, [countryOptions]);

  useEffect(() => {
    setMainLogo(resolveImagePreview(form.state.values.feature_image));
  }, [form.state.values.feature_image]);

  useEffect(() => {
    setCoverLogo(resolveImagePreview(form.state.values.cover_image));
  }, [form.state.values.cover_image]);

  useEffect(() => {
    setTradeLicensePreview(resolveImagePreview(form.state.values.trade_license));
  }, [form.state.values.trade_license]);

  useEffect(() => {
    const nextGalleryState: Record<number, string> = {};
    (form.state.values.gallery_images || []).forEach((image, index) => {
      const resolved = resolveImagePreview(image);
      if (resolved) {
        nextGalleryState[index] = resolved;
      }
    });
    setGalleryImagesState(nextGalleryState);
  }, [form.state.values.gallery_images]);

  // Debounced effect for loading cities when country changes
  useEffect(() => {
    const abortController = new AbortController();

    const loadCitiesForCountryWithAbort = async (selectedCountry: string | number) => {
      if (!selectedCountry) {
        setManagedCityOptions([]);
        setManagedLocationOptions([]);
        return;
      }

      try {
        const filterObj = { filter: [{ search_field: "country", search_value: selectedCountry }] } as SearchParams;
        const opts = getCitiesQuery(1, 100, undefined, undefined, filterObj)();
        const res =
          opts && typeof opts.queryFn === "function"
            ? await (opts.queryFn as any)()
            : await fetchCities(1, 100, undefined, undefined, filterObj);
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
    const abortController = new AbortController();

    const loadLocationsForCityWithAbort = async (selectedCity: string | number) => {
      if (!selectedCity) {
        setManagedLocationOptions([]);
        return;
      }

      try {
        const filterObj = { filter: [{ search_field: "city", search_value: selectedCity }] } as SearchParams;
        const opts = getLocationsQuery(1, 100, undefined, undefined, filterObj)();
        const res =
          opts && typeof opts.queryFn === "function"
            ? await (opts.queryFn as any)()
            : await fetchLocations(1, 100, undefined, undefined, filterObj);
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

  // --- Memoized search handlers ---
  // These are passed as `onSearch` props to SearchableSelect. Defining them
  // inline in JSX creates a new function reference on every render, which
  // can trigger effects inside SearchableSelect that depend on `onSearch`
  // identity, causing a render -> fetch -> setState -> render loop.
  // useCallback keeps the reference stable across renders.

  const handleVendorSearch = useCallback(async (q: string) => {
    try {
      let filterObj: SearchParams | undefined;
      if (q) {
        const parts = q.trim().split(" ");
        if (parts.length > 1) {
          filterObj = {
            filter: [
              { search_field: "first_name", search_value: parts[0] },
              { search_field: "last_name", search_value: parts[1] },
              { search_field: "user_type", search_value: "vendor" },
            ],
          };
        } else {
          filterObj = {
            filter: [
              { search_field: "first_name", search_value: q },
              { search_field: "user_type", search_value: "vendor" },
            ],
          };
        }
      } else {
        filterObj = { filter: [{ search_field: "user_type", search_value: "vendor" }] };
      }
      const opts = getVendorsQuery(1, 5, undefined, undefined, filterObj)();
      const res =
        opts && typeof opts.queryFn === "function"
          ? await (opts.queryFn as any)()
          : await fetchUsers(1, 5, undefined, undefined, filterObj);
      const items = res?.data ?? [];
      return items.map((c: any) => ({ value: c.id, label: c.first_name + " " + c.last_name }));
    } catch {
      return [];
    }
  }, []);

  const handleCountrySearch = useCallback(async (q: string) => {
    try {
      let filterObj: SearchParams | undefined;
      if (q) {
        filterObj = {
          filter: [
            { search_field: "name", search_value: q },
            { search_field: "status", search_value: true },
          ],
        };
      } else {
        filterObj = { filter: [{ search_field: "status", search_value: true }] };
      }

      const opts = getCountriesQuery(1, 100, undefined, undefined, filterObj)();
      const res =
        opts && typeof opts.queryFn === "function"
          ? await (opts.queryFn as any)()
          : await fetchCountries(1, 100, undefined, undefined, filterObj);
      const items = res?.data ?? [];
      setManagedCountryOptions(items.map((c: any) => ({ value: c.id, label: c.name })));
      return items.map((c: any) => ({ value: c.id, label: c.name }));
    } catch {
      setManagedCountryOptions([]);
      return [];
    }
  }, []);

  const handleCitySearch = useCallback(
    async (q: string) => {
      const countryFilterValue = form.state.values.country;
      if (!countryFilterValue) {
        return [];
      }

      // Options for the currently selected country were already loaded by the
      // debounced country effect above; avoid re-fetching identical data when
      // the dropdown opens with an empty query.
      if (!q) {
        return managedCityOptions;
      }

      try {
        const filterObj: SearchParams = {
          filter: [
            { search_field: "name", search_value: q },
            { search_field: "country", search_value: countryFilterValue },
          ],
        };

        const opts = getCitiesQuery(1, 100, undefined, undefined, filterObj)();
        const res =
          opts && typeof opts.queryFn === "function"
            ? await (opts.queryFn as any)()
            : await fetchCities(1, 100, undefined, undefined, filterObj);
        const items = res?.data ?? [];
        setManagedCityOptions(items.map((c: any) => ({ value: c.id, label: c.name })));
        return items.map((c: any) => ({ value: c.id, label: c.name }));
      } catch {
        setManagedCityOptions([]);
        return [];
      }
    },
    [form, managedCityOptions],
  );

  const handleLocationSearch = useCallback(
    async (q: string) => {
      const cityFilterValue = form.state.values.city;
      if (!cityFilterValue) {
        return [];
      }

      // Options for the currently selected city were already loaded by the
      // debounced city effect above; avoid re-fetching identical data when
      // the dropdown opens with an empty query.
      if (!q) {
        return managedLocationOptions;
      }

      try {
        const filterObj: SearchParams = {
          filter: [
            { search_field: "name", search_value: q },
            { search_field: "city", search_value: cityFilterValue },
          ],
        };

        const opts = getLocationsQuery(1, 100, undefined, undefined, filterObj)();
        const res =
          opts && typeof opts.queryFn === "function"
            ? await (opts.queryFn as any)()
            : await fetchLocations(1, 100, undefined, undefined, filterObj);
        const items = res?.data ?? [];
        setManagedLocationOptions(items.map((location: any) => ({ value: location.id, label: location.name })));
        return items.map((location: any) => ({ value: location.id, label: location.name }));
      } catch {
        setManagedLocationOptions([]);
        return [];
      }
    },
    [form, managedLocationOptions],
  );

  const handleCountryChange = useCallback(
    (field: AnyFieldApi) => (v: string | number) => {
      field.handleChange(v);
      form.setFieldValue("city", "");
      form.setFieldValue("location", "");
    },
    [form],
  );

  const handleCityChange = useCallback(
    (field: AnyFieldApi) => (v: string | number) => {
      field.handleChange(v);
      form.setFieldValue("location", "");
    },
    [form],
  );

  const handlePlaceSelect = useCallback(
    (field: AnyFieldApi) => (lat: number, lng: number, address: string) => {
      field.handleChange(address);
      form.setFieldValue("latitude", lat);
      form.setFieldValue("longitude", lng);
    },
    [form],
  );

  return (
    <Card className="p-4 sm:p-6">
      <CardContent className="p-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-8"
        >
          {/* ===================== Top: media + core details ===================== */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
            {/* ---- LEFT: Image upload column ---- */}
            <div className="flex flex-col gap-6">
              <div>
                <p className="mb-2 text-sm font-medium text-gray-900">
                  Feature Image <span className="text-red-500">*</span>
                </p>
                <form.Field
                  name="feature_image"
                  validators={{
                    onChange: ({ value }: { value: string }) => (!value ? 'Feature image is required' : undefined),
                    onSubmit: ({ value }: { value: string }) => (!value ? 'Feature image is required' : undefined),
                  }}
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
                          alt="Feature image"
                          emptyText="Feature image"
                          buttonText="Upload Feature Image"
                          previewWrapperClassName="h-[200px] w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300"
                          previewImageClassName="h-full w-full object-cover"
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                          Supported files: <strong>.png, .jpg, .jpeg</strong>
                        </p>
                      </FormFieldWrapper>
                    );
                  }}
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-900">Cover Image</p>
                <form.Field
                  name="cover_image"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="">
                        <UploadImage
                          id={field.name}
                          name={field.name}
                          preview={coverLogo}
                          onPreviewChange={(preview) => setCoverLogo(preview ?? "")}
                          onValueChange={(value: string) => field.handleChange(value)}
                          onBlur={field.handleBlur}
                          alt="Cover image"
                          emptyText="Cover image"
                          buttonText="Upload Cover Image"
                          previewWrapperClassName="h-[150px] w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300"
                          previewImageClassName="h-full w-full object-cover"
                        />
                      </FormFieldWrapper>
                    );
                  }}
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-900">Gallery Images</p>
                <form.Field
                  name="gallery_images"
                  mode="array"
                  children={(field) => {
                    const images = field.state.value || [];
                    return (
                      <div className="space-y-4">
                        {images.map((_: any, i: number) => (
                          <div key={i} className="relative">
                            <UploadImage
                              id={`gallery_images_${i}`}
                              name={`gallery_images[${i}]`}
                              preview={galleryImagesState[i] || null}
                              onPreviewChange={(preview) => {
                                setGalleryImagesState((prev) => ({ ...prev, [i]: preview ?? "" }));
                              }}
                              onValueChange={(value: string) => {
                                const newImages = [...images];
                                newImages[i] = value;
                                field.handleChange(newImages);
                              }}
                              alt={`Gallery image ${i + 1}`}
                              emptyText="Gallery image"
                              buttonText="Upload Image"
                              previewWrapperClassName="h-[100px] w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300"
                              previewImageClassName="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                field.removeValue(i);
                                setGalleryImagesState((prev) => {
                                  const next = { ...prev };
                                  delete next[i];
                                  return next;
                                });
                              }}
                              aria-label={`Remove gallery image ${i + 1}`}
                              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => field.pushValue("")}
                          className="w-full rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                        >
                          + Add Gallery Image
                        </button>
                      </div>
                    );
                  }}
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-900">Trade License (PDF/Image)</p>
                <form.Field
                  name="trade_license"
                  children={(field: AnyFieldApi) => {
                    const apiErrors = validationErrors?.[field.name] ?? [];
                    return (
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="">
                        <UploadImage
                          id={field.name}
                          name={field.name}
                          preview={tradeLicensePreview}
                          onPreviewChange={(preview) => setTradeLicensePreview(preview ?? "")}
                          onValueChange={(value: string) => field.handleChange(value)}
                          onBlur={field.handleBlur}
                          accept="image/*,application/pdf"
                          alt="Trade License"
                          emptyText="Trade License Document"
                          buttonText="Upload Document"
                          previewWrapperClassName="h-[150px] w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-300"
                          previewImageClassName="h-full w-full object-cover"
                        />
                      </FormFieldWrapper>
                    );
                  }}
                />
              </div>
            </div>

            {/* ---- RIGHT: Field grid ---- */}
            <div className={styles.fieldGrid}>
              <form.Field
                name="vendor"
                validators={{
                  onChange: ({ value }: { value: string | number }) => (!value ? 'Vendor is required' : undefined),
                  onSubmit: ({ value }: { value: string | number }) => (!value ? 'Vendor is required' : undefined),
                }}
                children={(field: AnyFieldApi) => {
                  const apiErrors = validationErrors?.[field.name] ?? [];
                  return (
                    <FormFieldWrapper field={field} apiErrors={apiErrors} label="Vendor">
                      <SearchableSelect
                        options={vendorOptions}
                        value={field.state.value}
                        onChange={(v) => field.handleChange(v)}
                        placeholder="Select One"
                        onSearch={handleVendorSearch}
                      />
                    </FormFieldWrapper>
                  );
                }}
              />

              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }: { value: string }) => (!value ? 'Property name is required' : undefined),
                  onSubmit: ({ value }: { value: string }) => (!value ? 'Property name is required' : undefined),
                }}
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
                        className={styles.input}
                        placeholder="Property name"
                      />
                    </FormFieldWrapper>
                  );
                }}
              />

              <form.Field
                name="description"
                validators={{
                  onChange: ({ value }: { value: string }) => (!value ? 'Description is required' : undefined),
                  onSubmit: ({ value }: { value: string }) => (!value ? 'Description is required' : undefined),
                }}
                children={(field: AnyFieldApi) => {
                  const apiErrors = validationErrors?.[field.name] ?? [];
                  return (
                    <FormFieldWrapper field={field} apiErrors={apiErrors} label="Description">
                      <textarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className={styles.input}
                        placeholder="Property description"
                        rows={4}
                      />
                    </FormFieldWrapper>
                  );
                }}
              />

              <form.Field
                name="trade_license_number"
                children={(field: AnyFieldApi) => {
                  const apiErrors = validationErrors?.[field.name] ?? [];
                  return (
                    <FormFieldWrapper field={field} apiErrors={apiErrors} label="Trade Licence Number">
                      <input
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className={styles.input}
                        placeholder="License number"
                      />
                    </FormFieldWrapper>
                  );
                }}
              />

              <form.Field
                name="listing_price"
                validators={{
                  onChange: ({ value }: { value: number }) => (value <= 0 ? 'Listing price must be greater than 0' : undefined),
                  onSubmit: ({ value }: { value: number }) => (value <= 0 ? 'Listing price must be greater than 0' : undefined),
                }}
                children={(field: AnyFieldApi) => {
                  const apiErrors = validationErrors?.[field.name] ?? [];
                  return (
                    <FormFieldWrapper field={field} apiErrors={apiErrors} label="Listing Price">
                      <input
                        id={field.name}
                        name={field.name}
                        type="number"
                        value={field.state.value ?? ""}
                        onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                        onBlur={field.handleBlur}
                        className={styles.input}
                        placeholder="0.00"
                      />
                    </FormFieldWrapper>
                  );
                }}
              />

              <form.Field
                name="sale_price"
                children={(field: AnyFieldApi) => {
                  const apiErrors = validationErrors?.[field.name] ?? [];
                  return (
                    <FormFieldWrapper field={field} apiErrors={apiErrors} label="Sale Price">
                      <input
                        id={field.name}
                        name={field.name}
                        type="number"
                        value={field.state.value ?? ""}
                        onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                        onBlur={field.handleBlur}
                        className={styles.input}
                        placeholder="0.00"
                      />
                    </FormFieldWrapper>
                  );
                }}
              />

              <form.Field
                name="is_featured"
                children={(field: AnyFieldApi) => {
                  return (
                    <div className="flex items-center pt-8">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          id={field.name}
                          name={field.name}
                          type="checkbox"
                          checked={field.state.value ?? false}
                          onChange={(e) => field.handleChange(e.target.checked)}
                          onBlur={field.handleBlur}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700">Is Featured?</span>
                      </label>
                    </div>
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
                        className={styles.select}
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

              <form.Field
                name="address"
                validators={{
                  onChange: ({ value }: { value: string }) => (!value ? 'Address is required' : undefined),
                  onSubmit: ({ value }: { value: string }) => (!value ? 'Address is required' : undefined),
                }}
                children={(field: AnyFieldApi) => {
                  const apiErrors = validationErrors?.[field.name] ?? [];
                  return (
                    <div className="col-span-full">
                      <FormFieldWrapper field={field} apiErrors={apiErrors} label="Address">
                        <AddressAutocomplete
                          onBlur={field.handleBlur}
                          onPlaceSelect={handlePlaceSelect(field)}
                          className={styles.input}
                          placeholder="Search and select address..."
                        />
                      </FormFieldWrapper>
                    </div>
                  );
                }}
              />

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
                        className={styles.inputReadOnly}
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
                        className={styles.inputReadOnly}
                        placeholder="0.000000"
                        readOnly
                      />
                    </FormFieldWrapper>
                  );
                }}
              />

              <form.Field
                name="country"
                validators={{
                  onChange: ({ value }: { value: string | number }) => (!value ? 'Country is required' : undefined),
                  onSubmit: ({ value }: { value: string | number }) => (!value ? 'Country is required' : undefined),
                }}
                children={(field: AnyFieldApi) => {
                  const apiErrors = validationErrors?.[field.name] ?? [];
                  return (
                    <FormFieldWrapper field={field} apiErrors={apiErrors} label="Country">
                      <SearchableSelect
                        options={managedCountryOptions}
                        value={field.state.value ?? ""}
                        onChange={handleCountryChange(field)}
                        placeholder="Select One"
                        className="w-full"
                        onSearch={handleCountrySearch}
                      />
                    </FormFieldWrapper>
                  );
                }}
              />

              <form.Field
                name="city"
                validators={{
                  onChange: ({ value }: { value: string | number }) => (!value ? 'City is required' : undefined),
                  onSubmit: ({ value }: { value: string | number }) => (!value ? 'City is required' : undefined),
                }}
                children={(field: AnyFieldApi) => {
                  const apiErrors = validationErrors?.[field.name] ?? [];
                  return (
                    <FormFieldWrapper field={field} apiErrors={apiErrors} label="City">
                      <SearchableSelect
                        options={managedCityOptions}
                        value={field.state.value ?? ""}
                        onChange={handleCityChange(field)}
                        placeholder="Select One"
                        className="w-full"
                        onSearch={handleCitySearch}
                      />
                    </FormFieldWrapper>
                  );
                }}
              />

              <form.Field
                name="location"
                validators={{
                  onChange: ({ value }: { value: string | number }) => (!value ? 'Location is required' : undefined),
                  onSubmit: ({ value }: { value: string | number }) => (!value ? 'Location is required' : undefined),
                }}
                children={(field: AnyFieldApi) => {
                  const apiErrors = validationErrors?.[field.name] ?? [];
                  return (
                    <FormFieldWrapper field={field} apiErrors={apiErrors} label="Location">
                      <SearchableSelect
                        options={managedLocationOptions}
                        value={field.state.value ?? ""}
                        onChange={(v) => field.handleChange(v)}
                        placeholder="Select One"
                        className="w-full"
                        onSearch={handleLocationSearch}
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
                        className={styles.input}
                        placeholder="Tax name"
                      />
                    </FormFieldWrapper>
                  );
                }}
              />

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
                          className={`${styles.input} pr-8`}
                          placeholder="0.00"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
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
                        className={styles.input}
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
                        className={styles.input}
                      />
                    </FormFieldWrapper>
                  );
                }}
              />
            </div>
          </div>

          {/* ===================== Amenities ===================== */}
          <FormSection title="Amenities">
            <div className={`grid grid-cols-2 gap-4 md:grid-cols-4 ${styles.sectionCard}`}>
              {amenities.length === 0 ? (
                <p className="col-span-full text-sm text-gray-500">No active amenities found.</p>
              ) : (
                amenities.map((amenity) => (
                  <form.Field
                    key={amenity.value}
                    name="amenities"
                    mode="array"
                    children={(field) => {
                      const currentAmenities = field.state.value || [];
                      const isChecked = currentAmenities.some(
                        (a: any) => String(a.name) === String(amenity.value) && a.allow,
                      );
                      return (
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const newAmenities = [...currentAmenities];
                              const index = newAmenities.findIndex((a: any) => String(a.name) === String(amenity.value));
                              if (index > -1) {
                                newAmenities[index] = { ...newAmenities[index], allow: checked };
                              } else {
                                newAmenities.push({ name: String(amenity.value), allow: checked });
                              }
                              field.handleChange(newAmenities);
                            }}
                            className={styles.checkbox}
                          />
                          <span className="text-sm font-medium text-gray-700">{amenity.label}</span>
                        </label>
                      );
                    }}
                  />
                ))
              )}
            </div>
          </FormSection>

          {/* ===================== Facilities ===================== */}
          <FormSection title="Facilities">
            <div className={`grid grid-cols-2 gap-4 md:grid-cols-4 ${styles.sectionCard}`}>
              {facilities.length === 0 ? (
                <p className="col-span-full text-sm text-gray-500">No active facilities found.</p>
              ) : (
                facilities.map((facility) => (
                  <form.Field
                    key={facility.value}
                    name="facilities"
                    mode="array"
                    children={(field) => {
                      const currentFacilities = field.state.value || [];
                      const isChecked = currentFacilities.some(
                        (a: any) => String(a.name) === String(facility.value) && a.allow,
                      );
                      return (
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const newFacilities = [...currentFacilities];
                              const index = newFacilities.findIndex(
                                (a: any) => String(a.name) === String(facility.value),
                              );
                              if (index > -1) {
                                newFacilities[index] = { ...newFacilities[index], allow: checked };
                              } else {
                                newFacilities.push({ name: String(facility.value), allow: checked });
                              }
                              field.handleChange(newFacilities);
                            }}
                            className={styles.checkbox}
                          />
                          <span className="text-sm font-medium text-gray-700">{facility.label}</span>
                        </label>
                      );
                    }}
                  />
                ))
              )}
            </div>
          </FormSection>

          {/* ===================== Food Options ===================== */}
          <FormSection title="Food Options">
            <div className={`grid grid-cols-2 gap-4 md:grid-cols-4 ${styles.sectionCard}`}>
              {foodOptions.length === 0 ? (
                <p className="col-span-full text-sm text-gray-500">No active food options found.</p>
              ) : (
                foodOptions.map((foodOption) => (
                  <form.Field
                    key={foodOption.value}
                    name="food_options"
                    mode="array"
                    children={(field) => {
                      const currentFoodOptions = field.state.value || [];
                      const isChecked = currentFoodOptions.some(
                        (a: any) => String(a.name) === String(foodOption.value) && a.allow,
                      );
                      return (
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const newFoodOptions = [...currentFoodOptions];
                              const index = newFoodOptions.findIndex(
                                (a: any) => String(a.name) === String(foodOption.value),
                              );
                              if (index > -1) {
                                newFoodOptions[index] = { ...newFoodOptions[index], allow: checked };
                              } else {
                                newFoodOptions.push({ name: String(foodOption.value), allow: checked });
                              }
                              field.handleChange(newFoodOptions);
                            }}
                            className={styles.checkbox}
                          />
                          <span className="text-sm font-medium text-gray-700">{foodOption.label}</span>
                        </label>
                      );
                    }}
                  />
                ))
              )}
            </div>
          </FormSection>

          {/* ===================== Rooms ===================== */}
          <FormSection title="Rooms">
            <form.Field
              name="rooms"
              mode="array"
              children={(field) => {
                const rooms = field.state.value || [];
                return (
                  <div className="space-y-4">
                    {rooms.map((_: any, i: number) => (
                      <div
                        key={i}
                        className="relative flex flex-col items-end gap-4 rounded-xl border border-gray-200 bg-gray-50 p-6 md:flex-row"
                      >
                        <span className="absolute -left-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-100 font-bold text-blue-800 shadow-sm">
                          {i + 1}
                        </span>

                        <form.Field
                          name={`rooms[${i}].name`}
                          children={(subField) => (
                            <div className="w-full flex-1">
                              <label className="mb-1 block text-sm font-semibold text-gray-700">Room Name</label>
                              <input
                                value={subField.state.value ?? ""}
                                onChange={(e) => subField.handleChange(e.target.value)}
                                onBlur={subField.handleBlur}
                                className={`${styles.input} rounded-lg px-4 py-2.5 shadow-sm hover:shadow-md`}
                                placeholder="e.g. Deluxe Suite"
                              />
                            </div>
                          )}
                        />

                        <form.Field
                          name={`rooms[${i}].type`}
                          children={(subField) => (
                            <div className="w-full flex-1">
                              <label className="mb-1 block text-sm font-semibold text-gray-700">Bed Type</label>
                              <select
                                value={subField.state.value ?? ""}
                                onChange={(e) => subField.handleChange(e.target.value)}
                                onBlur={subField.handleBlur}
                                className={`${styles.select} rounded-lg px-4 py-2.5 shadow-sm hover:shadow-md`}
                              >
                                <option value="">-- Select Bed Type --</option>
                                {roomTypes.map((rt) => (
                                  <option key={rt.value} value={rt.value}>
                                    {rt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        />

                        <button
                          type="button"
                          onClick={() => field.removeValue(i)}
                          className="mt-2 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 focus:ring-2 focus:ring-red-500 md:mt-0 md:w-auto"
                        >
                          Remove Room
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => field.pushValue({ name: "", type: "" })}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-95 md:w-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add New Room
                    </button>
                  </div>
                );
              }}
            />
          </FormSection>

          {/* Submit Button */}
          <div className="col-span-full mt-8 flex items-center justify-between gap-4">
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="ml-auto rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 disabled:hover:shadow-sm"
            >
              {isLoading ? buttonTextLoading : buttonText || "Submit"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PropertyForm;
