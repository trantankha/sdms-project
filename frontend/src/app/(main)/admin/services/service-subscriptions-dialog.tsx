"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { servicePackageService } from "@/services/service-package-service";
import { Subscription } from "@/types/services";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";

interface ServiceSubscriptionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ServiceSubscriptionsDialog({
    open,
    onOpenChange,
}: ServiceSubscriptionsDialogProps) {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            loadSubscriptions();
        }
    }, [open]);

    const loadSubscriptions = async () => {
        setLoading(true);
        try {
            const data = await servicePackageService.getSubscriptions();
            setSubscriptions(data);
        } catch (error) {
            console.error("Failed to load subscriptions", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Danh sách Đăng ký Dịch vụ</DialogTitle>
                    <DialogDescription>
                        Xem danh sách sinh viên đã đăng ký sử dụng dịch vụ.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-auto mt-4 border rounded-md">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="sticky top-0 bg-secondary">
                                <TableRow>
                                    <TableHead>Mã SV</TableHead>
                                    <TableHead>Họ tên</TableHead>
                                    <TableHead>Phòng</TableHead>
                                    <TableHead>Dịch vụ</TableHead>
                                    <TableHead className="text-center">SL</TableHead>
                                    <TableHead>Ngày ĐK</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subscriptions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                            Không có dữ liệu đăng ký.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    subscriptions.map((sub) => (
                                        <TableRow key={sub.id}>
                                            <TableCell className="font-mono text-xs">{sub.student_code || sub.user_id.substring(0, 8)}</TableCell>
                                            <TableCell className="font-medium">{sub.student_name || "---"}</TableCell>
                                            <TableCell>
                                                {sub.room_code ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                                        {sub.room_code} - {sub.building_name}
                                                    </span>
                                                ) : "N/A"}
                                            </TableCell>
                                            <TableCell className="font-medium">{sub.service_name || "---"}</TableCell>
                                            <TableCell className="text-center">{sub.quantity}</TableCell>
                                            <TableCell>{format(new Date(sub.start_date), "dd/MM/yyyy")}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={sub.is_active ? "ACTIVE" : "INACTIVE"} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
