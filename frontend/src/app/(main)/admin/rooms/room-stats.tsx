import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble, Building2, Users, AlertCircle } from "lucide-react";

// Interface matching backend response
export interface RoomStatistics {
    total_rooms: number;
    total_capacity: number;
    total_occupied: number;
    occupancy_rate: number;
    status_breakdown: Record<string, number>;
}


interface RoomStatsProps {
    stats: RoomStatistics | null;
}

export function RoomStats({ stats }: RoomStatsProps) {
    if (!stats) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="h-32 bg-muted/50" />
                ))}
            </div>
        );
    }

    const { total_rooms, total_capacity, total_occupied, occupancy_rate, status_breakdown } = stats;

    // Sum maintenance-related statuses just in case (e.g. BAO_TRI)
    const maintenanceCount = (status_breakdown['BAO_TRI'] || 0) + (status_breakdown['MAINTENANCE'] || 0);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-background dark:to-blue-900/10 border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số Phòng</CardTitle>
                    <Building2 className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{total_rooms}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        trên tất cả tòa nhà
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-white to-indigo-50 dark:from-background dark:to-indigo-900/10 border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Sức chứa</CardTitle>
                    <BedDouble className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{total_capacity}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        giường khả dụng
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-white to-green-50 dark:from-background dark:to-green-900/10 border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Tỷ lệ Lấp đầy</CardTitle>
                    <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.round(occupancy_rate)}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {total_occupied} sinh viên đang cư trú
                    </p>
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-white to-orange-50 dark:from-background dark:to-orange-900/10 border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Đang Bảo trì</CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{maintenanceCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        phòng đang sửa chữa
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
