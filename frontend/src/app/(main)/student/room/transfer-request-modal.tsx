"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { transferService } from "@/services/transfer-service";
import { Loader2 } from "lucide-react";

interface TransferRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contractId: string;
    onSuccess?: () => void;
}

export function TransferRequestModal({ open, onOpenChange, contractId, onSuccess }: TransferRequestModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState("");

    const handleSubmit = async () => {
        if (!reason.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập lý do chuyển phòng.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            await transferService.createTransfer({
                contract_id: contractId,
                reason: reason,
                // target_bed_id is optional, left for admin to assign
            });
            toast({
                title: "Thành công",
                description: "Đã gửi yêu cầu chuyển phòng. Vui lòng chờ phản hồi.",
                className: "bg-green-600 text-white border-none",
            });
            if (onSuccess) onSuccess();
            onOpenChange(false);
            setReason("");
        } catch (error: any) {
            toast({
                title: "Lỗi",
                description: error.response?.data?.detail || "Không thể gửi yêu cầu.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yêu cầu Chuyển phòng</DialogTitle>
                    <DialogDescription>
                        Gửi yêu cầu chuyển phòng đến ban quản lý. Vui lòng nêu rõ lý do và mong muốn (ví dụ: muốn ở tầng thấp, chung phòng với bạn...).
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Lý do & Mong muốn</Label>
                        <Textarea
                            id="reason"
                            placeholder="Nhập lý do chuyển phòng và phòng mong muốn (nếu có)..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="h-32"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !reason.trim()}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Gửi Yêu cầu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
