import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity } from "@/services/dashboard-service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
    Banknote,
    AlertCircle,
    FileText,
    UserPlus,
    Zap,
    Droplets,
    Clock,
    Home,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
    activities?: Activity[];
}

export function RecentActivity({ activities = [] }: RecentActivityProps) {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatTime = (timestamp: string) => {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: vi });
    };

    const getActivityIcon = (type: string, subtype?: string) => {
        switch (type) {
            case 'FINANCE':
                return <Banknote className="h-4 w-4 text-emerald-600" />;
            case 'SUPPORT':
                return <AlertCircle className="h-4 w-4 text-orange-500" />;
            case 'CONTRACT':
                return <FileText className="h-4 w-4 text-blue-500" />;
            case 'STUDENT':
                return <UserPlus className="h-4 w-4 text-indigo-500" />;
            case 'UTILITY':
                if (subtype?.includes('ELECTRIC')) return <Zap className="h-4 w-4 text-yellow-500" />;
                if (subtype?.includes('WATER')) return <Droplets className="h-4 w-4 text-cyan-500" />;
                return <Home className="h-4 w-4 text-purple-500" />; // Default utility/room
            case 'SYSTEM':
                return <ShieldAlert className="h-4 w-4 text-gray-500" />;
            default:
                return <Clock className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'FINANCE': return "bg-emerald-100 dark:bg-emerald-900/20";
            case 'SUPPORT': return "bg-orange-100 dark:bg-orange-900/20";
            case 'CONTRACT': return "bg-blue-100 dark:bg-blue-900/20";
            case 'STUDENT': return "bg-indigo-100 dark:bg-indigo-900/20";
            case 'UTILITY': return "bg-yellow-100 dark:bg-yellow-900/20";
            default: return "bg-gray-100 dark:bg-gray-800";
        }
    };

    return (
        <Card className="col-span-12 md:col-span-4 border-none shadow-md h-full">
            <CardHeader>
                <CardTitle>Hoạt động Gần đây</CardTitle>
                <CardDescription>Cập nhật theo thời gian thực</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-0 relative pl-2">
                    {/* Vertical Timeline Line */}
                    {activities.length > 0 && (
                        <div className="absolute left-[19px] top-2 bottom-4 w-[2px] bg-muted/50" />
                    )}

                    {activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <Clock className="h-10 w-10 text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground">Chưa có hoạt động nào được ghi nhận.</p>
                        </div>
                    ) : (
                        activities.map((item, index) => (
                            <div className="flex gap-4 relative pb-6 group last:pb-0" key={index}>
                                {/* Icon Timeline Node */}
                                <div className={cn(
                                    "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-background shadow-sm",
                                    getActivityColor(item.type)
                                )}>
                                    {getActivityIcon(item.type, item.subtype)}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col space-y-1 pt-1 min-w-0 flex-1">
                                    <div className="flex items-center justify-between text-base">
                                        <p className="font-medium truncate pr-2 text-sm text-foreground/90 group-hover:text-primary transition-colors">
                                            {item.title}
                                        </p>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted/50 px-1.5 py-0.5 rounded">
                                            {formatTime(item.timestamp)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            <span className="font-medium text-foreground/70 mr-1">
                                                {item.user.name}
                                            </span>
                                            {item.description}
                                        </p>
                                        {item.amount && (
                                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30 whitespace-nowrap">
                                                +{formatCurrency(item.amount)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
