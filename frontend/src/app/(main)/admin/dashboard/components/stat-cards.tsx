import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, FileWarning, Bell } from "lucide-react";

interface StatCardsProps {
    revenue: number;
    occupancyRate: number;
    activeStudents: number;
    pendingRequests: number;
    alerts: number;
}

export function StatCards({ revenue, occupancyRate, activeStudents, pendingRequests, alerts }: StatCardsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-white to-green-50 dark:from-background dark:to-green-900/10 border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Doanh thu</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(revenue)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Thực thu từ hóa đơn
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-background dark:to-blue-900/10 border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Tỷ lệ Lấp đầy</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{Number(occupancyRate).toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {activeStudents} sinh viên đang ở
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-white to-yellow-50 dark:from-background dark:to-yellow-900/10 border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Yêu cầu Chờ xử lý</CardTitle>
                    <FileWarning className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingRequests}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Hợp đồng cần duyệt
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-white to-red-50 dark:from-background dark:to-red-900/10 border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Hóa đơn Quá hạn</CardTitle>
                    <Bell className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{alerts}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Cần nhắc nhở thanh toán
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
