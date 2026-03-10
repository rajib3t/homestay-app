import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Country } from "@/types/location";
interface EditCountryModalProps {
  country: Country;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedCountry: Country) => void;
}
const EditCountryModal: React.FC<EditCountryModalProps> = ({ country, onOpenChange, onSave }) => {
  const [form, setForm] = React.useState<Country>(country);

  React.useEffect(() => {
    setForm(country);
  }, [country]);

  const handleChange = (field: keyof Country, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

          {/* Modal Box */}
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6 relative">

            {/* Close Icon */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-black cursor-pointer"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-semibold mb-6">
              Edit Country
            </h2>

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={(e) => {
              e.preventDefault();
              onSave(form);
            }}>

              <div>
                <label className="text-sm font-medium">Country Name</label>
                <Input
                  placeholder="India"
                  value={form.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Country Code</label>
                <Input
                  placeholder="IN"
                  value={form.code}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('code', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Dial Code</label>
                <Input
                  placeholder="91"
                  value={form.dial_code}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('dial_code', e.target.value)}
                />
              </div>

              {/* Buttons */}
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

export default EditCountryModal;           