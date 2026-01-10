"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { financeService } from "@/services/finance-service";
import { Invoice, InvoiceStatus } from "@/types/finance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, CheckCircle2, AlertCircle, Ban } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function StudentFinancePage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();

    const fetchInvoices = useCallback(async () => {
        try {
            const data = await financeService.getInvoices();
            // Sort by Created Date Descending
            const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setInvoices(sorted);
        } catch (err) {
            console.error("Failed to fetch invoices:", err);
        } finally {
            setLoading(false);
        }
    }, []); // Dependencies: setInvoices, setLoading are stable. financeService is stable.

    useEffect(() => {
        const checkPaymentReturn = async () => {
            const paymentStatus = searchParams.get("payment");
            const signature = searchParams.get("signature");

            if (paymentStatus === "success" && signature) {
                try {
                    // Convert searchParams to object
                    const params: any = {};
                    searchParams.forEach((value, key) => {
                        params[key] = value;
                    });

                    // Remove UI helper param if verify endpoint doesn't expect it (it ignores unknown params usually)
                    // But verify_ipn is strict about signatures.
                    // Wait, verify_ipn ONLY checks 'valid_keys'. So extra params are ignored. Safe.

                    const res = await financeService.verifyPayment(params);

                    if (res.status === "success") {
                        toast({
                            title: "Thanh toán thành công",
                            description: "Hóa đơn đã được cập nhật.",
                            className: "bg-green-50 border-green-200 text-green-800"
                        });
                        // Refresh Data Immediately
                        await fetchInvoices();
                    } else {
                        toast({
                            variant: "destructive",
                            title: "Lỗi xác thực",
                            description: res.message || "Chữ ký không hợp lệ."
                        });
                    }
                } catch (error) {
                    console.error("Verification error:", error);
                    toast({
                        variant: "destructive",
                        title: "Lỗi",
                        description: "Không thể xác thực giao dịch."
                    });
                } finally {
                    // Start fresh: Clean URL
                    router.replace("/student/finance");
                }
            }
        };

        checkPaymentReturn();
    }, [searchParams, router, toast, fetchInvoices]); // Added fetchInvoices to dependencies

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]); // Dependency: fetchInvoices

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusBadge = (status: InvoiceStatus) => {
        switch (status) {
            case InvoiceStatus.PAID:
                return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="w-3 h-3 mr-1" /> Đã thanh toán</Badge>;
            case InvoiceStatus.UNPAID:
                return <Badge className="bg-red-600 hover:bg-red-700"><AlertCircle className="w-3 h-3 mr-1" /> Chưa thanh toán</Badge>;
            case InvoiceStatus.OVERDUE:
                return <Badge className="bg-orange-600 hover:bg-orange-700"><AlertCircle className="w-3 h-3 mr-1" /> Quá hạn</Badge>;
            case InvoiceStatus.CANCELLED:
                return <Badge variant="secondary" className="bg-gray-200 text-gray-600 hover:bg-gray-300"><Ban className="w-3 h-3 mr-1" /> Đã hủy</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handlePayNow = async (invoice: Invoice) => {
        try {
            const res = await financeService.createPaymentUrl({
                invoice_id: invoice.id,
                amount: invoice.total_amount
            });
            window.location.href = res.url;
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể khởi tạo thanh toán. Vui lòng thử lại sau."
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const unpaidInvoices = invoices.filter(i => i.status === InvoiceStatus.UNPAID || i.status === InvoiceStatus.OVERDUE);
    const historyInvoices = invoices.filter(i => i.status !== InvoiceStatus.UNPAID && i.status !== InvoiceStatus.OVERDUE);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Tài chính & Hóa đơn</h2>
                <p className="text-muted-foreground">Quản lý các khoản thanh toán của bạn.</p>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Tổng nợ hiện tại</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                            {formatCurrency(unpaidInvoices.reduce((sum, i) => sum + i.total_amount, 0))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="unpaid" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="unpaid">Cần thanh toán ({unpaidInvoices.length})</TabsTrigger>
                    <TabsTrigger value="history">Lịch sử ({historyInvoices.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="unpaid" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hóa đơn chưa thanh toán</CardTitle>
                            <CardDescription>Vui lòng thanh toán đúng hạn để tránh phát sinh phí phạt.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {unpaidInvoices.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                                    <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                                    <p className="text-lg font-medium">Bạn đã thanh toán hết các hóa đơn!</p>
                                </div>
                            ) : (
                                <InvoiceTable
                                    invoices={unpaidInvoices}
                                    formatCurrency={formatCurrency}
                                    getStatusBadge={getStatusBadge}
                                    showPayButton
                                    onPay={handlePayNow}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lịch sử hóa đơn</CardTitle>
                            <CardDescription>Bao gồm các hóa đơn đã thanh toán và đã hủy.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InvoiceTable invoices={historyInvoices} formatCurrency={formatCurrency} getStatusBadge={getStatusBadge} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function InvoiceTable({ invoices, formatCurrency, getStatusBadge, showPayButton = false, onPay }: any) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Hạn thanh toán</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Ngày tạo</TableHead>
                    {showPayButton && <TableHead className="text-right">Hành động</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map((invoice: Invoice) => {
                    const isService = invoice.details?.month && invoice.details?.year;
                    const title = invoice.title || (isService ? `Hóa đơn Dịch vụ T${invoice.details?.month}` : "Hóa đơn Hợp đồng");

                    return (
                        <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    {title}
                                </div>
                            </TableCell>
                            <TableCell className="text-red-600 font-medium">
                                {invoice.due_date ? format(new Date(invoice.due_date), 'dd/MM/yyyy') : '---'}
                            </TableCell>
                            <TableCell className="font-bold">{formatCurrency(invoice.total_amount)}</TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                                {format(new Date(invoice.created_at), 'dd/MM/yyyy')}
                            </TableCell>
                            {showPayButton && (
                                <TableCell className="text-right">
                                    <Button size="sm" onClick={() => onPay && onPay(invoice)}>Thanh toán</Button>
                                </TableCell>
                            )}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
