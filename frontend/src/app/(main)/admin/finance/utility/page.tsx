"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Save, Loader2, Filter, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { financeService } from "@/services/finance-service";
import { roomService, Room } from "@/services/room-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ColumnDef, RowData } from "@tanstack/react-table";

// ... (Meta declaration and EditableCell kept as is via context context matching if I don't touch them)

// I will target the imports block specifically.


// Extend RowData
declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
        inputs: Record<string, { electric: number | "", water: number | "" }>;
        latestReadings: Record<string, any>; // Map roomId -> reading
        handleInputChange: (roomId: string, field: 'electric' | 'water', value: string) => void;
    }
}

// Editable Cell
const EditableCell = ({
    getValue,
    row,
    column,
    table,
}: {
    getValue: () => any;
    row: any;
    column: any;
    table: any;
}) => {
    const columnId = column.id as 'electric' | 'water';
    const roomId = row.original.id;
    const { inputs, handleInputChange, latestReadings } = table.options.meta as any;

    const inputValue = inputs?.[roomId]?.[columnId] ?? "";

    // Validation visual
    const reading = latestReadings?.[roomId];
    const prevValue = columnId === 'electric' ? reading?.electric_index : reading?.water_index;
    const isInvalid = inputValue !== "" && prevValue !== undefined && Number(inputValue) < prevValue;

    return (
        <Input
            type="number"
            placeholder="Nhập..."
            className={`w-32 transition-colors ${isInvalid ? "border-red-500 bg-red-50" : (inputValue !== "" ? "border-primary bg-primary/5" : "")}`}
            value={inputValue}
            onChange={(e) => handleInputChange(roomId, columnId, e.target.value)}
            title={isInvalid ? `Chỉ số mới phải >= ${prevValue}` : ""}
        />
    );
};

export default function UtilityRecordingPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const [rooms, setRooms] = useState<Room[]>([]);
    const [buildings, setBuildings] = useState<string[]>([]);
    const [buildingFilter, setBuildingFilter] = useState<string>("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [latestReadings, setLatestReadings] = useState<Record<string, any>>({});

    const [inputs, setInputs] = useState<Record<string, { electric: number | "", water: number | "" }>>({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [roomsData, readingsData] = await Promise.all([
                roomService.getRooms({ limit: 1000 }),
                financeService.getLatestReadings()
            ]);

            setRooms(roomsData);

            // Map readings by room_id
            const readingsMap: Record<string, any> = {};
            readingsData.forEach((r: any) => {
                readingsMap[r.room_id] = r;
            });
            setLatestReadings(readingsMap);

            const unique = Array.from(new Set(roomsData.map(r => r.building?.name).filter(Boolean))) as string[];
            setBuildings(unique);
        } catch (error) {
            toast({
                title: "Lỗi",
                description: "Không thể tải dữ liệu.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (roomId: string, field: 'electric' | 'water', value: string) => {
        const numValue = value === "" ? "" : Number(value);
        setInputs(prev => ({
            ...prev,
            [roomId]: {
                ...prev[roomId],
                [field]: numValue
            }
        }));
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            const payload = [];
            let hasError = false;

            for (const [roomId, data] of Object.entries(inputs)) {
                if (data.electric !== "" && data.electric !== undefined && data.water !== "" && data.water !== undefined) {

                    // Validate
                    const prev = latestReadings[roomId];
                    if (prev) {
                        if (Number(data.electric) < prev.electric_index || Number(data.water) < prev.water_index) {
                            hasError = true;
                            // Optionally highlight or break
                        }
                    }

                    payload.push({
                        room_id: roomId,
                        month: Number(month),
                        year: Number(year),
                        electric_index: Number(data.electric),
                        water_index: Number(data.water)
                    });
                }
            }

            if (payload.length === 0) {
                toast({ title: "Chưa có dữ liệu", description: "Vui lòng nhập dữ liệu.", variant: "destructive" });
                setSubmitting(false);
                return;
            }

            if (hasError) {
                if (!confirm("Một số chỉ số thấp hơn chỉ số cũ. Bạn có chắc chắn muốn lưu (ví dụ: trường hợp reset công tơ)?")) {
                    setSubmitting(false);
                    return;
                }
            }

            await financeService.recordUtilities(payload);

            toast({ title: "Thành công", description: `Đã lưu chỉ số cho ${payload.length} phòng.` });
            setInputs({});
            loadData(); // Reload to update previous readings
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể lưu dữ liệu.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRooms = useMemo(() => {
        return rooms.filter(room => {
            const matchesBuilding = buildingFilter === "ALL" || room.building?.name === buildingFilter;
            const matchesSearch = room.code.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesBuilding && matchesSearch;
        }).sort((a, b) => a.code.localeCompare(b.code));
    }, [rooms, buildingFilter, searchTerm]);

    const columns = useMemo<ColumnDef<Room>[]>(() => [
        {
            accessorKey: "code",
            header: "Phòng",
            cell: ({ row }) => <div className="font-bold">{row.getValue("code")}</div>
        },
        {
            accessorKey: "building.name",
            header: "Tòa nhà",
        },
        {
            id: "prev_electric",
            header: "Điện (Cũ)",
            cell: ({ row }) => {
                const reading = latestReadings[row.original.id];
                return <span className="text-muted-foreground font-mono">{reading?.electric_index ?? "0"}</span>
            }
        },
        {
            id: "electric",
            header: "Điện (Mới)",
            cell: EditableCell,
        },
        {
            id: "prev_water",
            header: "Nước (Cũ)",
            cell: ({ row }) => {
                const reading = latestReadings[row.original.id];
                return <span className="text-muted-foreground font-mono">{reading?.water_index ?? "0"}</span>
            }
        },
        {
            id: "water",
            header: "Nước (Mới)",
            cell: EditableCell,
        }
    ], [latestReadings]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Ghi Chỉ Số Điện Nước</h1>
                        <p className="text-muted-foreground">Cập nhật chỉ số điện nước hàng tháng.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 rounded-md border p-1 bg-background shadow-sm">
                        <span className="pl-2 text-sm text-muted-foreground whitespace-nowrap">Kỳ:</span>
                        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                            <SelectTrigger className="h-8 w-[70px] border-0 focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <SelectItem key={m} value={String(m)}>T{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-muted-foreground">/</span>
                        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                            <SelectTrigger className="h-8 w-[80px] border-0 focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[2024, 2025, 2026].map(y => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleSave} disabled={submitting}>
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Lưu Thay Đổi
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Danh sách phòng</CardTitle>
                            <CardDescription>Nhập chỉ số mới vào các ô bên dưới.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative w-full md:w-[200px]">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm mã phòng..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Tòa nhà" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Tất cả Tòa</SelectItem>
                                    {buildings.map(b => (
                                        <SelectItem key={b} value={b}>{b}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredRooms}
                            meta={{
                                inputs,
                                latestReadings,
                                handleInputChange
                            }}
                        />
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
