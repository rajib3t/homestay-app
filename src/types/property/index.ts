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
    trade_licence?: string | undefined;
    trade_licence_number?: string | undefined;
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