import { api } from './api';

export interface Room {
    id: string; // UUID
    code: string;
    floor: number;
    // building is now an object
    building?: {
        id: string;
        name: string;
        code: string;
        campus_id?: string;
        campus?: {
            id: string;
            name: string;
        };
    };
    building_id: string; // Needed for forms
    // room_type is now an object
    room_type?: {
        id: string;
        name: string;
        capacity: number;
        base_price: number;
        description?: string;
    };
    room_type_id: string; // Needed for forms
    capacity: number;
    current_occupancy: number;
    status: 'AVAILABLE' | 'FULL' | 'MAINTENANCE' | 'RESERVED';
    base_price: number;
    description?: string;
    beds: { id: string; label: string; status: string }[];
    gender_type: string;
    area_m2?: number;
    attributes?: Record<string, any>;
}

export interface RoomCreate {
    code: string;
    floor: number;
    building_id: string;
    room_type_id: string;
    status?: string;
    gender_type: string;
    base_price: number;
    area_m2?: number;
    attributes?: Record<string, any>;
}

export interface RoomUpdate {
    code?: string;
    floor?: number;
    building_id?: string;
    room_type_id?: string;
    status?: string;
    gender_allowed?: string;
    area_m2?: number;
    attributes?: Record<string, any>;
}

export interface RoomType {
    id: string;
    name: string;
    description?: string;
    capacity: number;
    base_price: number;
}

export const roomTypeService = {
    async getRoomTypes(): Promise<RoomType[]> {
        const response = await api.get<RoomType[]>('/api/v1/rooms/types');
        return response.data;
    },

    async createRoomType(data: any): Promise<RoomType> {
        const response = await api.post<RoomType>('/api/v1/rooms/types', data);
        return response.data;
    },

    async updateRoomType(id: string, data: any): Promise<RoomType> {
        const response = await api.put<RoomType>(`/api/v1/rooms/types/${id}`, data);
        return response.data;
    },

    async deleteRoomType(id: string): Promise<RoomType> {
        const response = await api.delete<RoomType>(`/api/v1/rooms/types/${id}`);
        return response.data;
    }
};

export const roomService = {
    roomType: roomTypeService,

    async getRooms(params?: { building?: string; status?: string; skip?: number; limit?: number; search?: string }): Promise<Room[]> {
        // Backend expects 'keyword' for search
        const queryParams: any = { ...params };
        if (params?.search) {
            queryParams.keyword = params.search;
            delete queryParams.search;
        }
        const response = await api.get<Room[]>('/api/v1/rooms/', { params: queryParams });
        return response.data;
    },

    async getRoom(id: string): Promise<Room> {
        const response = await api.get<Room>(`/api/v1/rooms/${id}`);
        return response.data;
    },

    async createRoom(data: RoomCreate): Promise<Room> {
        const response = await api.post<Room>('/api/v1/rooms/', data);
        return response.data;
    },

    async updateRoom(id: string, data: RoomUpdate): Promise<Room> {
        const response = await api.put<Room>(`/api/v1/rooms/${id}`, data);
        return response.data;
    },

    async deleteRoom(id: string): Promise<void> {
        await api.delete(`/api/v1/rooms/${id}`);
    },

    async getCampuses(): Promise<{ id: string; name: string }[]> {
        const response = await api.get('/api/v1/rooms/campuses');
        return response.data;
    },

    async getBuildings(campus_id?: string): Promise<{ id: string; name: string; code: string }[]> {
        const response = await api.get('/api/v1/rooms/buildings', { params: { campus_id } });
        return response.data;
    },

    async getRoomStats(building_id?: string): Promise<any> {
        const response = await api.get('/api/v1/rooms/stats', { params: { building_id } });
        return response.data;
    }
};
