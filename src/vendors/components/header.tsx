import React from "react";
import AdminHeader from "@/components/common/admin-header";

interface VendorHeaderProps {
    setOpenNewVendorModal: (open: boolean) => void;
}

const VendorHeader: React.FC<VendorHeaderProps> = ({ setOpenNewVendorModal }) => {
    return (
        <React.Fragment>
            <AdminHeader
                title="Vendors"
                description="Manage the vendors associated with your homestays."
                addLabel="Add Vendor"
                
                setOpenAddModal={setOpenNewVendorModal}
                
            />
           
        </React.Fragment>
    )
}
    
export default VendorHeader