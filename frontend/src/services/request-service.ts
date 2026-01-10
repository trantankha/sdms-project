import { api } from './api';
import { RequestStatus, MaintenanceRequest, MaintenanceRequestCreate, MaintenanceRequestUpdate } from '@/types';

export const requestService = {
    async getMyRequests() {
        // Backend endpoint: /support/requests
        const response = await api.get<MaintenanceRequest[]>('/api/v1/support/requests');
        return response.data;
    },

    async createRequest(data: MaintenanceRequestCreate) {
        const response = await api.post<MaintenanceRequest>('/api/v1/support/requests', data);
        return response.data;
    },

    async getRequests(status?: RequestStatus) {
        // Admin sees all, filterable by status
        const params = status ? { status } : {};
        const response = await api.get<MaintenanceRequest[]>('/api/v1/support/requests', { params });
        return response.data;
    },

    async updateRequest(id: string, data: MaintenanceRequestUpdate) {
        const response = await api.put<MaintenanceRequest>(`/api/v1/support/requests/${id}`, data);
        return response.data;
    },

    async cancelRequest(id: string) {
        const response = await api.put<MaintenanceRequest>(`/api/v1/support/requests/${id}/cancel`);
        return response.data;
    }
};
