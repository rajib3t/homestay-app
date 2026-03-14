import React from "react"
import CommonHeader from '@/components/common/common-header'
import type { CreateCountryDTO } from '@/types/location'
import AddCountryModal from './add'

export const CountryHeader: React.FC<{
  openNewCountryModal: boolean;
  setOpenNewCountryModal: (open: boolean) => void;
  onAddNewCountry: (payload: CreateCountryDTO) => Promise<any> | void
  validationErrors?: Record<string, string[]>
}> = (props) => {
  return (
    <CommonHeader
      title="Countries"
      description="Explore detailed information about countries including their code, dialing code and cities. Manage country data easily."
      addLabel="Add New Country"
      openAddModal={props.openNewCountryModal}
      setOpenAddModal={props.setOpenNewCountryModal}
      AddModal={AddCountryModal}
      onAdd={props.onAddNewCountry}
      validationErrors={props.validationErrors}
    />
  )
}