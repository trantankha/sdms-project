"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { roomService, RoomType } from "@/services/room-service";
import { Plus, Search, ArrowLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { RoomTypeModal } from "./room-type-modal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function RoomTypesPage() {
    const router = useRouter();
    const [types, setTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<RoomType | null>(null);

    useEffect(() => {
        loadTypes();
    }, []);

    const loadTypes = async () => {
        try {
            setLoading(true);
            const data = await roomService.roomType.getRoomTypes();
            setTypes(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (type: RoomType) => {
        if (!confirm(`Bạn có chắc muốn xóa loại phòng "${type.name}"?`)) return;
        try {
            await roomService.roomType.deleteRoomType(type.id);
            toast({ title: "Thành công", description: "Đã xóa loại phòng." });
            loadTypes();
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể xóa (có thể đang được sử dụng).", variant: "destructive" });
        }
    };

    const handleEdit = (type: RoomType) => {
        setSelectedType(type);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedType(null);
        setModalOpen(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const filteredTypes = types.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 p-6 bg-muted/20 min-h-screen">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý Loại phòng</h1>
                    <p className="text-muted-foreground text-sm">Cấu hình các loại phòng, giá cả và sức chứa.</p>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Danh sách Phân loại</CardTitle>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm..."
                                className="pl-8 w-[250px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm Loại phòng
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-background">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tên Loại phòng</TableHead>
                                    <TableHead>Sức chứa</TableHead>
                                    <TableHead>Giá cơ bản</TableHead>
                                    <TableHead>Mô tả</TableHead>
                                    <TableHead className="w-[100px]">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTypes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            Chưa có dữ liệu.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTypes.map((type) => (
                                        <TableRow key={type.id}>
                                            <TableCell className="font-medium">{type.name}</TableCell>
                                            <TableCell>{type.capacity} người</TableCell>
                                            <TableCell className="font-mono text-green-600 font-semibold">
                                                {formatCurrency(type.base_price)}
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate text-muted-foreground">
                                                {type.description || "—"}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(type)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Chỉnh sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDelete(type)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Xóa
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <RoomTypeModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                type={selectedType}
                onSuccess={loadTypes}
            />
        </div>
    );
}
