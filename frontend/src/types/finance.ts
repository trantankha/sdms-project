import { UUID } from "./common";

export enum UtilityType {
    ELECTRICITY = "DIEN",
    WATER = "NUOC",
    INTERNET = "INTERNET",
    TRASH = "VE_SINH"
}

export enum PaymentMethod {
    CASH = "TIEN_MAT",
    BANK_TRANSFER = "CHUYEN_KHOAN",
    MOMO = "MOMO",
    ONLINE = "ONLINE",
}

export enum InvoiceStatus {
    UNPAID = "CHUA_THANH_TOAN",
    PARTIAL = "TRA_MOT_PHAN",
    PAID = "DA_THANH_TOAN",
    OVERDUE = "QUA_HAN",
    CANCELLED = "DA_HUY",
}

// Utility Config
export interface UtilityConfig {
    id: UUID;
    type: UtilityType;
    price_per_unit: number;
    is_progressive: boolean;
}

export interface UtilityConfigCreate {
    type: UtilityType;
    price_per_unit: number;
    is_progressive?: boolean;
}

export interface UtilityConfigUpdate {
    price_per_unit?: number;
    is_progressive?: boolean;
}

// Utility Recording
export interface UtilityRecordingCreate {
    room_id: UUID;
    month: number;
    year: number;
    electric_index: number;
    water_index: number;
}

// Payment
export interface Payment {
    id: UUID;
    amount: number;
    payment_method: PaymentMethod;
    transaction_id?: string;
    created_at: string;
}

export interface PaymentCreate {
    invoice_id: UUID;
    amount: number;
    payment_method: PaymentMethod;
    transaction_id?: string;
}

export interface Invoice {
    id: UUID;
    contract_id?: UUID;
    room_id?: UUID;
    title?: string;
    total_amount: number;
    due_date?: string;
    status: InvoiceStatus;
    details?: Record<string, any>;
    paid_amount?: number;
    remaining_amount?: number;
    payments: Payment[];
    created_at: string;
    contract?: {
        id: UUID;
        student?: {
            full_name?: string;
            student_code?: string;
            avatar_url?: string;
        };
        bed?: {
            label?: string;
            name?: string;
            room?: {
                code: string;
                name?: string;
            }
        };
    };
    room?: {
        id: UUID;
        code: string;
        name?: string;
        building?: {
            name: string;
        }
    }
}

export interface InvoiceCreate {
    contract_id?: UUID;
    room_id?: UUID;
    title?: string;
    total_amount: number;
    due_date?: string;
    details?: Record<string, any>;
}
