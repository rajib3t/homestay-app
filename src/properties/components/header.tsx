import AdminHeader from "@/components/common/admin-header";
import React from "react";

interface PropertiesHeaderProps {
    setOpenNewPropertyModal: (open: boolean) => void;
}

const PropertiesHeader: React.FC<PropertiesHeaderProps> = ({ setOpenNewPropertyModal }) => {
    return (
        <React.Fragment>
            <AdminHeader
                title="Properties"
                description="Manage the properties available for homestays."
                addLabel="Add Property"
                addButton={false}
                
                
            />
           
        </React.Fragment>
    )
}

export default PropertiesHeader
