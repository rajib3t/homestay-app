import React from "react";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";

interface AdminHeaderProps {
    title: string;
    description?: string;
    addButton:boolean;
    addButtonType?: 'button' | 'link';
    addLabel?: string;
    addUrl ?: string
    setOpenAddModal?: (open: boolean) => void;
    icon?: React.ReactNode;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
    title, 
    description,
    addButton = true,
    addLabel = 'Add New',
    addButtonType = 'button',
    addUrl = '#',
    setOpenAddModal,
    icon
}) => {
    return (
        <React.Fragment>
            <div className="flex flex-col gap-4 pb-6 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                                {description}
                            </p>
                        )}
                    </div>
                    {addButton && (
                        <React.Fragment>
                        {addButtonType === 'button' && (
                            <Button
                            size="sm"
                            className="gap-2 shadow-sm cursor-pointer"
                            onClick={() => setOpenAddModal?.(true)}
                        >
                            {icon && <span className="mr-2">{icon}</span>}
                            
                            {addLabel}
                        </Button>
                        )}
                        {addButtonType === 'link' && (
    <Link
        className="inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer rounded-md text-sm font-medium h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        to={addUrl}
    >
        {icon && <span className="mr-2">{icon}</span>}
        {addLabel}
    </Link>
)}
                        </React.Fragment>
                    )}
                </div>
            </div>
       
        </React.Fragment>
    )
}
    
export default AdminHeader