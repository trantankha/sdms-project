import { UUID } from "./common";

export enum TransferStatus {
    PENDING = "CHO_DUYET",
    APPROVED = "DA_DUYET",
    REJECTED = "TU_CHOI",
    COMPLETED = "HOAN_TAT", // Frontend only? Or maybe backend maps it? Keeping for safety but vietnamized.
    CANCELLED = "DA_HUY"
}

export interface TransferRequest {
    id: UUID;
    student_id: UUID;
    contract_id: UUID;
    target_bed_id?: UUID;
    reason: string;
    status: TransferStatus;
    admin_response?: string;
    created_at: string;

    // Enriched UI fields
    student_name?: string;
    student_code?: string;
    current_room_name?: string;
    current_bed_label?: string;
    target_room_name?: string;
    target_bed_label?: string;
}

export interface TransferRequestCreate {
    contract_id: UUID;
    target_bed_id?: UUID;
    reason: string;
}

export interface TransferRequestUpdate {
    status: TransferStatus;
    admin_response?: string;
    assigned_bed_id?: string;
}
