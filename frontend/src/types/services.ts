import { UUID } from "./common";

export enum ServiceType {
    CLEANING = "DON_DEP",
    LAUNDRY = "GIAT_LA",
    WATER = "GIAO_NUOC",
    OTHER = "KHAC",
    PARKING = "GIU_XE",
    INTERNET = "INTERNET"
}

export enum BillingCycle {
    ONE_TIME = "MOT_LAN",
    MONTHLY = "HANG_THANG",
    SEMESTER = "HOC_KY"
}

export interface ServicePackage {
    id: UUID;
    name: string;
    description?: string;
    type: ServiceType;
    price: number;
    billing_cycle: BillingCycle;
    is_active: boolean;
}

export interface ServicePackageCreate {
    name: string;
    description?: string;
    type: ServiceType;
    price: number;
    billing_cycle?: BillingCycle;
    is_active?: boolean;
}

export interface ServicePackageUpdate {
    name?: string;
    description?: string;
    type?: ServiceType;
    price?: number;
    billing_cycle?: BillingCycle;
    is_active?: boolean;
}

export interface Subscription {
    id: UUID;
    user_id: UUID;
    service_id: UUID;
    service_name?: string;
    quantity: number;
    note?: string;
    start_date: string;
    end_date?: string;
    is_active: boolean;
    student_name?: string;
    student_code?: string;
    room_code?: string;
    building_name?: string;
    bed_label?: string;
}

export interface SubscriptionCreate {
    service_id: UUID;
    quantity?: number;
    note?: string;
}

export interface SubscriptionUpdate {
    quantity?: number;
    note?: string;
    is_active?: boolean;
}
