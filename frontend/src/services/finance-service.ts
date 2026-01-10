import { api } from './api';
import {
    Invoice, InvoiceCreate,
    Payment, PaymentCreate,
    UtilityConfig, UtilityConfigCreate, UtilityConfigUpdate,
    UtilityRecordingCreate
} from '@/types';

export const financeService = {
    // Invoices
    async getInvoices(params?: { contract_id?: string; room_id?: string; status?: string; page?: number; size?: number; search?: string }) {
        const queryParams: any = { ...params };
        if (params?.search) {
            queryParams.keyword = params.search;
            delete queryParams.search;
        }
        const response = await api.get<Invoice[]>('/api/v1/finance/invoices', { params: queryParams });
        return response.data;
    },

    async getInvoice(id: string) {
        const response = await api.get<Invoice>(`/api/v1/finance/invoices/${id}`);
        return response.data;
    },

    async createInvoice(data: InvoiceCreate) {
        const response = await api.post<Invoice>('/api/v1/finance/invoices', data);
        return response.data;
    },

    // Payments
    async createPayment(data: PaymentCreate) {
        const response = await api.post<Payment>('/api/v1/finance/payments', data);
        return response.data;
    },

    async createPaymentUrl(data: { invoice_id: string; amount: number }) {
        const response = await api.post<{ url: string }>('/api/v1/payment/create_url', data);
        return response.data;
    },

    // Utility Config
    async getUtilityConfigs() {
        const response = await api.get<UtilityConfig[]>('/api/v1/finance/config');
        return response.data;
    },

    async updateUtilityConfig(id: string, data: UtilityConfigUpdate) {
        const response = await api.put<UtilityConfig>(`/api/v1/finance/config/${id}`, data);
        return response.data;
    },

    // Utility Recording
    async recordUtilities(data: UtilityRecordingCreate[]) {
        const response = await api.post('/api/v1/finance/readings/batch', { items: data });
        return response.data;
    },

    async getLatestReadings() {
        // Need to define return type properly but using any or specific type if available
        // Return type is UtilityReadingResponse[]
        const response = await api.get<any[]>('/api/v1/finance/readings/latest');
        return response.data;
    },

    // Invoice Generation
    async generateMonthlyInvoices(month: number, year: number) {
        const response = await api.post<Invoice[]>('/api/v1/finance/invoices/generate', null, {
            params: { month, year }
        });
        return response.data;
    },

    async cancelInvoice(id: string) {
        const response = await api.put<Invoice>(`/api/v1/finance/invoices/${id}/cancel`);
        return response.data;
    },

    async getStats() {
        const response = await api.get<{ total_revenue: number; overdue_invoices: number; pending_invoices: number }>('/api/v1/finance/stats');
        return response.data;
    },

    // Payment Verification
    async verifyPayment(params: any) {
        const response = await api.get<any>('/api/v1/payment/payment_return', { params });
        return response.data;
    }
};
