import { Room } from "@/services/room-service";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Wifi, Wind, BedDouble, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomCardProps {
    room: Room;
    onViewDetails: (room: Room) => void;
    currentSelection?: { roomId: string; bedId: string };
}

export function RoomCard({ room, onViewDetails, currentSelection }: RoomCardProps) {
    const beds = room.beds || [];
    const availableBedsCount = beds.filter(b => b.status === "TRONG").length;
    const isFull = availableBedsCount === 0;
    const isSelectedRoom = currentSelection?.roomId === room.id;

    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return "Unknown";
        // Format: 1.500.000 -> 1.5tr for compactness if needed, or full string.
        // Let's stick to full clean format but larger font.
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
    };

    // Determine card theme based on status
    const cardTheme = isFull
        ? "border-l-4 border-l-gray-300 opacity-75 grayscale-[0.5]"
        : isSelectedRoom
            ? "border-l-4 border-l-primary ring-2 ring-primary ring-offset-2"
            : "border-l-0 hover:shadow-xl hover:-translate-y-1";

    const headerGradient = isFull
        ? "bg-gradient-to-r from-gray-100 to-gray-200"
        : "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30";

    return (
        <Card className={cn(
            "group overflow-hidden transition-all duration-300 relative border-none shadow-md",
            cardTheme
        )}>
            {/* Visual Header */}
            <div className={cn("px-6 py-4 flex justify-between items-center", headerGradient)}>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold text-foreground">
                            P.{room.code}
                        </h3>
                        {room.gender_type === 'NAM' && <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">Nam</Badge>}
                        {room.gender_type === 'NU' && <Badge variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-200">Nữ</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                        {room.building?.name || "Tòa nhà ?"} &bull; Tầng {room.floor}
                    </p>
                </div>
                <div className="text-right">
                    <span className="block text-xl font-bold text-primary">
                        {formatCurrency(room.base_price)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ tháng</span>
                </div>
            </div>

            <CardContent className="p-6">
                {/* Visual Bed Grid */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trạng thái giường</span>
                        <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full",
                            isFull ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        )}>
                            {isFull ? "Hết chỗ" : `Còn ${availableBedsCount} chỗ`}
                        </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {beds.length > 0 ? (
                            beds.map((bed, idx) => {
                                const isOccupied = bed.status !== "TRONG";
                                return (
                                    <div
                                        key={bed.id}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-2 rounded-lg border transition-colors",
                                            isOccupied
                                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                                : "bg-white border-green-200 text-green-600 shadow-sm border-2 border-dashed hover:border-solid hover:border-green-500"
                                        )}
                                        title={isOccupied ? "Đã có người" : "Còn trống"}
                                    >
                                        <BedDouble className="h-5 w-5 mb-1" />
                                        <span className="text-[10px] font-bold">{bed.label}</span>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="col-span-4 text-center text-sm text-muted-foreground py-2 italic">
                                Chưa cập nhật danh sách giường
                            </div>
                        )}
                    </div>
                </div>

                {/* Amenities / Info */}
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {room.capacity} Người
                    </Badge>
                    <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
                        <Sparkles className="h-3 w-3" />
                        {room.room_type?.name || "Tiêu chuẩn"}
                    </Badge>
                    {/* Mock amenities based on standard defaults since explicit data might be missing in basic 'Room' type */}
                    <Badge variant="outline" className="gap-1 font-normal text-muted-foreground bg-blue-50/50 border-blue-100">
                        <Wifi className="h-3 w-3" /> Wifi
                    </Badge>
                    {hasAc(room) && (
                        <Badge variant="outline" className="gap-1 font-normal text-muted-foreground bg-cyan-50/50 border-cyan-100">
                            <Wind className="h-3 w-3" /> Đhòa
                        </Badge>
                    )}
                </div>
            </CardContent>

            <CardFooter className="px-6 pb-6 pt-0">
                <Button
                    className={cn("w-full transition-all", isSelectedRoom ? "bg-green-600 hover:bg-green-700" : "")}
                    variant={isFull ? "outline" : "default"}
                    disabled={isFull}
                    onClick={() => onViewDetails(room)}
                >
                    {isSelectedRoom ? (
                        <>
                            <Check className="mr-2 h-4 w-4" /> Đã chọn phòng này
                        </>
                    ) : isFull ? "Đã hết chỗ" : "Xem chi tiết & Chọn"}
                </Button>
            </CardFooter>
        </Card>
    );
}

// Helper to guess AC based on price or type (since we don't have explicit amenities list in this specific view data sometimes)
// But wait, Room interface usually has amenities or attributes?
// Let's just assume for now based on price or room type name simple logic for visual flare.
// Or just hardcode common ones for visual concept.
function hasAc(room: Room) {
    // Simple heuristic for demo: Price > 1.5M or type contains "VIP" or "Service"
    // In real app, check room.attributes
    return (room.base_price > 1200000 || room.room_type?.name?.toLowerCase().includes('dịch vụ'));
}
