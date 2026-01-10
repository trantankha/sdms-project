import { api } from './api';
import {
    Contract, ContractCreate, ContractUpdateStatus,
    LiquidationRequest, LiquidationResponse
} from '@/types';

export const contractService = {
    async getContracts(params?: { student_id?: string; status?: string; page?: number; size?: number; campus_id?: string; search?: string }) {
        const queryParams: any = { ...params };
        if (params?.search) {
            queryParams.keyword = params.search;
            delete queryParams.search;
        }
        const response = await api.get<Contract[]>('/api/v1/contracts/', { params: queryParams });
        return response.data;
    },

    async getMyContracts() {
        const response = await api.get<Contract[]>('/api/v1/contracts/me');
        return response.data;
    },

    async getContract(id: string) {
        const response = await api.get<Contract>(`/api/v1/contracts/${id}`);
        return response.data;
    },

    async createContract(data: ContractCreate) {
        const response = await api.post<Contract>('/api/v1/contracts/book', data);
        return response.data;
    },

    async createContractAdmin(data: { student_id: string; bed_id: string; end_date: string }) {
        const response = await api.post<Contract>('/api/v1/contracts/admin-create', data);
        return response.data;
    },

    async updateContractStatus(id: string, data: ContractUpdateStatus) {
        const response = await api.put<Contract>(`/api/v1/contracts/${id}/status`, data);
        return response.data;
    },

    async liquidateContract(data: LiquidationRequest) {
        const response = await api.post<LiquidationResponse>('/api/v1/contracts/liquidate', data);
        return response.data;
    },

    async getStats() {
        const response = await api.get<{ pending_contracts: number; active_contracts: number }>('/api/v1/contracts/stats');
        return response.data;
    },

    async cancelMyContract(id: string) {
        const response = await api.delete(`/api/v1/contracts/${id}/cancel`);
        return response.data;
    }
};
