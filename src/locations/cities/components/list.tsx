import React from "react";
import { Button } from "@/components/ui/button";

import { TableHead, TableCell } from '@/components/ui/table'

import type { City } from "@/types/location";
import type { PaginatedMeta } from "@/types/common";
import  EditCityModal  from "@/locations/cities/components/edit";
import CommonTable from "@/components/common/common-table";

interface CityListProps {
  data?: City[];
  isLoading?: boolean;
  meta?: PaginatedMeta;
  
  openEditCityModal: boolean;
  setOpenEditCityModal?: (open: boolean) => void;
  onPageChange: (newPage: number) => void;
  onEditModalOpen: (city: City) => Promise<City | void> | City | void;
  onUpdateCity?: (updatedCity: City) => void;
  
  onSortChange?: (sortBy: string, order: 'asc' | 'desc') => void;
  currentSort?: string | null;
  currentOrder?: string | null;
  validationErrors?: Record<string, string[]>;
  
}

export const CityList: React.FC<CityListProps> = ({
  data,
  isLoading,
  meta,
  onPageChange,
  openEditCityModal,
  setOpenEditCityModal,
  onEditModalOpen,
  onUpdateCity,
 
  onSortChange,
  currentSort,
  currentOrder,
  validationErrors,
  
}) => {
  const [selectedCity, setSelectedCity] = React.useState<City | null>(null);
  


  return (
    <div className="flex flex-col gap-6 pb-6 border-b">
      <CommonTable
        data={data}
        isLoading={isLoading}
        meta={meta}
        onPageChange={onPageChange}
        keyExtractor={(c: City) => c.id}
        loadingPlaceholder="Loading cities..."
        emptyPlaceholder="No cities found."
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

            <TableHead>Locations</TableHead>
            <TableHead>Is Popular</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </React.Fragment>
        )}
        renderRow={(city: City) => (
          <React.Fragment >
            <TableCell className="font-medium">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shadow-lg ring-4 ring-white">
                    <img
                      src={city.image || "placeholder.webp"}
                      alt={city.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-white" />
                </div>

                <div className="flex flex-col">
                  <span className=" text-slate-700">{city.name}</span>
                </div>
              </div>
            </TableCell>

            <TableCell>{city.country}</TableCell>
            <TableCell>{city.location_count ?? 0}</TableCell>
            <TableCell>{city.is_popular ? "Yes" : "No"}</TableCell>

            <TableCell className="text-right space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer"
                onClick={async () => {
                  const maybe = onEditModalOpen?.(city);
                  let resolved: City | void;
                  if (maybe && typeof (maybe as any)?.then === 'function') {
                    resolved = await (maybe as Promise<City | void>);
                  } else {
                    resolved = maybe as City | void;
                  }
                  setSelectedCity((resolved as City) || city);
                  if (setOpenEditCityModal) setOpenEditCityModal(true);
                }}
              >
                Edit
              </Button>
            </TableCell>
          </React.Fragment>
        )}
      />

      {/* EDIT CITY MODAL */}
      {openEditCityModal && selectedCity && (
        <React.Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="animate-pulse text-white text-lg">Loading...</div>
          </div>
        }>
            <EditCityModal
            city={selectedCity}
            onOpenChange={(open: boolean) => {
              if (setOpenEditCityModal) setOpenEditCityModal(open);
              if (!open) setSelectedCity(null);
            }}
            onSave={(updatedCity: City) => {
              if (onUpdateCity) onUpdateCity(updatedCity);
            }}
            validationErrors={validationErrors}
          />
        </React.Suspense>
      )}
      {/* END EDIT CITY MODAL */}
    </div>
  );
}
 