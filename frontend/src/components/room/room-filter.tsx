import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

// Temporary interface until we have a real service
interface Building {
    id: string;
    name: string;
}

interface RoomFilterProps {
    onFilterChange: (filters: { buildingId?: string; status?: string; minPrice?: number; maxPrice?: number }) => void;
    buildings?: Building[]; // Passed from parent or fetched here? Better passed from parent.
}

export function RoomFilter({ onFilterChange, buildings = [] }: RoomFilterProps) {
    const [buildingId, setBuildingId] = useState<string>("all");
    const [priceRange, setPriceRange] = useState<string>("");

    const handleApply = () => {
        onFilterChange({
            buildingId: buildingId === "all" ? undefined : buildingId,
            // Parse price range logic later if needed
        });
    };

    const handleClear = () => {
        setBuildingId("all");
        setPriceRange("");
        onFilterChange({});
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
            <div className="space-y-2 flex-1">
                <Label>Tòa nhà</Label>
                <Select value={buildingId} onValueChange={setBuildingId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn tòa nhà" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {buildings.map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2 flex-1">
                <Label>Khoảng giá</Label>
                <Select value={priceRange} onValueChange={setPriceRange} disabled>
                    <SelectTrigger>
                        <SelectValue placeholder="Mọi mức giá" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="low">Dưới 1 triệu</SelectItem>
                        <SelectItem value="mid">1 - 2 triệu</SelectItem>
                        <SelectItem value="high">Trên 2 triệu</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex gap-2">
                <Button onClick={handleApply} className="gap-2">
                    <Search className="h-4 w-4" />
                    Tìm kiếm
                </Button>
                <Button variant="outline" onClick={handleClear} size="icon">
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
