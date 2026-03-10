import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import type {  CreateCountryDTO } from "@/types/location";

interface AddCountryModalProps {
  onOpenChange: (open: boolean) => void;
  onSave: (newCountry: CreateCountryDTO) => void;
  validationErrors?: Record<string, string[]>
}

const AddCountryModal: React.FC<AddCountryModalProps> = ({ onOpenChange, onSave, validationErrors }) => {
  const [form, setForm] = React.useState<CreateCountryDTO>({
    name: "",
    code: "",
    dial_code: "",
  });

  React.useEffect(() => {
    // reset form when modal mounts
    setForm({ name: "", code: "", dial_code: "" });
  }, []);

  const handleChange = (field: keyof CreateCountryDTO, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
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
            <label className="text-sm font-medium">Country Name</label>
            <Input
              placeholder="India"
              value={form.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("name", e.target.value)}
            />
            {validationErrors?.name && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.name.join(', ')}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Country Code</label>
            <Input
              placeholder="IN"
              value={form.code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("code", e.target.value)}
            />
            {validationErrors?.code && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.code.join(', ')}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Dial Code</label>
            <Input
              placeholder="91"
              value={form.dial_code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("dial_code", e.target.value)}
            />
            {validationErrors?.dial_code && (
              <p className="text-sm text-red-600 mt-1">{validationErrors.dial_code.join(', ')}</p>
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
              Save Country
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCountryModal;