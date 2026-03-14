import { protectedApi } from "@/lib/api";
import type { ApiResponse } from "@/types/common";

import type { CreateCountryDTO, Country, UpdateCountryDTO, CreateCityDTO, City, UpdateCityDTO, CreateLocationDTO, Location } from "@/types/location";


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


export const fetchCountries = async (
  page: number,
  limit: number,
  sort?: string,
  sort_order?: string,
  filter?: SearchParams
) => {
  let queryParams = `?page=${page}&limit=${limit}`;

  if (sort) {
    queryParams += `&sort=${encodeURIComponent(sort)}`;
  }

  if (sort_order) {
    queryParams += `&sort_order=${encodeURIComponent(sort_order)}`;
  }

  if (filter?.filter && filter.filter.length > 0) {
    filter.filter.forEach((item) => {
      if (!item?.search_field || !item?.search_value) return;
      queryParams += `&${encodeURIComponent(item.search_field)}=${encodeURIComponent(item.search_value)}`;
    });
  }

  const url = `/locations/countries${queryParams}`;

  const response = await protectedApi.get<ApiResponse<Country[]>>(url);

  return response.data as ApiResponse<Country[]>;
};

export const fetchCountry = async (id: string) => {
  const url = `/locations/country/${id}`;
  const res: any = await protectedApi.get<any>(url);
  const body = res && res.data ? res.data : res;
  const raw = body && body.data ? body.data : body;

  const mapped: Country = {
    id: typeof raw.id === 'number' ? String(raw.id) : raw.id,
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


export const createCity = async (payload: CreateCityDTO) => {
  const { name, country, is_popular, image } = payload;
  return protectedApi.post<ApiResponse<City>>('/locations/city', { name, country: country, is_popular, image });
}

export const fetchCities = async (page: number, limit: number, sort?: string, sort_order?: string, filter?: SearchParams) => {
  let queryParams = `?page=${page}&size=${limit}`;

  if (sort) {
    queryParams += `&sort=${encodeURIComponent(sort)}`;
  }

  if (sort_order) {
    queryParams += `&sort_order=${encodeURIComponent(sort_order)}`;
  }

  if (filter?.filter && filter.filter.length > 0) {
    filter.filter.forEach((item) => {
      if (!item?.search_field || !item?.search_value) return;
      queryParams += `&${encodeURIComponent(item.search_field)}=${encodeURIComponent(item.search_value)}`;
    });
  }

  const url = `/locations/cities${queryParams}`;
  const response = await protectedApi.get<ApiResponse<City[]>>(url);

  return response.data as unknown as ApiResponse<City[]>;
};

export const fetchCity = async (id: string) => {
  const url = `/locations/city/${id}`;
  const res: any = await protectedApi.get<any>(url);
  const body = res && res.data ? res.data : res;
  const raw = body && body.data ? body.data : body;

  const mapped: City = {
    id: typeof raw.id === 'number' ? String(raw.id) : raw.id,
    name: raw.name,
    country: raw.country,
    is_popular: raw.is_popular === true || raw.is_popular === 'true',
    image: raw.image ?? null,
  };

  const apiResponse: ApiResponse<City> = {
    success: body?.success ?? true,
    data: mapped,
    message: body?.message,
  };

  return apiResponse;
};

export const updateCity = async (id: string, payload: UpdateCityDTO) => {
  const { name, country, is_popular, image } = payload;
  return protectedApi.patch<ApiResponse<City>>(`/locations/city/${id}`, { name, country: country, is_popular, image });
};


export const createLocation = async (payload: CreateLocationDTO) => {
  const { name, country, city } = payload;
  return protectedApi.post<ApiResponse<Location>>('/locations/create', { name, country, city });
}

export const updateLocation = async (id: string | number, payload: Partial<Location>) => {
  return protectedApi.patch<ApiResponse<Location>>(`/locations/update/${id}`, payload);
}

export const fetch_city_by_country = async (country: string) => {
  const url = `/locations/country/${encodeURIComponent(country)}/cities`;
  const response = await protectedApi.get<ApiResponse<City[]>>(url);
  return response.data as unknown as ApiResponse<City[]>;
}

export const fetchLocations = async (page: number, limit: number, sort?: string, sort_order?: string, filter?: SearchParams) => {
    let queryParams = `?page=${page}&size=${limit}`;

    if (sort) {
      queryParams += `&sort=${encodeURIComponent(sort)}`;
    }

    if (sort_order) {
      queryParams += `&sort_order=${encodeURIComponent(sort_order)}`;
    }

    if (filter?.filter && filter.filter.length > 0) {
      filter.filter.forEach((item) => {
        if (!item?.search_field || !item?.search_value) return;
        queryParams += `&${encodeURIComponent(item.search_field)}=${encodeURIComponent(item.search_value)}`;
      });
    }

    const url = `/locations/locations${queryParams}`;
    const response = await protectedApi.get<ApiResponse<Location[]>>(url);

    return response.data as unknown as ApiResponse<Location[]>;
}

export const fetchLocation = async (id: string) => {
    const url = `/locations/location/${id}`;
    const res = await protectedApi.get<Location>(url);
    
    return res.data as unknown as ApiResponse<Location>;
}