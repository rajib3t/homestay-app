
export interface UserData {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    mobile?: string;
    user_type: string;
    username: string;
    image?: string;

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