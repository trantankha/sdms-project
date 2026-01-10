import { api } from './api';
import { TransferRequest, TransferRequestCreate, TransferRequestUpdate } from '@/types';

export const transferService = {
    async getTransfers(params?: { student_id?: string; status?: string; page?: number; size?: number }) {
        const response = await api.get<TransferRequest[]>('/api/v1/transfers/', { params });
        return response.data;
    },

    async createTransfer(data: TransferRequestCreate) {
        const response = await api.post<TransferRequest>('/api/v1/transfers/', data);
        return response.data;
    },

    async updateTransfer(id: string, data: TransferRequestUpdate) {
        const response = await api.put<TransferRequest>(`/api/v1/transfers/${id}`, data);
        return response.data;
    }
};
