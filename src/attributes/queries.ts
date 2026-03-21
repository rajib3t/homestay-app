import { queryOptions } from "@tanstack/react-query"
import type { SearchParams } from "@/types/common"
import { fetchAmenities, fetchBedTypes, fetchFacilities } from "@/services/attribute"


export const getAmenitiesQuery = (page: number, limit: number, sort?: string, sort_order?: string, filter?: SearchParams) => () =>
   queryOptions({
      queryKey: ["GET_AMENITIES", page, limit, sort, sort_order, filter],
      queryFn: () => fetchAmenities(page, limit, sort, sort_order, filter),
   })


export const getFacilitiesQuery = (page: number, limit: number, sort?: string, sort_order?: string, filter?: SearchParams) => () =>
   queryOptions({
      queryKey: ["GET_FACILITIES", page, limit, sort, sort_order, filter],
      queryFn: () => fetchFacilities(page, limit, sort, sort_order, filter),
   })


export const getBedTypesQuery = (page: number, limit: number, sort?: string, sort_order?: string, filter?: SearchParams) => () =>
   queryOptions({
      queryKey: ["GET_BED_TYPES", page, limit, sort, sort_order, filter],
      queryFn: () => fetchBedTypes(page, limit, sort, sort_order, filter),
   })