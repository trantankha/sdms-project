"use client";

import { DebouncedInput } from "@/components/ui/debounced-input";
import { useSearch } from "@/hooks/use-search";
import { useEffect, useState } from "react";
import { Room, roomService } from "@/services/room-service";
import { campusService, Campus } from "@/services/campus-service";
import { RoomStatus } from "@/types/enums";
import { Loader2, RefreshCcw, Building as BuildingIcon, Plus, Search, Layers, MapPin } from "lucide-react";
import { RoomStats, RoomStatistics } from "./room-stats";
import { RoomCard } from "./room-card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoomFormModal } from "./room-form-modal";
import { useToast } from "@/hooks/use-toast";

export default function RoomsPage() {
    const {
        searchQuery,
        setSearchQuery,
        filters,
        setFilter,
        getQueryParams
    } = useSearch();

    const [rooms, setRooms] = useState<Room[]>([])
    const [campuses, setCampuses] = useState<Campus[]>([])
    const [buildings, setBuildings] = useState<{ id: string, name: string }[]>([]) // Add buildings state
    const [loading, setLoading] = useState(true)
    // We will derive filtered rooms from 'rooms' + 'useSearch' values for now, 
    // to maintain the complex grouping without refactoring the whole backend for grouped response.
    // However, the Plan mentioned sending search to backend. 
    // Let's do hybrid: Fetch all (limit 100 or more) with backend search if possible, or client side filter.
    // The current backend getRooms supports filtering. 
    // Let's try to fetch fresh data when params change, but `groupedRooms` structure relies on having enough data.
    // If we filter on backend, we get a flat list. The grouping logic still works on that list.
    // So we can use backend filtering!

    const [stats, setStats] = useState<RoomStatistics | null>(null)

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchData()
    }, [searchQuery, filters.building_id, filters.status]) // Trigger on URL changes

    const fetchData = async () => {
        // setLoading(true) // Removed to prevent UI flashing
        try {
            // Prepare params
            const params: any = { limit: 100 }; // Keep limit high for grouping view
            if (searchQuery) params.search = searchQuery;
            if (filters.building_id && filters.building_id !== 'ALL') params.building_id = filters.building_id; // Changed to building_id
            if (filters.status && filters.status !== 'ALL') {
                // Status logic was complex in client-side (ACTIVE vs CON_CHO etc).
                // For backend, we pass the raw status value if it matches, OR we need the backend to handle "Show Available" smarts.
                // roomService.getRooms supports 'status'. 
                params.status = filters.status;
            }

            const [roomsData, statsData, campusesData, buildingsData] = await Promise.all([
                roomService.getRooms(params),
                roomService.getRoomStats(),
                campusService.getCampuses(),
                roomService.getBuildings() // Fetch all buildings
            ])
            setRooms(roomsData)
            setStats(statsData)
            setCampuses(campusesData)
            setBuildings(buildingsData)
        } catch (error) {
            console.error("Failed to fetch data", error)
            toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
        } finally {
            setLoading(false)
        }
    }

    // Filter logic moved to backend fetch
    const filteredRooms = rooms; // Direct usage since 'rooms' is now fetched with filters


    const handleEdit = (room: Room) => {
        setSelectedRoom(room);
        setModalOpen(true);
    };

    const handleDelete = async (room: Room) => {
        if (!confirm(`Are you sure you want to delete room ${room.code}?`)) return;
        try {
            await roomService.deleteRoom(room.id);
            toast({ title: "Success", description: "Room deleted" });
            fetchData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete room", variant: "destructive" });
        }
    };

    const handleCreate = () => {
        setSelectedRoom(null);
        setModalOpen(true);
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    // Grouping Logic: Campus -> Building -> Floor
    // Map Campus ID -> Name
    const campusMap = new Map(campuses.map(c => [c.id, c.name]));

    // Structure: { [CampusName]: { [BuildingName]: { [Floor]: Room[] } } }
    const groupedRooms: Record<string, Record<string, Record<number, Room[]>>> = {};

    filteredRooms.forEach(room => {
        const campusId = room.building?.campus_id;
        // If no campus_id, group under "Unknown Campus" or try to find by building if possible.
        // For now fallback to "Khác"
        const campusName = (campusId ? campusMap.get(campusId) : "Khác") || "Khác";
        const buildingName = room.building?.name || "Unknown Building";
        const floor = room.floor;

        if (!groupedRooms[campusName]) groupedRooms[campusName] = {};
        if (!groupedRooms[campusName][buildingName]) groupedRooms[campusName][buildingName] = {};
        if (!groupedRooms[campusName][buildingName][floor]) groupedRooms[campusName][buildingName][floor] = [];

        groupedRooms[campusName][buildingName][floor].push(room);
    });


    return (
        <TooltipProvider>
            <div className="flex flex-col gap-8 p-6 bg-muted/20 min-h-screen" suppressHydrationWarning>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                            Quản lý Phòng
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Tổng quan về tình trạng phòng và sức chứa.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/rooms/types'}>
                            <Layers className="mr-2 h-3.5 w-3.5" />
                            Cấu hình
                        </Button>
                        <Button variant="outline" size="sm" onClick={fetchData}>
                            <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                            Làm mới
                        </Button>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={handleCreate}>
                            <Plus className="mr-2 h-3.5 w-3.5" />
                            Thêm Phòng
                        </Button>
                    </div>
                </div>

                <RoomStats stats={stats} />

                {/* Filters Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-background p-4 rounded-xl border shadow-sm sticky top-0 z-10 backdrop-blur-sm bg-background/80">
                    <div className="flex flex-1 gap-3 items-center w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <div className="relative">
                            <DebouncedInput
                                placeholder="Tìm phòng..."
                                value={searchQuery}
                                onValueChange={(value) => setSearchQuery(value)}
                                className="max-w-[180px] pl-8 h-9"
                            />
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>

                        <Select value={filters.building_id || "ALL"} onValueChange={(val) => setFilter('building_id', val)}>
                            <SelectTrigger className="w-[160px] h-9">
                                <SelectValue placeholder="Tất cả Tòa nhà" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả Tòa nhà</SelectItem>
                                {buildings.map(b => (
                                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.status || "ALL"} onValueChange={(val) => setFilter('status', val)}>
                            <SelectTrigger className="w-[140px] h-9">
                                <SelectValue placeholder="Tất cả Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả Trạng thái</SelectItem>
                                <SelectItem value={RoomStatus.AVAILABLE}>Còn trống</SelectItem>
                                <SelectItem value={RoomStatus.FULL}>Đã đầy</SelectItem>
                                <SelectItem value={RoomStatus.MAINTENANCE}>Bảo trì</SelectItem>
                                <SelectItem value={RoomStatus.RESERVED}>Đã đặt</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="text-sm font-medium text-muted-foreground">
                        {filteredRooms.length} phòng được tìm thấy
                    </div>
                </div>

                {/* Visual Floor Plan Grid Grouped by Campus */}
                <div className="space-y-12">
                    {Object.keys(groupedRooms).length === 0 ? (
                        <div className="text-center py-20 bg-card rounded-xl border border-dashed">
                            <p className="text-muted-foreground">Không tìm thấy phòng nào phù hợp.</p>
                            <Button variant="link" onClick={() => { setFilter('building_id', 'ALL'); setFilter('status', 'ALL'); setSearchQuery("") }}>Xóa bộ lọc</Button>
                        </div>
                    ) : (
                        Object.entries(groupedRooms).sort().map(([campusName, buildings]) => (
                            <div key={campusName} className="space-y-8">
                                {/* Campus Header */}
                                <div className="flex items-center gap-3 pb-2 border-b-2 border-primary/20">
                                    <div className="p-2 bg-primary/20 rounded-full">
                                        <MapPin className="h-6 w-6 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight text-primary/80">{campusName}</h2>
                                </div>

                                {/* Buildings in Campus */}
                                {Object.entries(buildings).sort().map(([buildingName, floors]) => (
                                    <div key={buildingName} className="space-y-6 ml-4 md:ml-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-secondary/50 rounded-lg">
                                                <BuildingIcon className="h-5 w-5 text-secondary-foreground" />
                                            </div>
                                            <h3 className="text-xl font-semibold tracking-tight">{buildingName}</h3>
                                        </div>

                                        <div className="flex flex-col gap-10 pl-6 border-l-2 border-muted/40 ml-3">
                                            {Object.entries(floors).sort((a, b) => Number(a[0]) - Number(b[0])).map(([floor, roomsOnFloor]) => (
                                                <div key={floor} className="relative">
                                                    {/* Floor Header Badge */}
                                                    <div className="absolute -left-[40px] top-0 flex items-center justify-center w-9 h-9 rounded-full bg-background border-2 border-muted text-sm font-bold text-muted-foreground shadow-sm z-10">
                                                        {floor}F
                                                    </div>

                                                    {/* Room Grid */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pt-1">
                                                        {roomsOnFloor.sort((a, b) => a.code.localeCompare(b.code)).map(room => (
                                                            <RoomCard
                                                                key={room.id}
                                                                room={room}
                                                                onEdit={() => handleEdit(room)}
                                                                onDelete={() => handleDelete(room)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <RoomFormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                room={selectedRoom}
                onSuccess={fetchData}
            />
        </TooltipProvider>
    )
}
