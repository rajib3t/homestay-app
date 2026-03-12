import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, UploadCloudIcon } from "lucide-react";
import type { CreateCityDTO } from "@/types/location";
import { Label } from "@/components/ui/label";
import SearchableSelect from "@/components/ui/searchable-select";
import { getCountriesQuery } from "@/locations/queries";
import { fetchCountries } from "@/services/location";

interface AddCityModalProps {
  onOpenChange: (open: boolean) => void;
  onSave: (newCity: CreateCityDTO) => void;
  validationErrors?: Record<string, string[]>
}

const AddCityModal: React.FC<AddCityModalProps> = ({ onOpenChange, onSave, validationErrors }) => {
  const [form, setForm] = React.useState<CreateCityDTO>({
    name: "",
    country: "",
    is_popular: false,
    image: null,
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    // reset form when modal mounts
    setForm({ name: "", country: "", is_popular: false, image: null });
    setImagePreview(null);
  }, []);

  const handleChange = (field: keyof CreateCityDTO, value: any) => {
    console.log("handleChange", field, value);
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file?: File) => {
    if (!file) {
      setForm(prev => ({ ...prev, image: null }));
      setImagePreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setForm(prev => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const [countryOptions, setCountryOptions] = React.useState<{ value: string | number; label: string }[]>([]);

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
          Add City
        </h2>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const payload = {
              ...form,
              country: form.country === "" ? null : form.country,
            } as unknown as CreateCityDTO;
            onSave(payload);
          }}
        >
          <div>
            <label className="text-sm font-medium">Image</label>
            <div className="mt-2 mb-2">
              <div className="w-full h-48 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-center">
                {imagePreview ? (
                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  <img src={imagePreview} alt="city preview" className="object-cover w-full h-full rounded-md" />
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center">
                    
                    <span>300×400</span>
                  </div>
                )}
                
              </div>
              <div className="relative mt-2">
                <Label className="flex items-center justify-center gap-2 border rounded-md px-4 py-2 cursor-pointer hover:bg-gray-50">
                  <UploadCloudIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Upload Image</span>

                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/jpg"
                    className="hidden"
                    onChange={(e) => handleImageChange(e.target.files?.[0])}
                  />
                </Label>
              </div>
              {validationErrors?.image && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.image.join(', ')}</p>
              )}
            </div>
          </div>

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
            <Label className="text-sm font-medium">Name</Label>
            <Input
              placeholder="City name"
              value={form.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("name", e.target.value)}
            />
            {validationErrors?.name && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.name.join(', ')}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium">Is Popular</Label>
            <div className="mt-2">
              <Label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!form.is_popular}
                  onChange={(e) => handleChange("is_popular", e.target.checked)}
                />
                <span className="ml-2">Mark as popular</span>
              </Label>
            </div>
            {validationErrors?.is_popular && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.is_popular.join(', ')}</p>
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
              Save City
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCityModal;