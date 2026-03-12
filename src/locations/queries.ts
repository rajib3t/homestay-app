import { queryOptions } from "@tanstack/react-query"
import type { SearchParams } from "@/types/common"
import { fetchCities, fetchCity, fetchCountries, fetchCountry } from "@/services/location"

export const getCountriesQuery = (page: number, limit: number, sort?: string, sort_order?: string, filter?: SearchParams) => () =>
   queryOptions({
      queryKey: ["GET_COUNTRIES", page, limit, sort, sort_order, filter],
      queryFn: () => fetchCountries(page, limit, sort, sort_order, filter),
   })

export const getCountryQuery = (id: number) => () =>
   queryOptions({
      queryKey: ["GET_COUNTRY", id],
      queryFn: () => fetchCountry(id),
   })


export const getCitiesQuery = (page: number, limit: number, sort?: string, sort_order?: string, filter?: SearchParams) => () =>
   queryOptions({
      queryKey: ["GET_CITIES", page, limit, sort, sort_order, filter],
      queryFn: () => fetchCities(page, limit, sort, sort_order, filter),
   })

export const getCityQuery = (id: string) => () =>
   queryOptions({
      queryKey: ["GET_CITY", id],
      queryFn: () => fetchCity(id),
   })