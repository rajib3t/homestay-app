import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCountriesQuery } from "@/locations/queries";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import PaginationRender from "@/components/pagination-render";
import type { Country } from "@/types/location";

export const CountryList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // Fixed limit for simplicity, can be made dynamic

  const { data, isLoading } = useQuery(getCountriesQuery(page, limit)());

  // Normalize response: service returns ApiResponse<T> where payload is in `data`
  const countries = data?.data || [];
  const meta = data?.meta;

  const totalPages = meta?.total ? Math.ceil(meta.total / limit) : 1;
  
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Pagination items rendered by separate component

  return (
    <div className="flex flex-col gap-6 pb-6 border-b">
      <div className="rounded-2xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Dial Code</TableHead>
              <TableHead>Cities</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : countries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No countries found.
                </TableCell>
              </TableRow>
            ) : (
              countries.map((country: Country) => (
                <TableRow key={country.id}>
                  <TableCell className="font-medium">{country.name}</TableCell>
                  <TableCell>{country.code}</TableCell>
                  <TableCell>{country.dial_code}</TableCell>
                  <TableCell>{Array.isArray(country.cities) ? country.cities.length : country.cities}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        country.status ? "default" : "secondary"
                      }
                    >
                      {country.status ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" className="cursor-pointer">
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="cursor-pointer">
                      Disable
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <PaginationRender page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
};