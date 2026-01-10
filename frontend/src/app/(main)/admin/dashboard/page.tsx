"use client";

import { useEffect, useState } from "react";
import { roomService } from "@/services/room-service";
import { financeService } from "@/services/finance-service";
import { contractService } from "@/services/contract-service";
import { dashboardService } from "@/services/dashboard-service";
import { StatCards } from "./components/stat-cards";
import { OccupancyChart } from "./components/occupancy-chart";
import { RecentActivity } from "./components/recent-activity";
import { DashboardBanner } from "./components/dashboard-banner";
import { Button } from "@/components/ui/button";
import { CalendarDateRangePicker } from "./components/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [roomData, revenueData, contractData, activityData] = await Promise.all([
                    roomService.getRoomStats(),
                    financeService.getStats(),
                    contractService.getStats(),
                    dashboardService.getActivities()
                ]);
                setStats({
                    room: roomData,
                    finance: revenueData,
                    contract: contractData,
                    activities: activityData.slice(0, 4)
                });
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };
        loadData();
    }, []);

    const { room, finance, contract, activities } = stats || {
        room: { total_rooms: 0, total_capacity: 0, total_occupied: 0, occupancy_rate: 0, building_stats: [] },
        finance: { total_revenue: 0, overdue_invoices: 0, pending_invoices: 0 },
        contract: { pending_contracts: 0 },
        activities: []
    };

    const occupancyRate = room.occupancy_rate ? Number(room.occupancy_rate.toFixed(1)) : 0;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                    Tổng Quan
                </h2>
                <div className="flex items-center space-x-2">
                    <CalendarDateRangePicker />
                    <Button>Tải Báo cáo</Button>
                </div>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="analytics">Phân tích</TabsTrigger>
                    <TabsTrigger value="reports">Báo cáo</TabsTrigger>
                    <TabsTrigger value="notifications">Thông báo</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <StatCards
                        revenue={finance.total_revenue}
                        occupancyRate={occupancyRate}
                        activeStudents={room.total_occupied}
                        pendingRequests={contract.pending_contracts}
                        alerts={finance.overdue_invoices}
                    />

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <OccupancyChart data={room.building_stats || []} />
                        <div className="col-span-1 lg:col-span-4">
                            <RecentActivity activities={activities} />
                        </div>
                        <div className="col-span-1 lg:col-span-3">
                            <DashboardBanner />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="analytics" className="space-y-4">
                    <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Tính năng Phân tích đang được phát triển...</p>
                    </div>
                </TabsContent>
                <TabsContent value="reports" className="space-y-4">
                    <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Tính năng Báo cáo đang được phát triển...</p>
                    </div>
                </TabsContent>
                <TabsContent value="notifications" className="space-y-4">
                    <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Tính năng Thông báo đang được phát triển...</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
