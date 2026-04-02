import { protectedApi } from "@/lib/api";

import type { ApiError } from "@/lib/api";
import type { CreateUserData, UserData } from "@/types/user";
import type { ApiResponse } from '@/types/common' 


export const createUser = async (userData: Partial<CreateUserData>): Promise<ApiResponse<UserData>> => {
    try {
        const response = await protectedApi.post<ApiResponse<UserData>>("/users/", userData);
        return response.data;
    } catch (error) {
        throw error as ApiError;
    }
};


export const fetchUsers = async (
    page: number,
    limit: number,
    sort?: string,
    sort_order?: string,
    filter?: SearchParams
): Promise<ApiResponse<UserData[]>> => {
   let queryParams = `?page=${page}&size=${limit}`;
   
     if (sort) {
       queryParams += `&sort=${encodeURIComponent(sort)}`;
     }
   
     if (sort_order) {
       queryParams += `&sort_order=${encodeURIComponent(sort_order)}`;
     }
   
     console.log("Filter in fetchUsers:", filter);
     if (filter?.filter && filter.filter.length > 0) {
       filter.filter.forEach((item) => {
         if (!item?.search_field || !item?.search_value) return;
         queryParams += `&${encodeURIComponent(item.search_field)}=${encodeURIComponent(item.search_value)}`;
       });
     }

    
   
     const url = `/users/${queryParams}`;
     console.log("Fetching users with URL:", url);
     const response = await protectedApi.get<ApiResponse<UserData[]>>(url);
   
     return response.data as unknown as ApiResponse<UserData[]>;
};