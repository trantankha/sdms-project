import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { roomService, Room, RoomType } from "@/services/room-service";
import { campusService, Campus, Building } from "@/services/campus-service";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ROOM_STATUS_MAP } from "@/lib/status-config";

interface RoomFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    room?: Room | null; // If null, creating new
    onSuccess: () => void;
}

const VALID_ROOM_STATUSES = ["AVAILABLE", "FULL", "MAINTENANCE", "RESERVED", "CLEANING"];

const UI_TO_API_STATUS_MAP: Record<string, string> = {
    "AVAILABLE": "CON_CHO",
    "FULL": "DAY",
    "MAINTENANCE": "BAO_TRI",
    "RESERVED": "GIU_CHO",
    "CLEANING": "DANG_DON"
};

const API_TO_UI_STATUS_MAP: Record<string, string> = {
    "CON_CHO": "AVAILABLE",
    "DAY": "FULL",
    "BAO_TRI": "MAINTENANCE",
    "GIU_CHO": "RESERVED",
    "DANG_DON": "CLEANING"
};

const GENDER_OPTIONS = [
    { value: "NAM", label: "Nam" },
    { value: "NU", label: "Nữ" },
    { value: "HON_HOP", label: "Hỗn hợp" }
];

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

export function RoomFormModal({ open, onOpenChange, room, onSuccess }: RoomFormModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

    // New State for Helper Data
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [selectedCampusId, setSelectedCampusId] = useState("");

    // Form State
    const [code, setCode] = useState("");
    const [floor, setFloor] = useState("");
    const [buildingId, setBuildingId] = useState("");
    const [typeId, setTypeId] = useState("");
    const [status, setStatus] = useState("AVAILABLE");
    const [genderType, setGenderType] = useState("HON_HOP");
    const [basePrice, setBasePrice] = useState("");
    const [areaM2, setAreaM2] = useState("");
    const [selectedAmenities, setSelectedAmenities] = useState<Record<string, boolean>>({});
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            loadRoomTypes();
            loadCampuses();
            if (room) {
                setCode(room.code);
                setFloor(String(room.floor));
                setTypeId(room.room_type_id);
                // Try to infer building and campus if room has updated model structure
                // For now, if editing, we might need to fetch full room details or assume building_id is present
                if (room.building_id) {
                    setBuildingId(room.building_id);
                    // Hack for now: Load all buildings (no campus filter) to allow displaying the selected building.
                    loadBuildings(undefined);
                }

                // Map backend status to frontend key
                setStatus(API_TO_UI_STATUS_MAP[room.status] || room.status);
                // gender & price need to be handled if available in room object, assumes room has them now or defaults
                // Need to update room object interface if it comes from backend with gender/price
                setGenderType(room.gender_type || "HON_HOP"); // Default or map if available
                setBasePrice(String(room.base_price || ""));
                setAreaM2(String(room.area_m2 || ""));
                setSelectedAmenities(room.attributes || {});
            } else {
                // Reset
                setCode("");
                setFloor("");
                setTypeId("");
                setStatus("AVAILABLE");
                setBuildingId("");
                setSelectedCampusId("");
                setBuildings([]);
                setGenderType("HON_HOP");
                setBasePrice("");
                setAreaM2("");
                setSelectedAmenities({});
            }
        }
    }, [open, room]);

    const loadCampuses = async () => {
        try {
            const data = await campusService.getCampuses();
            setCampuses(data);
        } catch (error) {
            console.error("Failed to load campuses", error);
        }
    };

    const loadBuildings = async (campusId?: string) => {
        try {
            const data = await campusService.getBuildings(campusId);
            setBuildings(data);
        } catch (error) {
            console.error("Failed to load buildings", error);
        }
    };

    // When campus changes, reload buildings
    const handleCampusChange = (campusId: string) => {
        setSelectedCampusId(campusId);
        setBuildingId(""); // Reset building
        loadBuildings(campusId);
    };

    const loadRoomTypes = async () => {
        try {
            const types = await roomService.roomType.getRoomTypes();
            setRoomTypes(types);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRoomTypeChange = (value: string) => {
        setTypeId(value);
        const selectedType = roomTypes.find(t => t.id === value);
        if (selectedType) {
            setBasePrice(String(selectedType.base_price));
        }
    };

    const handleAmenitiesChange = (key: string, checked: boolean) => {
        setSelectedAmenities(prev => ({
            ...prev,
            [key]: checked
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload: any = {
                code,
                floor: Number(floor),
                room_type_id: typeId || null,
                status: UI_TO_API_STATUS_MAP[status.toUpperCase()] || status,
                base_price: Number(basePrice),
                gender_type: genderType,
                area_m2: Number(areaM2) || null,
                attributes: selectedAmenities
            };

            if (room) {
                await roomService.updateRoom(room.id, payload);
                toast({ title: "Thành công", description: "Cập nhật thông tin phòng thành công." });
            } else {
                // Create
                if (!buildingId) {
                    toast({ title: "Lỗi", description: "Vui lòng chọn Tòa nhà", variant: "destructive" });
                    setSubmitting(false);
                    return;
                }
                payload.building_id = buildingId;
                await roomService.createRoom(payload);
                toast({ title: "Thành công", description: "Đã thêm phòng mới thành công." });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể lưu thông tin phòng", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        {room ? "Chỉnh sửa thông tin phòng" : "Thêm phòng mới"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Campus & Building Selection */}
                    {!room && ( // Only show when creating new room to allow selection
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Cơ sở</Label>
                                <Select value={selectedCampusId} onValueChange={handleCampusChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn cơ sở" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {campuses.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Tòa nhà</Label>
                                <Select value={buildingId} onValueChange={setBuildingId} disabled={!selectedCampusId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn tòa nhà" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {buildings.map(b => (
                                            <SelectItem key={b.id} value={b.id}>{b.name} ({b.code})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Mã phòng</Label>
                            <Input
                                id="code"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                placeholder="P.101"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="floor">Tầng</Label>
                            <Input
                                id="floor"
                                type="number"
                                value={floor}
                                onChange={e => setFloor(e.target.value)}
                                placeholder="1"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Loại phòng</Label>
                            <Select value={typeId} onValueChange={handleRoomTypeChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại phòng" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roomTypes.map(t => (
                                        <SelectItem key={t.id} value={t.id}>
                                            {t.name} - {formatCurrency(t.base_price)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="basePrice">Giá phòng (VNĐ)</Label>
                            <Input
                                id="basePrice"
                                type="number"
                                value={basePrice}
                                onChange={e => setBasePrice(e.target.value)}
                                placeholder="Nhập giá phòng"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="area">Diện tích (m²)</Label>
                            <Input
                                id="area"
                                type="number"
                                value={areaM2}
                                onChange={e => setAreaM2(e.target.value)}
                                placeholder="VD: 30"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Loại giới tính</Label>
                            <Select value={genderType} onValueChange={setGenderType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại giới tính" />
                                </SelectTrigger>
                                <SelectContent>
                                    {GENDER_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Trạng thái</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                {VALID_ROOM_STATUSES.map(s => {
                                    const config = ROOM_STATUS_MAP[s] || { label: s, icon: null };
                                    const Icon = config.icon;
                                    return (
                                        <SelectItem key={s} value={s}>
                                            <div className="flex items-center gap-2">
                                                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                                                <span>{config.label}</span>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border rounded-lg p-4 bg-muted/20">
                        <Label className="mb-3 block text-base font-semibold">Tiện ích & Nội thất</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {AMENITIES_OPTIONS.map((item) => (
                                <div key={item.key} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={item.key}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={!!selectedAmenities[item.key]}
                                        onChange={(e) => handleAmenitiesChange(item.key, e.target.checked)}
                                    />
                                    <label
                                        htmlFor={item.key}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {item.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy bỏ</Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
