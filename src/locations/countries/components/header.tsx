import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"
import React, { useState } from "react"
import  type { CreateCountryDTO } from '@/types/location'

export const CountryHeader: React.FC<{
  onAddNewCountry: (payload: CreateCountryDTO) => void
}> = ({
  onAddNewCountry,
}) => {
  const [openNewCountryModal, setOpenNewCountryModal] = useState(false)
  const [form, setForm] = useState<CreateCountryDTO>({ name: '', code: '', dialCode: '' })

  const handleChange = (field: keyof CreateCountryDTO, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddNewCountry(form)
    setForm({ name: '', code: '', dialCode: '' })
    setOpenNewCountryModal(false)
  }

  return (
    <React.Fragment>
      <div className="flex flex-col gap-4 pb-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              Countries
            </h1>

            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Explore detailed information about countries including their code,
              dialing code and cities. Manage country data easily.
            </p>
          </div>

          <Button
            size="sm"
            className="gap-2 shadow-sm"
            onClick={() => setOpenNewCountryModal(true)}
          >
            <Plus className="w-4 h-4" />
            Add New Country
          </Button>
        </div>
      </div>

      {/* FULL PAGE MODAL */}
      {openNewCountryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">

          {/* Modal Box */}
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-6 relative">

            {/* Close Icon */}
            <button
              onClick={() => setOpenNewCountryModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-black"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-semibold mb-6">
              Add New Country
            </h2>

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

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
                  value={form.dialCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('dialCode', e.target.value)}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenNewCountryModal(false)}
                >
                  Cancel
                </Button>

                <Button type="submit">
                  Save Country
                </Button>

              </div>

            </form>
          </div>
        </div>
      )}
    </React.Fragment>
  )
}