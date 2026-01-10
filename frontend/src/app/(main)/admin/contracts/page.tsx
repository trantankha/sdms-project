"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MoreHorizontal, ArrowUpDown, Plus, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { contractService } from "@/services/contract-service";
import { Contract, ContractStatus } from "@/types/contracts";
import { DataTable } from "@/components/ui/data-table/data-table";
import { StatusBadge } from "@/components/status-badge";
import { getStatusConfig } from "@/lib/status-config";
import { useSearch } from "@/hooks/use-search";
import { DebouncedInput } from "@/components/ui/debounced-input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { LiquidationModal } from "./liquidation-modal";
import { ContractFormModal } from "./contract-form-modal";
import { useToast } from "@/hooks/use-toast";

import { ContractDetailsModal } from "./contract-details-modal";
import { Eye } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { campusService } from "@/services/campus-service";

export default function ContractsPage() {
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

    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [liquidationOpen, setLiquidationOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    // Campus filter is now handled via useSearch filters
    const [campuses, setCampuses] = useState<any[]>([]);
    const { toast } = useToast();

    // Imports need: import { campusService } from "@/services/campus-service";
    // We will need to add that import at top of file separately if not present.

    useEffect(() => {
        loadCampuses();
    }, []);

    useEffect(() => {
        loadContracts();
    }, [page, limit, searchQuery, filters.status, filters.campus_id]);

    const loadCampuses = async () => {
        try {
            const data = await campusService.getCampuses();
            setCampuses(data);
        } catch (e) {
            toast({ title: "Lỗi", description: "Không thể tải danh sách cơ sở", variant: "destructive" });
        }
    }

    const loadContracts = async () => {
        // setLoading(true); // Optimization: Don't clear UI on every filter change
        try {
            const params = getQueryParams();
            // Map filters
            if (params.status === 'ALL') delete params.status;
            if (params.campus_id === 'ALL') delete params.campus_id;

            // Backend might accept 'search' or 'keyword'. Our service has 'search'.
            // Service expects { student_id?:... search?:... }
            // Let's pass params.

            const data = await contractService.getContracts(params);
            setContracts(data);
        } catch (error) {
            console.error("Failed to load contracts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: ContractStatus) => {
        try {
            await contractService.updateContractStatus(id, { status });
            toast({ title: "Thành công", description: `Đã cập nhật trạng thái hợp đồng.` });
            loadContracts();
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể cập nhật trạng thái", variant: "destructive" });
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Data is already filtered by backend
    const filteredContracts = contracts;


    // Helper to get count for tabs
    const getCount = (status: string) => {
        if (status === "ALL") return contracts.length;
        return contracts.filter(c => c.status === status).length;
    };

    // Columns Definition
    const columns: ColumnDef<Contract>[] = [
        {
            accessorKey: "student",
            header: "Sinh viên",
            meta: { className: "w-[300px]" },
            cell: ({ row }) => {
                const student = row.original.student;
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden border">
                            {student?.avatar_url ? (
                                <img src={student.avatar_url} alt={student.full_name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-xs font-semibold">{student?.full_name?.charAt(0) || "S"}</span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-medium text-sm truncate max-w-[180px]" title={student?.full_name}>
                                {student?.full_name || "Unknown"}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono">
                                {student?.student_code || "N/A"}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "room_info", // Virtual accessor
            header: "Phòng / Giường",
            meta: { className: "w-[200px]" },
            cell: ({ row }) => {
                const bed = row.original.bed;
                const room = row.original.room || bed?.room;
                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center align-center gap-1 text-xs text-muted-foreground">
                            <span>Phòng:</span>
                            <span className="font-mono bg-muted rounded">
                                {room?.code || "N/A"}
                            </span>
                        </div>
                        <div className="flex items-center align-center gap-1 text-xs text-muted-foreground">
                            <span>Giường:</span>
                            <span className="font-mono bg-muted rounded">
                                {bed?.label || bed?.name || "N/A"}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            meta: { className: "w-[200px]" },
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Thời gian
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const start = row.getValue("created_at");
                const end = row.original.end_date;
                return (
                    <div className="flex flex-col text-xs">
                        <span className="text-muted-foreground">Bắt đầu: <span className="text-foreground font-medium">{start ? format(new Date(start as string), "dd/MM/yyyy") : "N/A"}</span></span>
                        <span className="text-muted-foreground mt-0.5">Kết thúc: <span className="text-foreground font-medium">{end ? format(new Date(end as string), "dd/MM/yyyy") : "N/A"}</span></span>
                    </div>
                );
            }
        },
        // Remove redundant end_date column
        {
            accessorKey: "status",
            header: "Trạng thái",
            meta: { className: "w-[200px]" },
            cell: ({ row }) => {
                const status = row.getValue<ContractStatus>("status")
                return <StatusBadge status={status} type="contract" />
            },
        },
        {
            accessorKey: "price_per_month",
            meta: { className: "w-[120px]" },
            header: ({ column }) => (
                <div className="text-right">Giá thuê</div>
            ),
            cell: ({ row }) => (
                <div className="text-right">
                    <div className="font-medium text-sm">{formatCurrency(row.getValue("price_per_month"))}</div>
                    <span className="text-[10px] text-muted-foreground">/tháng</span>
                </div>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const contract = row.original

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
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(contract.id)}
                            >
                                Sao chép ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => {
                                setSelectedContract(contract);
                                setDetailsOpen(true);
                            }}>
                                <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                            </DropdownMenuItem>

                            {contract.status === ContractStatus.PENDING && (
                                <>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(contract.id, ContractStatus.ACTIVE)}>
                                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Duyệt hợp đồng
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(contract.id, ContractStatus.TERMINATED)} className="text-destructive">
                                        <XCircle className="mr-2 h-4 w-4" /> Từ chối
                                    </DropdownMenuItem>
                                </>
                            )}

                            {/* Allow Liquidation if ACTIVE or EXPIRED or matching string values */}
                            {([
                                ContractStatus.ACTIVE,
                                ContractStatus.EXPIRED,
                                "DANG_O",
                                "HET_HAN",
                                "ACTIVE",
                                "EXPIRED"
                            ] as any[]).includes(contract.status) && (
                                    <DropdownMenuItem onClick={() => {
                                        setSelectedContract(contract);
                                        setLiquidationOpen(true);
                                    }} className="text-amber-600">
                                        <AlertTriangle className="mr-2 h-4 w-4" /> Thanh lý hợp đồng
                                    </DropdownMenuItem>
                                )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    return (
        <div className="flex flex-col gap-8 p-6 bg-muted/20 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                        Quản lý Hợp đồng
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Theo dõi, phê duyệt và thanh lý hợp đồng thuê phòng của sinh viên.
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo Hợp đồng Mới
                </Button>
            </div>

            {/* Stats / Filter Tabs & Campus Selection */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: "Tất cả", value: "ALL" },
                        { label: getStatusConfig(ContractStatus.ACTIVE, "contract").label, value: ContractStatus.ACTIVE },
                        { label: getStatusConfig(ContractStatus.PENDING, "contract").label, value: ContractStatus.PENDING },
                        { label: getStatusConfig(ContractStatus.TERMINATED, "contract").label, value: ContractStatus.TERMINATED }
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

                <div className="flex items-center gap-2">
                    <DebouncedInput
                        placeholder="Tìm Mã SV, Tên..."
                        value={searchQuery}
                        onValueChange={(value) => setSearchQuery(value)}
                        className="max-w-[180px] h-9"
                    />
                    <Select value={filters.campus_id || "ALL"} onValueChange={(val) => setFilter('campus_id', val)}>
                        <SelectTrigger className="w-[200px] h-9 bg-background">
                            <SelectValue placeholder="Chọn cơ sở" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tất cả Cơ sở</SelectItem>
                            {campuses.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle>Danh sách hợp đồng</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={filteredContracts}
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

            <LiquidationModal
                open={liquidationOpen}
                onOpenChange={setLiquidationOpen}
                contract={selectedContract}
                onSuccess={loadContracts}
            />

            <ContractFormModal
                open={createOpen}
                onOpenChange={setCreateOpen}
                onSuccess={loadContracts}
            />

            <ContractDetailsModal
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                contract={selectedContract}
            />
        </div>
    );
}
