"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenanceRequest, RequestStatus } from "@/types";
import { requestService } from "@/services/request-service";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { eventBus, REFRESH_SIDEBAR } from "@/lib/events";

interface RequestActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: MaintenanceRequest;
    onSuccess: () => void;
}

export function RequestActionDialog({ open, onOpenChange, request, onSuccess }: RequestActionDialogProps) {
    const { toast } = useToast();
    const [status, setStatus] = useState<RequestStatus>(request.status);
    const [notes, setNotes] = useState(request.ai_analysis_result || "");
    const [isLoading, setIsLoading] = useState(false);

    async function handleUpdate() {
        setIsLoading(true);
        try {
            await requestService.updateRequest(request.id, {
                status: status,
                ai_analysis_result: notes // reusing this field for admin notes for now
            });

            toast({
                title: "Cập nhật thành công",
                description: "Trạng thái yêu cầu đã được cập nhật.",
            });
            eventBus.emit(REFRESH_SIDEBAR);
            onSuccess();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể cập nhật yêu cầu.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Chi tiết yêu cầu #{request.id.slice(0, 8)}</DialogTitle>
                    <DialogDescription>
                        Xem chi tiết và cập nhật trạng thái xử lý.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground text-xs">Người gửi</Label>
                            <div className="font-medium">Sinh viên (Phòng {request.room_code || "N/A"})</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground text-xs">Ngày gửi</Label>
                            <div className="font-medium">{format(new Date(request.created_at), "dd/MM/yyyy HH:mm")}</div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">Tiêu đề</Label>
                        <div className="font-semibold text-lg">{request.title}</div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-muted-foreground text-xs">Mô tả chi tiết</Label>
                        <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                            {request.description || "Không có mô tả"}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Cập nhật trạng thái</Label>
                        <Select value={status} onValueChange={(val) => setStatus(val as RequestStatus)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={RequestStatus.OPEN}>Mới (Chưa xử lý)</SelectItem>
                                <SelectItem value={RequestStatus.IN_PROGRESS}>Đang xử lý</SelectItem>
                                <SelectItem value={RequestStatus.DONE}>Hoàn thành</SelectItem>
                                <SelectItem value={RequestStatus.REJECTED}>Hủy bỏ / Từ chối</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Ghi chú của quản lý / Kết quả phân tích</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Nhập ghi chú xử lý hoặc kết quả..."
                            className="h-20"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Đóng
                    </Button>
                    <Button onClick={handleUpdate} disabled={isLoading}>
                        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
