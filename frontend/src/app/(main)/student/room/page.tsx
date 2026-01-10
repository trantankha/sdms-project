"use client";

import { useEffect, useState } from "react";
import { contractService } from "@/services/contract-service";
import { Contract } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Loader2, Home, Bed, Users, MapPin, FileJson, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { TransferRequestModal } from "./transfer-request-modal";

// Extracted Sub-component for Empty State
function EmptyRoomState() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
            <div className="bg-muted p-6 rounded-full mb-4">
                <Home className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Chưa có thông tin phòng</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
                Bạn hiện chưa có hợp đồng phòng nào đang hoạt động.
                <br />
                Bạn có thể đăng ký phòng mới ngay bây giờ.
            </p>
            <div className="mt-6">
                <Button onClick={() => window.location.href = '/student/register-room'} className="gap-2">
                    <Bed className="h-4 w-4" />
                    Đăng ký phòng mới
                </Button>
            </div>
        </div>
    );
}

// Extracted Sub-component for Room Details
function RoomDetailCard({ contract }: { contract: Contract }) {
    return (
        <Card className="md:col-span-1 shadow-md border-t-4 border-t-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    Phòng {contract.room?.code || "N/A"}
                </CardTitle>
                <CardDescription>
                    {contract.room?.building?.name || "N/A"}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <DetailRow
                    icon={<MapPin className="h-5 w-5 text-muted-foreground" />}
                    label="Vị trí"
                    value={`Tầng ${contract.room?.floor || "N/A"}, ${contract.room?.building?.name || ""}`}
                />
                <DetailRow
                    icon={<Users className="h-5 w-5 text-muted-foreground" />}
                    label="Loại phòng"
                    value={`${contract.room?.room_type?.name} (${contract.room?.room_type?.capacity ? `${contract.room.room_type.capacity} người` : "N/A"})`}
                />
                <DetailRow
                    icon={<Bed className="h-5 w-5 text-muted-foreground" />}
                    label="Giường của bạn"
                    value={contract.bed?.name || contract.bed?.label || "Chưa xếp giường"}
                    valueClass="text-primary font-semibold"
                />
            </CardContent>
        </Card>
    );
}

// Key-Value Row Helper
function DetailRow({ icon, label, value, valueClass = "text-muted-foreground" }: { icon: React.ReactNode, label: string, value: string, valueClass?: string }) {
    return (
        <div className="flex items-start justify-between p-3 bg-muted/40 rounded-lg">
            <div className="flex items-center gap-3">
                {icon}
                <div>
                    <p className="font-medium text-sm">{label}</p>
                    <p className={`text-sm ${valueClass}`}>{value}</p>
                </div>
            </div>
        </div>
    );
}

// Extracted Sub-component for Contract Details
function ContractDetailCard({ contract, onCancel, onTransfer }: { contract: Contract, onCancel: () => void, onTransfer: () => void }) {
    return (
        <Card className="md:col-span-1 shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-blue-500" />
                    Thông tin Hợp đồng
                </CardTitle>
                <CardDescription>Mã HĐ: {contract.id?.substring(0, 8).toUpperCase()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <InfoRow label="Trạng thái">
                    <StatusBadge status={contract.status} type="contract" />
                </InfoRow>
                <InfoRow label="Ngày bắt đầu" value={contract.start_date ? format(new Date(contract.start_date), "dd/MM/yyyy") : "N/A"} />
                <InfoRow label="Ngày kết thúc" value={contract.end_date ? format(new Date(contract.end_date), "dd/MM/yyyy") : "N/A"} />
                <InfoRow label="Giá thuê">
                    <span className="text-sm font-bold text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(contract.price_per_month || 0)} / tháng
                    </span>
                </InfoRow>
            </CardContent>
            <CardFooter className="bg-muted/20 p-4">
                <div className="w-full flex gap-2">
                    {contract.status === "DANG_O" && (
                        <Button variant="outline" className="flex-1 gap-2" onClick={onTransfer}>
                            <RefreshCcw className="h-4 w-4" />
                            Chuyển phòng
                        </Button>
                    )}
                    {/* Gia hạn - Future Feature */}
                    {/* <Button variant="ghost" className="flex-1" disabled>Gia hạn</Button> */}

                    {contract.status === "CHO_DUYET" && (
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={onCancel}
                        >
                            Hủy yêu cầu
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}

function InfoRow({ label, value, children }: { label: string, value?: string, children?: React.ReactNode }) {
    return (
        <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">{label}</span>
            {children ? children : <span className="text-sm font-medium">{value}</span>}
        </div>
    );
}

export default function StudentRoomPage() {
    const { toast } = useToast();
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);

    const [transferModalOpen, setTransferModalOpen] = useState(false);

    useEffect(() => {
        const fetchRoomInfo = async () => {
            try {
                const contracts = await contractService.getMyContracts();
                // Prioritize finding an active or pending contract
                const activeContract = contracts.find(c => c.status === "DANG_O" || c.status === "CHO_DUYET");
                setContract(activeContract || contracts[0] || null);
            } catch (err) {
                console.error("Failed to fetch room info:", err);
                toast({
                    variant: "destructive",
                    title: "Lỗi",
                    description: "Không thể tải thông tin phòng.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchRoomInfo();
    }, [toast]);

    const handleCancel = async () => {
        if (!contract) return;
        if (!window.confirm("Bạn có chắc chắn muốn hủy yêu cầu đăng ký này?")) return;

        try {
            setLoading(true);
            await contractService.cancelMyContract(contract.id);
            toast({
                title: "Thành công",
                description: "Đã hủy yêu cầu đăng ký phòng.",
            });
            setContract(null);
        } catch (err: any) {
            console.error("Cancel failed", err);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: err.response?.data?.detail || "Không thể hủy yêu cầu.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!contract) {
        return <EmptyRoomState />;
    }

    return (
        <div className="space-y-6 container mx-auto p-4 md:p-6 max-w-5xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Thông tin Phòng ở</h2>
                <p className="text-muted-foreground">Chi tiết về phòng và hợp đồng hiện tại của bạn.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <RoomDetailCard contract={contract} />
                <ContractDetailCard
                    contract={contract}
                    onCancel={handleCancel}
                    onTransfer={() => setTransferModalOpen(true)}
                />
            </div>

            <TransferRequestModal
                open={transferModalOpen}
                onOpenChange={setTransferModalOpen}
                contractId={contract.id}
                onSuccess={() => {
                    // Refresh data maybe? Or just close.
                }}
            />
        </div>
    );
}

