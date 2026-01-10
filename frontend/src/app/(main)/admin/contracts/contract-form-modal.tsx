"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { contractService } from "@/services/contract-service";
import { studentService } from "@/services/student-service"; // Fetch users
import { roomService, Room } from "@/services/room-service";
import { User, UserRole } from "@/types/auth";
import { format } from "date-fns";
import { eventBus, REFRESH_SIDEBAR } from "@/lib/events";

interface ContractFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function ContractFormModal({ open, onOpenChange, onSuccess }: ContractFormModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    // Data Sources
    const [students, setStudents] = useState<User[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [availableBeds, setAvailableBeds] = useState<{ id: string, label: string }[]>([]);

    // Form State
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");
    const [selectedRoomId, setSelectedRoomId] = useState<string>("");
    const [selectedBedId, setSelectedBedId] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // Missing Info State
    const [missingGender, setMissingGender] = useState<string>("");
    const [missingPhone, setMissingPhone] = useState<string>("");
    const [needsUpdate, setNeedsUpdate] = useState(false);

    // Load initial data
    useEffect(() => {
        if (open) {
            loadInitialData();
            // Reset form
            setSelectedStudentId("");
            setSelectedRoomId("");
            setSelectedBedId("");
            setEndDate("");
            setMissingGender("");
            setMissingPhone("");
            setNeedsUpdate(false);
        }
    }, [open]);

    // Check Student Info
    useEffect(() => {
        if (selectedStudentId) {
            const student = students.find(s => s.id === selectedStudentId);
            if (student) {
                const _needsGender = !student.gender;
                const _needsPhone = !student.phone_number;
                setNeedsUpdate(_needsGender || _needsPhone);

                // If student has info, prefill? No, we only want inputs if MISSING.
                // But if they change back to a student with info, clear 'missing' states.
                if (!_needsGender) setMissingGender("");
                if (!_needsPhone) setMissingPhone("");
            }
        } else {
            setNeedsUpdate(false);
        }
    }, [selectedStudentId, students]);

    // Handle Room selection -> Filter Beds
    useEffect(() => {
        if (selectedRoomId) {
            const room = rooms.find(r => r.id === selectedRoomId);
            if (room && room.beds) {
                // Filter AVAILABLE beds only
                const freeBeds = room.beds.filter(b => b.status === "TRONG");
                // Careful with Enums strings, checking backend "TRONG" map or "AVAILABLE"
                // Assuming "AVAILABLE" based on logic but localized potentially.
                // Let's debug or check status-config. 
                // Actually Backend Enum: AVAILABLE, OCCUPIED, MAINTENANCE
                // Frontend might receive string "AVAILABLE".
                // Let's check typical responses.
                // Safe bet: !is_occupied or status === 'AVAILABLE'
                // Let's trust status logic from service update
                const avail = room.beds.filter((b: any) =>
                    b.status === "AVAILABLE" || b.status === "TRONG" || (!b.is_occupied && !b.status)
                ).map(b => ({ id: b.id, label: b.label }));
                setAvailableBeds(avail);
            } else {
                setAvailableBeds([]);
            }
        } else {
            setAvailableBeds([]);
        }
    }, [selectedRoomId, rooms]);

    const loadInitialData = async () => {
        try {
            // Parallel fetch
            const [fetchedStudents, fetchedRooms] = await Promise.all([
                studentService.getStudents({ limit: 100 }), // Filter Active later?
                roomService.getRooms({ limit: 1000 })
            ]);
            // Filter only Active Students
            setStudents(fetchedStudents.filter(s => s.is_active));
            setRooms(fetchedRooms);
        } catch (error) {
            console.error("Failed to load initial data", error);
            toast({ title: "Lỗi", description: "Không thể tải danh sách sinh viên hoặc phòng.", variant: "destructive" });
        }
    };

    const handleSubmit = async () => {
        if (!selectedStudentId || !selectedBedId || !endDate) {
            toast({ title: "Thiếu thông tin", description: "Vui lòng chọn đầy đủ Sinh viên, Giường và Ngày kết thúc.", variant: "destructive" });
            return;
        }

        const student = students.find(s => s.id === selectedStudentId);
        // Validate missing info
        if (student) {
            if (!student.gender && !missingGender) {
                toast({ title: "Thiếu thông tin", description: "Vui lòng chọn giới tính cho sinh viên.", variant: "destructive" });
                return;
            }
            if (!student.phone_number && !missingPhone) {
                toast({ title: "Thiếu thông tin", description: "Vui lòng nhập số điện thoại cho sinh viên.", variant: "destructive" });
                return;
            }
        }

        const dateObj = new Date(endDate);
        if (dateObj <= new Date()) {
            toast({ title: "Ngày không hợp lệ", description: "Ngày kết thúc phải sau ngày hiện tại.", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        try {
            await contractService.createContractAdmin({
                student_id: selectedStudentId,
                bed_id: selectedBedId,
                end_date: dateObj.toISOString(), // Backend expects datetime string
                student_gender: missingGender || undefined,
                student_phone: missingPhone || undefined
            } as any);
            toast({ title: "Thành công", description: "Hợp đồng mới đã được tạo." });
            eventBus.emit(REFRESH_SIDEBAR);
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            const msg = error?.response?.data?.detail || "Không thể tạo hợp đồng";
            toast({ title: "Lỗi", description: msg, variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tạo Hợp Đồng Mới</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Sinh viên</Label>
                        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn sinh viên..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {students.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.student_code ? `${s.student_code} - ` : ""}{s.full_name} ({s.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedStudentId && students.find(s => s.id === selectedStudentId) && !students.find(s => s.id === selectedStudentId)?.gender && (
                        <div className="grid gap-2 p-3 border border-yellow-200 bg-yellow-50 rounded-md">
                            <Label className="text-yellow-800">Cập nhật Giới tính (Bắt buộc để xếp phòng)</Label>
                            <Select value={missingGender} onValueChange={setMissingGender}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn giới tính..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NAM">Nam</SelectItem>
                                    <SelectItem value="NU">Nữ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {selectedStudentId && students.find(s => s.id === selectedStudentId) && !students.find(s => s.id === selectedStudentId)?.phone_number && (
                        <div className="grid gap-2 p-3 border border-blue-200 bg-blue-50 rounded-md">
                            <Label className="text-blue-800">Cập nhật Số điện thoại (Bắt buộc)</Label>
                            <Input
                                value={missingPhone}
                                onChange={(e) => setMissingPhone(e.target.value)}
                                placeholder="Nhập số điện thoại..."
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Phòng</Label>
                            <Select value={selectedRoomId} onValueChange={(val) => { setSelectedRoomId(val); setSelectedBedId(""); }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn phòng..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {rooms.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            {r.building?.name} - {r.code} ({r.room_type?.name})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Giường</Label>
                            <Select value={selectedBedId} onValueChange={setSelectedBedId} disabled={!selectedRoomId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn giường..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableBeds.length > 0 ? (
                                        availableBeds.map((b) => (
                                            <SelectItem key={b.id} value={b.id}>
                                                {b.label}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-muted-foreground text-center">Không có giường trống</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Ngày kết thúc hợp đồng</Label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Tạo hợp đồng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
