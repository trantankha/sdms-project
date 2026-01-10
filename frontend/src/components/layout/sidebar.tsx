"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    Building2,
    Users,
    FileText,
    DollarSign,
    LogOut,
    ShieldAlert,
    Wrench,
    MessageSquare,
    ArrowLeftRight,
    HelpCircle
} from "lucide-react";
import { LogoutConfirmDialog } from "@/components/logout-confirm-dialog";
import { requestService } from "@/services/request-service";
import { transferService } from "@/services/transfer-service";
import { contractService } from "@/services/contract-service";
import { RequestStatus, TransferStatus } from "@/types";

const sidebarItems = [
    {
        title: "Tổng Quan",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Phòng ở",
        href: "/admin/rooms",
        icon: Building2,
    },
    {
        title: "Sinh viên",
        href: "/admin/students",
        icon: Users,
    },
    {
        id: "contracts",
        title: "Hợp đồng",
        href: "/admin/contracts",
        icon: FileText,
    },
    {
        title: "Tài chính",
        href: "/admin/finance",
        icon: DollarSign,
    },
    {
        title: "Dịch vụ",
        href: "/admin/services",
        icon: Wrench,
    },
    {
        title: "Tin tức",
        href: "/admin/communication",
        icon: MessageSquare,
    },
    {
        title: "Kỷ luật",
        href: "/admin/conduct",
        icon: ShieldAlert,
    },
    {
        id: "transfers",
        title: "Chuyển phòng",
        href: "/admin/transfers",
        icon: ArrowLeftRight,
    },
    {
        id: "requests",
        title: "Yêu cầu",
        href: "/admin/requests",
        icon: HelpCircle,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [counts, setCounts] = useState<{
        requests: number;
        transfers: number;
        contracts: number;
    }>({ requests: 0, transfers: 0, contracts: 0 });

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [requests, transfers, contractStats] = await Promise.all([
                    requestService.getRequests(RequestStatus.OPEN),
                    transferService.getTransfers({ status: TransferStatus.PENDING }),
                    contractService.getStats()
                ]);

                // Handle potential API variations (e.g. if services return wrapped objects)
                // Assuming service methods return arrays directly as per previous analysis
                const requestCount = Array.isArray(requests) ? requests.length : 0;
                const transferCount = Array.isArray(transfers) ? transfers.length : 0;
                const contractCount = contractStats?.pending_contracts || 0;

                setCounts({
                    requests: requestCount,
                    transfers: transferCount,
                    contracts: contractCount
                });
            } catch (error) {
                console.error("Failed to fetch sidebar counts", error);
            }
        };

        fetchCounts();

        // Poll every 30 seconds for updates
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, []);

    const getBadgeCount = (id?: string) => {
        switch (id) {
            case "requests": return counts.requests;
            case "transfers": return counts.transfers;
            case "contracts": return counts.contracts;
            default: return 0;
        }
    };

    return (
        <div className="flex h-screen sticky top-0 w-full flex-col border-r bg-card text-card-foreground">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Building2 className="h-6 w-6 text-red-600" />
                    <span className="text-lg font-bold text-primary">Ký túc xá UTEHY</span>
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
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary relative",
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
