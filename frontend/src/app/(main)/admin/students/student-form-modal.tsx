"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { studentService } from "@/services/student-service";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { User, UserRole } from "@/types/auth"; // Assuming User type is here or types/auth

interface StudentFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    student?: User | null; // If null, creating new
    onSuccess: () => void;
}

export function StudentFormModal({ open, onOpenChange, student, onSuccess }: StudentFormModalProps) {
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [studentCode, setStudentCode] = useState("");
    const [gender, setGender] = useState<"NAM" | "NU" | "HON_HOP">("NAM");
    const [password, setPassword] = useState("");

    // Status is usually managed via actions, but let's allow setting it if needed? 
    // Usually creation implies active. Edit might change it.
    // Let's keep it simple: Create/Edit basic info. Status toggle is separate action.

    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            // Reset or Load
            if (student) {
                setFullName(student.full_name || "");
                setEmail(student.email || "");
                setPhone(student.phone_number || ""); // User type might need phone_number
                setStudentCode(student.student_code || ""); // User type might need student_code
                setGender(student.gender as any || "NAM");
                setPassword(""); // Don't show password
            } else {
                setFullName("");
                setEmail("");
                setPhone("");
                setStudentCode("");
                setGender("NAM");
                setPassword("");
            }
        }
    }, [open, student]);

    const handleSubmit = async () => {
        if (!fullName || !email) {
            toast({ title: "Lỗi", description: "Vui lòng nhập đầy đủ thông tin bắt buộc (*)", variant: "destructive" });
            return;
        }

        setSubmitting(true);
        try {
            const payload: any = {
                full_name: fullName,
                email: email,
                phone_number: phone === "" ? null : phone,
                student_code: studentCode === "" ? null : studentCode,
                gender: gender,
                role: UserRole.STUDENT
            };

            if (student) {
                // Update
                // We typically don't update password here unless provided
                if (password) payload.password = password;

                await studentService.updateStudent(student.id, payload);
                toast({ title: "Thành công", description: "Cập nhật thông tin sinh viên thành công." });
            } else {
                // Create
                if (!password) {
                    toast({ title: "Lỗi", description: "Vui lòng nhập mật khẩu cho tài khoản mới.", variant: "destructive" });
                    setSubmitting(false);
                    return;
                }
                payload.password = password;
                await studentService.createStudent(payload);
                toast({ title: "Thành công", description: "Thêm sinh viên mới thành công." });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Submit Error:", error);
            const detail = error?.response?.data?.detail;
            let msg = "Không thể lưu thông tin sinh viên";
            if (typeof detail === "string") {
                msg = detail;
            } else if (Array.isArray(detail)) {
                msg = detail.map((e: any) => `${e.loc.join(".")}: ${e.msg}`).join("; ");
            }
            toast({ title: "Lỗi", description: msg, variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    // ... inside return ...
    /* 
    We will use a second replace or manually ensure the Select values match "NAM", "NU", "HON_HOP" 
    Wait, I can do it in one go if I target the chunks correctly. 
    But replace_file_content is single block.
    I will update the handleSubmit block first.
    */

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        {student ? "Chỉnh sửa thông tin sinh viên" : "Thêm sinh viên mới"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Họ và tên <span className="text-red-500">*</span></Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="studentCode">Mã sinh viên</Label>
                            <Input
                                id="studentCode"
                                value={studentCode}
                                onChange={e => setStudentCode(e.target.value)}
                                placeholder="SV123456"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="student@example.com"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="0912345678"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Giới tính</Label>
                            <Select value={gender} onValueChange={(val: any) => setGender(val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn giới tính" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NAM">Nam</SelectItem>
                                    <SelectItem value="NU">Nữ</SelectItem>
                                    <SelectItem value="HON_HOP">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {(student === null || student === undefined) ? (
                            <div className="grid gap-2">
                                <Label htmlFor="password">Mật khẩu <span className="text-red-500">*</span></Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <Label htmlFor="password">Mật khẩu mới (Để trống nếu không đổi)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy bỏ</Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thông tin
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
