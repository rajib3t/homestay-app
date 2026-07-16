import React from "react";

import type { PropertyListDTO } from "@/types/property";
import type { PaginatedMeta } from "@/types/common"; // Update the path as needed
import CommonTable from "@/components/common/common-table";
import { TableCell } from "@/components/ui/table";

import { Button } from "@/components/ui/button";
interface PropertyListProps {
  data: PropertyListDTO[];
  isLoading: boolean;
  meta: PaginatedMeta;
  onPageChange: (newPage: number) => void;
  onEditProperty: (property: PropertyListDTO) => void;
  openStatusChangeModal: (property: PropertyListDTO) => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({
  data,
  isLoading,
  meta,
  onPageChange,
  onEditProperty,
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
              keyExtractor={(a: PropertyListDTO) => a.id}
              loadingPlaceholder="Loading properties..."
              emptyPlaceholder="No properties found."
              renderHead={() => (
                <React.Fragment>
                  <TableCell>Name</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Sale Price</TableCell>
                  <TableCell>Actions</TableCell>
                </React.Fragment>
              )}
              renderRow={(property: PropertyListDTO) => (
                <React.Fragment>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-gray-200 rounded shadow-lg">
                        <img
                          src={property.feature_image || "placeholder.webp"}
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span>{property.name}</span>
                    </div>
                  </TableCell>
                
                  <TableCell>{property.location_name}</TableCell>
                  <TableCell>{property.city_name}</TableCell>
                  <TableCell>₹{property.price.toFixed(2)}</TableCell>
                  <TableCell>₹{property.sale_price.toFixed(2)}</TableCell>
                    
                  
                  
                  <TableCell>
                    <Button onClick={() => onEditProperty(property)}>Edit</Button>
                    <Button onClick={() => openStatusChangeModal(property)}>
                     
                    </Button>
                  </TableCell>
                </React.Fragment>
              )}
            />
       </div>
     </React.Fragment>
  );
}
   
 