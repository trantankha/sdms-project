import { Room } from "@/services/room-service";
import { formatStatus, getStatusColor, formatPrice } from "@/lib/room-utils";
import { BedVisualizer } from "./bed-visualizer";
import { StatusBadge } from "@/components/status-badge";
import { MoreHorizontal, Users, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RoomCardProps {
    room: Room;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function RoomCard({ room, onEdit, onDelete }: RoomCardProps) {
    const capacity = room.room_type?.capacity || room.beds?.length || 0;

    return (
        <div className="group relative flex flex-col justify-between rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/50">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg tracking-tight">{room.code}</h3>
                        <StatusBadge status={room.status} type="room" className="h-5 px-1.5 py-0 text-[10px]" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{room.room_type?.name || "Standard Room"}</p>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Sửa phòng
                        </DropdownMenuItem>
                        {/* Details can be a dialog too? */}
                        <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Xóa
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Visual Bed Grid */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Sĩ số</span>
                    <span className="font-medium text-foreground">{room.current_occupancy} / {capacity}</span>
                </div>
                <BedVisualizer totalBeds={capacity} occupiedCount={room.current_occupancy} />
            </div>

            {/* Footer */}
            <div className="mt-auto pt-3 border-t flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">Giá/Tháng</span>
                    <span className="font-semibold text-sm">{formatPrice(room.base_price)}</span>
                </div>

                {room.status === 'AVAILABLE' && (
                    <Button size="sm" variant="secondary" className="h-7 text-xs">
                        Xếp phòng
                    </Button>
                )}
            </div>
        </div>
    );
}
