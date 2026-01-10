import { api } from './api';
import { ServicePackage, ServicePackageCreate, ServicePackageUpdate, Subscription, SubscriptionCreate, SubscriptionUpdate } from '@/types';

export const servicePackageService = {
    // Packages
    async getPackages(params?: { type?: string; is_active?: boolean }) {
        const response = await api.get<ServicePackage[]>('/api/v1/services/packages', { params });
        return response.data;
    },

    async createPackage(data: ServicePackageCreate) {
        const response = await api.post<ServicePackage>('/api/v1/services/packages', data);
        return response.data;
    },

    async updatePackage(id: string, data: ServicePackageUpdate) {
        const response = await api.put<ServicePackage>(`/api/v1/services/packages/${id}`, data);
        return response.data;
    },

    // Subscriptions
    // Subscriptions
    async getSubscriptions(params?: { user_id?: string; active_only?: boolean }) {
        const response = await api.get<Subscription[]>('/api/v1/services/subscriptions', { params });
        return response.data;
    },

    async getMySubscriptions() {
        const response = await api.get<Subscription[]>('/api/v1/services/my-subscriptions');
        return response.data;
    },

    async subscribe(data: SubscriptionCreate) {
        const response = await api.post<Subscription>('/api/v1/services/subscribe', data);
        return response.data;
    },

    async updateSubscription(id: string, data: SubscriptionUpdate) {
        const response = await api.put<Subscription>(`/api/v1/services/subscriptions/${id}`, data);
        return response.data;
    }
};
