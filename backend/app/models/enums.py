import enum

class GenderType(str, enum.Enum):
    MALE = "NAM"
    FEMALE = "NU"
    MIXED = "HON_HOP"

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    MANAGER = "QUAN_LY_TOA"
    STUDENT = "SINH_VIEN"

class InvoiceStatus(str, enum.Enum):
    UNPAID = "CHUA_THANH_TOAN"
    PARTIAL = "TRA_MOT_PHAN"
    PAID = "DA_THANH_TOAN"
    OVERDUE = "QUA_HAN"
    CANCELLED = "DA_HUY"

class PaymentMethod(str, enum.Enum):
    CASH = "TIEN_MAT"
    BANK_TRANSFER = "CHUYEN_KHOAN"
    ONLINE = "ONLINE"
    VIRTUAL_BANK = "NGAN_HANG_AO"

class UtilityType(str, enum.Enum):
    ELECTRICITY = "DIEN"
    WATER = "NUOC"

class RoomStatus(str, enum.Enum):
    AVAILABLE = "CON_CHO"
    FULL = "DAY"
    MAINTENANCE = "BAO_TRI"
    RESERVED = "GIU_CHO"
    CLEANING = "DANG_DON"

class BedStatus(str, enum.Enum):
    AVAILABLE = "TRONG"
    OCCUPIED = "DANG_O"
    MAINTENANCE = "BAO_TRI"
    RESERVED = "DA_DAT"

class ContractStatus(str, enum.Enum):
    PENDING = "CHO_DUYET"
    ACTIVE = "DANG_O"
    EXPIRED = "HET_HAN"
    TERMINATED = "CHAM_DUT"

class ServiceType(str, enum.Enum):
    PARKING = "GIU_XE"
    LAUNDRY = "GIAT_LA"
    CLEANING = "DON_DEP"
    WATER_DELIVERY = "GIAO_NUOC"
    INTERNET = "INTERNET"
    OTHER = "KHAC"

class BillingCycle(str, enum.Enum):
    ONE_TIME = "MOT_LAN"
    MONTHLY = "HANG_THANG"
    SEMESTER = "HOC_KY"

class RequestStatus(str, enum.Enum):
    OPEN = "MOI"
    IN_PROGRESS = "DANG_XU_LY"
    DONE = "HOAN_THANH"
    REJECTED = "TU_CHOI"

class AnnouncementPriority(str, enum.Enum):
    NORMAL = "BINH_THUONG"
    HIGH = "QUAN_TRONG"
    URGENT = "KHAN_CAP"

class ViolationSeverity(str, enum.Enum):
    WARNING = "NHAC_NHO"
    MAJOR = "CANH_CAO"
    CRITICAL = "KY_LUAT"

class TransferStatus(str, enum.Enum):
    PENDING = "CHO_DUYET"
    APPROVED = "DA_DUYET"
    REJECTED = "TU_CHOI"

class AnnouncementScope(str, enum.Enum):
    GLOBAL = "TOAN_HE_THONG"
    CAMPUS = "CO_SO"
    BUILDING = "TOA_NHA"
    ROLE = "NHOM_NGUOI_DUNG"

class AnnouncementStatus(str, enum.Enum):
    DRAFT = "NHAP"
    PUBLISHED = "DA_DANG"
    ARCHIVED = "LUU_TRU"
