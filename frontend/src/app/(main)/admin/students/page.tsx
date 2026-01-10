"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DebouncedInput } from "@/components/ui/debounced-input";
import { Users, UserPlus, ShieldCheck, MoreHorizontal, FileEdit, Trash2, Copy } from "lucide-react";
import { studentService } from "@/services/student-service";
import { User } from "@/types/auth";
import { DataTable } from "@/components/ui/data-table/data-table";
import { StudentFormModal } from "./student-form-modal";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/status-badge";
import { useSearch } from "@/hooks/use-search";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function StudentsPage() {
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

    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    // Remove local statusFilter state, use useSearch's filters

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const { toast } = useToast();

    // Data Fetching
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const params = getQueryParams();
            // Convert 'ALL' to undefined for backend
            if (params.status === 'ALL') delete params.status;

            // Map frontend status filter to backend params
            // The hook stores filters as strings. 
            // We mapped 'is_active' in service, but UI uses 'status' = ACTIVE/INACTIVE/ALL
            // Let's adjust helper.
            let fetchParams: any = { ...params };

            // Handle Filter Mapping
            // filters.status comes from URL.
            if (filters.status === 'ACTIVE') fetchParams.is_active = true;
            if (filters.status === 'INACTIVE') fetchParams.is_active = false;

            const data = await studentService.getStudents(fetchParams);
            setStudents(data);
        } catch (error) {
            console.error("Failed to load students", error);
            toast({ title: "Lỗi", description: "Không thể tải danh sách sinh viên", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // Trigger fetch when search params change
    useEffect(() => {
        fetchStudents();
    }, [page, limit, searchQuery, filters.status]); // Depend on specific values from useSearch

    const handleCreate = () => {
        setSelectedStudent(null);
        setModalOpen(true);
    };

    const handleEdit = (student: User) => {
        setSelectedStudent(student);
        setModalOpen(true);
    };

    const handleDelete = async (student: User) => {
        if (!confirm(`Bạn có chắc chắn muốn ${student.is_active ? 'vô hiệu hóa' : 'kích hoạt'} sinh viên này?`)) return;

        try {
            await studentService.updateStudent(student.id, { is_active: !student.is_active });
            toast({ title: "Thành công", description: "Cập nhật trạng thái thành công." });
            fetchStudents(); // Reload 
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể cập nhật trạng thái.", variant: "destructive" });
        }
    }

    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.is_active).length;

    // Helper for tabs
    // We strictly control status via URL now
    const currentStatus = filters.status || "ALL";

    // Define Columns Locally to access handlers
    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "full_name",
            header: "Họ và tên",
            cell: ({ row }) => {
                const user = row.original
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>{user.full_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium">{user.full_name || "Chưa cập nhật"}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "student_code",
            header: "Mã SV",
            cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("student_code") || "---"}</div>
        },
        {
            accessorKey: "phone_number",
            header: "SĐT",
            cell: ({ row }) => <div className="text-sm">{row.getValue("phone_number") || "---"}</div>
        },
        {
            accessorKey: "is_active",
            header: "Trạng thái",
            cell: ({ row }) => {
                const isActive = row.getValue("is_active") as boolean
                return <StatusBadge status={isActive ? "ACTIVE" : "INACTIVE"} type="user" />
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const user = row.original

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
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                <Copy className="mr-2 h-4 w-4" /> Sao chép ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <FileEdit className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(user)} className={user.is_active ? "text-destructive" : "text-green-600"}>
                                {user.is_active ? (
                                    <><Trash2 className="mr-2 h-4 w-4" /> Vô hiệu hóa</>
                                ) : (
                                    <><ShieldCheck className="mr-2 h-4 w-4" /> Kích hoạt</>
                                )}
                            </DropdownMenuItem>
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
                        Quản lý Sinh viên
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Xem và quản lý hồ sơ, trạng thái hoạt động của sinh viên.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Thêm sinh viên
                    </Button>
                </div>
            </div>

            {/* Stats Cards - Simplified for Pagination Context */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-background dark:to-blue-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Hiển thị</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{totalStudents}</div>
                        <p className="text-xs text-muted-foreground mt-1">Sinh viên trên trang này</p>
                    </CardContent>
                </Card>
                {/* Keeping other cards for layout consistency but they might be misleading if not careful. */}
                <Card className="bg-gradient-to-br from-white to-green-50 dark:from-background dark:to-green-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Đang hoạt động</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">{activeStudents}</div>
                        <p className="text-xs text-muted-foreground mt-1">Trên trang này</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-background dark:to-gray-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Vô hiệu hóa</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-muted-foreground">{totalStudents - activeStudents}</div>
                        <p className="text-xs text-muted-foreground mt-1">Trên trang này</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {[
                    { label: "Tất cả", value: "ALL" },
                    { label: "Đang hoạt động", value: "ACTIVE" },
                    { label: "Vô hiệu hóa", value: "INACTIVE" }
                ].map((item) => (
                    <Button
                        key={item.value}
                        variant={currentStatus === item.value ? "default" : "outline"}
                        onClick={() => setFilter("status", item.value)}
                        className={`rounded-full px-4 ${currentStatus === item.value
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
                    <CardTitle>Danh sách sinh viên</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center py-4">
                        <DebouncedInput
                            placeholder="Tìm kiếm theo tên, email, mã sv..."
                            value={searchQuery}
                            onValueChange={(value: string) => setSearchQuery(value)}
                            className="max-w-sm"
                        />
                    </div>

                    <DataTable
                        columns={columns}
                        data={students}
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

            <StudentFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                student={selectedStudent}
                onSuccess={fetchStudents}
            />
        </div>
    );
}
