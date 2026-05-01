
export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  address_type: 'work' | 'home' | 'other';
  is_primary: boolean;
}

export interface CompanyData {
  name: string;
  email: string;
  phone: string;
  address: Address;
}

export interface UserData {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile?: string;
    user_type: string;
    username: string;
    image?: string;
    company?: CompanyData;

}

export interface CreateUserData {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile?: string;
    password: string;
    confirmPassword: string;
    user_type: string;
    image?: string;

}