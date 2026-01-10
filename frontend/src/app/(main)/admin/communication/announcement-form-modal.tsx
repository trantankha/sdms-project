"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Announcement, AnnouncementPriority, AnnouncementScope, AnnouncementStatus } from "@/types/communication";
import { communicationService } from "@/services/communication-service";
import { campusService } from "@/services/campus-service";
import { useState } from "react";

const formSchema = z.object({
    title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
    content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
    priority: z.nativeEnum(AnnouncementPriority),
    scope: z.nativeEnum(AnnouncementScope),
    status: z.nativeEnum(AnnouncementStatus),
    target_criteria: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AnnouncementFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    announcement?: Announcement | null;
    onSuccess: () => void;
}

export function AnnouncementFormModal({
    open,
    onOpenChange,
    announcement,
    onSuccess,
}: AnnouncementFormModalProps) {
    const { toast } = useToast();
    const isEditing = !!announcement;
    const [campuses, setCampuses] = useState<any[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            content: "",
            priority: AnnouncementPriority.NORMAL,
            scope: AnnouncementScope.GLOBAL,
            status: AnnouncementStatus.PUBLISHED,
            target_criteria: [], // Add default value
        },
    });

    // Watch scope to toggle fields
    const scope = form.watch("scope");

    useEffect(() => {
        if (scope === AnnouncementScope.CAMPUS) {
            loadCampuses();
        }
    }, [scope]);

    const loadCampuses = async () => {
        try {
            // Lazy load campus service if possible, or assume imported.
            // We need to add import for campusService at the top.
            const data = await campusService.getCampuses();
            setCampuses(data);
        } catch (error) {
            console.error("Failed to load campuses", error);
        }
    }

    useEffect(() => {
        if (announcement) {
            form.reset({
                title: announcement.title,
                content: announcement.content,
                priority: announcement.priority,
                scope: announcement.scope,
                status: announcement.status,
                target_criteria: announcement.target_criteria || [],
            });
        } else {
            form.reset({
                title: "",
                content: "",
                priority: AnnouncementPriority.NORMAL,
                scope: AnnouncementScope.GLOBAL,
                status: AnnouncementStatus.PUBLISHED,
                target_criteria: [],
            });
        }
    }, [announcement, form, open]);

    const onSubmit = async (values: FormValues) => {
        try {
            if (isEditing && announcement) {
                await communicationService.updateAnnouncement(announcement.id, values);
                toast({ title: "Thành công", description: "Đã cập nhật thông báo." });
            } else {
                await communicationService.createAnnouncement(values);
                toast({ title: "Thành công", description: "Đã tạo thông báo mới." });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể lưu thông báo.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Chỉnh sửa Thông báo" : "Tạo Thông báo Mới"}</DialogTitle>
                    <DialogDescription>
                        Soạn thảo và gửi thông báo đến sinh viên và ban quản lý.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField<FormValues, "title">
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tiêu đề</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ví dụ: Thông báo lịch cắt điện..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField<FormValues, "priority">
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mức độ ưu tiên</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn mức độ" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={AnnouncementPriority.URGENT}>Khẩn cấp (Đỏ)</SelectItem>
                                                <SelectItem value={AnnouncementPriority.HIGH}>Cao (Cam)</SelectItem>
                                                <SelectItem value={AnnouncementPriority.NORMAL}>Bình thường (Xanh)</SelectItem>
                                                <SelectItem value={AnnouncementPriority.LOW}>Thấp (Xám)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField<FormValues, "scope">
                                control={form.control}
                                name="scope"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phạm vi</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn phạm vi" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={AnnouncementScope.GLOBAL}>Toàn hệ thống</SelectItem>
                                                <SelectItem value={AnnouncementScope.CAMPUS}>Theo Cơ sở</SelectItem>
                                                <SelectItem value={AnnouncementScope.BUILDING}>Tòa nhà</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Campus Selection - Show only if Scope is CAMPUS */}
                        {scope === AnnouncementScope.CAMPUS && (
                            <FormField<FormValues, "target_criteria">
                                control={form.control}
                                name="target_criteria"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Chọn Cơ sở</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange([val])}
                                            value={field.value?.[0]}
                                            defaultValue={field.value?.[0]}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn cơ sở áp dụng" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {campuses.map(campus => (
                                                    <SelectItem key={campus.id} value={campus.id}>
                                                        {campus.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField<FormValues, "content">
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nội dung chi tiết</FormLabel>
                                    <FormControl>
                                        <Textarea className="min-h-[150px]" placeholder="Nhập nội dung thông báo..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField<FormValues, "status">
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Trạng thái phát hành</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Trạng thái" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={AnnouncementStatus.DRAFT}>Bản nháp</SelectItem>
                                            <SelectItem value={AnnouncementStatus.PUBLISHED}>Xuất bản ngay</SelectItem>
                                            <SelectItem value={AnnouncementStatus.ARCHIVED}>Lưu trữ (Ẩn)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Hủy
                            </Button>
                            <Button type="submit">
                                {isEditing ? "Lưu thay đổi" : "Tạo & Gửi"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
