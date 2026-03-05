import { queryOptions } from "@tanstack/react-query"

import {fetchCountries, fetchCountry } from "@/services/location"

export const getCountriesQuery = (page: number, limit: number) => () =>
   queryOptions({
      queryKey: ["GET_COUNTRIES", page, limit],
      queryFn: () => fetchCountries(page, limit),
   })

export const getCountryQuery = (id: number) => () =>
   queryOptions({
      queryKey: ["GET_COUNTRY", id],
      queryFn: () => fetchCountry(id),
   })