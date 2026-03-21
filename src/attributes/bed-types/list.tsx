import React from "react";
import type { BedType } from "@/types/attribute/index.";
import CommonTable from "@/components/common/common-table";
import { TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BedTypeListProps {
  data: BedType[];
  isLoading: boolean;
  meta: PaginatedMeta;
  onPageChange: (newPage: number) => void;
  onEditBedType: (bedType: BedType) => void;
  openStatusChangeModal: (bedType: BedType) => void;
}


export const BedTypeList: React.FC<BedTypeListProps> = ({
  data,
  isLoading,
  meta,
  onPageChange,
  onEditBedType,
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
              keyExtractor={(a: BedType) => a.id}
              loadingPlaceholder="Loading bed types..."
              emptyPlaceholder="No bed types found."
              renderHead={() => (
                <React.Fragment>
                  <TableCell>Name</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell className="text-right">Actions</TableCell>
                </React.Fragment>
              )}
              renderRow={(bedType: BedType) => (
                    <React.Fragment>
                      <TableCell>{bedType.name}</TableCell>
                      <TableCell>{bedType.capacity}</TableCell>
                      <TableCell>
                        <Badge className={bedType.status ? "bg-green-500" : "bg-red-500"}>
                          {bedType.status ? "Active" : "Inactive"}
                        </Badge>
                        
                      </TableCell>
                      
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant={"outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            onEditBedType(bedType);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          className={`cursor-pointer ${bedType.status ? "bg-red-500" : "bg-green-500"}`}
                          onClick={() => {
                            openStatusChangeModal(bedType);
                          }}
                        >
                          {bedType.status ? "Disable" : "Enable"}
                        </Button>
                      </TableCell>
                    </React.Fragment>
              )}
            />    
        
        </div>
    </React.Fragment>
  );
}