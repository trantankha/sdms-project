import { UUID } from "./common";

export interface Campus {
    id: UUID;
    name: string;
    address?: string;
}

export interface RoomType {
    id: UUID;
    name: string;
    capacity: number;
    base_price: number;
    description?: string;
    amenities: string[];
}

export interface Building {
    id: UUID;
    code: string;
    name: string;
    total_floors: number;
    campus?: {
        id: UUID;
        name: string;
    };
}

export interface Bed {
    id: UUID;
    label: string;
    status: string;
    is_occupied: boolean;
}

export interface Room {
    id: UUID;
    code: string;
    floor: number;
    gender_type: string; // NAM, NU, HON_HOP
    status: string;
    base_price: number;
    area_m2?: number;
    current_occupancy: number;
    room_type?: RoomType;
    building?: Building;
    beds?: Bed[];
}
