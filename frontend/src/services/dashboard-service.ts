import { api } from './api';

export interface StudentDashboardStats {
    unpaid_invoices_count: number;
    unpaid_invoices_total: number;
    active_requests_count: number;
    room_info: {
        id: string;
        code: string;
        building: string;
        contract_status: string;
        end_date: string;
    } | null;
    utility_usage: {
        electricity: number;
        water: number;
    };
}

export interface Activity {
    type: string;
    subtype: string;
    title: string;
    description: string;
    timestamp: string;
    amount: number | null;
    status: string;
    user: {
        name: string;
        avatar: string | null;
    };
}

export const dashboardService = {
    async getStudentStats() {
        const response = await api.get<StudentDashboardStats>('/api/v1/dashboard/student/stats');
        return response.data;
    },

    async getActivities() {
        const response = await api.get<Activity[]>('/api/v1/dashboard/activities');
        return response.data;
    }
};
