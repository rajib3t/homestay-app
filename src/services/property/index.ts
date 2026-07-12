import { protectedApi } from "@/lib/api";

import type { ApiError } from "@/lib/api";
import type { PropertyDTO } from "@/types/property";
import type { ApiResponse } from '@/types/common'

export  const createProperty = async (data: Partial<PropertyDTO>): Promise<ApiResponse<PropertyDTO>> => {
    try {
        const response = await protectedApi.post<ApiResponse<PropertyDTO>>("/properties", data);
        return response.data;
    } catch (error) {
        throw error as ApiError;
    }
}