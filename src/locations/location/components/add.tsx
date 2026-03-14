import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import type {   CreateLocationDTO } from "@/types/location";
import SearchableSelect from "@/components/ui/searchable-select";
import { getCitiesQuery, getCountriesQuery } from "@/locations/queries";
import {  fetchCities, fetchCountries } from "@/services/location";



interface AddLocationModalProps {
  onOpenChange: (open: boolean) => void;
  onSave: (newLocation: CreateLocationDTO) => void;
  validationErrors?: Record<string, string[]>
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({ onOpenChange, onSave, validationErrors }) => {
  const [form, setForm] = React.useState<CreateLocationDTO>({
    name: "",
    country: "",
    city    : "",
  });
    const [countryOptions, setCountryOptions] = React.useState<{ value: string | number; label: string }[]>([])
    const [cityOptions, setCityOptions] = React.useState<{ value: string | number; label: string }[]>([])

    React.useEffect(() => {
        // reset form when modal mounts
        setForm({ name: "", country: "", city: "" });
        
      }, []);
      React.useEffect(() => {
          // load initial country list
          let mounted = true;
          (async () => {
            try {
              const filterObj = { filter: [ {search_field: 'status', search_value: true}] } as SearchParams;
              const opts = getCountriesQuery(1, 100, '', '', filterObj)();
              // QueryFn may be typed to expect a context; call safely and fallback to fetchCountries
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const res = opts && typeof opts.queryFn === 'function' ? await (opts.queryFn as any)() : await fetchCountries(1, 100, '', '', filterObj);
              if (!mounted) return;
              const items = res?.data ?? [];
              setCountryOptions(items.map((c: any) => ({ value: c.id, label: c.name })));
            } catch (err) {
              // ignore
            }
          })();
          return () => { mounted = false; };
        }, []);

    const handleChange = (field: keyof CreateLocationDTO, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        
        if (field === 'country') {  
            
            const cityOptions = getCitiesQuery(1, 100, '', '', { filter: [ { search_field: 'country', search_value: value } ] })();
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             const fetchCitiesFn = cityOptions && typeof cityOptions.queryFn === 'function' ? (cityOptions.queryFn as any) : null;
            
            if (fetchCitiesFn) {
            fetchCitiesFn().then((res: any) => {
                const items = res?.data ?? [];
                setCityOptions(items.map((c: any) => ({ value: c.id, label: c.name })));
            }).catch(() => {
                setCityOptions([]);
            });
            } else {
            setCityOptions([]);
        }
        }
      };

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
                  Add Country
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
                                if (q) {
                                filterObj = { filter: [ { search_field: 'name', search_value: q }, { search_field: 'country', search_value: form.country } ] };
                                } else {
                                filterObj = { filter: [ { search_field: 'country', search_value: form.country } ] };
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
            {validationErrors?.country && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.country.join(', ')}</p>
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
      )
};

export default AddLocationModal