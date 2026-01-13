import { api } from '@/services/api';
import { LoginCredentials, AuthResponse, User } from '@/types/auth';
import { useAuthStore } from '@/stores/auth-store';
import Cookies from 'js-cookie';

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const params = new URLSearchParams();
        params.append('username', credentials.username);
        params.append('password', credentials.password);

        const response = await api.post<AuthResponse>('/api/v1/auth/login/access-token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token } = response.data;

        // Temporarily set token in Cookie so the subsequent request works if it relies on cookies, 
        // or update store first if api interceptor uses store.
        // Assuming api interceptor uses Cookies or we need to set it manually.
        Cookies.set('auth_token', access_token, { expires: 7 });

        // Fetch user details immediately
        // We manually set header for this request if needed, or rely on the cookie we just set
        // (If api client reads from cookie)
        // Let's assume standard flow: update store -> api uses store/cookie
        useAuthStore.getState().setAuth(null, access_token);

        const user = await authService.me(); // This will update store with user data

        // Set Role Cookie now that we have the user
        Cookies.set('user_role', user.role, { expires: 7 });

        return { ...response.data, user };
    },

    async register(data: any): Promise<AuthResponse> {
        // Backend maps UserCreate to /api/v1/auth/register
        // data should match UserCreate schema
        const response = await api.post<AuthResponse>('/api/v1/auth/register', data);
        return response.data;
    },

    async me(options?: { skipGlobalErrorHandler?: boolean }): Promise<User> {
        const response = await api.get<User>('/api/v1/auth/me', {
            skipGlobalErrorHandler: options?.skipGlobalErrorHandler
        } as any); // Type casting since we are extending config
        useAuthStore.getState().updateUser(response.data);
        return response.data;
    },

    async updateProfile(id: string, data: { full_name?: string; phone_number?: string; gender?: string; avatar_url?: string }) {
        const response = await api.put<User>(`/api/v1/users/${id}`, data);
        return response.data;
    },

    async changePassword(id: string, data: any) {
        const response = await api.put<User>(`/api/v1/users/${id}/password`, data);
        return response.data;
    },

    logout() {
        useAuthStore.getState().logout();
        Cookies.remove('auth_token');
        Cookies.remove('user_role');
    }
};
