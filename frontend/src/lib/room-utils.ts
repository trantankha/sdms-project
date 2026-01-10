export const formatStatus = (status: string) => {
    switch (status) {
        // Backend returns the Enum Value (Vietnamese), so we check for those
        case 'CON_CHO':
        case 'AVAILABLE':
            return 'Còn trống';

        case 'DAY':
        case 'FULL':
            return 'Đã đầy';

        case 'BAO_TRI':
        case 'MAINTENANCE':
            return 'Bảo trì';

        case 'GIU_CHO':
        case 'RESERVED':
            return 'Đã giữ chỗ';

        case 'DANG_DON':
        case 'CLEANING':
            return 'Đang dọn';

        default: return status; // Return as is if unknown, or format more
    }
};

export const getStatusColor = (status: string) => {
    switch (status) {
        case 'CON_CHO':
        case 'AVAILABLE':
            return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200';

        case 'DAY':
        case 'FULL':
            return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200';

        case 'BAO_TRI':
        case 'MAINTENANCE':
            return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200';

        case 'GIU_CHO':
        case 'RESERVED':
            return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200';

        default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
};

export const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};
