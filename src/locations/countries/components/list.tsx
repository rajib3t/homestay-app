import React from "react";
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
import type { PaginatedMeta } from "@/types/common";

interface CountryListProps {
  data?: Country[];
  isLoading?: boolean;
  meta?: PaginatedMeta;
  onPageChange: (newPage: number) => void;
}

export const CountryList: React.FC<CountryListProps> = ({
  data,
  isLoading,
  meta,
  onPageChange,
}) => {
  const totalPages =
    meta?.total && meta?.size ? Math.ceil(meta.total / meta.size) : 1;

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
                  <div className="animate-pulse text-muted-foreground">
                    Loading countries...
                  </div>
                </TableCell>
              </TableRow>
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No countries found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((country) => (
                <TableRow key={country.id}>
                  <TableCell className="font-medium">
                    {country.name}
                  </TableCell>

                  <TableCell>{country.code}</TableCell>

                  <TableCell>{country.dial_code}</TableCell>

                  <TableCell>{Array.isArray(country.cities) ? country.cities.length : 0}</TableCell>

                  <TableCell>
                    <Badge variant={country.status ? "default" : "secondary"}>
                      {country.status ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="cursor-pointer"
                    >
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
        <PaginationRender
          page={meta?.page ?? 1}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};