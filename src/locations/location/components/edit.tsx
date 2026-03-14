import React from "react";
import type { Location } from "@/types/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import SearchableSelect from "@/components/ui/searchable-select";
import { getCitiesQuery, getCountriesQuery } from "@/locations/queries";
import {  fetchCities, fetchCountries, fetch_city_by_country, fetchCountry, fetchCity } from "@/services/location";
import type { SearchParams } from "@/types/common";
interface EditLocationProps {
    location: Location;
    onOpenChange: (open: boolean) => void;
    onSave: (updatedLocation: Location) => void;
    validationErrors?: Record<string, string[]>;
}

const EditLocationModal: React.FC<EditLocationProps> = ({ location, onOpenChange, onSave , validationErrors }) => {
    const [form, setForm] = React.useState<Location>(location);
    const [countryOptions, setCountryOptions] = React.useState<{ value: string | number; label: string }[]>([])
    const [cityOptions, setCityOptions] = React.useState<{ value: string | number; label: string }[]>([])
    const [resolvedCountryId, setResolvedCountryId] = React.useState<string | undefined>(undefined);
    React.useEffect(() => {
        setForm(location);
    }, [location]);

    // Populate select options with current values so the selects show the selected item
    React.useEffect(() => {
        // Populate country option and resolve to an id if needed so city fetch uses id
        let resolvedCountryId: string | undefined;
        let resolvedCountryLabel: string | undefined;

        const populate = async () => {
          if (location?.country) {
            const isId = /^(\d+|[0-9a-fA-F]{24})$/.test(String(location.country));
            if (isId) {
              resolvedCountryId = String(location.country);
              try {
                const res: any = await fetchCountry(String(location.country));
                resolvedCountryLabel = res?.data?.name ?? String(location.country);
              } catch (e) {
                resolvedCountryLabel = String(location.country);
              }
            } else {
              // location.country is a name; try to resolve its id
              try {
                const filterObj = { filter: [{ search_field: 'name', search_value: String(location.country) }] } as any;
                const res = await fetchCountries(1, 10, undefined, undefined, filterObj as any);
                const items = res?.data ?? [];
                const found = items.find((c: any) => String(c.name).toLowerCase() === String(location.country).toLowerCase());
                if (found) {
                  resolvedCountryId = String(found.id);
                  resolvedCountryLabel = found.name;
                } else {
                  resolvedCountryLabel = String(location.country);
                }
              } catch (e) {
                resolvedCountryLabel = String(location.country);
              }
            }

            setCountryOptions([{ value: resolvedCountryId ?? String(location.country), label: resolvedCountryLabel ?? String(location.country) }]);
            if (resolvedCountryId) {
              setResolvedCountryId(resolvedCountryId);
              setForm(prev => ({ ...prev, country: String(resolvedCountryId) }));
            } else {
              setResolvedCountryId(undefined);
            }
            console.debug('EditModal: resolvedCountry', { resolvedCountryId, resolvedCountryLabel });
          }
          // Now populate city options. Prefer fetching by resolvedCountryId so API receives id.
          if (resolvedCountryId) {
            try {
              const res = await fetch_city_by_country(resolvedCountryId);
              const items = res?.data ?? [];
              const mapped = items.map((c: any) => ({ value: String(c.id), label: c.name }));
              setCityOptions(mapped);
              // If location.city is present, try to select it (by id or name)
              if (location?.city) {
                const isCityId = /^(\d+|[0-9a-fA-F]{24})$/.test(String(location.city));
                if (isCityId) {
                  setForm(prev => ({ ...prev, city: String(location.city) }));
                } else {
                  const found = items.find((c: any) => String(c.name).toLowerCase() === String(location.city).toLowerCase());
                  if (found) setForm(prev => ({ ...prev, city: String(found.id) }));
                  else setForm(prev => ({ ...prev, city: String(location.city) }));
                }
              }
            } catch (e) {
              // fallback: if we can't fetch list, still set city to provided value
              if (location?.city) setCityOptions([{ value: String(location.city), label: String(location.city) }]);
            }
          } else if (location?.city) {
            // No resolved country id: try to fetch city by id or fallback to name
            const isCityId = /^(\d+|[0-9a-fA-F]{24})$/.test(String(location.city));
            if (isCityId) {
              try {
                const res: any = await fetchCity(String(location.city));
                const name = res?.data?.name ?? String(location.city);
                setCityOptions([{ value: String(location.city), label: name }]);
                setForm(prev => ({ ...prev, city: String(location.city) }));
              } catch (e) {
                setCityOptions([{ value: String(location.city), label: String(location.city) }]);
              }
            } else {
              setCityOptions([{ value: String(location.city), label: String(location.city) }]);
            }
          }
        };

        populate();
    }, [location]);

    // When country changes in the form, fetch cities for that country to populate city options
    // React.useEffect(() => {
    //   if (!form?.country) {
    //     setCityOptions([]);
    //     return;
    //   }

    //   (async () => {
    //     console.log(form.country);
        
    //     try {
    //         let filterObj: SearchParams | undefined;
    //         filterObj = { filter: [ { search_field: 'country', search_value: form.country } ] };
    //      const opts = getCitiesQuery(1, 100, undefined, undefined, filterObj)();
    //                             // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //                             const res = opts && typeof opts.queryFn === 'function' ? await (opts.queryFn as any)() : await fetchCities(1, 100, undefined, undefined, filterObj);
    //                             const items = res?.data ?? [];
                                
    //       setCityOptions(items.map((c: any) => ({ value: c.id, label: c.name })));
    //     } catch (err) {
    //       // ignore
    //     }
    //   })();
    // }, [form?.country]);

    const handleChange = (field: keyof Location, value: string) => {

        setForm(prev => ({ ...prev, [field]: value }));
        if (field === 'country') {
            setCityOptions([]);
        }
    };

    // When user changes country, resolve id (if needed) and fetch cities for that country
    React.useEffect(() => {
      if (!form?.country) {
        setCityOptions([]);
        setResolvedCountryId(undefined);
        return;
      }

      let active = true;
      (async () => {
        try {
          const countryValue = String(form.country);
          const idRegex = /^(\d+|[0-9a-fA-F]{24})$/;
          let countryId: string | undefined;

          if (idRegex.test(countryValue)) {
            countryId = countryValue;
          } else {
            // try to resolve name -> id
            try {
              const filterObj = { filter: [{ search_field: 'name', search_value: countryValue }] } as any;
              const res = await fetchCountries(1, 10, undefined, undefined, filterObj as any);
              const items = res?.data ?? [];
              const found = items.find((c: any) => String(c.name).toLowerCase() === countryValue.toLowerCase());
              if (found) countryId = String(found.id);
            } catch (e) {
              // ignore
            }
          }

          if (!active) return;
          setResolvedCountryId(countryId);

          // fetch cities for this country (prefer id, but allow using countryValue as filter)
          try {
            const countryFilterValue = countryId ?? countryValue;
            const opts = getCitiesQuery(1, 100, undefined, undefined, { filter: [ { search_field: 'country', search_value: countryFilterValue } ] } as any)();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = opts && typeof opts.queryFn === 'function' ? await (opts.queryFn as any)() : await fetchCities(1, 100, undefined, undefined, { filter: [ { search_field: 'country', search_value: countryFilterValue } ] } as any);
            const items = res?.data ?? [];
            const mapped: { value: string; label: string }[] = items.map((c: any) => ({ value: String(c.id), label: c.name }));

            if (active) {
              setCityOptions(mapped);
              // clear selected city if it does not exist in new options
              const hasCurrentCity = mapped.some(m => String(m.value) === String(form.city));
              if (!hasCurrentCity) {
                setForm(prev => ({ ...prev, city: '' }));
              }
            }
          } catch (e) {
            // ignore
          }
        } catch (err) {
          // ignore
        }
      })();

      return () => { active = false; };
    }, [form?.country]);

    return (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6 relative">
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute right-4 top-4 text-gray-500 hover:text-black cursor-pointer"
                >
                  <X size={18} />
                </button>
        
                <h2 className="text-xl font-semibold mb-6">
                  Edit Location
                </h2>
        
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSave(form);
                  }}
                >
                  <div>
                    <Label className="text-sm font-medium">Country</Label>
                    <div className="mt-2">
                    <SearchableSelect
                        options={countryOptions}
                        value={form.country}
                        onChange={(v) => handleChange("country", v)}
                        placeholder="Select One"
                        onSearch={async (q: string) => {
                        try {
                            let filterObj: SearchParams | undefined;
                            if (q) {
                            filterObj = { filter: [ { search_field: 'name', search_value: q }, { search_field: 'status', search_value: true } ] };
                            } else {
                            filterObj = { filter: [ { search_field: 'status', search_value: true } ] };
                            }
                            const opts = getCountriesQuery(1, 100, undefined, undefined, filterObj)();
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const res = opts && typeof opts.queryFn === 'function' ? await (opts.queryFn as any)() : await fetchCountries(1, 100, undefined, undefined, filterObj);
                            const items = res?.data ?? [];
                            return items.map((c: any) => ({ value: c.id, label: c.name }));
                        } catch (err) {
                            return [];
                        }
                        }}
                    />
                </div>
            {validationErrors?.country && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.country.join(', ')}</p>
            )}
          </div>
            <div>
                <Label className="text-sm font-medium">City</Label>
                    <div className="mt-2">
                        <SearchableSelect
                            options={cityOptions}
                            value={form.city}
                            onChange={(v) => handleChange("city", v)}
                            placeholder="Select One"
                            onSearch={async (q: string) => {
                            try {
                                let filterObj: SearchParams | undefined;
                                  const countryFilterValue = resolvedCountryId ?? form.country;
                                  console.log('city onSearch countryFilterValue', countryFilterValue, q);
                                  if (q) {
                                  filterObj = { filter: [ { search_field: 'name', search_value: q }, { search_field: 'country', search_value: countryFilterValue } ] };
                                  } else {
                                  filterObj = { filter: [ { search_field: 'country', search_value: countryFilterValue } ] };
                                  }
                                const opts = getCitiesQuery(1, 100, undefined, undefined, filterObj)();
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const res = opts && typeof opts.queryFn === 'function' ? await (opts.queryFn as any)() : await fetchCities(1, 100, undefined, undefined, filterObj);
                                const items = res?.data ?? [];
                                return items.map((c: any) => ({ value: c.id, label: c.name }));
                            } catch (err) {
                                return [];
                            }
                            }}
                        />
                </div>
            {validationErrors?.city && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.city.join(', ')}</p>
            )}
          </div>
         <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <Input
                      placeholder="Location name"
                      value={form.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("name", e.target.value)}
                    />
                    {validationErrors?.name && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.name.join(', ')}</p>
                    )}
                  </div>    
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
        
                    <Button type="submit" className="cursor-pointer">
                      Save Location
                    </Button>
                  </div>
                </form>
              </div>
            </div>
    );
};

export default EditLocationModal;

