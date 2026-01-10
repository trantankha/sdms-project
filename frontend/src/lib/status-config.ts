import {
    TransferStatus
} from "@/types/transfers";
import {
    UtilityType,
    PaymentMethod,
    InvoiceStatus
} from "@/types/finance";
import {
    ContractStatus
} from "@/types/contracts";
import {
    AnnouncementPriority,
    AnnouncementScope,
    AnnouncementStatus
} from "@/types/communication";
import { BadgeProps } from "@/components/ui/badge";
import {
    Activity,
    AlertCircle,
    Archive,
    Banknote,
    Building,
    CheckCircle2,
    Clock,
    Clock3,
    CreditCard,
    Droplets,
    FileText,
    HelpCircle,
    Home,
    Layers,
    Megaphone,
    Trash2,
    Wifi,
    XCircle,
    Zap,
    Users,
    AlertTriangle,
    ShieldAlert
} from "lucide-react";
import { ViolationSeverity } from "@/types/conduct";
import { RequestStatus } from "@/types/support";

export type StatusConfig = {
    label: string;
    variant: BadgeProps["variant"] | "warning" | "success" | "info" | "purple" | "cyan";
    icon?: React.ElementType;
};

// --- Transfers ---
export const TRANSFER_STATUS_MAP: Record<TransferStatus, StatusConfig> = {
    [TransferStatus.PENDING]: {
        label: "Đang chờ duyệt",
        variant: "warning",
        icon: Clock,
    },
    [TransferStatus.APPROVED]: {
        label: "Đã duyệt",
        variant: "success",
        icon: CheckCircle2,
    },
    [TransferStatus.REJECTED]: {
        label: "Đã từ chối",
        variant: "destructive",
        icon: XCircle,
    },
    [TransferStatus.COMPLETED]: {
        label: "Hoàn tất",
        variant: "info",
        icon: CheckCircle2,
    },
    [TransferStatus.CANCELLED]: {
        label: "Đã hủy",
        variant: "secondary",
        icon: XCircle,
    },
};

// --- Finance: Utility Type ---
export const UTILITY_TYPE_MAP: Record<UtilityType, StatusConfig> = {
    [UtilityType.ELECTRICITY]: {
        label: "Điện",
        variant: "warning", // Yellow/Orange fit for electricity
        icon: Zap,
    },
    [UtilityType.WATER]: {
        label: "Nước",
        variant: "info", // Blue
        icon: Droplets,
    },
    [UtilityType.INTERNET]: {
        label: "Internet",
        variant: "purple",
        icon: Wifi,
    },
    [UtilityType.TRASH]: {
        label: "Vệ sinh",
        variant: "secondary",
        icon: Trash2,
    },
};

// --- Finance: Payment Method ---
export const PAYMENT_METHOD_MAP: Record<PaymentMethod, StatusConfig> = {
    [PaymentMethod.CASH]: {
        label: "Tiền mặt",
        variant: "outline",
        icon: Banknote,
    },
    [PaymentMethod.BANK_TRANSFER]: {
        label: "Chuyển khoản",
        variant: "outline",
        icon: CreditCard,
    },
    [PaymentMethod.MOMO]: {
        label: "MoMo",
        variant: "purple",
        icon: CreditCard,
    },
    [PaymentMethod.ONLINE]: {
        label: "Trực tuyến",
        variant: "success",
        icon: CreditCard,
    },
};

// --- Finance: Invoice Status ---
export const INVOICE_STATUS_MAP: Record<string, StatusConfig> = {
    [InvoiceStatus.PARTIAL]: { label: "Trả một phần", variant: "secondary", icon: Clock3 },

    [InvoiceStatus.UNPAID]: { label: "Chưa thanh toán", variant: "warning", icon: Activity },

    [InvoiceStatus.PAID]: { label: "Đã thanh toán", variant: "success", icon: CheckCircle2 },

    [InvoiceStatus.OVERDUE]: { label: "Quá hạn", variant: "destructive", icon: AlertCircle },

    [InvoiceStatus.CANCELLED]: { label: "Đã hủy", variant: "secondary", icon: XCircle },
};

// --- Contracts ---
export const CONTRACT_STATUS_MAP: Record<string, StatusConfig> = {
    // Standard Vietnamese Backend Values
    "DANG_O": { label: "Đang hiệu lực", variant: "success", icon: CheckCircle2 },
    "HET_HAN": { label: "Hết hạn", variant: "warning", icon: Clock },
    "CHAM_DUT": { label: "Đã chấm dứt", variant: "destructive", icon: XCircle },
    "CHO_DUYET": { label: "Chờ ký", variant: "info", icon: Clock },

    // English Fallbacks (UPPERCASE)
    "ACTIVE": { label: "Đang hiệu lực", variant: "success", icon: CheckCircle2 },
    "EXPIRED": { label: "Hết hạn", variant: "warning", icon: Clock },
    "TERMINATED": { label: "Đã chấm dứt", variant: "destructive", icon: XCircle },
    "PENDING": { label: "Chờ ký", variant: "info", icon: Clock },

    // English Fallbacks (Title Case - just in case toUpperCase fails or logic is weird)
    "Active": { label: "Đang hiệu lực", variant: "success", icon: CheckCircle2 },
    "Expired": { label: "Hết hạn", variant: "warning", icon: Clock },
    "Terminated": { label: "Đã chấm dứt", variant: "destructive", icon: XCircle },
    "Pending": { label: "Chờ ký", variant: "info", icon: Clock },
};

// --- Communication: Priority ---
export const ANNOUNCEMENT_PRIORITY_MAP: Record<string, StatusConfig> = {
    [AnnouncementPriority.LOW]: { label: "Thấp", variant: "secondary", icon: Activity },
    "LOW": { label: "Thấp", variant: "secondary", icon: Activity },

    [AnnouncementPriority.NORMAL]: { label: "Bình thường", variant: "info", icon: Activity },
    "NORMAL": { label: "Bình thường", variant: "info", icon: Activity },

    [AnnouncementPriority.HIGH]: { label: "Cao", variant: "warning", icon: AlertCircle },
    "HIGH": { label: "Cao", variant: "warning", icon: AlertCircle },

    [AnnouncementPriority.URGENT]: { label: "Khẩn cấp", variant: "destructive", icon: Megaphone },
    "URGENT": { label: "Khẩn cấp", variant: "destructive", icon: Megaphone },
};

// --- Communication: Scope ---
export const ANNOUNCEMENT_SCOPE_MAP: Record<string, StatusConfig> = {
    [AnnouncementScope.GLOBAL]: { label: "Toàn hệ thống", variant: "purple", icon: Building },
    "GLOBAL": { label: "Toàn hệ thống", variant: "purple", icon: Building },

    [AnnouncementScope.CAMPUS]: { label: "Cơ sở", variant: "success", icon: Building },
    "CAMPUS": { label: "Cơ sở", variant: "success", icon: Building },

    [AnnouncementScope.BUILDING]: { label: "Tòa nhà", variant: "info", icon: Building },
    "BUILDING": { label: "Tòa nhà", variant: "info", icon: Building },

    [AnnouncementScope.FLOOR]: { label: "Tầng", variant: "cyan", icon: Layers },
    "FLOOR": { label: "Tầng", variant: "cyan", icon: Layers },

    [AnnouncementScope.ROOM]: { label: "Phòng", variant: "secondary", icon: Home },
    "ROOM": { label: "Phòng", variant: "secondary", icon: Home },
};

// --- Communication: Status ---
export const ANNOUNCEMENT_STATUS_MAP: Record<string, StatusConfig> = {
    [AnnouncementStatus.DRAFT]: { label: "Nháp", variant: "secondary", icon: FileText },
    [AnnouncementStatus.PUBLISHED]: { label: "Đã đăng", variant: "success", icon: Megaphone },
    [AnnouncementStatus.ARCHIVED]: { label: "Lưu trữ", variant: "outline", icon: Archive },
};

// --- Request Status ---
export const REQUEST_STATUS_MAP: Record<string, StatusConfig> = {
    [RequestStatus.OPEN]: { label: "Mới", variant: "info", icon: AlertCircle },
    [RequestStatus.IN_PROGRESS]: { label: "Đang xử lý", variant: "warning", icon: Clock },
    [RequestStatus.DONE]: { label: "Hoàn thành", variant: "success", icon: CheckCircle2 },
    [RequestStatus.REJECTED]: { label: "Đã từ chối", variant: "destructive", icon: XCircle },
};

// --- Room Status ---
export const ROOM_STATUS_MAP: Record<string, StatusConfig> = {
    AVAILABLE: { label: "Còn trống", variant: "success", icon: CheckCircle2 },
    CON_CHO: { label: "Còn trống", variant: "success", icon: CheckCircle2 },
    FULL: { label: "Đã đầy", variant: "secondary", icon: XCircle },
    DAY: { label: "Đã đầy", variant: "secondary", icon: XCircle },
    MAINTENANCE: { label: "Đang bảo trì", variant: "destructive", icon: AlertTriangle },
    BAO_TRI: { label: "Đang bảo trì", variant: "destructive", icon: AlertTriangle },
    RESERVED: { label: "Giữ chỗ", variant: "warning", icon: Clock },
    GIU_CHO: { label: "Giữ chỗ", variant: "warning", icon: Clock },
    CLEANING: { label: "Đang dọn", variant: "info", icon: Zap },
    DANG_DON: { label: "Đang dọn", variant: "info", icon: Zap },
    OCCUPIED: { label: "Đang ở", variant: "purple", icon: Users },
};

// --- Services: Service Type ---
export const SERVICE_TYPE_MAP: Record<string, StatusConfig> = {
    CLEANING: { label: "Dọn dẹp", variant: "info", icon: Zap },
    DON_DEP: { label: "Dọn dẹp", variant: "info", icon: Zap },

    LAUNDRY: { label: "Giặt ủi", variant: "purple", icon: CheckCircle2 },
    GIAT_LA: { label: "Giặt ủi", variant: "purple", icon: CheckCircle2 },

    WATER: { label: "Giao nước", variant: "cyan", icon: Droplets },
    WATER_DELIVERY: { label: "Giao nước", variant: "cyan", icon: Droplets },
    GIAO_NUOC: { label: "Giao nước", variant: "cyan", icon: Droplets },

    PARKING: { label: "Giữ xe", variant: "warning", icon: CreditCard },
    GIU_XE: { label: "Giữ xe", variant: "warning", icon: CreditCard },

    INTERNET: { label: "Internet", variant: "purple", icon: Wifi },

    OTHER: { label: "Khác", variant: "secondary", icon: HelpCircle },
    KHAC: { label: "Khác", variant: "secondary", icon: HelpCircle },
};

// --- Services: Billing Cycle ---
export const BILLING_CYCLE_MAP: Record<string, StatusConfig> = {
    ONE_TIME: { label: "Một lần", variant: "outline", icon: CheckCircle2 },
    MOT_LAN: { label: "Một lần", variant: "outline", icon: CheckCircle2 },

    MONTHLY: { label: "Hàng tháng", variant: "info", icon: Clock },
    HANG_THANG: { label: "Hàng tháng", variant: "info", icon: Clock },

    SEMESTER: { label: "Học kỳ", variant: "purple", icon: Layers },
    HOC_KY: { label: "Học kỳ", variant: "purple", icon: Layers },

    YEARLY: { label: "Hàng năm", variant: "purple", icon: Clock }, // Keep for compatibility if needed
};

// --- Helper to get config ---
// --- User Status ---
export const USER_STATUS_MAP: Record<string, StatusConfig> = {
    ACTIVE: { label: "Hoạt động", variant: "success", icon: CheckCircle2 },
    INACTIVE: { label: "Đã khóa", variant: "destructive", icon: XCircle },
    // Handle boolean string conversions just in case
    true: { label: "Hoạt động", variant: "success", icon: CheckCircle2 },
    false: { label: "Đã khóa", variant: "destructive", icon: XCircle },
};

// --- Violation Severity ---
export const VIOLATION_SEVERITY_MAP: Record<string, StatusConfig> = {
    [ViolationSeverity.WARNING]: { label: "Nhắc nhở", variant: "warning", icon: AlertTriangle },
    [ViolationSeverity.MAJOR]: { label: "Cảnh cáo", variant: "destructive", icon: ShieldAlert },
    [ViolationSeverity.CRITICAL]: { label: "Kỷ luật", variant: "destructive", icon: ShieldAlert },
};

// --- Helper to get config ---
export function getStatusConfig(
    status: string | any,
    type?: "transfer" | "utility" | "payment" | "invoice" | "contract" | "priority" | "scope" | "announcement" | "room" | "service_type" | "billing_cycle" | "user" | "violation" | "request"
): StatusConfig {
    if (status === undefined || status === null) return { label: "N/A", variant: "secondary" };

    const statusString = String(status).trim();
    const statusKey = statusString.toUpperCase(); // Normalize for lookup
    let config: StatusConfig | undefined;

    if (type) {
        switch (type) {
            case "transfer": config = TRANSFER_STATUS_MAP[status as TransferStatus] || TRANSFER_STATUS_MAP[statusKey as TransferStatus]; break;
            case "utility": config = UTILITY_TYPE_MAP[status as UtilityType] || UTILITY_TYPE_MAP[statusKey as UtilityType]; break;
            case "payment": config = PAYMENT_METHOD_MAP[status as PaymentMethod] || PAYMENT_METHOD_MAP[statusKey as PaymentMethod]; break;
            case "invoice": config = INVOICE_STATUS_MAP[status as InvoiceStatus] || INVOICE_STATUS_MAP[statusKey as InvoiceStatus]; break;
            case "contract": config = CONTRACT_STATUS_MAP[status as ContractStatus] || CONTRACT_STATUS_MAP[statusKey as ContractStatus]; break;
            case "priority": config = ANNOUNCEMENT_PRIORITY_MAP[status as AnnouncementPriority] || ANNOUNCEMENT_PRIORITY_MAP[statusKey as AnnouncementPriority]; break;
            case "scope": config = ANNOUNCEMENT_SCOPE_MAP[status as AnnouncementScope] || ANNOUNCEMENT_SCOPE_MAP[statusKey as AnnouncementScope]; break;
            case "announcement": config = ANNOUNCEMENT_STATUS_MAP[status as AnnouncementStatus] || ANNOUNCEMENT_STATUS_MAP[statusKey as AnnouncementStatus]; break;
            case "room": config = ROOM_STATUS_MAP[status] || ROOM_STATUS_MAP[statusKey]; break;
            case "service_type": config = SERVICE_TYPE_MAP[status] || SERVICE_TYPE_MAP[statusKey]; break;
            case "billing_cycle": config = BILLING_CYCLE_MAP[status] || BILLING_CYCLE_MAP[statusKey]; break;
            case "user": config = USER_STATUS_MAP[status] || USER_STATUS_MAP[statusString] || USER_STATUS_MAP[statusKey]; break;
            case "violation": config = VIOLATION_SEVERITY_MAP[status] || VIOLATION_SEVERITY_MAP[statusKey]; break;
            case "request": config = REQUEST_STATUS_MAP[status] || REQUEST_STATUS_MAP[statusKey]; break;
        }
    }

    // Auto-detection lookup (if type not provided or specific lookup failed)
    if (!config) {
        // Force check for Contract Status English keys if type is contract
        if (type === "contract") {
            const titleCaseKey = statusString.charAt(0).toUpperCase() + statusString.slice(1).toLowerCase();
            if (CONTRACT_STATUS_MAP[statusString]) config = CONTRACT_STATUS_MAP[statusString];
            else if (CONTRACT_STATUS_MAP[titleCaseKey]) config = CONTRACT_STATUS_MAP[titleCaseKey];
        }

        if (!config) {
            if (TRANSFER_STATUS_MAP[statusKey as TransferStatus]) config = TRANSFER_STATUS_MAP[statusKey as TransferStatus];
            else if (INVOICE_STATUS_MAP[statusKey as InvoiceStatus]) config = INVOICE_STATUS_MAP[statusKey as InvoiceStatus];
            else if (CONTRACT_STATUS_MAP[statusKey as ContractStatus]) config = CONTRACT_STATUS_MAP[statusKey as ContractStatus];
            else if (ANNOUNCEMENT_PRIORITY_MAP[statusKey as AnnouncementPriority]) config = ANNOUNCEMENT_PRIORITY_MAP[statusKey as AnnouncementPriority];
            else if (ANNOUNCEMENT_SCOPE_MAP[statusKey as AnnouncementScope]) config = ANNOUNCEMENT_SCOPE_MAP[statusKey as AnnouncementScope];
            else if (ANNOUNCEMENT_STATUS_MAP[statusKey as AnnouncementStatus]) config = ANNOUNCEMENT_STATUS_MAP[statusKey as AnnouncementStatus];
            else if (UTILITY_TYPE_MAP[statusKey as UtilityType]) config = UTILITY_TYPE_MAP[statusKey as UtilityType];
            else if (PAYMENT_METHOD_MAP[statusKey as PaymentMethod]) config = PAYMENT_METHOD_MAP[statusKey as PaymentMethod];
            else if (ROOM_STATUS_MAP[statusKey]) config = ROOM_STATUS_MAP[statusKey];
            else if (SERVICE_TYPE_MAP[statusKey]) config = SERVICE_TYPE_MAP[statusKey];
            else if (BILLING_CYCLE_MAP[statusKey]) config = BILLING_CYCLE_MAP[statusKey];
            else if (USER_STATUS_MAP[statusKey] || USER_STATUS_MAP[String(status)]) config = USER_STATUS_MAP[statusKey] || USER_STATUS_MAP[String(status)];
            else if (VIOLATION_SEVERITY_MAP[statusKey]) config = VIOLATION_SEVERITY_MAP[statusKey];
        }
    }

    // Default Fallback
    return config || {
        label: statusString, // Return specific trimmed string
        variant: "secondary",
        icon: HelpCircle
    };
}
