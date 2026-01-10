"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Wrench, ShoppingCart, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { servicePackageService } from "@/services/service-package-service";
import { ServicePackage, ServiceType, BillingCycle } from "@/types/services";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ServicePackageFormModal } from "./service-package-modal";
import { ServiceSubscriptionsDialog } from "./service-subscriptions-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/status-badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function ServicesPage() {
    const [services, setServices] = useState<ServicePackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState<string>("ALL");

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [subscriptionsOpen, setSubscriptionsOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<ServicePackage | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const data = await servicePackageService.getPackages();
            setServices(data);
        } catch (error) {
            console.error("Failed to load services", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedService(null);
        setModalOpen(true);
    };

    const handleEdit = (service: ServicePackage) => {
        setSelectedService(service);
        setModalOpen(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const filteredServices = typeFilter === "ALL"
        ? services
        : services.filter(s => s.type === typeFilter);

    // Calculate Stats
    const totalServices = services.length;
    const activeServices = services.filter(s => s.is_active).length;

    // Helper for tabs
    const getCount = (type: string) => {
        if (type === "ALL") return services.length;
        return services.filter(s => s.type === type).length;
    };

    const columns: ColumnDef<ServicePackage>[] = [
        {
            accessorKey: "name",
            header: "Tên Dịch vụ",
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "type",
            header: "Loại",
            cell: ({ row }) => {
                const type = row.getValue<ServiceType>("type")
                return <StatusBadge status={type} type="service_type" />
            },
        },
        {
            accessorKey: "price",
            header: "Đơn giá",
            cell: ({ row }) => <div className="font-medium">{formatCurrency(row.getValue("price"))}</div>,
        },
        {
            accessorKey: "billing_cycle",
            header: "Chu kỳ",
            cell: ({ row }) => {
                const cycle = row.getValue<BillingCycle>("billing_cycle")
                return <StatusBadge status={cycle} type="billing_cycle" />
            },
        },
        {
            accessorKey: "is_active",
            header: "Trạng thái",
            cell: ({ row }) => {
                const isActive = row.getValue<boolean>("is_active")
                return (
                    <StatusBadge
                        status={isActive ? "ACTIVE" : "INACTIVE"}
                    />
                )
            },
        },
        {
            accessorKey: "description",
            header: "Mô tả",
            cell: ({ row }) => <div className="text-sm text-muted-foreground truncate max-w-[200px]">{row.getValue("description")}</div>,
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const service = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(service)}>
                                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </DropdownMenuItem>
                            {/* Further implementation: Delete/Deactivate */}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ];

    return (
        <div className="flex flex-col gap-8 p-6 bg-muted/20 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                        Quản lý Dịch vụ
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Cấu hình gói dịch vụ và xem đăng ký.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="shadow-sm" onClick={() => setSubscriptionsOpen(true)}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Xem Đăng ký
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm Gói Dịch vụ
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-background dark:to-blue-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số Gói</CardTitle>
                        <Wrench className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{totalServices}</div>
                        <p className="text-xs text-muted-foreground mt-1">Dịch vụ khả dụng</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-green-50 dark:from-background dark:to-green-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Đang Hoạt động</CardTitle>
                        <Wrench className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">{activeServices}</div>
                        <p className="text-xs text-muted-foreground mt-1">Đang cung cấp</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {[
                    { label: "Tất cả", value: "ALL" },
                    { label: "Giặt ủi", value: ServiceType.LAUNDRY },
                    { label: "Dọn dẹp", value: ServiceType.CLEANING },
                    { label: "Nước uống", value: ServiceType.WATER },
                    { label: "Khác", value: ServiceType.OTHER }
                ].map((item) => (
                    <Button
                        key={item.value}
                        variant={typeFilter === item.value ? "default" : "outline"}
                        onClick={() => setTypeFilter(item.value)}
                        className={`rounded-full px-4 ${typeFilter === item.value
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
                    <CardTitle>Danh sách Gói Dịch vụ</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={filteredServices}
                        searchKey="name"
                        searchPlaceholder="Tìm theo tên..."
                    />
                </CardContent>
            </Card>

            <ServicePackageFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                servicePackage={selectedService}
                onSuccess={loadServices}
            />

            <ServiceSubscriptionsDialog
                open={subscriptionsOpen}
                onOpenChange={setSubscriptionsOpen}
            />
        </div>
    );
}
