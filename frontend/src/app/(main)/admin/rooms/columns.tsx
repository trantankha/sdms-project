"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Room } from "@/services/room-service"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const columns: ColumnDef<Room>[] = [
    {
        accessorKey: "code",
        header: "Room Number",
        cell: ({ row }) => <div className="font-semibold text-primary">{row.getValue("code")}</div>,
    },
    {
        accessorKey: "building.name",
        header: "Building",
        cell: ({ row }) => <div className="text-muted-foreground">{row.original.building?.name}</div>,
    },
    {
        accessorKey: "room_type.name",
        header: "Type",
        cell: ({ row }) => <Badge variant="outline">{row.original.room_type?.name}</Badge>,
    },
    {
        accessorKey: "capacity",
        header: "Capacity",
        cell: ({ row }) => {
            const current = row.original.current_occupancy;
            const capacity = row.original.room_type?.capacity || row.original.beds?.length || 0;
            const percentage = capacity > 0 ? (current / capacity) * 100 : 0;

            return (
                <div className="flex flex-col gap-1 w-[120px]">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{current}/{capacity}</span>
                        <span>{Math.round(percentage)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                </div>
            )
        }
    },
    {
        accessorKey: "base_price",
        header: () => <div className="text-right">Price/Month</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("base_price"))
            const formatted = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
            }).format(amount)

            return <div className="font-medium text-right font-mono">{formatted}</div>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return <StatusBadge status={status} type="room" />
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const room = row.original

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
                            onClick={() => navigator.clipboard.writeText(room.id.toString())}
                        >
                            Copy Room ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Room</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
