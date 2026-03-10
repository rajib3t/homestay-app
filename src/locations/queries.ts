import { queryOptions } from "@tanstack/react-query"

import {fetchCountries, fetchCountry } from "@/services/location"

export const getCountriesQuery = (page: number, limit: number, sort?: string, sort_order?: string, filter?: {search_field?: string , search_value?: string}) => () =>
   queryOptions({
      queryKey: ["GET_COUNTRIES", page, limit, sort, sort_order, filter],
      queryFn: () => fetchCountries(page, limit, sort, sort_order, filter),
   })

export const getCountryQuery = (id: number) => () =>
   queryOptions({
      queryKey: ["GET_COUNTRY", id],
      queryFn: () => fetchCountry(id),
   })