"use client";

import { useState, useEffect } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { campusService, Campus, Building } from "@/services/campus-service";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface UtilityConfigModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UtilityConfigModal({ open, onOpenChange }: UtilityConfigModalProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    // Data State
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [buildings, setBuildings] = useState<Building[]>([]);

    // Selection State
    const [selectedCampusId, setSelectedCampusId] = useState("");
    const [selectedBuildingId, setSelectedBuildingId] = useState("");

    // Config State
    const [electricPrice, setElectricPrice] = useState<number>(0);
    const [waterPrice, setWaterPrice] = useState<number>(0);

    useEffect(() => {
        if (open) {
            loadCampuses();
            // Reset
            setSelectedCampusId("");
            setSelectedBuildingId("");
            setElectricPrice(0);
            setWaterPrice(0);
            setBuildings([]);
        }
    }, [open]);

    const loadCampuses = async () => {
        try {
            const data = await campusService.getCampuses();
            setCampuses(data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadBuildings = async (campusId: string) => {
        try {
            const data = await campusService.getBuildings(campusId);
            setBuildings(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCampusChange = (campusId: string) => {
        setSelectedCampusId(campusId);
        setSelectedBuildingId("");
        setElectricPrice(0);
        setWaterPrice(0);
        loadBuildings(campusId);
    };

    const handleBuildingChange = (buildingId: string) => {
        setSelectedBuildingId(buildingId);
        const building = buildings.find(b => b.id === buildingId);
        if (building && building.utility_config) {
            setElectricPrice(building.utility_config.electric_price || 0);
            setWaterPrice(building.utility_config.water_price || 0);
        } else {
            // Default or empty
            setElectricPrice(0);
            setWaterPrice(0);
        }
    };

    const handleSave = async () => {
        if (!selectedBuildingId) {
            toast({ title: "Lỗi", description: "Vui lòng chọn Tòa nhà.", variant: "destructive" });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                utility_config: {
                    electric_price: electricPrice,
                    water_price: waterPrice
                }
            };
            await campusService.updateBuilding(selectedBuildingId, payload);
            toast({ title: "Thành công", description: "Đã cập nhật đơn giá điện nước cho tòa nhà." });

            // Reload building data to reflect changes (optional, but good for sync)
            const updatedBuildings = await campusService.getBuildings(selectedCampusId);
            setBuildings(updatedBuildings);

            // onOpenChange(false); // Maybe keep open to edit others?
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể lưu thay đổi.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Cấu hình Đơn giá Tiện ích (Theo Tòa nhà)</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Selection Area */}
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
                            <Select value={selectedBuildingId} onValueChange={handleBuildingChange} disabled={!selectedCampusId}>
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

                    {/* Config Area */}
                    <div className="space-y-4 border rounded-md p-4 bg-muted/50">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right font-medium col-span-1">DIEN</Label>
                            <Input
                                type="number"
                                value={electricPrice}
                                onChange={(e) => setElectricPrice(Number(e.target.value))}
                                className="col-span-3"
                                disabled={!selectedBuildingId}
                                placeholder="VNĐ / kWh"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right font-medium col-span-1">NUOC</Label>
                            <Input
                                type="number"
                                value={waterPrice}
                                onChange={(e) => setWaterPrice(Number(e.target.value))}
                                className="col-span-3"
                                disabled={!selectedBuildingId}
                                placeholder="VNĐ / m3"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
                    <Button onClick={handleSave} disabled={saving || !selectedBuildingId}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
