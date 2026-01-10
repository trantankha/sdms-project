"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { roomService, Room } from "@/services/room-service";
import { contractService } from "@/services/contract-service";
import { RoomFilter } from "@/components/room/room-filter";
import { RoomList } from "@/components/room/room-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"; // Fixed import
import { Loader2, ArrowRight, Home } from "lucide-react";
import { api } from "@/services/api"; // To fetch buildings manually or via new service method

interface Building {
    id: string;
    name: string;
}

export default function RegisterRoomPage() {
    const router = useRouter();
    const { toast } = useToast(); // Fixed usage

    // Data
    const [rooms, setRooms] = useState<Room[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [loading, setLoading] = useState(true);

    // Selection
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [filters, setFilters] = useState<{ buildingId?: string; status?: string }>({});

    useEffect(() => {
        fetchBuildings();
    }, []);

    useEffect(() => {
        fetchRooms();
    }, [filters]);

    const fetchBuildings = async () => {
        try {
            // We just added this endpoint
            const res = await api.get<Building[]>('/api/v1/rooms/buildings');
            setBuildings(res.data);
        } catch (error) {
            console.error("Failed to fetch buildings", error);
        }
    };

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const queryParams: any = {};
            if (filters.buildingId) queryParams.building_id = filters.buildingId; // key matches backend
            queryParams.status = "CON_CHO";

            // We need to cast queryParams because getRooms signature expects { building?: string... }
            // but we can pass extra properties if we cast to any or if the service is flexible.
            // In room-service.ts: getRooms(params?: { building?: string ... })
            // We should ideally update room-service.ts to include building_id but 'building' was the param name in the interface.
            // Let's pass both to be sure or check what I implemented in backend.
            // Backend expects `building_id`. Frontend service sends `params` directly.

            const data = await roomService.getRooms(queryParams);
            setRooms(data);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể tải danh sách phòng",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBookConfig = (roomId: string, bedId: string) => {
        setSelectedRoomId(roomId);
        setSelectedBedId(bedId);
    };

    const [duration, setDuration] = useState(5); // Default 5 months

    const handleConfirm = async () => {
        if (!selectedBedId) return;
        setSubmitting(true);
        try {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + duration);

            await contractService.createContract({
                bed_id: selectedBedId,
                end_date: endDate.toISOString(),
            });

            toast({
                title: "Đăng ký thành công!",
                description: "Vui lòng chờ quản lý duyệt yêu cầu của bạn.",
            });

            // Redirect
            router.push("/student/room");

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.detail || "Đăng ký thất bại. Vui lòng thử lại.";
            toast({
                variant: "destructive",
                title: "Thất bại",
                description: msg,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const selectedRoom = rooms.find(r => r.id === selectedRoomId);
    const selectedBed = selectedRoom?.beds.find(b => b.id === selectedBedId);

    // Calculate preview end date
    const previewEndDate = new Date();
    previewEndDate.setMonth(previewEndDate.getMonth() + duration);

    return (
        <div className="space-y-6 pb-20 container mx-auto p-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Đăng ký Phòng ở</h1>
                <p className="text-muted-foreground">Chọn phòng và giường phù hợp với nhu cầu của bạn.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <RoomFilter onFilterChange={setFilters} buildings={buildings} />
                    <RoomList
                        rooms={rooms}
                        loading={loading}
                        onBookConfig={handleBookConfig}
                        currentSelection={selectedRoomId && selectedBedId ? { roomId: selectedRoomId, bedId: selectedBedId } : undefined}
                    />
                </div>

                {/* Summary / Confirmation Panel */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <Card className="border-2 border-primary/10 shadow-lg">
                            <CardHeader className="bg-muted/10 pb-4">
                                <CardTitle>Thông tin đăng ký</CardTitle>
                                <CardDescription>Xem lại lựa chọn của bạn</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                {!selectedRoom ? (
                                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/5">
                                        <Home className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                        <p>Chưa chọn phòng</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="text-sm font-medium">Phòng</span>
                                            <span className="font-bold text-lg">{selectedRoom.code}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="text-sm font-medium">Tòa nhà</span>
                                            <span className="">{selectedRoom.building?.name || "Tòa nhà " + selectedRoom.building_id}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="text-sm font-medium">Giường</span>
                                            <span className="font-bold text-primary">{selectedBed?.label || "Giường " + selectedBedId}</span>
                                        </div>

                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="text-sm font-medium">Thời hạn</span>
                                            <select
                                                className="bg-transparent font-bold text-right outline-none cursor-pointer hover:underline"
                                                value={duration}
                                                onChange={(e) => setDuration(Number(e.target.value))}
                                            >
                                                <option value={3}>3 tháng</option>
                                                <option value={5}>5 tháng (1 kỳ)</option>
                                                <option value={9}>9 tháng</option>
                                                <option value={12}>12 tháng</option>
                                            </select>
                                        </div>

                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="text-sm font-medium">Kết thúc dự kiến</span>
                                            <span className="">
                                                {previewEndDate.toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center pb-2 border-b">
                                            <span className="text-sm font-medium">Giá thuê / tháng</span>
                                            <span className="font-bold text-green-600">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedRoom.base_price)}
                                            </span>
                                        </div>

                                        <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200">
                                            Lưu ý: Hợp đồng sẽ được gửi yêu cầu phê duyệt. Bạn cần thanh toán cọc sau khi được duyệt.
                                        </div>
                                    </>
                                )}
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button
                                    className="w-full"
                                    size="lg"
                                    disabled={!selectedRoom || !selectedBed || submitting}
                                    onClick={handleConfirm}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            Xác nhận đăng ký
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
