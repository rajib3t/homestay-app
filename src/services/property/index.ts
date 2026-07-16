import { protectedApi } from "@/lib/api";

import type { ApiError } from "@/lib/api";
import type { PropertyDTO, PropertyListDTO, PropertyResponseDTO } from "@/types/property";
import type { ApiResponse } from '@/types/common'

const getDefaultPropertyPayload = (): PropertyDTO => ({
    vendor: '',
    name: '',
    description: '',
    country: '',
    city: '',
    location: '',
    address: '',
    latitude: 0,
    longitude: 0,
    is_published: false,
    listing_price: 0,
    sale_price: 0,
    is_featured: false,
    star_rating: '',
    tax_name: '',
    tax_percentage: 0,
    check_in_time: '',
    checkout_time: '',
    trade_license: '',
    trade_license_number: '',
    feature_image: '',
    cover_image: '',
    gallery_images: [],
    food_options: [],
    amenities: [],
    facilities: [],
    rooms: [],
})

export const normalizePropertyPayload = (data: Partial<PropertyDTO> = {}): PropertyDTO => {
    const payload: PropertyDTO = {
        ...getDefaultPropertyPayload(),
        ...data,
        latitude: Number.isFinite(Number(data.latitude)) ? Number(data.latitude) : 0,
        longitude: Number.isFinite(Number(data.longitude)) ? Number(data.longitude) : 0,
        listing_price: Number.isFinite(Number(data.listing_price)) ? Number(data.listing_price) : 0,
        sale_price: Number.isFinite(Number(data.sale_price)) ? Number(data.sale_price) : 0,
        tax_percentage: Number.isFinite(Number(data.tax_percentage)) ? Number(data.tax_percentage) : 0,
        feature_image: data.feature_image ?? '',
        cover_image: data.cover_image ?? '',
        trade_license: data.trade_license ?? '',
        trade_license_number: data.trade_license_number ?? '',
        star_rating: data.star_rating ?? '',
        tax_name: data.tax_name ?? '',
        check_in_time: data.check_in_time ?? '',
        checkout_time: data.checkout_time ?? '',
        gallery_images: Array.isArray(data.gallery_images) ? data.gallery_images : [],
        food_options: Array.isArray(data.food_options) ? data.food_options : [],
        amenities: Array.isArray(data.amenities) ? data.amenities : [],
        facilities: Array.isArray(data.facilities) ? data.facilities : [],
        rooms: Array.isArray(data.rooms) ? data.rooms : [],
    }

    return payload
}

export const createProperty = async (data: Partial<PropertyDTO>): Promise<ApiResponse<PropertyDTO>> => {
    try {
        const normalizedData = normalizePropertyPayload(data)
        const response = await protectedApi.post<ApiResponse<PropertyDTO>>("/properties", normalizedData)
        return response.data
    } catch (error) {
        throw error as ApiError
    }
}

export const updateProperty = async (
    propertyId: string,
    data: Partial<PropertyDTO>,
): Promise<ApiResponse<PropertyDTO>> => {
    try {
        const normalizedData = normalizePropertyPayload(data)
        const response = await protectedApi.patch<ApiResponse<PropertyDTO>>(
            `/properties/${propertyId}`,
            normalizedData,
        )
        return response.data
    } catch (error) {
        throw error as ApiError
    }
}

export const fetchProperties = async (page: number, limit: number, sort?: string, sort_order?: string, filter?: SearchParams) => {
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

    const url = `/properties${queryParams}`;
    const response = await protectedApi.get<ApiResponse<PropertyListDTO[]>>(url);

    return response.data as unknown as ApiResponse<PropertyListDTO[]>;




        
}

export const fetchPropertyById = async (propertyId: string): Promise<ApiResponse<PropertyResponseDTO>> => {
    try {
        const response = await protectedApi.get<ApiResponse<PropertyResponseDTO>>(`/properties/${propertyId}`)
        return response.data
    } catch (error) {
        throw error as ApiError
    }   
}
