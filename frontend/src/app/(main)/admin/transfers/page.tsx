"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftRight, Clock, CheckCircle } from "lucide-react";
import { transferService } from "@/services/transfer-service";
import { TransferRequest, TransferStatus } from "@/types/transfers";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ReviewTransferModal } from "./review-transfer-modal";
import { getColumns } from "./columns";

export default function TransfersPage() {
    const [transfers, setTransfers] = useState<TransferRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    // Modal State
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);

    useEffect(() => {
        loadTransfers();
    }, []);

    const loadTransfers = async () => {
        try {
            const data = await transferService.getTransfers();
            setTransfers(data);
        } catch (error) {
            console.error("Failed to load transfers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = (transfer: TransferRequest) => {
        setSelectedTransfer(transfer);
        setIsReviewOpen(true);
    };

    const columns = getColumns(handleReview);

    const filteredTransfers = statusFilter === "ALL"
        ? transfers
        : transfers.filter(t => t.status === statusFilter);

    // ... (stats calculation remains same)
    const totalRequests = transfers.length;
    const pendingRequests = transfers.filter(t => t.status === TransferStatus.PENDING).length;
    const approvedRequests = transfers.filter(t => t.status === TransferStatus.APPROVED).length;

    const getCount = (status: string) => {
        if (status === "ALL") return transfers.length;
        return transfers.filter(t => t.status === status).length;
    };

    return (
        <div className="flex flex-col gap-8 p-6 bg-muted/20 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                        Yêu cầu Chuyển phòng
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Quản lý yêu cầu chuyển phòng hoặc tòa nhà của sinh viên.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-background dark:to-blue-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Yêu cầu</CardTitle>
                        <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{totalRequests}</div>
                        <p className="text-xs text-muted-foreground mt-1">Tất cả bản ghi</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-yellow-50 dark:from-background dark:to-yellow-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Chờ duyệt</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600 border-none">{pendingRequests}</div>
                        <p className="text-xs text-muted-foreground mt-1">Đang chờ phê duyệt</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-green-50 dark:from-background dark:to-green-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Đã duyệt</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">{approvedRequests}</div>
                        <p className="text-xs text-muted-foreground mt-1">Đã xử lý thành công</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {[
                    { label: "Tất cả", value: "ALL" },
                    { label: "Chờ duyệt", value: TransferStatus.PENDING },
                    { label: "Đã duyệt", value: TransferStatus.APPROVED },
                    { label: "Từ chối", value: TransferStatus.REJECTED },
                    { label: "Hoàn tất", value: TransferStatus.COMPLETED }
                ].map((item) => (
                    <Button
                        key={item.value}
                        variant={statusFilter === item.value ? "default" : "outline"}
                        onClick={() => setStatusFilter(item.value)}
                        className={`rounded-full px-4 ${statusFilter === item.value
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
                    <CardTitle>Danh sách Yêu cầu</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={filteredTransfers}
                        searchKey="student_id"
                        searchPlaceholder="Tìm theo ID Sinh viên..."
                    />
                </CardContent>
            </Card>

            <ReviewTransferModal
                open={isReviewOpen}
                onOpenChange={setIsReviewOpen}
                transfer={selectedTransfer}
                onSuccess={loadTransfers}
            />
        </div>
    );
}
