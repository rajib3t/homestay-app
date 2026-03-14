import React from "react"
import LocationHeader from '@/components/common/common-header'
import type { CreateLocationDTO } from '@/types/location'
import AddLocationModal from '@/locations/location/components/add'

export const HeaderLocation: React.FC<{
  openNewLocationModal: boolean;
  setOpenNewLocationModal: (open: boolean) => void;
  onAddNewLocation: (payload: CreateLocationDTO) => Promise<any> | void
  validationErrors?: Record<string, string[]>
}> = (props) => {
  return (
    <LocationHeader
      title="Locations"
      description="Explore detailed information about locations including their code, dialing code and countries. Manage location data easily."
      addLabel="Add New Location"
      openAddModal={props.openNewLocationModal}
      setOpenAddModal={props.setOpenNewLocationModal}
      AddModal={AddLocationModal}
      onAdd={props.onAddNewLocation}
      validationErrors={props.validationErrors}
    />
  )
}