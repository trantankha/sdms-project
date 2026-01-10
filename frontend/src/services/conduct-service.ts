import { api } from './api';
import { Violation, ViolationCreate } from '@/types';

export const conductService = {
    async getViolations(params?: { student_id?: string; severity?: string; page?: number; size?: number }) {
        const response = await api.get<Violation[]>('/api/v1/conduct/violations', { params });
        return response.data;
    },

    async getMyViolations() {
        const response = await api.get<Violation[]>('/api/v1/conduct/me');
        return response.data;
    },

    async createViolation(data: ViolationCreate) {
        const response = await api.post<Violation>('/api/v1/conduct/violations', data);
        return response.data;
    },

    async updateViolation(id: string, data: Partial<ViolationCreate>) {
        const response = await api.put<Violation>(`/api/v1/conduct/violations/${id}`, data);
        return response.data;
    },

    async deleteViolation(id: string) {
        const response = await api.delete<Violation>(`/api/v1/conduct/violations/${id}`);
        return response.data;
    }
};
