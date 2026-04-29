import React, { useState } from "react";
import { Button } from "@/components/ui/button";

import { TableHead, TableCell } from '@/components/ui/table'

import type { PaginatedMeta } from "@/types/common";
// import  EditCityModal  from "@/locations/cities/components/edit";
import CommonTable from "@/components/common/common-table";
import type { UserData } from "@/types/user";
import Avatar from "@/components/common/avatar";
interface VendorListProps {
  data?: UserData[];
  isLoading?: boolean;
  meta?: PaginatedMeta;
  
 
  onEditVendor?: (vendor: UserData) => void;
  onPageChange: (newPage: number) => void;
 
 
  
  onSortChange?: (sortBy: string, order: 'asc' | 'desc') => void;
  currentSort?: string | null;
  currentOrder?: string | null;
  validationErrors?: Record<string, string[]>;
  
}

const VendorList: React.FC<VendorListProps> = ({
  data,
  isLoading,
  meta,
  onPageChange,
  

 
 
  onSortChange,
  onEditVendor,
  currentSort,
  currentOrder,
  
  
}) => {
 const [imgError, setImgError] = useState(false);
  


  return (
    <div className="flex flex-col gap-6 pb-6 border-b">
      <CommonTable
        data={data}
        isLoading={isLoading}
        meta={meta}
        onPageChange={onPageChange}
        keyExtractor={(c: UserData) => c.id}
        loadingPlaceholder="Loading vendors..."
        emptyPlaceholder="No vendors found."
        renderHead={() => (
          <React.Fragment>
            <TableHead>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  const col = 'name'
                  const current = currentSort === col ? (currentOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                  onSortChange?.(col, current as 'asc' | 'desc')
                }}
                className="flex items-center gap-2"
              >
                Name
                {currentSort === 'name' ? (currentOrder === 'asc' ? '▲' : '▼') : ''}
              </Button>
            </TableHead>

            <TableHead>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  const col = 'email'
                  const current = currentSort === col ? (currentOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                  onSortChange?.(col, current as 'asc' | 'desc')
                }}
                className="flex items-center gap-2"
              >
                Email
                {currentSort === 'email' ? (currentOrder === 'asc' ? '▲' : '▼') : ''}
              </Button>
            </TableHead>

            <TableHead>Mobile</TableHead>
            
            <TableHead className="text-right">Action</TableHead>
          </React.Fragment>
        )}
        renderRow={(vendor: UserData) => (
          <React.Fragment >
            <TableCell className="font-medium">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar src={vendor?.image} firstName={vendor?.first_name} lastName={vendor?.last_name} size={40} className="shadow-lg ring-4 ring-white" />
                  {/*    */}
                </div>

                <div className="flex flex-col">
                  <span className=" text-slate-700">{vendor?.first_name + ' ' + vendor?.last_name}</span>
                </div>
              </div>
            </TableCell>

            <TableCell>{vendor?.email}</TableCell>
            <TableCell>{vendor?.mobile}</TableCell>
            

            <TableCell className="text-right space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onEditVendor?.(vendor)}
              >
                Edit
              </Button>
            </TableCell>
          </React.Fragment>
        )}
      />

    </div>
  );
}
 

export default VendorList;