import { api } from './api';

export interface Campus {
    id: string;
    name: string;
    address?: string;
}

export interface Building {
    id: string;
    name: string;
    code: string;
    campus_id: string;
    utility_config?: {
        electric_price: number;
        water_price: number;
    };
    campus?: Campus;
}

export const campusService = {
    async getCampuses(): Promise<Campus[]> {
        // Enpoint defined in rooms.py: /api/v1/rooms/campuses
        const response = await api.get<Campus[]>('/api/v1/rooms/campuses');
        return response.data;
    },

    async getBuildings(campusId?: string): Promise<Building[]> {
        // Endpoint defined in rooms.py: /api/v1/rooms/buildings
        const params = campusId ? { campus_id: campusId } : {};
        const response = await api.get<Building[]>('/api/v1/rooms/buildings', { params });
        return response.data;
    },

    async updateBuilding(id: string, data: any): Promise<Building> {
        const response = await api.put<Building>(`/api/v1/rooms/buildings/${id}`, data);
        return response.data;
    }
};
