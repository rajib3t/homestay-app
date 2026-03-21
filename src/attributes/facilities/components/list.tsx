import React from "react";
import type { Facility } from "@/types/attribute/index.";
import CommonTable from "@/components/common/common-table";
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FacilityListProps {
  data: Facility[];
  isLoading: boolean;
  meta: PaginatedMeta;
  onPageChange: (newPage: number) => void;
   onEditFacility: (facility: Facility) => void;
   openStatusChangeModal: (facility: Facility) => void;
}


const FacilityList: React.FC<FacilityListProps> = ({
  data,
  isLoading,
  meta,
  onPageChange,
  onEditFacility,
  openStatusChangeModal,
}) => {
    
    
  return (
    <React.Fragment>
        <div className="flex flex-col gap-6 pb-6 border-b">
          <CommonTable
              data={data}
              isLoading={isLoading}
              meta={meta}
              onPageChange={onPageChange}
              keyExtractor={(a: Facility) => a.id}
              loadingPlaceholder="Loading facilities..."
              emptyPlaceholder="No facilities found."
              renderHead={() => (
                <React.Fragment>
                  <TableCell>Name</TableCell>
                  <TableCell>Icon</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </React.Fragment>
              )}
              renderRow={(facility: Facility) => (
                <React.Fragment>
                  <TableCell>{facility.name}</TableCell>
                  <TableCell>
                    <div className="w-15 h-15  overflow-hidden bg-gray-200 shadow-lg ring-4 ring-white">
                    <img
                      src={facility.icon || "placeholder.webp"}
                      alt={facility.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={facility.status ? "bg-green-500" : "bg-red-500"}>
                {facility.status ? "Active" : "Inactive"}
              </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                size="sm"
                variant={"outline"}
                className="cursor-pointer"
                onClick={() => {
                  onEditFacility(facility);
                }}
              >
                Edit
              </Button>
              <Button
                  size="sm"
                  className={`cursor-pointer ${facility.status ? "bg-red-500" : "bg-green-500"}`}
                  onClick={() => {
                    if (openStatusChangeModal) {
                      openStatusChangeModal(facility);
                    }
                  }}
                >
                  {facility.status ? "Disable" : "Enable"}
                  </Button>
                  </TableCell>
                </React.Fragment>
              )}
            />    
        
        </div>
    </React.Fragment>
  );
}

export default FacilityList;