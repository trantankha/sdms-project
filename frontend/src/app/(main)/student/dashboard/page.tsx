"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Home,
    FileText,
    AlertCircle,
    Zap,
    ArrowRight,
    DollarSign,
    Wrench,
    Megaphone,
    Calendar,
    Clock
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { communicationService } from "@/services/communication-service";
import { dashboardService, StudentDashboardStats } from "@/services/dashboard-service";
import { Announcement, AnnouncementScope, AnnouncementPriority } from "@/types/communication";
import { Badge } from "@/components/ui/badge";

export default function StudentDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<StudentDashboardStats | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch stats and announcements in parallel
                // Use 'size' instead of 'limit'
                const [statsData, announcementsData] = await Promise.all([
                    dashboardService.getStudentStats(),
                    communicationService.getAnnouncements({ size: 5 })
                ]);
                setStats(statsData);
                setAnnouncements(announcementsData);
            } catch (error) {
                console.error("Dashboard load failed", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getContractStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
            case 'DANG_O':
                return <Badge className="bg-green-600 hover:bg-green-700">Đang ở</Badge>;
            case 'PENDING':
            case 'CHO_DUYET':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Chờ duyệt</Badge>;
            case 'EXPIRED':
            case 'HET_HAN':
                return <Badge variant="destructive">Hết hạn</Badge>;
            case 'TERMINATED':
            case 'CHAM_DUT':
                return <Badge variant="secondary">Đã chấm dứt</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                        Xin chào, {user?.full_name || "Sinh viên"}!
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Chào mừng bạn quay trở lại hệ thống quản lý KTX.
                    </p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-white to-orange-50 dark:from-background dark:to-orange-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Yêu cầu hỗ trợ</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{loading ? "..." : stats?.active_requests_count || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Đang xử lý</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white to-red-50 dark:from-background dark:to-red-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Công nợ</CardTitle>
                        <FileText className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {loading ? "..." : (stats?.unpaid_invoices_count || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tổng: {loading ? "..." : formatCurrency(stats?.unpaid_invoices_total || 0)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white to-yellow-50 dark:from-background dark:to-yellow-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Điện / Nước</CardTitle>
                        <Zap className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                            <span>Điện: <span className="font-bold">{loading ? "..." : stats?.utility_usage?.electricity}</span> kWh</span>
                            <span>Nước: <span className="font-bold">{loading ? "..." : stats?.utility_usage?.water}</span> m³</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Tháng gần nhất</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-background dark:to-blue-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Phòng của bạn</CardTitle>
                        <Home className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                            {loading ? "..." : (stats?.room_info?.code || "Chưa có")}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {loading ? "..." : (stats?.room_info?.building || "---")}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Areas */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Left: Notices */}
                <div className="col-span-4 space-y-6">
                    <Card className="h-full border-none shadow-sm flex flex-col bg-background/50 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Megaphone className="h-5 w-5 text-primary" />
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl">Thông báo chung</CardTitle>
                                        <CardDescription>Tin tức mới nhất từ ban quản lý</CardDescription>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto pr-2">
                            {loading ? (
                                <div className="text-center py-10 text-muted-foreground">Đang tải...</div>
                            ) : announcements.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
                                    <div className="bg-muted/50 p-4 rounded-full">
                                        <Megaphone className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                    <p>Chưa có thông báo mới nào.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {announcements.map((announcement) => (
                                        <div key={announcement.id} className="group relative flex gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors bg-card">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm group-hover:shadow-md transition-shadow">
                                                {announcement.priority === AnnouncementPriority.URGENT ? (
                                                    <AlertCircle className="h-6 w-6 text-red-500" />
                                                ) : announcement.scope === AnnouncementScope.GLOBAL ? (
                                                    <Megaphone className="h-6 w-6 text-blue-500" />
                                                ) : (
                                                    <FileText className="h-6 w-6 text-orange-500" />
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col gap-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className="font-semibold text-sm leading-none group-hover:text-primary transition-colors line-clamp-1">
                                                        {announcement.title}
                                                    </h4>
                                                    <span className="flex items-center text-[10px] text-muted-foreground whitespace-nowrap">
                                                        <Clock className="mr-1 h-3 w-3" />
                                                        {new Date(announcement.created_at).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {announcement.content}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                                                        {announcement.scope === AnnouncementScope.GLOBAL ? 'Toàn hệ thống' :
                                                            announcement.scope === AnnouncementScope.CAMPUS ? 'Cơ sở' :
                                                                announcement.scope === AnnouncementScope.BUILDING ? 'Tòa nhà' : announcement.scope}
                                                    </Badge>

                                                    {announcement.priority === AnnouncementPriority.HIGH && (
                                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400">Quan trọng</Badge>
                                                    )}
                                                    {announcement.priority === AnnouncementPriority.URGENT && (
                                                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5 font-normal">Khẩn cấp</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Quick Actions */}
                <div className="col-span-3 space-y-6">
                    <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Tác vụ nhanh</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Link href="/student/requests">
                                <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/10 dark:hover:border-orange-900/30 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 group-hover:scale-110 transition-transform">
                                        <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <span className="mt-3 text-sm font-medium group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">Báo hỏng</span>
                                </div>
                            </Link>

                            <Link href="/student/finance">
                                <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/10 dark:hover:border-green-900/30 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform">
                                        <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="mt-3 text-sm font-medium group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">Thanh toán</span>
                                </div>
                            </Link>

                            <Link href="/student/services">
                                <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/10 dark:hover:border-blue-900/30 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                                        <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="mt-3 text-sm font-medium group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Đăng ký DV</span>
                                </div>
                            </Link>

                            <Link href="/student/room">
                                <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/10 dark:hover:border-purple-900/30 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform">
                                        <Home className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <span className="mt-3 text-sm font-medium group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">Xem Phòng</span>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Compact Contract Status */}
                    <Card className="shadow-sm border-l-4 border-l-primary/70">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base">Trạng thái Hợp đồng</CardTitle>
                                {stats?.room_info ? (
                                    getContractStatusBadge(stats.room_info.contract_status)
                                ) : (
                                    <Badge variant="outline" className="bg-gray-100 text-gray-500">Chưa đăng ký</Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground/70" />
                                    {stats?.room_info?.end_date
                                        ? `Hết hạn: ${new Date(stats.room_info.end_date).toLocaleDateString('vi-VN')}`
                                        : "Bạn chưa có hợp đồng phòng ở nào."}
                                </p>
                                <Link href="/student/room" className="inline-block mt-3 w-full">
                                    <Button variant="outline" size="sm" className="w-full">
                                        Xem chi tiết hợp đồng <ArrowRight className="ml-2 h-3 w-3" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
