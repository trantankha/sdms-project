import { UUID } from "./common";

export enum ContractStatus {
    ACTIVE = "DANG_O",
    EXPIRED = "HET_HAN",
    TERMINATED = "CHAM_DUT",
    PENDING = "CHO_DUYET"
}

import { Room } from "./rooms";

export interface Contract {
    id: UUID;
    student_id: UUID;
    bed_id: UUID;
    price_per_month: number;
    deposit_amount: number;
    status: ContractStatus;
    start_date: string;
    end_date: string;
    created_at: string;
    student?: {
        full_name?: string;
        student_code?: string;
        email?: string;
        phone_number?: string;
        avatar_url?: string;
    };
    bed?: {
        id: UUID;
        name: string;
        label?: string;
        room?: {
            code: string;
            name?: string;
        };
    };
    room?: Room;
}

export interface ContractCreate {
    bed_id: UUID;
    end_date: string;
}

export interface ContractUpdateStatus {
    status: ContractStatus;
}

export interface LiquidationRequest {
    contract_id: UUID;
    penalty_amount?: number;
    damage_fee?: number;
    notes?: string;
}

export interface LiquidationResponse {
    id: UUID;
    contract_id: UUID;
    liquidation_date: string;
    total_refund_to_student: number;
    refund_deposit_amount: number;
    penalty_amount: number;
    damage_fee: number;
    notes?: string;
    confirmed_by: UUID;
}
