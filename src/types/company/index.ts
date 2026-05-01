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
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
}

export interface CreateCompanyData {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    address_type: 'work' | 'home' | 'other';
    is_primary: boolean;
  };
}
