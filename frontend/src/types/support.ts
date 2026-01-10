export enum RequestStatus {
    OPEN = "MOI",
    IN_PROGRESS = "DANG_XU_LY",
    DONE = "HOAN_THANH",
    REJECTED = "TU_CHOI"
}

export interface MaintenanceRequest {
    id: string;
    title: string;
    description?: string;
    status: RequestStatus;
    room_code?: string;
    created_at: string;
    image_url?: string;
    ai_analysis_result?: string;
}

export interface MaintenanceRequestCreate {
    title: string;
    description?: string;
    room_code?: string;
}

export interface MaintenanceRequestUpdate {
    title?: string;
    description?: string;
    image_url?: string;
    status?: RequestStatus;
    ai_analysis_result?: string;
    room_code?: string;
}
