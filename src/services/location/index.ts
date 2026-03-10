import { protectedApi } from "@/lib/api";
import type { ApiResponse } from "@/types/common";

import type { CreateCountryDTO , Country, UpdateCountryDTO } from "@/types/location";

export const createCountry = (payload: CreateCountryDTO) => {
    const { name, code, dial_code } = payload;
    return protectedApi.post<ApiResponse<Country>>('/locations/country', { name, code, dial_code: Number(dial_code) });
}

export const updateCountry = (id: string, payload: UpdateCountryDTO) => {
    const { name, code, dial_code } = payload;
    return protectedApi.patch<ApiResponse<Country>>(`/locations/country/${id}`, { name, code, dial_code: dial_code ? Number(dial_code) : undefined });
}

export const statusChangeCountry = (id: string, status: boolean) => {
    return protectedApi.patch<ApiResponse<Country>>(`/locations/country/${id}/status`, { status });
}


export const fetchCountries = async (page: number, limit: number) => {
    const url = `/locations/countries?page=${page}&size=${limit}`;
     const response = await protectedApi.get<ApiResponse<Country[]>>(url);

     return response.data as unknown as ApiResponse<Country[]>;
    
}

export const fetchCountry = async (id: number) => {
    const url = `/locations/country/${id}`;
    const res: any = await protectedApi.get<any>(url);
    const body = res && res.data ? res.data : res;
    const raw = body && body.data ? body.data : body;

    const mapped: Country = {
        id: typeof raw.id === 'number' ? raw.id : raw.id,
        name: raw.name,
        code: raw.code,
        dial_code: raw.dial_code != null ? `+${raw.dial_code}` : (raw.dial_code ?? ''),
        cities: Array.isArray(raw.cities) ? raw.cities.length : (typeof raw.cities === 'number' ? raw.cities : 0),
        status: raw.status === true || raw.status === 'true',
    };

    const apiResponse: ApiResponse<Country> = {
        success: body?.success ?? true,
        data: mapped,
        message: body?.message,
    };

    return apiResponse;
}