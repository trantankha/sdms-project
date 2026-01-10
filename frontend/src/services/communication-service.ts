import { api } from './api';
import { Announcement, AnnouncementCreate, AnnouncementUpdate } from '@/types';

export const communicationService = {
    async getAnnouncements(params?: { scope?: string; page?: number; size?: number }) {
        const response = await api.get<Announcement[]>('/api/v1/announcements/', { params });
        return response.data;
    },

    async getAnnouncement(id: string) {
        const response = await api.get<Announcement>(`/api/v1/announcements/${id}`);
        return response.data;
    },

    async createAnnouncement(data: AnnouncementCreate) {
        const response = await api.post<Announcement>('/api/v1/announcements/', data);
        return response.data;
    },

    async updateAnnouncement(id: string, data: AnnouncementUpdate) {
        const response = await api.put<Announcement>(`/api/v1/announcements/${id}`, data);
        return response.data;
    },

    async deleteAnnouncement(id: string) {
        const response = await api.delete(`/api/v1/announcements/${id}`);
        return response.data;
    }
};
