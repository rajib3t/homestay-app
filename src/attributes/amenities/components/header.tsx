import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
interface AmenitiesHeaderProps {
    setOpenNewAmenityModal: (open: boolean) => void;
}

const AmenitiesHeader: React.FC<AmenitiesHeaderProps> = ({ setOpenNewAmenityModal }) => {
    return (
        <React.Fragment>
           <div className="flex flex-col gap-4 pb-6 border-b">
            <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                Amenities
                </h1>

                
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                   Manage the amenities available for homestays.
                </p>
                
            </div>

            <Button
                size="sm"
                className="gap-2 shadow-sm cursor-pointer"
                onClick={() => setOpenNewAmenityModal(true)}
            >
                <Plus className="w-4 h-4" />
                Add Amenity
            </Button>
            </div>
        </div>
        </React.Fragment>
    )
}
    
export default AmenitiesHeader