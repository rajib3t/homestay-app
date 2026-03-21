export interface CreateAmenityDTO {
    name: string;
    icon: string ; // Can be a base64 string or a File when uploading
}

export interface Amenity {
    id: string;
    name: string;
    icon: string; // URL to the amenity icon
    status: boolean;
}

export interface UpdateAmenityDTO {
    name?: string;
    icon?: string ; // Optional for updates
}

export interface FacilityDTO {
    name: string;
    icon: string ; // Can be a base64 string or a File when uploading
}


export interface Facility {
    id: string;
    name: string;
    icon: string; // URL to the facility icon
    status: boolean;
}


export interface BedType {
    id: string;
    name: string;
    capacity: number;
    status: boolean;
}

export interface BedTypeDTO {
    name: string;
    capacity: number | null;
}