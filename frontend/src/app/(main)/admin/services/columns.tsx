"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ServicePackage, ServiceType, BillingCycle } from "@/types/services"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const columns: ColumnDef<ServicePackage>[] = [
    {
        accessorKey: "name",
        header: "Tên dịch vụ",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "type",
        header: "Loại dịch vụ",
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
            return <StatusBadge status={isActive} type="user" />
        },
    },
    {
        accessorKey: "description",
        header: "Mô tả",
        cell: ({ row }) => <div className="text-sm text-muted-foreground truncate max-w-[200px]">{row.getValue("description")}</div>,
    },
    {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
            const service = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Ngưng hoạt động</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
