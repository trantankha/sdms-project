"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Contract, ContractStatus } from "@/types/contracts"
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
import Link from "next/link"

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const columns: ColumnDef<Contract>[] = [
    {
        accessorKey: "student_id",
        header: "Student",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium text-sm">Student: <span className="font-mono text-xs text-muted-foreground">{row.original.student_id.substring(0, 8)}</span></span>
                <span className="text-xs text-muted-foreground">Bed: <span className="font-mono">{row.original.bed_id.substring(0, 8)}</span></span>
            </div>
        ),
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Start Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => format(new Date(row.getValue("created_at")), "dd/MM/yyyy"),
    },
    {
        accessorKey: "end_date",
        header: "End Date",
        cell: ({ row }) => format(new Date(row.getValue("end_date")), "dd/MM/yyyy"),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue<ContractStatus>("status")
            return <StatusBadge status={status} type="contract" />
        },
    },
    {
        accessorKey: "price_per_month",
        header: ({ column }) => (
            <div className="text-right">Monthly Rent</div>
        ),
        cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue("price_per_month"))}</div>,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const contract = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(contract.id)}
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/contracts/${contract.id}/liquidate`} className="text-destructive w-full cursor-pointer">
                                Liquidate
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
