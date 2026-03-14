import React from "react";
import { Button } from "@/components/ui/button";

import { TableHead, TableCell } from '@/components/ui/table'

import type { City, Location } from "@/types/location";
import type { PaginatedMeta } from "@/types/common";
import  EditLocationModal  from "@/locations/location/components/edit";
import CommonTable from "@/components/common/common-table";

interface LocationListProps {
  data?: Location[];
  isLoading?: boolean;
  meta?: PaginatedMeta;
  
  openEditLocationModal: boolean;
  setOpenEditLocationModal?: (open: boolean) => void;
  onPageChange: (newPage: number) => void;
  onEditModalOpen: (location: Location) => Promise<Location | void> | Location | void;
  onUpdateLocation?: (updatedLocation: Location) => void;
  
  onSortChange?: (sortBy: string, order: 'asc' | 'desc') => void;
  currentSort?: string | null;
  currentOrder?: string | null;
  validationErrors?: Record<string, string[]>;
  
}

export const LocationList: React.FC<LocationListProps> = ({
  data,
  isLoading,
  meta,
  onPageChange,
  openEditLocationModal,
  setOpenEditLocationModal,
  onEditModalOpen,
  onUpdateLocation,
 
  onSortChange,
  currentSort,
  currentOrder,
  validationErrors,
  
}) => {
  const [selectedLocation, setSelectedLocation] = React.useState<Location | null>(null);
  

    console.log("LocationList render", { data, isLoading, meta, currentSort, currentOrder, openEditLocationModal , onUpdateLocation, validationErrors, selectedLocation});
  return (
    <div className="flex flex-col gap-6 pb-6 border-b">
      <CommonTable
        data={data}
        isLoading={isLoading}
        meta={meta}
        onPageChange={onPageChange}
        keyExtractor={(c: Location) => c.id}
        loadingPlaceholder="Loading locations..."
        emptyPlaceholder="No locations found."
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
                  const col = 'country'
                  const current = currentSort === col ? (currentOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                  onSortChange?.(col, current as 'asc' | 'desc')
                }}
                className="flex items-center gap-2"
              >
                Country
                {currentSort === 'country' ? (currentOrder === 'asc' ? '▲' : '▼') : ''}
              </Button>
            </TableHead>

            <TableHead>City</TableHead>
            
            <TableHead className="text-right">Action</TableHead>
          </React.Fragment>
        )}
        renderRow={(location: Location) => (
          <React.Fragment >
            <TableCell className="font-medium">
              <div className="flex items-center gap-4">
                <div className="relative">
                
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-white" />
                </div>

                <div className="flex flex-col">
                  <span className=" text-slate-700">{location.name}</span>
                </div>
              </div>
            </TableCell>

            <TableCell>{location.country}</TableCell>
            <TableCell>{location.city}</TableCell>
            

            <TableCell className="text-right space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer"
                onClick={async () => {
                  const maybe = onEditModalOpen?.(location);
                  let resolved: Location | void;
                  if (maybe && typeof (maybe as any)?.then === 'function') {
                    resolved = await (maybe as Promise<Location | void>);
                  } else {
                    resolved = maybe as Location | void;
                  }
                  setSelectedLocation((resolved as Location) || location);
                  if (setOpenEditLocationModal) setOpenEditLocationModal(true);
                }}
              >
                Edit
              </Button>
            </TableCell>
          </React.Fragment>
        )}
      />

      {/* EDIT LOCATION MODAL */}
      {openEditLocationModal && selectedLocation && (
        <React.Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="animate-pulse text-white text-lg">Loading...</div>
          </div>
        }>
            <EditLocationModal
            location={selectedLocation}
            onOpenChange={(open: boolean) => {
              if (setOpenEditLocationModal) setOpenEditLocationModal(open);
              if (!open) setSelectedLocation(null);
            }}
            onSave={(updatedLocation: Location) => {
              if (onUpdateLocation) onUpdateLocation(updatedLocation);
            }}
            validationErrors={validationErrors}
          />
        </React.Suspense>
      )}
      {/* END EDIT LOCATION MODAL */}
    </div>
  );
}
 