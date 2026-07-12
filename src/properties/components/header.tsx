import AdminHeader from "@/components/common/admin-header";
import React from "react";

interface PropertiesHeaderProps {
    title: string;
    description: string;
    addButton: boolean;
    addLabel: string;
    setOpenAddModal: (open: boolean) => void;
    addButtonType: 'button' | 'link';
    addUrl: string;
    icon?: React.ReactNode;
}

const PropertiesHeader: React.FC<PropertiesHeaderProps> = ({ title, description, addButton, addLabel, setOpenAddModal, addButtonType, addUrl, icon   }) => {
    return (
        <React.Fragment>
            <AdminHeader
                title={title}
                description={description}
                addLabel={addLabel}
                addButton={addButton}
                setOpenAddModal={setOpenAddModal}
                addButtonType={addButtonType}
                addUrl={addUrl}
                icon={icon}
            />
           
        </React.Fragment>
    )
}

export default PropertiesHeader
