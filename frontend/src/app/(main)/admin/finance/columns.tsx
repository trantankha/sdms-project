"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Invoice, InvoiceStatus } from "@/types/finance"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
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

export const columns: ColumnDef<Invoice>[] = [
    {
        accessorKey: "id",
        header: "Mã hóa đơn",
        cell: ({ row }) => <div className="font-mono text-xs text-muted-foreground">{row.getValue<string>("id").substring(0, 8)}...</div>,
    },
    {
        accessorKey: "title",
        header: "Tiêu đề",
        cell: ({ row }) => <div className="font-medium">{row.getValue("title") || "Tiền phòng / Học phí"}</div>,
    },
    {
        accessorKey: "total_amount",
        header: ({ column }) => (
            <Button
                variant="ghost"
                className="w-full justify-end"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Số tiền
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div className="text-right font-bold font-mono">{formatCurrency(row.getValue("total_amount"))}</div>,
    },
    {
        accessorKey: "due_date",
        header: "Hạn thanh toán",
        cell: ({ row }) => {
            const date = row.getValue<string>("due_date");
            return date ? format(new Date(date), "dd/MM/yyyy") : "N/A";
        },
    },
    {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
            const status = row.getValue<InvoiceStatus>("status")
            return <StatusBadge status={status} type="invoice" />
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const invoice = row.original

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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(invoice.id)}>
                            Sao chép ID
                        </DropdownMenuItem>
                        <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                        <DropdownMenuItem>Đánh dấu đã thanh toán</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Hủy hóa đơn</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
