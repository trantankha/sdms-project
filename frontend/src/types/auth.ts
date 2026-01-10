export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'QUAN_LY_TOA',
    STUDENT = 'SINH_VIEN',
}

export interface User {
    id: string;
    email: string;
    full_name?: string;
    is_active: boolean;
    role: UserRole;
    student_code?: string;
    avatar_url?: string;
    phone_number?: string;
    gender?: string; // 'MALE' | 'FEMALE' | 'OTHER'
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export type AuthResponse = LoginResponse;
