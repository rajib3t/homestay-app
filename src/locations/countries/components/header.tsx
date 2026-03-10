import { Button } from "@/components/ui/button"

import { Plus } from "lucide-react"
import React from "react"
import  type { CreateCountryDTO } from '@/types/location'
import AddCountryModal from './add'

export const CountryHeader: React.FC<{
  openNewCountryModal: boolean;
  setOpenNewCountryModal: (open: boolean) => void;
  onAddNewCountry: (payload: CreateCountryDTO) => Promise<any> | void
  validationErrors?: Record<string, string[]>
}> = ({
  openNewCountryModal,
  setOpenNewCountryModal,
  onAddNewCountry,
  validationErrors,
}) => {
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
            className="gap-2 shadow-sm cursor-pointer"
            onClick={() => setOpenNewCountryModal(true)}
          >
            <Plus className="w-4 h-4" />
            Add New Country
          </Button>
        </div>
      </div>

      {openNewCountryModal && (
        <AddCountryModal
          onOpenChange={(open: boolean) => setOpenNewCountryModal(open)}
          onSave={async (payload: CreateCountryDTO) => {
            try {
              await onAddNewCountry(payload)
              setOpenNewCountryModal(false)
            } catch (e) {
              // keep modal open to show validation errors
            }
          }}
          validationErrors={validationErrors}
        />
      )}
    </React.Fragment>
  )
}