import { Button } from "@/components/ui/button"

import { Plus } from "lucide-react"
import React from "react"
import  type { CreateCityDTO } from '@/types/location'
import AddCityModal from '@/locations/cities/components/add'

export const CityHeader: React.FC<{
  openNewCityModal: boolean;
  setOpenNewCityModal: (open: boolean) => void;
  onAddNewCity: (payload: CreateCityDTO) => Promise<any> | void
  validationErrors?: Record<string, string[]>
}> = ({
  openNewCityModal,
  setOpenNewCityModal,
  onAddNewCity,
  validationErrors,
}) => {
  return (
    <React.Fragment>
      <div className="flex flex-col gap-4 pb-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
              Cities
            </h1>

            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Explore detailed information about cities including their code,
              dialing code and countries. Manage city data easily.
            </p>
          </div>

          <Button
            size="sm"
            className="gap-2 shadow-sm cursor-pointer"
            onClick={() => setOpenNewCityModal(true)}
          >
            <Plus className="w-4 h-4" />
            Add New City
          </Button>
        </div>
      </div>

      {openNewCityModal && (
        <AddCityModal
          onOpenChange={(open: boolean) => setOpenNewCityModal(open)}
          onSave={async (payload: CreateCityDTO) => {
            try {
              await onAddNewCity(payload)
              setOpenNewCityModal(false)
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