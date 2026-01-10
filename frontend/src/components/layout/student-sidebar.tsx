"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Home,
    DollarSign,
    Wrench,
    MessageSquare,
    LogOut,
    HelpCircle,
    User,
    ShieldAlert
} from "lucide-react";
import { LogoutConfirmDialog } from "@/components/logout-confirm-dialog";
import { dashboardService } from "@/services/dashboard-service";
import { eventBus, REFRESH_SIDEBAR } from "@/lib/events";

const sidebarItems = [
    {
        title: "Tổng Quan",
        href: "/student/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Phòng ngủ",
        href: "/student/room",
        icon: Home,
    },
    {
        id: "finance",
        title: "Tài chính",
        href: "/student/finance",
        icon: DollarSign,
    },
    {
        title: "Dịch vụ",
        href: "/student/services",
        icon: Wrench,
    },
    {
        id: "requests",
        title: "Yêu cầu",
        href: "/student/requests",
        icon: HelpCircle,
    },
    {
        title: "Tin tức",
        href: "/student/news",
        icon: MessageSquare,
    },
    {
        title: "Kỷ luật",
        href: "/student/conduct",
        icon: ShieldAlert,
    },
    {
        title: "Hồ sơ",
        href: "/student/profile",
        icon: User,
    }
];

export function StudentSidebar() {
    const pathname = usePathname();
    const [counts, setCounts] = useState<{
        unpaidInvoices: number;
        activeRequests: number;
    }>({ unpaidInvoices: 0, activeRequests: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // dashboardService.getStudentStats() returns 401 if not logged in, but sidebar is usually protected layout.
                // We should handle try-catch gracefully.
                const stats = await dashboardService.getStudentStats();
                setCounts({
                    unpaidInvoices: stats.unpaid_invoices_count || 0,
                    activeRequests: stats.active_requests_count || 0,
                });
            } catch (error) {
                // Silent error if just created account/no data/or session expired
                console.error("Failed to sidebar stats", error);
            }
        };

        fetchStats();

        // Listen for updates
        eventBus.on(REFRESH_SIDEBAR, fetchStats);

        // Poll every 60s
        const interval = setInterval(fetchStats, 60000);

        return () => {
            clearInterval(interval);
            eventBus.off(REFRESH_SIDEBAR, fetchStats);
        };
    }, []);

    const getBadgeCount = (id?: string) => {
        if (id === 'finance') return counts.unpaidInvoices;
        if (id === 'requests') return counts.activeRequests;
        return 0;
    };

    return (
        <div className="flex h-screen sticky top-0 left-0 z-30 w-full flex-col border-r bg-card text-card-foreground">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/student/dashboard" className="flex items-center gap-2 font-semibold">
                    <Home className="h-6 w-6 text-red-600" />
                    <span className="text-lg font-bold text-primary">Cổng thông tin</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {sidebarItems.map((item) => {
                        const count = getBadgeCount((item as any).id);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:text-primary relative",
                                    pathname.startsWith(item.href)
                                        ? "bg-muted text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                <span className="flex-1">{item.title}</span>
                                {count > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="h-5 w-5 flex items-center justify-center p-0 rounded-full text-[10px]"
                                    >
                                        {count > 9 ? '9+' : count}
                                    </Badge>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="mt-auto border-t p-4">
                <LogoutConfirmDialog>
                    <Button variant="outline" className="w-full justify-start gap-2">
                        <LogOut className="h-4 w-4" />
                        Đăng xuất
                    </Button>
                </LogoutConfirmDialog>
            </div>
        </div>
    );
}
