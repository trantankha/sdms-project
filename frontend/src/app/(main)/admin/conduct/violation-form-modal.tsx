"use client";

import { useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Violation, ViolationSeverity, ViolationCreate } from "@/types/conduct";
import { conductService } from "@/services/conduct-service";

const formSchema = z.object({
    identifier: z.string().min(1, "Vui lòng nhập Mã SV, Email hoặc UUID"),
    title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
    description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự"),
    severity: z.nativeEnum(ViolationSeverity),
    points_deducted: z.coerce.number().min(0, "Điểm trừ không được âm"),
    violation_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Ngày không hợp lệ",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface ViolationFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    violation?: Violation | null;
    onSuccess: () => void;
}

export function ViolationFormModal({
    open,
    onOpenChange,
    violation,
    onSuccess,
}: ViolationFormModalProps) {
    const { toast } = useToast();
    const isEditing = !!violation;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as Resolver<FormValues>,
        defaultValues: {
            identifier: "",
            title: "",
            description: "",
            severity: ViolationSeverity.WARNING,
            points_deducted: 0,
            violation_date: format(new Date(), "yyyy-MM-dd"), // Default today
        },
    });

    useEffect(() => {
        if (violation) {
            form.reset({
                identifier: violation.user_id, // When editing, we show ID (or we could fetch code)
                title: violation.title,
                description: violation.description,
                severity: violation.severity,
                points_deducted: violation.points_deducted,
                violation_date: format(new Date(violation.violation_date), "yyyy-MM-dd"),
            });
        } else {
            form.reset({
                identifier: "",
                title: "",
                description: "",
                severity: ViolationSeverity.WARNING,
                points_deducted: 0,
                violation_date: format(new Date(), "yyyy-MM-dd"),
            });
        }
    }, [violation, form, open]);

    const onSubmit = async (values: FormValues) => {
        try {
            // Determine identifier type
            const idInput = values.identifier.trim();
            const isEmail = idInput.includes("@");
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idInput);

            const payload: any = {
                title: values.title,
                description: values.description,
                severity: values.severity,
                points_deducted: values.points_deducted,
                violation_date: new Date(values.violation_date).toISOString(),
            };

            if (isEditing && violation) {
                // Update
                await conductService.updateViolation(violation.id, payload);
                toast({ title: "Thành công", description: "Cập nhật hồ sơ vi phạm thành công." });
            } else {
                // Create
                if (isUUID) {
                    payload.student_id = idInput;
                } else if (isEmail) {
                    payload.email = idInput;
                } else {
                    payload.student_code = idInput;
                }

                await conductService.createViolation(payload);
                toast({ title: "Thành công", description: "Đã ghi nhận vi phạm mới." });
            }

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể lưu hồ sơ vi phạm.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Chỉnh sửa Hồ sơ" : "Ghi nhận Vi phạm Mới"}</DialogTitle>
                    <DialogDescription>
                        Tạo hồ sơ vi phạm kỷ luật cho sinh viên.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField<FormValues, "identifier">
                            control={form.control}
                            name="identifier"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sinh viên (Mã SV, Email hoặc UUID)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập ID sinh viên..." {...field} disabled={isEditing} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField<FormValues, "title">
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tiêu đề vi phạm</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ví dụ: Hút thuốc lá..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField<FormValues, "violation_date">
                                control={form.control}
                                name="violation_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ngày vi phạm</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField<FormValues, "severity">
                                control={form.control}
                                name="severity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mức độ</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn mức độ" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={ViolationSeverity.CRITICAL}>Kỷ luật (Đuổi học/Đình chỉ)</SelectItem>
                                                <SelectItem value={ViolationSeverity.MAJOR}>Cảnh cáo</SelectItem>
                                                <SelectItem value={ViolationSeverity.WARNING}>Nhắc nhở</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField<FormValues, "points_deducted">
                                control={form.control}
                                name="points_deducted"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Điểm trừ rèn luyện</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField<FormValues, "description">
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả chi tiết</FormLabel>
                                    <FormControl>
                                        <Textarea className="min-h-[100px]" placeholder="Mô tả sự việc..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Hủy
                            </Button>
                            <Button type="submit">
                                {isEditing ? "Lưu thay đổi" : "Ghi nhận"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
