import AdminHeader from "@/components/common/admin-header";
import React from "react";

interface BedTypesHeaderProps {
    setOpenNewBedTypeModal: (open: boolean) => void;
}

const BedTypesHeader: React.FC<BedTypesHeaderProps> = ({ setOpenNewBedTypeModal }) => {
    return (
        <React.Fragment>
            <AdminHeader
                title="Bed Types"
                description="Manage the bed types available for homestays."
                addLabel="Add Bed Type"
                addButton={true}
                setOpenAddModal={setOpenNewBedTypeModal}
                
            />
           
        </React.Fragment>
    )
}
    
export default BedTypesHeader