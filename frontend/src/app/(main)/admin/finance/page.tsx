"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Download, Plus, FileText, Zap, Settings, Loader2, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { financeService } from "@/services/finance-service";
import { Invoice, InvoiceStatus } from "@/types/finance";
import { DataTable } from "@/components/ui/data-table/data-table";
import { UtilityConfigModal } from "./utility-config-modal";
import { InvoiceCreateModal } from "./invoice-create-modal";
import { InvoiceDetailsModal } from "./invoice-details-modal";
import { useToast } from "@/hooks/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { useSearch } from "@/hooks/use-search";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FinancePage() {
    const {
        searchQuery,
        setSearchQuery,
        page,
        setPage,
        limit,
        setLimit,
        setFilter,
        filters,
        getQueryParams
    } = useSearch({ defaultLimit: 10 });

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    // const [statusFilter, setStatusFilter] = useState<string>("ALL"); // Removed

    const [showConfigModal, setShowConfigModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        loadInvoices();
    }, [page, limit, searchQuery, filters.status]);

    const loadInvoices = async () => {
        // setLoading(true); // Optimization
        try {
            const params = getQueryParams();
            // Map status filter
            // Frontend 'ALL' -> Backend undefined or ignored if passed
            // `financeService.getInvoices` supports params directly

            const data = await financeService.getInvoices(params);
            setInvoices(data);
        } catch (error) {
            console.error("Failed to load invoices", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInvoices = async () => {
        setGenerating(true);
        try {
            const now = new Date();
            await financeService.generateMonthlyInvoices(now.getMonth() + 1, now.getFullYear());
            toast({ title: "Thành công", description: "Đã tạo hóa đơn tháng này." });
            loadInvoices();
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể tạo hóa đơn.", variant: "destructive" });
        } finally {
            setGenerating(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleMarkAsPaid = async (invoice: Invoice) => {
        if (!confirm("Xác nhận thanh toán toàn bộ cho hóa đơn này?")) return;
        try {
            await financeService.createPayment({
                invoice_id: invoice.id,
                amount: invoice.remaining_amount,
                payment_method: "TIEN_MAT" as any,
            });
            toast({ title: "Thành công", description: "Đã cập nhật thanh toán." });
            loadInvoices();
        } catch (error) {
            toast({ title: "Lỗi", description: "Thất bại.", variant: "destructive" });
        }
    };

    const handleCancelInvoice = async (invoice: Invoice) => {
        if (!confirm("Bạn có chắc chắn muốn hủy hóa đơn này không?")) return;
        try {
            await financeService.cancelInvoice(invoice.id);
            toast({ title: "Thành công", description: "Đã hủy hóa đơn." });
            loadInvoices();
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể hủy hóa đơn.", variant: "destructive" });
        }
    };

    const columns: ColumnDef<Invoice>[] = [
        {
            accessorKey: "student",
            header: "Đối tượng", // Renamed from Sinh viên
            meta: { className: "w-[200px]" },
            cell: ({ row }) => {
                const invoice = row.original;
                const contract = invoice.contract;
                const student = contract?.student;
                const room = invoice.room;

                if (student) {
                    return (
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden border">
                                {student.avatar_url ? (
                                    <img src={student.avatar_url} alt={student.full_name} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-xs font-semibold">{student.full_name?.charAt(0) || "U"}</span>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm truncate max-w-[180px]" title={student.full_name}>
                                    {student.full_name || "Unknown"}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono">
                                    {student.student_code || "N/A"}
                                </span>
                            </div>
                        </div>
                    );
                }

                if (room) {
                    return (
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                                <span className="text-xs font-bold text-blue-700">P</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm truncate text-blue-700">
                                    Phòng {room.code}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {room.building?.name}
                                </span>
                            </div>
                        </div>
                    );
                }

                return <span className="text-muted-foreground italic">Không xác định</span>;
            },
        },
        {
            accessorKey: "title",
            header: "Nội dung",
            cell: ({ row }) => <div className="font-medium text-sm truncate max-w-[350px]" title={row.getValue("title")}>{row.getValue("title") || "Tiền phòng / Học phí"}</div>,
        },
        {
            accessorKey: "total_amount",
            meta: { className: "w-[140px]" },
            header: ({ column }) => (
                <Button variant="ghost" className="w-full justify-end p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Số tiền <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="text-right font-bold font-mono text-sm">{formatCurrency(row.getValue("total_amount"))}</div>,
        },
        {
            accessorKey: "due_date",
            header: "Hạn TT",
            meta: { className: "w-[120px]" },
            cell: ({ row }) => {
                const date = row.getValue<string>("due_date");
                return date ? <span className="text-xs">{format(new Date(date), "dd/MM/yyyy")}</span> : "N/A";
            },
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            meta: { className: "w-[120px]" },
            cell: ({ row }) => <StatusBadge status={row.getValue<InvoiceStatus>("status")} type="invoice" />,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const invoice = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(invoice.id)}>Sao chép ID</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedInvoice(invoice); setDetailsOpen(true); }}>Xem chi tiết</DropdownMenuItem>
                            {invoice.status !== InvoiceStatus.PAID && invoice.status !== InvoiceStatus.CANCELLED && (
                                <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>Đánh dấu đã thanh toán</DropdownMenuItem>
                            )}
                            {invoice.status !== InvoiceStatus.CANCELLED && invoice.status !== InvoiceStatus.PAID && (
                                <DropdownMenuItem className="text-destructive" onClick={() => handleCancelInvoice(invoice)}>Hủy hóa đơn</DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    // Data filtered by backend
    const filteredInvoices = invoices;


    // Calculate Stats
    const totalRevenue = invoices
        .filter(i => i.status === InvoiceStatus.PAID)
        .reduce((sum, i) => sum + i.total_amount, 0);

    const outstandingDebt = invoices
        .filter(i => i.status === InvoiceStatus.OVERDUE)
        .reduce((sum, i) => sum + i.total_amount, 0);

    const overdueCount = invoices.filter(i => i.status === InvoiceStatus.OVERDUE).length;

    const getCount = (status: string) => {
        if (status === "ALL") return invoices.length;
        return invoices.filter(i => i.status === status).length;
    };

    return (
        <div className="flex flex-col gap-6 p-6 bg-muted/20 min-h-screen">
            {/* Header & Main Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                        Quản lý Tài chính
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Theo dõi doanh thu, quản lý hóa đơn và điện nước.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="shadow-sm">
                                <Settings className="mr-2 h-4 w-4" />
                                Tiện ích
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShowConfigModal(true)}>
                                <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                                Cấu hình Đơn giá
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push("/admin/finance/utility")}>
                                <Zap className="mr-2 h-4 w-4 text-muted-foreground" />
                                Chốt số Điện/Nước
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-6 w-px bg-border mx-2" />

                    <Button variant="outline" className="shadow-sm border-dashed" onClick={() => setShowCreateModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo Hóa đơn lẻ
                    </Button>
                    <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                        onClick={handleGenerateInvoices}
                        disabled={generating}
                    >
                        {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                        Tạo Hóa đơn (Tháng này)
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-white to-green-50 dark:from-background dark:to-green-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Doanh thu thực tế</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700 dark:text-green-400">{formatCurrency(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Tổng tiền từ các hóa đơn đã thanh toán</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-red-50 dark:from-background dark:to-red-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Nợ chưa thu</CardTitle>
                        <DollarSign className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">{formatCurrency(outstandingDebt)}</div>
                        <p className="text-xs text-muted-foreground mt-1">{overdueCount} hóa đơn quá hạn thanh toán</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-background dark:to-blue-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Hóa đơn tháng này</CardTitle>
                        <FileText className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{getCount("ALL")}</div>
                        <p className="text-xs text-muted-foreground mt-1">Tổng số hóa đơn trong hệ thống</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 justify-between items-center">
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: "Tất cả", value: "ALL" },
                        { label: "Đã thanh toán", value: InvoiceStatus.PAID },
                        { label: "Chưa thanh toán", value: InvoiceStatus.UNPAID },
                        { label: "Quá hạn", value: InvoiceStatus.OVERDUE }
                    ].map((item) => (
                        <Button
                            key={item.value}
                            variant={(filters.status || "ALL") === item.value ? "default" : "outline"}
                            onClick={() => setFilter('status', item.value)}
                            className={`rounded-full px-4 ${(filters.status || "ALL") === item.value
                                ? ""
                                : "bg-background hover:bg-muted"
                                }`}
                            size="sm"
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>
                <DebouncedInput
                    placeholder="Tìm tiêu đề, Mã SV, Tên..."
                    value={searchQuery}
                    onValueChange={(value) => setSearchQuery(value)}
                    className="max-w-[250px] h-9"
                />
            </div>

            <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle>Danh sách hóa đơn</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={filteredInvoices}
                        // Manual Pagination
                        pageCount={-1}
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

            {/* Modals */}
            <UtilityConfigModal open={showConfigModal} onOpenChange={setShowConfigModal} />



            <InvoiceDetailsModal
                invoice={selectedInvoice}
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                onUpdate={loadInvoices}
            />

            <InvoiceCreateModal
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
                onSuccess={loadInvoices}
            />
        </div>
    );
}
