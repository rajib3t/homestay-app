import React from "react"
import type { CreateCityDTO } from '@/types/location'
import AddCityModal from '@/locations/cities/components/add'
import CommonHeader from "@/components/common/common-header"

export const CityHeader: React.FC<{
  openNewCityModal: boolean;
  setOpenNewCityModal: (open: boolean) => void;
  onAddNewCity: (payload: CreateCityDTO) => Promise<any> | void
  validationErrors?: Record<string, string[]>
}> = (props) => {
  return (
    <CommonHeader
      title="Cities"
      description="Explore detailed information about cities including their code, dialing code and countries. Manage city data easily."
      addLabel="Add New City"
      openAddModal={props.openNewCityModal}
      setOpenAddModal={props.setOpenNewCityModal}
      AddModal={AddCityModal}
      onAdd={props.onAddNewCity}
      validationErrors={props.validationErrors}
    />
  )
}