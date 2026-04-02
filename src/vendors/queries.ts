import { queryOptions } from "@tanstack/react-query"
import type { SearchParams } from "@/types/common"
import { fetchUsers } from "@/services/user"



 export const getVendorsQuery = (page: number, limit: number, sort?: string, sort_order?: string, filter?: SearchParams) => () => {
   
    return queryOptions({
      queryKey: ["GET_VENDORS", page, limit, sort, sort_order, filter],
      queryFn: () => fetchUsers(page, limit, sort, sort_order, filter),
    })
}