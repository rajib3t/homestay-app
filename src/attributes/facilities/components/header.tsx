import React from "react";
import AdminHeader from "@/components/common/admin-header";

interface FacilitiesHeaderProps {
    onAddFacility:  (open: boolean) => void;
}

export const FacilitiesHeader: React.FC<FacilitiesHeaderProps> = ({ onAddFacility }) => {
    return (
        <React.Fragment>
             <AdminHeader
                title="Facilities"
                description="Manage the facilities available for homestays."
                addLabel="Add Facility"
                openAddModal={false}
                setOpenAddModal={onAddFacility}
                
            />
        </React.Fragment>
    )
}