"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { contractService } from "@/services/contract-service";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Contract } from "@/types/contracts";

interface LiquidationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contract: Contract | null;
    onSuccess: () => void;
}

export function LiquidationModal({ open, onOpenChange, contract, onSuccess }: LiquidationModalProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const [checkoutDate, setCheckoutDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [damageCost, setDamageCost] = useState<string>("0");
    const [notes, setNotes] = useState("");

    const handleLiquidate = async () => {
        if (!contract) return;
        setLoading(true);
        try {
            await contractService.liquidateContract({
                contract_id: contract.id,
                checkout_date: new Date(checkoutDate).toISOString(),
                return_deposit_amount: contract.deposit_amount - Number(damageCost), // Logic handled by backend? 
                // Wait, backend `LiquidationCreate` has: contract_id, checkout_date, room_condition_notes, equipment_handover_status, damage_fee
                // Let's match typical request.
                damage_fee: Number(damageCost),
                room_condition_notes: notes,
                equipment_handover_status: "CHECKED", // Simple default
            } as any);

            toast({ title: "Thành công", description: "Đã thanh lý hợp đồng." });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể thanh lý hợp đồng", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thanh lý Hợp đồng</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Ngày trả phòng</Label>
                        <Input
                            type="date"
                            className="col-span-3"
                            value={checkoutDate}
                            onChange={(e) => setCheckoutDate(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Phí bồi thường</Label>
                        <Input
                            type="number"
                            className="col-span-3"
                            value={damageCost}
                            onChange={(e) => setDamageCost(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Ghi chú</Label>
                        <Input
                            className="col-span-3"
                            placeholder="Nhập tình trạng phòng..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy bỏ</Button>
                    <Button onClick={handleLiquidate} disabled={loading} variant="destructive">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Xác nhận thanh lý
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
