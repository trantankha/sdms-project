"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Violation, ViolationSeverity } from "@/types/conduct"
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

export const createColumns = (
    onView: (violation: Violation) => void,
    onEdit: (violation: Violation) => void
): ColumnDef<Violation>[] => [
        {
            id: "student",
            accessorFn: (row) => `${row.student?.full_name || ""} ${row.student?.student_code || ""} ${row.student?.email || ""}`,
            header: "Sinh viên",
            cell: ({ row }) => {
                const student = row.original.student;
                const userId = row.original.user_id;

                if (!student) {
                    return <div className="font-mono text-xs text-muted-foreground">{userId.substring(0, 8)}...</div>
                }

                return (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {student.avatar_url ? (
                                <img src={student.avatar_url} alt={student.full_name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-xs font-bold text-primary">{student.full_name?.charAt(0) || "U"}</span>
                            )}
                        </div>
                        <div>
                            <div className="font-medium text-sm">{student.full_name || "Unknown"}</div>
                            <div className="text-xs text-muted-foreground flex gap-2">
                                <span className="font-mono bg-muted px-1 rounded">{student.student_code}</span>
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "title",
            header: "Vi phạm",
            meta: { className: "w-[300px]" },
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.getValue("title")}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{row.original.description}</span>
                </div>
            ),
        },
        {
            accessorKey: "severity",
            header: "Mức độ",
            cell: ({ row }) => {
                const severity = row.getValue<ViolationSeverity>("severity")
                return <StatusBadge status={severity} type="violation" />
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: "points_deducted",
            meta: { className: "w-[100px]" },
            header: ({ column }) => (
                <div className="text-center">Điểm trừ</div>
            ),
            cell: ({ row }) => <div className="text-center font-bold text-destructive">-{row.getValue("points_deducted")}</div>,
        },
        {
            accessorKey: "violation_date",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0"
                >
                    Ngày vi phạm
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => format(new Date(row.getValue("violation_date")), "dd/MM/yyyy"),
        },
        {
            id: "actions",
            header: "Thao tác",
            cell: ({ row }) => {
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
                            <DropdownMenuItem onClick={() => onView(row.original)}>Xem Chi tiết</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(row.original)}>Chỉnh sửa</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
