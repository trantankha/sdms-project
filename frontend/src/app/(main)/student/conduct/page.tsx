"use client";

import { useEffect, useState } from "react";
import { conductService } from "@/services/conduct-service";
import { Violation, ViolationSeverity } from "@/types/conduct";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert, Calendar, AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function StudentConductPage() {
    const [violations, setViolations] = useState<Violation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await conductService.getMyViolations();
            setViolations(data);
        } catch (error) {
            console.error("Failed to load violations", error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case ViolationSeverity.CRITICAL:
                return <Badge variant="destructive" className="flex items-center gap-1"><AlertOctagon className="h-3 w-3" /> Kỷ luật</Badge>;
            case ViolationSeverity.MAJOR:
                return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Cảnh cáo</Badge>;
            case ViolationSeverity.WARNING:
                return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 flex items-center gap-1"><Info className="h-3 w-3" /> Nhắc nhở</Badge>;
            default:
                return <Badge variant="outline">{severity}</Badge>;
        }
    };

    // Stats
    const totalPoints = violations.reduce((sum, v) => sum + v.points_deducted, 0);
    const criticalCount = violations.filter(v => v.severity === ViolationSeverity.CRITICAL).length;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 container max-w-5xl mx-auto pb-10">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Hồ sơ Kỷ luật</h1>
                <p className="text-muted-foreground mt-2">
                    Theo dõi lịch sử rèn luyện và các ghi nhận vi phạm nội quy.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-background dark:to-muted border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số ghi nhận</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{violations.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Lần vi phạm</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white to-orange-50 dark:from-background dark:to-orange-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng điểm trừ</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">{totalPoints}</div>
                        <p className="text-xs text-muted-foreground mt-1">Điểm rèn luyện bị trừ</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white to-red-50 dark:from-background dark:to-red-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Mức độ nghiêm trọng</CardTitle>
                        <AlertOctagon className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Lần kỷ luật cấp cao</p>
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-6" />

            {/* Timeline View */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Lịch sử ghi nhận
                </h2>

                {violations.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-4">
                            <div className="bg-green-100 p-4 rounded-full dark:bg-green-900/20">
                                <ShieldAlert className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-foreground">Không có vi phạm nào</h3>
                                <p>Tuyệt vời! Bạn đang chấp hành tốt nội quy KTX.</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="relative border-l-2 border-muted ml-3 space-y-8 pl-8 pb-8">
                        {violations.map((violation) => (
                            <div key={violation.id} className="relative group">
                                {/* Timeline Dot */}
                                <div className={`absolute -left-[41px] top-1 h-5 w-5 rounded-full border-4 border-background ${violation.severity === ViolationSeverity.CRITICAL ? 'bg-red-500' :
                                    violation.severity === ViolationSeverity.MAJOR ? 'bg-orange-500' : 'bg-gray-400'
                                    } shadow-sm`} />

                                <Card className="hover:shadow-lg transition-shadow border-muted">
                                    <CardHeader>
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-lg">{violation.title}</CardTitle>
                                                    {getSeverityBadge(violation.severity)}
                                                </div>
                                                <CardDescription className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(violation.violation_date).toLocaleDateString("vi-VN", {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </CardDescription>
                                            </div>
                                            <div className="flex-shrink-0 text-right">
                                                <span className="text-sm font-medium text-muted-foreground">Điểm trừ</span>
                                                <div className="text-2xl font-bold text-red-600">-{violation.points_deducted}</div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed">
                                            {violation.description}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
