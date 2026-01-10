import { UUID } from "./common";

export enum AnnouncementPriority {
    LOW = "THAP", // Frontend only
    NORMAL = "BINH_THUONG",
    HIGH = "QUAN_TRONG",
    URGENT = "KHAN_CAP"
}

export enum AnnouncementScope {
    GLOBAL = "TOAN_HE_THONG",
    CAMPUS = "CO_SO", // New scope
    BUILDING = "TOA_NHA",
    FLOOR = "TANG", // Frontend only
    ROOM = "PHONG" // Frontend only
}

export enum AnnouncementStatus {
    DRAFT = "NHAP",
    PUBLISHED = "DA_DANG",
    ARCHIVED = "LUU_TRU"
}

export interface Announcement {
    id: UUID;
    title: string;
    content: string;
    author_name?: string;
    priority: AnnouncementPriority;
    scope: AnnouncementScope;
    status: AnnouncementStatus;
    published_at?: string;
    expires_at?: string;
    target_criteria?: string[];
    created_at: string;
}

export interface AnnouncementCreate {
    title: string;
    content: string;
    priority?: AnnouncementPriority;
    scope?: AnnouncementScope;
    target_criteria?: string[];
    status?: AnnouncementStatus;
    published_at?: string;
    expires_at?: string;
}

export interface AnnouncementUpdate {
    title?: string;
    content?: string;
    priority?: AnnouncementPriority;
    scope?: AnnouncementScope;
    target_criteria?: string[];
    status?: AnnouncementStatus;
    published_at?: string;
    expires_at?: string;
}
