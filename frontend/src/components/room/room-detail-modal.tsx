import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Room } from "@/services/room-service";
import { BedSelector } from "./bed-selector";
import { Users, Info, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AMENITIES_OPTIONS = [
    { key: "air_conditioner", label: "Điều hòa" },
    { key: "washing_machine", label: "Máy giặt" },
    { key: "fridge", label: "Tủ lạnh" },
    { key: "water_heater", label: "Nóng lạnh" },
    { key: "bunk_bed", label: "Giường tầng" },
    { key: "wardrobe", label: "Tủ quần áo" },
    { key: "desk", label: "Bàn học" },
    { key: "wifi", label: "Wifi" },
];

interface RoomDetailModalProps {
    room: Room | null;
    open: boolean;
    onClose: () => void;
    onBookConfig: (roomId: string, bedId: string) => void;
    currentSelection?: { roomId: string; bedId: string };
}

export function RoomDetailModal({ room, open, onClose, onBookConfig, currentSelection }: RoomDetailModalProps) {
    if (!room) return null;

    const beds = room.beds || [];
    const hasBeds = beds.length > 0;
    const isSelectedRoom = currentSelection?.roomId === room.id;

    // Helper for currency
    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return "Chưa cập nhật";
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl">
                        Phòng {room.code}
                        {isSelectedRoom && <Badge className="bg-green-600">Đang chọn</Badge>}
                    </DialogTitle>
                    <DialogDescription>
                        Xem thông tin chi tiết và chọn giường phù hợp.
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto flex-1 pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        {/* Left Column: Room Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                                <Building className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Vị trí</p>
                                    <p className="font-semibold">{room.building?.name || "Tòa nhà ?"} - Tầng {room.floor}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                                <Users className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Sức chứa</p>
                                    <p className="font-semibold">{room.current_occupancy} / {room.capacity} người</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                                <Info className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Loại phòng</p>
                                    <p className="font-semibold">{room.room_type?.name || "Tiêu chuẩn"}</p>
                                </div>
                            </div>

                            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30">
                                <p className="text-sm font-medium text-green-700 dark:text-green-400">Giá thuê</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                                    {formatCurrency(room.base_price)}
                                    <span className="text-sm font-normal text-muted-foreground ml-1">/ tháng</span>
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Description or extra info */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                    <Info className="h-4 w-4" />
                                    Mô tả & Tiện ích
                                </h4>
                                <div className="text-sm text-muted-foreground leading-relaxed p-3 border rounded-lg bg-muted/5 space-y-3">
                                    <p>{room.description || room.room_type?.description || "Không có mô tả chi tiết cho phòng này."}</p>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground">Giới tính:</span>
                                            {room.gender_type === 'NAM' ? 'Nam' : room.gender_type === 'NU' ? 'Nữ' : 'Hỗn hợp'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground">Diện tích:</span>
                                            {room.area_m2 ? `${room.area_m2} m²` : "Tiêu chuẩn"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Render Attributes/Amenities */}
                            {room.attributes && Object.keys(room.attributes).length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Tiện nghi có sẵn</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {AMENITIES_OPTIONS.map(opt => {
                                            if (room.attributes?.[opt.key]) {
                                                return (
                                                    <Badge key={opt.key} variant="secondary" className="px-3 py-1">
                                                        {opt.label}
                                                    </Badge>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 mt-2 pb-4">
                        <h3 className="text-lg font-semibold mb-4">Danh sách giường</h3>
                        {hasBeds ? (
                            <BedSelector
                                beds={beds as any}
                                selectedBedId={isSelectedRoom ? currentSelection?.bedId : undefined}
                                onSelect={(bedId) => onBookConfig(room.id, bedId)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/10">
                                <p className="text-muted-foreground font-medium">Chưa có dữ liệu giường</p>
                                <p className="text-sm text-muted-foreground/80">Vui lòng liên hệ quản lý ký túc xá.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
