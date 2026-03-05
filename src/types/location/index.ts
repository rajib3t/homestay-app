export interface Country {
    id: number;
    name: string;
    code: string;
    dialCode: string;
    cities: number;
    status: "Active" | "Inactive";
}

export interface CreateCountryDTO {
    name: string;
    code: string;
    dialCode: string;
}

export interface UpdateCountryDTO {
    name?: string;
    code?: string;
    dialCode?: string;
    status?: "Active" | "Inactive";
}