"use client"

import { ColumnDef } from "@tanstack/react-table"
import { TransferRequest, TransferStatus } from "@/types/transfers"
import { Badge } from "@/components/ui/badge"
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

export const getColumns = (
    onReview: (transfer: TransferRequest) => void
): ColumnDef<TransferRequest>[] => [
        {
            accessorKey: "student_id",
            header: "Sinh viên",
            cell: ({ row }) => {
                const name = row.original.student_name;
                const code = row.original.student_code || row.original.student_id;
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{name || "Unknown"}</span>
                        <span className="font-mono text-xs text-muted-foreground" title={code}>
                            {row.original.student_code || (code && code.length > 8 ? code.substring(0, 8) + "..." : code)}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "current_room_name",
            header: "Phòng hiện tại",
            cell: ({ row }) => {
                const roomName = row.original.current_room_name;
                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{roomName || "N/A"}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "reason",
            header: "Lý do",
            cell: ({ row }) => <div className="max-w-[200px] truncate" title={row.getValue("reason")}>{row.getValue("reason")}</div>,
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
            cell: ({ row }) => {
                const status = row.getValue<TransferStatus>("status")
                return <StatusBadge status={status} type="transfer" />
            },
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Ngày yêu cầu
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => format(new Date(row.getValue("created_at")), "dd/MM/yyyy"),
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => {
                const transfer = row.original;
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
                            <DropdownMenuItem onClick={() => onReview(transfer)}>
                                Xem chi tiết
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
