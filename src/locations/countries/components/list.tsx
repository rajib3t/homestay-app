import React from "react";
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
import type { Country } from "@/types/location";

export const CountryList: React.FC = () => {
  const page = 1;
  const limit = 10;

  const { data, isLoading, isError } = useQuery(getCountriesQuery(page, limit)());

  console.log(data);
  
  // Normalize response: service returns ApiResponse<T> where payload is in `data`
  const countries =
    (data && Array.isArray((data as any).data) && (data as any).data) || [];

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
            {countries.map((country: Country) => (
              <TableRow key={country.id}>
                <TableCell className="font-medium">
                  {country.name}
                </TableCell>
                <TableCell>{country.code}</TableCell>
                <TableCell>{country.dialCode}</TableCell>
                <TableCell>{country.cities}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      country.status === "Active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {country.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};