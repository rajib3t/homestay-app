import AdminHeader from "@/components/common/admin-header";
import React from "react";
interface AmenitiesHeaderProps {
    setOpenNewAmenityModal: (open: boolean) => void;
}

const AmenitiesHeader: React.FC<AmenitiesHeaderProps> = ({ setOpenNewAmenityModal }) => {
    return (
        <React.Fragment>
            <AdminHeader
                title="Amenities"
                description="Manage the amenities available for homestays."
                addLabel="Add Amenity"
                openAddModal={false}
                setOpenAddModal={setOpenNewAmenityModal}
                
            />
           
        </React.Fragment>
    )
}
    
export default AmenitiesHeader