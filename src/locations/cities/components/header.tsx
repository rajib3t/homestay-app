import React from "react"
import AdminHeader from "@/components/common/admin-header"

export const CityHeader: React.FC<{
  openNewCityModal: boolean;
  setOpenNewCityModal: (open: boolean) => void;
  validationErrors?: Record<string, string[]>
}> = (props) => {
  return (
    // 
    <AdminHeader
      title="Cities"
      description="Manage the cities where your homestays are located."
      addLabel="Add City"
      addButton={true}
      
      setOpenAddModal={props.setOpenNewCityModal}
      
    />
  )
}