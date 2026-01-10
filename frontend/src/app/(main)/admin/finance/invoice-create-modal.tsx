"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { contractService } from "@/services/contract-service";
import { financeService } from "@/services/finance-service";
import { Contract, ContractStatus } from "@/types/contracts";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface InvoiceCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

interface LineItem {
    name: string;
    amount: number;
}

export function InvoiceCreateModal({ open, onOpenChange, onSuccess }: InvoiceCreateModalProps) {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loadingContracts, setLoadingContracts] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    // Form State
    const [contractId, setContractId] = useState<string>("");
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState<string>("");
    const [items, setItems] = useState<LineItem[]>([{ name: "Khoản thu khác", amount: 0 }]);

    useEffect(() => {
        if (open) {
            loadContracts();
            resetForm();
        }
    }, [open]);

    const resetForm = () => {
        setContractId("");
        setTitle("");
        setDueDate("");
        setItems([{ name: "", amount: 0 }]);
    };

    const loadContracts = async () => {
        setLoadingContracts(true);
        try {
            const data = await contractService.getContracts({ status: "ACTIVE" }); // Or ContractStatus.ACTIVE if string map works
            // Filter locally if needed or trust backend
            // Note: backend api might not accept "ACTIVE" string if enum strict, but usually it does. 
            // Better to use empty status and filter in JS if unsure about backend enum matching
            const activeContracts = data.filter(c => c.status === ContractStatus.ACTIVE || c.status === "ACTIVE" as any || c.status === "DANG_O" as any);
            setContracts(activeContracts);
        } catch (error) {
            console.error("Failed to load contracts");
        } finally {
            setLoadingContracts(false);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { name: "", amount: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);

    const handleSubmit = async () => {
        if (!contractId) {
            toast({ title: "Lỗi", description: "Vui lòng chọn hợp đồng (sinh viên).", variant: "destructive" });
            return;
        }
        if (!title) {
            toast({ title: "Lỗi", description: "Vui lòng nhập tiêu đề hóa đơn.", variant: "destructive" });
            return;
        }
        if (totalAmount <= 0) {
            toast({ title: "Lỗi", description: "Tổng tiền phải lớn hơn 0.", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        try {
            await financeService.createInvoice({
                contract_id: contractId as any, // Cast UUID
                title: title,
                total_amount: totalAmount,
                due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
                details: { items: items }
            });
            toast({ title: "Thành công", description: "Đã tạo hóa đơn mới." });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể tạo hóa đơn.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-6">
                <DialogHeader>
                    <DialogTitle>Tạo Hóa Đơn Mới (Thủ công)</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
                    <div className="grid gap-2">
                        <Label>Chọn Hợp đồng / Sinh viên</Label>
                        <Select value={contractId} onValueChange={setContractId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn sinh viên..." />
                            </SelectTrigger>
                            <SelectContent>
                                {loadingContracts ? <div className="p-2 text-sm text-center">Đang tải...</div> :
                                    contracts.map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.student?.student_code} - {c.student?.full_name || "Unknown"} (Phòng {c.bed?.room?.code})
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Tiêu đề hóa đơn</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ví dụ: Thu tiền phạt vi phạm, Thu phí sửa chữa..."
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Hạn thanh toán</Label>
                        <Input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Chi tiết khoản thu</Label>
                            <Button size="sm" variant="outline" onClick={handleAddItem}>
                                <Plus className="h-4 w-4 mr-1" /> Thêm khoản
                            </Button>
                        </div>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tên khoản mục</TableHead>
                                        <TableHead className="w-[150px] text-right">Số tiền</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Input
                                                    value={item.name}
                                                    onChange={(e) => handleItemChange(index, "name", e.target.value)}
                                                    placeholder="Tên khoản thu"
                                                    className="h-8"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    value={item.amount}
                                                    onChange={(e) => handleItemChange(index, "amount", Number(e.target.value))}
                                                    className="h-8 text-right"
                                                    min={0}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleRemoveItem(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex justify-end text-sm font-bold mt-2">
                            Tổng cộng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalAmount)}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Tạo hóa đơn
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
