"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Megaphone, Bell, MoreHorizontal, ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { communicationService } from "@/services/communication-service";
import { Announcement, AnnouncementPriority, AnnouncementScope, AnnouncementStatus } from "@/types/communication";
import { DataTable } from "@/components/ui/data-table/data-table";
// import { columns } from "./columns"; // Moved locally
import { AnnouncementFormModal } from "./announcement-form-modal";
import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/status-badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function CommunicationPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            const data = await communicationService.getAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            console.error("Failed to load announcements", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedAnnouncement(null);
        setModalOpen(true);
    };

    const handleEdit = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
        setModalOpen(true);
    };

    // Placeholder for delete functionality
    const handleDelete = async (id: string) => {
        try {
            await communicationService.deleteAnnouncement(id);
            toast({ title: "Thành công", description: "Đã xóa thông báo." });
            loadAnnouncements();
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể xóa thông báo.", variant: "destructive" });
        }
    };

    const filteredAnnouncements = priorityFilter === "ALL"
        ? announcements
        : announcements.filter(a => a.priority === priorityFilter);

    // Calculate Stats
    const totalAnnouncements = announcements.length;
    const publishedAnnouncements = announcements.filter(a => a.status === AnnouncementStatus.PUBLISHED).length;
    const urgentAnnouncements = announcements.filter(a => a.priority === AnnouncementPriority.URGENT).length;

    // Helper for tabs
    const getCount = (priority: string) => {
        if (priority === "ALL") return announcements.length;
        return announcements.filter(a => a.priority === priority).length;
    };

    const columns: ColumnDef<Announcement>[] = [
        {
            accessorKey: "title",
            header: "Chủ đề",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[300px]">{row.getValue("title")}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[300px]">{row.original.content}</span>
                </div>
            ),
        },
        {
            accessorKey: "priority",
            header: "Độ ưu tiên",
            cell: ({ row }) => {
                const priority = row.getValue<AnnouncementPriority>("priority")
                return <StatusBadge status={priority} type="priority" />
            },
        },
        {
            accessorKey: "scope",
            header: "Phạm vi",
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
                    Ngày tạo
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => format(new Date(row.getValue("created_at")), "dd/MM/yyyy HH:mm"),
        },
        {
            accessorKey: "status",
            header: "Trạng thái",
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
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(announcement)}>
                                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(announcement.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Xóa
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
                        Tin tức & Thông báo
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Quản lý các thông báo và tin tức ký túc xá.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo Thông báo
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-background dark:to-blue-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số Thông báo</CardTitle>
                        <Megaphone className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{totalAnnouncements}</div>
                        <p className="text-xs text-muted-foreground mt-1">Tất cả bản ghi</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-green-50 dark:from-background dark:to-green-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Đã xuất bản</CardTitle>
                        <Bell className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">{publishedAnnouncements}</div>
                        <p className="text-xs text-muted-foreground mt-1">Đang hiển thị</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-white to-red-50 dark:from-background dark:to-red-900/10 border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tin Khẩn cấp</CardTitle>
                        <Bell className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">{urgentAnnouncements}</div>
                        <p className="text-xs text-muted-foreground mt-1">Thông báo ưu tiên cao</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {[
                    { label: "Tất cả", value: "ALL" },
                    { label: "Khẩn cấp", value: AnnouncementPriority.URGENT },
                    { label: "Cao", value: AnnouncementPriority.HIGH },
                    { label: "Thường", value: AnnouncementPriority.NORMAL },
                    { label: "Thấp", value: AnnouncementPriority.LOW }
                ].map((item) => (
                    <Button
                        key={item.value}
                        variant={priorityFilter === item.value ? "default" : "outline"}
                        onClick={() => setPriorityFilter(item.value)}
                        className={`rounded-full px-4 ${priorityFilter === item.value
                            ? ""
                            : "bg-background hover:bg-muted"
                            } `}
                        size="sm"
                    >
                        {item.label}
                    </Button>
                ))}
            </div>

            <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle>Danh sách Thông báo</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={filteredAnnouncements}
                        searchKey="title"
                        searchPlaceholder="Tìm theo chủ đề..."
                    />
                </CardContent>
            </Card>

            <AnnouncementFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                announcement={selectedAnnouncement}
                onSuccess={loadAnnouncements}
            />
        </div>
    );
}
