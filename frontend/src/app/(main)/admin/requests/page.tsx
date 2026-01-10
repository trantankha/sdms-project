"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, Filter, MoreHorizontal, Eye, CheckCircle, XCircle, AlertCircle, Clock, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { requestService } from "@/services/request-service";
import { MaintenanceRequest, RequestStatus } from "@/types";
import { RequestActionDialog } from "./request-action-dialog";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/status-badge";
import { useSearch } from "@/hooks/use-search";
import { DebouncedInput } from "@/components/ui/debounced-input";

export default function AdminRequestsPage() {
    const {
        searchQuery,
        setSearchQuery,
        filters,
        setFilter,
        page,
        setPage,
        limit,
        setLimit
    } = useSearch({ defaultLimit: 10 });

    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
    const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            // Fetch all requests then filter client side because API is limited
            const statusParam = filters.status === 'ALL' ? undefined : (filters.status as RequestStatus);
            const data = await requestService.getRequests(statusParam);
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [filters.status]); // Re-fetch only when status filter changes (API support)

    // Client-side filtering for Search, since API might not support it yet
    const filteredRequests = requests.filter(req => {
        if (!searchQuery) return true;
        const lowerQuery = searchQuery.toLowerCase();
        return (
            req.title.toLowerCase().includes(lowerQuery) ||
            req.description?.toLowerCase().includes(lowerQuery) ||
            req.room_code?.toLowerCase().includes(lowerQuery)
        );
    });

    const handleAction = (request: MaintenanceRequest) => {
        setSelectedRequest(request);
        setIsActionDialogOpen(true);
    };

    const columns: ColumnDef<MaintenanceRequest>[] = [
        {
            accessorKey: "created_at",
            header: "Ngày gửi",
            cell: ({ row }) => <div className="text-muted-foreground">{format(new Date(row.original.created_at), "dd/MM/yyyy HH:mm")}</div>
        },
        {
            accessorKey: "title",
            header: "Tiêu đề",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.title}</span>
                    {row.original.description && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {row.original.description}
                        </span>
                    )}
                </div>
            )
        },
        {
            accessorKey: "room_code",
            header: "Phòng",
            cell: ({ row }) => <Badge variant="secondary">{row.original.room_code || "N/A"}</Badge>
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => <StatusBadge status={row.original.status} type="request" />
        },
        {
            id: "actions",
            cell: ({ row }) => {
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleAction(row.original)}>
                                <Eye className="mr-2 h-4 w-4" /> Xem & Xử lý
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ];

    // Stats calculation
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === RequestStatus.OPEN || r.status === RequestStatus.IN_PROGRESS).length;
    const doneRequests = requests.filter(r => r.status === RequestStatus.DONE).length;

    const currentStatus = filters.status || "ALL";

    return (
        <div className="flex flex-col gap-8 p-6 bg-muted/20 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                        Quản lý Yêu cầu & Sự cố
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Tiếp nhận và xử lý các báo cáo từ sinh viên.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fetchRequests()}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-background dark:to-blue-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng yêu cầu</CardTitle>
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{loading ? "..." : totalRequests}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ghi nhận (theo bộ lọc hiện tại)</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-orange-50 dark:from-background dark:to-orange-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Chờ xử lý</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600 border-none">{loading ? "..." : pendingRequests}</div>
                        <p className="text-xs text-muted-foreground mt-1">Yêu cầu chưa hoàn thành</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-green-50 dark:from-background dark:to-green-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Đã hoàn thành</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">{loading ? "..." : doneRequests}</div>
                        <p className="text-xs text-muted-foreground mt-1">Yêu cầu đã xử lý xong</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {[
                    { label: "Tất cả", value: "ALL" },
                    { label: "Mới", value: RequestStatus.OPEN },
                    { label: "Đang xử lý", value: RequestStatus.IN_PROGRESS },
                    { label: "Đã xong", value: RequestStatus.DONE },
                    { label: "Đã hủy", value: RequestStatus.REJECTED }
                ].map((item) => (
                    <Button
                        key={item.value}
                        variant={currentStatus === item.value ? "default" : "outline"}
                        onClick={() => setFilter("status", item.value)}
                        className={`rounded-full px-4 ${currentStatus === item.value
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
                    <CardTitle>Danh sách yêu cầu</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center py-4">
                        <DebouncedInput
                            placeholder="Tìm theo tiêu đề, phòng..."
                            value={searchQuery}
                            onValueChange={(value) => setSearchQuery(value)}
                            className="max-w-sm"
                        />
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredRequests}
                        pageCount={-1} // using client side pagination by default inside datatable if pageCount is -1, 
                        // BUT DataTable component usually needs manual handling if pageCount is provided or different logic.
                        // Let's look at DataTable implementation again. 
                        // It uses `getPaginationRowModel()`.
                        // If we pass `pagination` state, we control it.
                        pagination={{
                            pageIndex: page - 1,
                            pageSize: limit,
                        }}
                        onPaginationChange={(updaterOrValue) => {
                            if (typeof updaterOrValue === 'function') {
                                const newState = updaterOrValue({
                                    pageIndex: page - 1,
                                    pageSize: limit
                                });
                                setPage(newState.pageIndex + 1);
                                setLimit(newState.pageSize);
                            } else {
                                setPage(updaterOrValue.pageIndex + 1);
                                setLimit(updaterOrValue.pageSize);
                            }
                        }}
                    />
                </CardContent>
            </Card>

            {selectedRequest && (
                <RequestActionDialog
                    open={isActionDialogOpen}
                    onOpenChange={setIsActionDialogOpen}
                    request={selectedRequest}
                    onSuccess={() => {
                        fetchRequests();
                        setIsActionDialogOpen(false);
                    }}
                />
            )}
        </div>
    );
}
