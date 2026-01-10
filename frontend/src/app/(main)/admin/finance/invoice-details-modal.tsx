"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { Invoice, InvoiceStatus } from "@/types/finance";
import { format } from "date-fns";
import { Loader2, Printer, Ban } from "lucide-react";
import { financeService } from "@/services/finance-service";
import { contractService } from "@/services/contract-service";
import { Contract } from "@/types/contracts";
import { useToast } from "@/hooks/use-toast";

interface InvoiceDetailsModalProps {
    invoice: Invoice | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdate: () => void;
}

export function InvoiceDetailsModal({ invoice, open, onOpenChange, onUpdate }: InvoiceDetailsModalProps) {
    const [contract, setContract] = useState<Contract | null>(null);
    const [loadingContract, setLoadingContract] = useState(false);
    const [processing, setProcessing] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open && invoice?.contract_id) {
            loadContract(invoice.contract_id);
        }
    }, [open, invoice]);

    const loadContract = async (id: string) => {
        setLoadingContract(true);
        try {
            const data = await contractService.getContract(id);
            setContract(data);
        } catch (error) {
            console.error("Failed to load contract", error);
        } finally {
            setLoadingContract(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleCancel = async () => {
        if (!invoice) return;
        if (!confirm("Bạn có chắc chắn muốn hủy hóa đơn này không?")) return;

        setProcessing(true);
        try {
            await financeService.cancelInvoice(invoice.id);
            toast({ title: "Thành công", description: "Đã hủy hóa đơn." });
            onUpdate();
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể hủy hóa đơn.", variant: "destructive" });
        } finally {
            setProcessing(false);
        }
    };

    if (!invoice) return null;

    const lineItems = (invoice.details?.items as any[]) || [];

    const handleOnlinePayment = async () => {
        if (!invoice) return;
        setProcessing(true);
        try {
            const res = await financeService.createPaymentUrl({
                invoice_id: invoice.id,
                amount: invoice.remaining_amount || 0
            });
            window.location.href = res.url;
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể tạo giao dịch thanh toán.", variant: "destructive" });
            setProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-6 overflow-hidden">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <div>
                            <DialogTitle className="text-xl">Chi tiết Hóa đơn</DialogTitle>
                            <p className="text-sm text-muted-foreground font-mono mt-1">{invoice.id}</p>
                        </div>
                        <StatusBadge status={invoice.status} type="invoice" />
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {/* General Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="shadow-none border bg-muted/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Thông tin thanh toán</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tổng tiền:</span>
                                    <span className="font-bold">{formatCurrency(invoice.total_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Đã trả:</span>
                                    <span className="text-green-600">{formatCurrency(invoice.paid_amount || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Còn lại:</span>
                                    <span className="text-red-600 font-bold">{formatCurrency(invoice.remaining_amount || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Hạn thanh toán:</span>
                                    <span>{invoice.due_date ? format(new Date(invoice.due_date), "dd/MM/yyyy") : "N/A"}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-none border bg-muted/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Thông tin Sinh viên & Phòng</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                {loadingContract ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                                    </div>
                                ) : contract ? (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Sinh viên:</span>
                                            <span className="font-medium">{contract.student?.full_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Mã SV:</span>
                                            <span>{contract.student?.student_code}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Phòng:</span>
                                            <span className="font-medium">{contract.bed?.room?.code}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Giường:</span>
                                            <span>{contract.bed?.label || contract.bed?.name || "N/A"}</span>
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-muted-foreground italic">Không tìm thấy hợp đồng</span>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Line Items */}
                    <div>
                        <h3 className="font-semibold mb-2 text-sm">Chi tiết khoản thu</h3>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Khoản mục</TableHead>
                                        <TableHead className="text-right">Sử dụng</TableHead>
                                        <TableHead className="text-right">Đơn giá</TableHead>
                                        <TableHead className="text-right">Thành tiền</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lineItems.length > 0 ? lineItems.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell className="text-right">
                                                {item.usage !== undefined
                                                    ? `${item.usage} ${item.name === 'Điện' ? 'kWh' : item.name === 'Nước' ? 'm3' : ''}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.rate ? formatCurrency(item.rate) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(item.amount)}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">Không có chi tiết</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Payment History */}
                    {invoice.payments && invoice.payments.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2 text-sm">Lịch sử thanh toán</h3>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Ngày</TableHead>
                                            <TableHead>Phương thức</TableHead>
                                            <TableHead className="text-right">Số tiền</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoice.payments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>{format(new Date(payment.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                                                <TableCell>
                                                    <StatusBadge status={payment.payment_method} type="payment" />
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-green-600">
                                                    +{formatCurrency(payment.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-6 flex justify-between items-center w-full sm:justify-between">
                    <Button variant="outline" className="gap-2">
                        <Printer className="h-4 w-4" /> In hóa đơn
                    </Button>

                    <div className="flex gap-2">
                        {invoice.status !== InvoiceStatus.CANCELLED && invoice.status !== InvoiceStatus.PAID && (
                            <Button variant="destructive" onClick={handleCancel} disabled={processing}>
                                <Ban className="mr-2 h-4 w-4" /> Hủy hóa đơn
                            </Button>
                        )}
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>Đóng</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
