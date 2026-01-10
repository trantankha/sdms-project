import { UUID } from "./common";
import { User } from "./auth";

export enum ViolationSeverity {
    WARNING = "NHAC_NHO",
    MAJOR = "CANH_CAO",
    CRITICAL = "KY_LUAT"
}

export interface Violation {
    id: UUID;
    user_id: UUID;
    student?: User;
    title: string;
    description: string;
    severity: ViolationSeverity;
    points_deducted: number;
    violation_date: string;
    created_at?: string;
}

export interface ViolationCreate {
    student_id?: UUID;
    student_code?: string;
    email?: string;
    title: string;
    description: string;
    severity: ViolationSeverity;
    points_deducted?: number;
    violation_date?: string;
}
