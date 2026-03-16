import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { TableHead, TableCell } from '@/components/ui/table'

import type { Country } from "@/types/location";
import type { PaginatedMeta } from "@/types/common";
import  EditCountryModal  from "./edit";
import CommonTable from "@/components/common/common-table";

interface CountryListProps {
  data?: Country[];
  isLoading?: boolean;
  meta?: PaginatedMeta;
  
  openEditCountryModal: boolean;
  onPageChange: (newPage: number) => void;
  setOpenEditCountryModal: (open: boolean) => void;
  onUpdateCountry?: (updatedCountry: Country) => void;
  openStatusChangeModal?: (country: Country) => void;
  onSortChange?: (sortBy: string, order: 'asc' | 'desc') => void;
  currentSort?: string | null;
  currentOrder?: string | null;
  
}

export const CountryList: React.FC<CountryListProps> = ({
  data,
  isLoading,
  meta,
  onPageChange,
  openEditCountryModal,
  setOpenEditCountryModal,
  onUpdateCountry,
  openStatusChangeModal,
  onSortChange,
  currentSort,
  currentOrder,
  
}) => {
  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(null);
  


  return (
    <div className="flex flex-col gap-6 pb-6 border-b">
      <CommonTable
        data={data}
        isLoading={isLoading}
        meta={meta}
        onPageChange={onPageChange}
        keyExtractor={(c: Country) => c.id}
        loadingPlaceholder="Loading countries..."
        emptyPlaceholder="No countries found."
        renderHead={() => (
          <React.Fragment>
            <TableHead>
              <button
                type="button"
                onClick={() => {
                  const col = 'name'
                  const current = currentSort === col ? (currentOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                  onSortChange?.(col, current as 'asc' | 'desc')
                }}
                className="flex items-center gap-2"
              >
                Name
                {currentSort === 'name' ? (currentOrder === 'asc' ? '▲' : '▼') : ''}
              </button>
            </TableHead>

            <TableHead>
              <button
                type="button"
                onClick={() => {
                  const col = 'code'
                  const current = currentSort === col ? (currentOrder === 'asc' ? 'desc' : 'asc') : 'asc'
                  onSortChange?.(col, current as 'asc' | 'desc')
                }}
                className="flex items-center gap-2"
              >
                Code
                {currentSort === 'code' ? (currentOrder === 'asc' ? '▲' : '▼') : ''}
              </button>
            </TableHead>

            <TableHead>Dial Code</TableHead>
            <TableHead>Cities</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </React.Fragment>
        )}
        renderRow={(country: Country) => (
          <React.Fragment>
            <TableCell className="font-medium">{country.name}</TableCell>
            <TableCell>{country.code}</TableCell>
            <TableCell>{country.dial_code}</TableCell>
            <TableCell>{country.city_count ?? 0}</TableCell>
            <TableCell>
              <Badge className={country.status ? "bg-green-500" : "bg-red-500"}>
                {country.status ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  setSelectedCountry(country);
                  setOpenEditCountryModal(true);
                }}
              >
                Edit
              </Button>

              <Button
                size="sm"
                className={`cursor-pointer ${country.status ? "bg-red-500" : "bg-green-500"}`}
                onClick={() => {
                  if (openStatusChangeModal) {
                    openStatusChangeModal(country);
                  }
                }}
              >
                {country.status ? "Disable" : "Enable"}
              </Button>
            </TableCell>
          </React.Fragment>
        )}
      />

      {/* EDIT COUNTRY MODAL */}
      {openEditCountryModal && selectedCountry && (
        <React.Suspense fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="animate-pulse text-white text-lg">Loading...</div>
          </div>
        }>
          <EditCountryModal
            country={selectedCountry}
            onOpenChange={(open: boolean) => {
              setOpenEditCountryModal(open);
              if (!open) setSelectedCountry(null);
            }}
            onSave={(updatedCountry: Country) => {
              // close modal and clear selection. Caller can handle persistence elsewhere.
              setOpenEditCountryModal(false);
              setSelectedCountry(null);
              if (onUpdateCountry) onUpdateCountry(updatedCountry);
            }}
           />
        </React.Suspense>
      )}
      {/* END EDIT COUNTRY MODAL */}
    </div>
  );
}
 