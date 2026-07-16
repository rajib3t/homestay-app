import { queryOptions } from "@tanstack/react-query"
import type { SearchParams } from "@/types/common"
import { fetchProperties, fetchPropertyById } from "@/services/property"
export const getPropertiesQuery = (page: number, limit: number, sort?: string, sort_order?: string, filter?: SearchParams) => () =>
   queryOptions({
      queryKey: ["GET_PROPERTIES", page, limit, sort, sort_order, filter],
      queryFn: () => fetchProperties(page, limit, sort, sort_order, filter),
   })


export const getPropertyByIdQuery = (propertyId: string) => () =>
   queryOptions({
      queryKey: ["GET_PROPERTY_BY_ID", propertyId],
      queryFn: () => fetchPropertyById(propertyId),
   })