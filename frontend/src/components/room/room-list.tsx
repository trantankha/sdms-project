import { Room } from "@/services/room-service";
import { RoomCard } from "./room-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { RoomDetailModal } from "./room-detail-modal";

interface RoomListProps {
    rooms: Room[];
    loading: boolean;
    onBookConfig: (roomId: string, bedId: string) => void;
    currentSelection?: { roomId: string; bedId: string };
}

export function RoomList({ rooms, loading, onBookConfig, currentSelection }: RoomListProps) {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="border p-4 rounded-lg space-y-3">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                        <div className="flex gap-4 mt-4">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/10 text-center">
                <p className="text-muted-foreground mb-2">Không tìm thấy phòng nào phù hợp.</p>
                <p className="text-sm text-gray-400">Vui lòng thử thay đổi bộ lọc.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
                {rooms.map((room) => (
                    <RoomCard
                        key={room.id}
                        room={room}
                        onViewDetails={(r) => setSelectedRoom(r)}
                        currentSelection={currentSelection}
                    />
                ))}
            </div>

            <RoomDetailModal
                room={selectedRoom}
                open={!!selectedRoom}
                onClose={() => setSelectedRoom(null)}
                onBookConfig={(roomId, bedId) => {
                    onBookConfig(roomId, bedId);
                    // Optional: Close modal after selection if we want auto-close behavior, 
                    // but keeping it open allows changing bed.
                    // Let's keep it open or let user close it.
                    // Actually usually after selecting, user might want to see it selected.
                }}
                currentSelection={currentSelection}
            />
        </>
    );
}
