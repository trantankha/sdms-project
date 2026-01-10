"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Contract } from "@/types/contracts";
import { format } from "date-fns";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    CalendarDays,
    User,
    BedDouble,
    CreditCard,
    FileText,
    Clock
} from "lucide-react";

interface ContractDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contract: Contract | null;
}

export function ContractDetailsModal({ open, onOpenChange, contract }: ContractDetailsModalProps) {
    if (!contract) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return format(new Date(dateString), "dd/MM/yyyy");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FileText className="h-6 w-6 text-primary" />
                        Chi tiết Hợp Đồng
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Header Info */}
                    <div className="flex items-center justify-between rounded-lg bg-secondary/20 p-4 border border-border">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground font-mono">#{contract.id.split('-')[0]}...</p>
                            <StatusBadge status={contract.status} type="contract" />
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-muted-foreground">Giá thuê</p>
                            <p className="text-xl font-bold text-primary">{formatCurrency(contract.price_per_month)} <span className="text-sm font-normal text-muted-foreground">/ tháng</span></p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Student Info */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-base">Sinh viên</h3>
                                        {contract.student?.full_name && (
                                            <p className="text-sm text-muted-foreground">{contract.student.full_name}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-muted-foreground">Mã SV:</span>
                                        <span className="font-medium font-mono">{contract.student?.student_code || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium max-w-[180px] truncate" title={contract.student?.email}>{contract.student?.email || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">SĐT:</span>
                                        <span className="font-medium">{contract.student?.phone_number || "Chưa cập nhật"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Room Info */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <BedDouble className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-base">Phòng & Giường</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {contract.room?.building?.name ? (
                                                <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
                                                    {contract.room?.building?.campus?.name || "Cơ sở ?"}
                                                </span>
                                            ) : (
                                                `Mã Phòng: ${contract.room?.code || 'N/A'}`
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-muted-foreground">Tòa nhà:</span>
                                        <span className="font-medium">{contract.room?.building?.name} - {contract.room?.code}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="text-muted-foreground">Giường số:</span>
                                        <span className="font-medium">{contract.bed?.name || contract.bed?.label || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2">
                                        <span className="text-muted-foreground">Loại phòng:</span>
                                        <span className="font-medium">
                                            {contract.room?.room_type?.name || "Tiêu chuẩn"}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Timeline & Money */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2 text-sm text-foreground/80">
                            <Clock className="h-4 w-4" /> Thời gian & Tài chính
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
                            <div className="space-y-1">
                                <p className="text-muted-foreground text-xs uppercase tracking-wider">Ngày bắt đầu</p>
                                <p className="font-medium flex items-center gap-2 text-base">
                                    <CalendarDays className="h-4 w-4 text-green-600" />
                                    {formatDate(contract.start_date || contract.created_at)}
                                </p>
                            </div>
                            <div className="space-y-1 border-l pl-4">
                                <p className="text-muted-foreground text-xs uppercase tracking-wider">Ngày kết thúc</p>
                                <p className="font-medium flex items-center gap-2 text-base">
                                    <CalendarDays className="h-4 w-4 text-red-600" />
                                    {formatDate(contract.end_date)}
                                </p>
                            </div>
                            <div className="space-y-1 border-l pl-4">
                                <p className="text-muted-foreground text-xs uppercase tracking-wider">Tiền cọc</p>
                                <p className="font-medium flex items-center gap-2 text-base text-primary">
                                    <CreditCard className="h-4 w-4" />
                                    {formatCurrency(contract.deposit_amount)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)} variant="secondary" className="w-full sm:w-auto">Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
