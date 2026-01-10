
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth';
import Cookies from 'js-cookie';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;

    setAuth: (user: User | null, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

            logout: () => {
                Cookies.remove('auth_token');
                set({ user: null, token: null, isAuthenticated: false });
            },



            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : (updates as User)
            })),
        }),
        {
            name: 'sdms-auth-storage', // unique name
            partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }), // Don't persist sessionExpired
        }
    )
);
