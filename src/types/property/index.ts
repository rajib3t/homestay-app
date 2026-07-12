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
    feature_image: string | undefined; // URL of the feature image
    cover_image?: string | undefined; // URL of the cover image
    gallery_images?: string[] | undefined; // Array of image URLs
}