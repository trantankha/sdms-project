import { api } from './api';
import { User, UserRole } from '@/types/auth';

export const studentService = {
    async getStudents(params?: { skip?: number; limit?: number; search?: string; role?: string; is_active?: boolean }): Promise<User[]> {
        // Map frontend params to backend params
        const queryParams = {
            skip: params?.skip ?? 0,
            limit: params?.limit ?? 100,
            role: params?.role || UserRole.STUDENT,
            keyword: params?.search,
            ...(params?.is_active !== undefined && { is_active: params.is_active })
        };

        const response = await api.get<User[]>('/api/v1/users/', {
            params: queryParams
        });
        return response.data;
    },

    async getStudent(id: string): Promise<User> {
        const response = await api.get<User>(`/api/v1/users/${id}`);
        return response.data;
    },

    async createStudent(data: any): Promise<User> {
        const response = await api.post<User>('/api/v1/users/', { ...data, role: UserRole.STUDENT });
        return response.data;
    },

    async updateStudent(id: string, data: any): Promise<User> {
        const response = await api.put<User>(`/api/v1/users/${id}`, data);
        return response.data;
    },

    async deleteStudent(id: string): Promise<User> {
        // In this system, delete likely deactivates or permanently deletes depending on backend policy
        const response = await api.delete<User>(`/api/v1/users/${id}`);
        return response.data;
    }
};
