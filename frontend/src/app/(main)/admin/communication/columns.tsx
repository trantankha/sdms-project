"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Announcement, AnnouncementPriority, AnnouncementScope, AnnouncementStatus } from "@/types/communication"
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

export const columns: ColumnDef<Announcement>[] = [
    {
        accessorKey: "title",
        header: "Subject",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium truncate max-w-[300px]">{row.getValue("title")}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[300px]">{row.original.content}</span>
            </div>
        ),
    },
    {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => {
            const priority = row.getValue<AnnouncementPriority>("priority")
            return <StatusBadge status={priority} type="priority" />
        },
    },
    {
        accessorKey: "scope",
        header: "Audience",
        cell: ({ row }) => {
            const scope = row.getValue<AnnouncementScope>("scope")
            return <StatusBadge status={scope} type="scope" />
        },
    },
    {
        accessorKey: "created_at",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Created At
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => format(new Date(row.getValue("created_at")), "dd/MM/yyyy HH:mm"),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue<AnnouncementStatus>("status")
            return <StatusBadge status={status} type="announcement" />
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const announcement = row.original

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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Publish Now</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
