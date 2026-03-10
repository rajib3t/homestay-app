export interface Country {
    id: number;
    name: string;
    code: string;
    dial_code: string;
    cities: [] | number; // Can be an array of city names or a count of cities
    status: boolean
}

export interface CreateCountryDTO {
    name: string;
    code: string;
    dial_code: string;
}

export interface UpdateCountryDTO {
    name?: string;
    code?: string;
    dial_code?: string;
   
   
}