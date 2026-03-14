export interface Country {
    id: number;
    name: string;
    code: string;
    dial_code: string;
    cities: [] // Can be an array of city names or a count of cities
    status: boolean
    city_count?: number; // Optional field to store the count of cities if cities is an array
}

export interface CreateCountryDTO {
    name: string;
    code: string;
    dial_code: string;
}

export interface CreateCityDTO {
    name: string;
    // frontend may provide either the country name or an id; backend expects `country` name
    country?: string;
    country_id?: string; // kept for compatibility with existing components
    is_popular?: boolean;
    // image can be a base64 string or a File when uploading
    image?: string | File | null;
}

export interface UpdateCityDTO {
    name?: string;
    country?: string;
    is_popular?: boolean;
    image?: string | File | null;
}

export interface UpdateCountryDTO {
    name?: string;
    code?: string;
    dial_code?: string;


}

export interface City {
    id: string;
    name: string;
    country: string;
    is_popular: boolean;
    image?: string | null;
}


export interface CreateLocationDTO {
    name: string;
    country: string;
    city: string;
}

export interface Location {
    id: string;
    name: string;
    country: string;
    city: string;
}