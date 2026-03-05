import { protectedApi } from "@/lib/api";
import type { ApiResponse } from "@/types/common";

import type { CreateCountryDTO , Country } from "@/types/location";

export const createCountry = (payload: CreateCountryDTO) => {
    const { name, code, dialCode } = payload;
    return protectedApi.post<ApiResponse<Country>>('/locations/country', { name, code, dial_code: Number(dialCode) });
}


export const fetchCountries = async (page: number, limit: number) => {
    const url = `/locations/countries?page=${page}&size=${limit}`;
    const res: any = await protectedApi.get<any>(url);

    // Normalize wrapper (handle axios-like `res.data` or direct body)
    const body = res && res.data ? res.data : res;

    // The backend returns an object with pagination fields and `data` array inside `data`:
    // { data: { total, page, size, data: [...] }, success }
    const paginated = body && body.data && Array.isArray(body.data.data) ? body.data : body;

    const items: any[] = Array.isArray(paginated.data) ? paginated.data : Array.isArray(paginated) ? paginated : [];

    const mapped: Country[] = items.map((c: any) => ({
        id: typeof c.id === 'number' ? c.id : c.id,
        name: c.name,
        code: c.code,
        dialCode: c.dial_code != null ? `+${c.dial_code}` : (c.dialCode ?? ''),
        cities: Array.isArray(c.cities) ? c.cities.length : (typeof c.cities === 'number' ? c.cities : 0),
        status: c.status === true || c.status === 'true' ? 'Active' : 'Inactive',
    }));

    const apiResponse: ApiResponse<Country[]> = {
        success: body?.success ?? true,
        data: mapped,
        message: body?.message,
        meta: {
            total: paginated?.total ?? body?.total,
            page: paginated?.page ?? body?.page,
            limit: paginated?.size ?? body?.size,
            totalPages: paginated?.totalPages ?? body?.totalPages,
            hasNextPage: paginated?.hasNextPage ?? body?.hasNextPage,
            hasPrevPage: paginated?.hasPrevPage ?? body?.hasPrevPage,
        },
    };

    return apiResponse;
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
        dialCode: raw.dial_code != null ? `+${raw.dial_code}` : (raw.dialCode ?? ''),
        cities: Array.isArray(raw.cities) ? raw.cities.length : (typeof raw.cities === 'number' ? raw.cities : 0),
        status: raw.status === true || raw.status === 'true' ? 'Active' : 'Inactive',
    };

    const apiResponse: ApiResponse<Country> = {
        success: body?.success ?? true,
        data: mapped,
        message: body?.message,
    };

    return apiResponse;
}