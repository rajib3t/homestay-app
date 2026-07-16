export interface PropertyDTO {
    vendor: string;
    name: string;
    description: string;
    country: string;
    city: string;
    location: string;
    address: string;
    latitude: number;
    longitude: number;
    is_published: boolean;
    listing_price: number;
    sale_price: number;
    is_featured: boolean;
    star_rating?: string | number | undefined;
    tax_name?: string | undefined;
    tax_percentage?: number | undefined;
    check_in_time?: string | undefined;
    checkout_time?: string | undefined;
    trade_license?: string | null | undefined;
    trade_license_number?: string | undefined;
    feature_image: string | undefined; // URL of the feature image
    cover_image?: string | undefined; // URL of the cover image
    gallery_images?: string[] | undefined; // Array of image URLs
    food_options?: { name: string; allow: boolean }[];
    amenities?: {
        name: string;
        allow: boolean
    }[];
    facilities?: {
        name: string;
        allow: boolean
    }[];
    rooms?: {
        name: string,
        type: string,
    }[];
}

export interface PropertyResponseDTO extends PropertyDTO {
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string;
    id: string;
}

export interface PropertyListDTO {
    id: string;
    name: string;
    price: number;
    sale_price: number;
    facilities?: {
        name: string;
        allowed: boolean;
    }[];
    amenities?: {
        name: string;
        allowed: boolean;
    }[];
    city_name?: string;
    country_name?: string;
    location_name?: string;
    feature_image?: string;
}




