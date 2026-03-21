import type { s } from "node_modules/vite/dist/node/chunks/moduleRunnerTransport";

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

export interface CityDTO {
    id: string;
    name: string;
    country: string;
    is_popular: boolean;
    image: string 
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
    location_count?: number; // Optional field to store the count of locations if needed
    locations?: Location[]; // Optional field to store the list of locations if needed
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