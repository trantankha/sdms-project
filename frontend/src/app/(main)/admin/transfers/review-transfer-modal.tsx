// I will switch to backend task.

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TransferRequest, TransferStatus } from "@/types/transfers";
import { transferService } from "@/services/transfer-service";
import { roomService } from "@/services/room-service";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { eventBus, REFRESH_SIDEBAR } from "@/lib/events";

interface ReviewTransferModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transfer: TransferRequest | null;
    onSuccess: () => void;
}

export function ReviewTransferModal({
    open,
    onOpenChange,
    transfer,
    onSuccess,
}: ReviewTransferModalProps) {
    const { toast } = useToast();

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setShowConfirmApprove(false);
            setShowRejectInput(false);
            setRejectReason("");
            setTargetBedId("");
            // Reset cascading selections
            setSelectedCampusId("");
            setSelectedBuildingId("");
            setCampuses([]);
            setBuildings([]);
            setAvailableBeds([]);
        }
    }, [open]);
    const [loading, setLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [showConfirmApprove, setShowConfirmApprove] = useState(false);

    // State for Bed Selection (Cascading)
    const [campuses, setCampuses] = useState<{ id: string; name: string }[]>([]);
    const [selectedCampusId, setSelectedCampusId] = useState<string>("");

    const [buildings, setBuildings] = useState<{ id: string; name: string }[]>([]);
    const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");

    const [availableBeds, setAvailableBeds] = useState<{ id: string; label: string; roomName: string; price: number }[]>([]);
    const [targetBedId, setTargetBedId] = useState<string>("");

    // 1. Fetch Campuses when open
    useEffect(() => {
        if (showConfirmApprove) {
            roomService.getCampuses().then(setCampuses).catch(e => console.error("Fetch campuses failed", e));
        }
    }, [showConfirmApprove]);

    // 2. Fetch Buildings when Campus changes
    useEffect(() => {
        if (selectedCampusId) {
            roomService.getBuildings(selectedCampusId).then(setBuildings).catch(e => console.error("Fetch buildings failed", e));
        } else {
            setBuildings([]);
        }
        // Reset downstream
        setSelectedBuildingId("");
        setAvailableBeds([]);
        setTargetBedId("");
    }, [selectedCampusId]);

    // 3. Fetch Beds/Rooms when Building changes
    useEffect(() => {
        if (selectedBuildingId) {
            const fetchBeds = async () => {
                try {
                    // Use correct query param 'building_id' matching backend
                    const rooms = await roomService.getRooms({ status: 'CON_CHO', building_id: selectedBuildingId } as any);
                    const beds = [];
                    for (const room of rooms) {
                        if (room.beds) {
                            for (const bed of room.beds) {
                                if (bed.status === 'TRONG') {
                                    beds.push({
                                        id: bed.id,
                                        label: `${room.code} - ${bed.label}`,
                                        roomName: room.code,
                                        price: room.base_price
                                    });
                                }
                            }
                        }
                    }
                    beds.sort((a, b) => a.label.localeCompare(b.label));
                    setAvailableBeds(beds);
                } catch (error) {
                    console.error("Failed to fetch beds", error);
                }
            };
            fetchBeds();
        } else {
            setAvailableBeds([]);
            setTargetBedId("");
        }
    }, [selectedBuildingId]);

    if (!transfer) return null;

    const handleApprove = async () => {
        if (!targetBedId) {
            toast({
                title: "Chưa chọn giường",
                description: "Vui lòng chọn giường đích cho sinh viên.",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            await transferService.updateTransfer(transfer.id, {
                status: TransferStatus.APPROVED,
                admin_response: "Yêu cầu đã được chấp thuận.",
                assigned_bed_id: targetBedId
            });
            toast({
                title: "Thành công",
                description: "Đã duyệt yêu cầu chuyển phòng.",
                className: "bg-green-600 text-white border-none",
            });
            eventBus.emit(REFRESH_SIDEBAR);
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể duyệt yêu cầu. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast({
                title: "Yêu cầu lý do",
                description: "Vui lòng nhập lý do từ chối.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            await transferService.updateTransfer(transfer.id, {
                status: TransferStatus.REJECTED,
                admin_response: rejectReason,
            });
            toast({
                title: "Đã từ chối",
                description: "Yêu cầu chuyển phòng đã bị từ chối.",
            });
            eventBus.emit(REFRESH_SIDEBAR);
            onSuccess();
            onOpenChange(false);
            setShowRejectInput(false);
            setRejectReason("");
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể từ chối yêu cầu. Vui lòng thử lại.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chi tiết Yêu cầu Chuyển phòng</DialogTitle>
                    <DialogDescription>
                        Xem xét thông tin và đưa ra quyết định duyệt hoặc từ chối.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 overflow-y-auto px-1">
                    {/* Status Badge */}
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Trạng thái:</span>
                        <StatusBadge status={transfer.status} type="transfer" />
                    </div>

                    {/* Student Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Sinh viên</span>
                            <span className="font-medium text-sm">{transfer.student_name || "N/A"}</span>
                            <span className="text-xs text-muted-foreground">{transfer.student_code || transfer.student_id}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Phòng hiện tại</span>
                            <span className="font-medium text-sm">{transfer.current_room_name || "N/A"}</span>
                            <span className="text-xs text-muted-foreground">{transfer.current_bed_label || "Chưa xếp giường"}</span>
                        </div>
                    </div>

                    {/* Target Room Info (If Approved) */}
                    {(transfer.target_room_name || transfer.target_bed_label) && (
                        <div className="flex flex-col gap-1 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-md">
                            <span className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Đã chuyển đến:
                            </span>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-sm">{transfer.target_room_name}</span>
                                <span className="text-xs text-muted-foreground font-medium bg-white dark:bg-black/20 px-2 py-0.5 rounded-full border">
                                    {transfer.target_bed_label}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Request Info */}
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-muted-foreground">Lý do chuyển</span>
                        <div className="p-3 rounded-md bg-muted/50 text-sm italic">
                            "{transfer.reason}"
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-muted-foreground">Ngày yêu cầu</span>
                        <span className="text-sm">
                            {format(new Date(transfer.created_at), "dd 'tháng' MM, yyyy - HH:mm")}
                        </span>
                    </div>

                    {/* Admin Response (If exists) */}
                    {transfer.admin_response && (
                        <div className="flex flex-col gap-1 mt-2">
                            <span className="text-sm font-medium text-muted-foreground">Phản hồi của Admin</span>
                            <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300">
                                {transfer.admin_response}
                            </div>
                        </div>
                    )}

                    {/* Reject Input */}
                    {showRejectInput && (
                        <div className="flex flex-col gap-2 mt-2 p-4 border rounded-md bg-destructive/5 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                Xác nhận từ chối
                            </div>
                            <Textarea
                                placeholder="Nhập lý do từ chối (bắt buộc)..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="bg-background"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowRejectInput(false)}
                                    disabled={loading}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleReject}
                                    disabled={loading || !rejectReason.trim()}
                                >
                                    {loading ? "Đang xử lý..." : "Xác nhận Từ chối"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Approve Confirmation */}
                    {showConfirmApprove && transfer.status === TransferStatus.PENDING && (
                        <div className="flex flex-col gap-2 mt-2 p-4 border rounded-md bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-medium text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                Xác nhận Duyệt Chuyển phòng
                            </div>

                            {/* Cascading Selection */}
                            <div className="flex flex-col gap-3 my-2 bg-muted/30 p-3 rounded-lg border">
                                <span className="text-sm font-semibold text-primary">Chọn Phòng Điều Chuyển</span>

                                {/* 1. Campus */}
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <Label className="text-sm">Cơ sở</Label>
                                    <Select value={selectedCampusId} onValueChange={setSelectedCampusId}>
                                        <SelectTrigger className="col-span-2 bg-background h-8">
                                            <SelectValue placeholder="-- Chọn Cơ sở --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {campuses.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 2. Building */}
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <Label className="text-sm">Tòa nhà</Label>
                                    <Select value={selectedBuildingId} onValueChange={setSelectedBuildingId} disabled={!selectedCampusId}>
                                        <SelectTrigger className="col-span-2 bg-background h-8">
                                            <SelectValue placeholder="-- Chọn Tòa nhà --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {buildings.map(b => (
                                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 3. Bed (Result) */}
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <Label className="text-sm">Giường trống</Label>
                                    <Select value={targetBedId} onValueChange={setTargetBedId} disabled={!selectedBuildingId}>
                                        <SelectTrigger className="col-span-2 bg-background h-8 border-yellow-300 dark:border-yellow-800">
                                            <SelectValue placeholder="-- Chọn Giường --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableBeds.length === 0 ? (
                                                <div className="p-2 text-xs text-muted-foreground text-center">
                                                    {selectedBuildingId ? "Không còn giường trống" : "Vui lòng chọn tòa nhà"}
                                                </div>
                                            ) : (
                                                availableBeds.map((bed) => (
                                                    <SelectItem key={bed.id} value={bed.id}>
                                                        {bed.label} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bed.price)}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                                Hành động này sẽ tự động:
                                <ul className="list-disc list-inside mt-1 ml-1 space-y-1">
                                    <li><strong>Thanh lý hợp đồng cũ</strong> (Giải phóng giường cũ).</li>
                                    <li><strong>Tạo hợp đồng mới</strong> (Giường mới, giá mới).</li>
                                    <li><strong>Tính toán hoàn tiền</strong> cho những ngày chưa ở (nếu đã đóng).</li>
                                    <li><strong>Tạo hóa đơn</strong> thanh toán chênh lệch/cọc mới.</li>
                                </ul>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <Button variant="ghost" size="sm" onClick={() => setShowConfirmApprove(false)} disabled={loading}>
                                    Hủy
                                </Button>
                                <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={handleApprove} disabled={loading}>
                                    {loading ? "Đang xử lý..." : "Xác nhận Duyệt"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-between gap-2">
                    {!showRejectInput && !showConfirmApprove && transfer.status === TransferStatus.PENDING ? (
                        <>
                            <Button
                                variant="outline"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                onClick={() => setShowRejectInput(true)}
                                disabled={loading}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Từ chối
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => setShowConfirmApprove(true)}
                                disabled={loading}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Duyệt Yêu cầu
                            </Button>
                        </>
                    ) : (
                        !showRejectInput && !showConfirmApprove && (
                            <Button
                                variant="secondary"
                                onClick={() => onOpenChange(false)}
                                className="w-full sm:w-auto ml-auto"
                            >
                                Đóng
                            </Button>
                        )
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
