import { protectedApi } from "@/lib/api";
import type { Amenity, CreateAmenityDTO, FacilityDTO, UpdateAmenityDTO, Facility, BedTypeDTO, BedType } from "@/types/attribute/index.";
import type { ApiResponse } from "@/types/common";


export const createAmenity = (payload: CreateAmenityDTO) => {
  const { name, icon } = payload;
  return protectedApi.post<ApiResponse<Amenity>>('/attributes/amenity', { name, icon });
}


export const fetchAmenities = async (
  page: number,
  limit: number,
  sort?: string,
  sort_order?: string,
  filter?: SearchParams
) => {
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

  const url = `/attributes/amenities${queryParams}`;

  const response = await protectedApi.get<ApiResponse<Amenity[]>>(url);

  return response.data as ApiResponse<Amenity[]>;
};

export const updateAmenity = (id: string, payload: UpdateAmenityDTO) => {

  const { name, icon } = payload;
  if (icon && icon.startsWith("data:")) {
    // If the icon is a base64 string, we can send it directly
    return protectedApi.patch<ApiResponse<Amenity>>(`/attributes/amenity/${id}`, { name, icon });
  }else {
    // If the icon is a URL, we should send it as is
    return protectedApi.patch<ApiResponse<Amenity>>(`/attributes/amenity/${id}`, { name, icon:null });
  }
  
  
}

export const statusChangeAmenity = (id: string, status: boolean) => {
  return protectedApi.patch<ApiResponse<Amenity>>(`/attributes/amenity/${id}/status`, { status });
}

export const createFacility = (payload: FacilityDTO) => {
  const { name, icon } = payload;
  return protectedApi.post<ApiResponse<Facility>>('/attributes/facility', { name, icon });
}

export const fetchFacilities = async (
  page: number,
  limit: number,
  sort?: string,
  sort_order?: string,
  filter?: SearchParams
) => {
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

  const url = `/attributes/facilities${queryParams}`;

  const response = await protectedApi.get<ApiResponse<Facility[]>>(url);

  return response.data as ApiResponse<Facility[]>;
};


export const updateFacility = (id: string, payload: FacilityDTO) => {
  const { name, icon } = payload;
  if (icon && icon.startsWith("data:")) {
    // If the icon is a base64 string, we can send it directly
    return protectedApi.patch<ApiResponse<Facility>>(`/attributes/facility/${id}`, { name, icon });
  }else {
    // If the icon is a URL, we should send it as is
    return protectedApi.patch<ApiResponse<Facility>>(`/attributes/facility/${id}`, { name, icon:null });
  }
}



export const statusChangeFacility = (id: string, status: boolean) => {
  return protectedApi.patch<ApiResponse<Facility>>(`/attributes/facility/${id}/status`, { status });
}


export const createBedType = (payload: BedTypeDTO) => {
  const { name, capacity } = payload;
  return protectedApi.post<ApiResponse<BedType>>('/attributes/room-type', { name, capacity });
}


export const fetchBedTypes = async (
  page: number,
  limit: number,
  sort?: string,
  sort_order?: string,
  filter?: SearchParams
) => {
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

  const url = `/attributes/room-types${queryParams}`;

  const response = await protectedApi.get<ApiResponse<BedType[]>>(url);

  return response.data as ApiResponse<BedType[]>;
};

export const updateBedType = (id: string, payload: BedTypeDTO) => {
  const { name, capacity } = payload;
  return protectedApi.patch<ApiResponse<BedType>>(`/attributes/room-type/${id}`, { name, capacity });
}

export const statusChangeBedType = (id: string, status: boolean) => {
  return protectedApi.patch<ApiResponse<BedType>>(`/attributes/room-type/${id}/status`, { status });
}