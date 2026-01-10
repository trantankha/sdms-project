import axios from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import Cookies from 'js-cookie';

// Helper to ensure valid API URL
const getBaseUrl = () => {
    let url = process.env.NEXT_PUBLIC_API_URL;

    // Fallback if undefined or empty
    if (!url) return 'http://localhost:8000';

    // Fix: If user forgot http://, add it (assuming localhost or IP)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        console.warn(`Invalid NEXT_PUBLIC_API_URL format: "${url}". automaticallly prepending http://`);
        url = `http://${url}`;
    }

    // Fix: Remove trailing slash if present
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }

    // Fix: Remove trailing /api/v1 if present to avoid duplication (service adds it)
    if (url.endsWith('/api/v1')) {
        console.warn('Removing trailing /api/v1 from NEXT_PUBLIC_API_URL to avoid double path.');
        url = url.slice(0, -'/api/v1'.length);
    }

    // Ensure no trailing slash again after removal
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }

    return url;
};

const API_URL = getBaseUrl();
console.log('API Service configured with Base URL:', API_URL);

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401
// Response Interceptor: Handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if the request explicitly wants to bypass global error handling
        if (error.config?.skipGlobalErrorHandler) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            Cookies.remove('auth_token');
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                // Redirect to login page
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
