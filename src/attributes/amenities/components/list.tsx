import React from "react";
import type { Amenity } from "@/types/attribute/index.";
import CommonTable from "@/components/common/common-table";
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AmenityListProps {
  data: Amenity[];
  isLoading: boolean;
  meta: PaginatedMeta;
  onPageChange: (newPage: number) => void;
   onEditAmenity: (amenity: Amenity) => void;
   openStatusChangeModal: (amenity: Amenity) => void;
}


export const AmenityList: React.FC<AmenityListProps> = ({
  data,
  isLoading,
  meta,
  onPageChange,
  onEditAmenity,
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
              keyExtractor={(a: Amenity) => a.id}
              loadingPlaceholder="Loading amenities..."
              emptyPlaceholder="No amenities found."
              renderHead={() => (
                <React.Fragment>
                  <TableCell>Name</TableCell>
                  <TableCell>Icon</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </React.Fragment>
              )}
              renderRow={(amenity: Amenity) => (
                <React.Fragment>
                  <TableCell>{amenity.name}</TableCell>
                  <TableCell>
                    <div className="w-15 h-15  overflow-hidden bg-gray-200 shadow-lg ring-4 ring-white">
                    <img
                      src={amenity.icon || "placeholder.webp"}
                      alt={amenity.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={amenity.status ? "bg-green-500" : "bg-red-500"}>
                {amenity.status ? "Active" : "Inactive"}
              </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                size="sm"
                variant={"outline"}
                className="cursor-pointer"
                onClick={() => {
                  onEditAmenity(amenity);
                }}
              >
                Edit
              </Button>
              <Button
                              size="sm"
                              className={`cursor-pointer ${amenity.status ? "bg-red-500" : "bg-green-500"}`}
                              onClick={() => {
                                if (openStatusChangeModal) {
                                  openStatusChangeModal(amenity);
                                }
                              }}
                            >
                              {amenity.status ? "Disable" : "Enable"}
                            </Button>
                  </TableCell>
                </React.Fragment>
              )}
            />    
        
        </div>
    </React.Fragment>
  );
}