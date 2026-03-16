import { queryOptions } from "@tanstack/react-query"
import type { SearchParams } from "@/types/common"
import { fetchAmenities } from "@/services/attribute"


export const getAmenitiesQuery = (page: number, limit: number, sort?: string, sort_order?: string, filter?: SearchParams) => () =>
   queryOptions({
      queryKey: ["GET_AMENITIES", page, limit, sort, sort_order, filter],
      queryFn: () => fetchAmenities(page, limit, sort, sort_order, filter),
   })