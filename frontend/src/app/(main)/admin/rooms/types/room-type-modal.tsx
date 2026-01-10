"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { roomService, RoomType } from "@/services/room-service";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface RoomTypeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type?: RoomType | null; // If null, creating new
    onSuccess: () => void;
}

export function RoomTypeModal({ open, onOpenChange, type, onSuccess }: RoomTypeModalProps) {
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            if (type) {
                setName(type.name);
                setCapacity(String(type.capacity));
                setPrice(String(type.base_price));
                setDescription(type.description || "");
            } else {
                // Reset
                setName("");
                setCapacity("");
                setPrice("");
                setDescription("");
            }
        }
    }, [open, type]);

    const handleSubmit = async () => {
        if (!name || !capacity || !price) {
            toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin bắt buộc.", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                name,
                capacity: Number(capacity),
                base_price: Number(price),
                description
            };

            if (type) {
                await roomService.roomType.updateRoomType(type.id, payload);
                toast({ title: "Thành công", description: "Cập nhật loại phòng thành công." });
            } else {
                await roomService.roomType.createRoomType(payload);
                toast({ title: "Thành công", description: "Tạo loại phòng mới thành công." });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể lưu loại phòng.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        {type ? "Chỉnh sửa Loại phòng" : "Thêm Loại phòng Mới"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Tên loại phòng <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ví dụ: Phòng Dịch vụ 4 người"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="capacity">Sức chứa (Người) <span className="text-red-500">*</span></Label>
                            <Input
                                id="capacity"
                                type="number"
                                value={capacity}
                                onChange={e => setCapacity(e.target.value)}
                                placeholder="4"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">Giá cơ bản (VNĐ) <span className="text-red-500">*</span></Label>
                            <Input
                                id="price"
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                placeholder="1500000"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Mô tả tiện nghi, đặc điểm..."
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy bỏ</Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {type ? "Lưu thay đổi" : "Tạo mới"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
