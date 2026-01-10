"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ShieldAlert } from "lucide-react";
import { conductService } from "@/services/conduct-service";
import { Violation, ViolationSeverity } from "@/types/conduct";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ViolationFormModal } from "./violation-form-modal";
import { createColumns } from "./columns";
import { ViolationDetailSheet } from "./violation-detail-sheet";

export default function ConductPage() {
    const [violations, setViolations] = useState<Violation[]>([]);
    const [loading, setLoading] = useState(true);
    const [severityFilter, setSeverityFilter] = useState<string>("ALL");

    // Modal State (Create/Edit)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingViolation, setEditingViolation] = useState<Violation | null>(null);

    // Sheet State (View Details)
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

    useEffect(() => {
        loadViolations();
    }, []);

    const loadViolations = async () => {
        try {
            const data = await conductService.getViolations();
            setViolations(data);
        } catch (error) {
            console.error("Failed to load violations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingViolation(null);
        setIsModalOpen(true);
    };

    const handleView = (violation: Violation) => {
        setSelectedViolation(violation);
        setIsSheetOpen(true);
    };

    const handleEdit = (violation: Violation) => {
        setEditingViolation(violation);
        setIsModalOpen(true);
        // If sheet is open, we can close it or keep it open.
        // Usually, editing replaces the view context, so we might keep it open if we want to return to it, 
        // but since the modal overlays everything, it's fine.
        // However, if we edit from the sheet, we might want to refresh the sheet data after edit.
    };

    const columns = createColumns(handleView, handleEdit);

    const filteredViolations = severityFilter === "ALL"
        ? violations
        : violations.filter(v => v.severity === severityFilter);

    // Calculate Stats
    const totalViolations = violations.length;
    const criticalViolations = violations.filter(v => v.severity === ViolationSeverity.CRITICAL).length;
    const totalPointsDeducted = violations.reduce((sum, v) => sum + v.points_deducted, 0);

    return (
        <div className="flex flex-col gap-8 p-6 bg-muted/20 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                        Quản lý Kỷ luật
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Theo dõi và quản lý hồ sơ kỷ luật sinh viên.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleCreate} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Ghi nhận Vi phạm
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-background dark:to-blue-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số Vi phạm</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{totalViolations}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ghi nhận kỳ này</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-red-50 dark:from-background dark:to-red-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Vấn đề Nghiêm trọng</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">{criticalViolations}</div>
                        <p className="text-xs text-muted-foreground mt-1">Cần xử lý ngay</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-orange-50 dark:from-background dark:to-orange-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Điểm trừ</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{totalPointsDeducted}</div>
                        <p className="text-xs text-muted-foreground mt-1">Tổng phạt tích lũy</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {[
                    { label: "Tất cả", value: "ALL" },
                    { label: "Kỷ luật", value: ViolationSeverity.CRITICAL },
                    { label: "Cảnh cáo", value: ViolationSeverity.MAJOR },
                    { label: "Nhắc nhở", value: ViolationSeverity.WARNING }
                ].map((item) => (
                    <Button
                        key={item.value}
                        variant={severityFilter === item.value ? "default" : "outline"}
                        onClick={() => setSeverityFilter(item.value)}
                        className={`rounded-full px-4 ${severityFilter === item.value
                            ? ""
                            : "bg-background hover:bg-muted"
                            }`}
                        size="sm"
                    >
                        {item.label}
                    </Button>
                ))}
            </div>

            <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle>Hồ sơ Vi phạm</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={filteredViolations}
                        searchKey="student"
                        searchPlaceholder="Tìm theo Tên hoặc MSSV..."
                    />
                </CardContent>
            </Card>

            <ViolationFormModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                violation={editingViolation}
                onSuccess={loadViolations}
            />

            <ViolationDetailSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                violation={selectedViolation}
                onEdit={handleEdit}
                onRefresh={loadViolations}
            />
        </div>
    );
}
