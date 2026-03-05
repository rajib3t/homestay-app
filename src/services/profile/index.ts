
import { protectedApi } from "@/lib/api";

import type { ApiError } from "@/lib/api";
import type { UserData } from "@/types/user";
import type { ApiResponse } from '@/types/common'


export const fetchUserProfile = async (): Promise<ApiResponse<UserData>> => {
    try {
        const response = await protectedApi.get<ApiResponse<UserData>>("/profile");
        return response.data;
    } catch (error) {
        throw error as ApiError;
    }
};


export const updateUserProfile = async (
    data: Partial<UserData>
): Promise<ApiResponse<UserData>> => {
    try {
        const response = await protectedApi.put<ApiResponse<UserData>>(
            "/profile",
            data
        );
        return response.data;
    } catch (error) {
        throw error as ApiError;
    }
};