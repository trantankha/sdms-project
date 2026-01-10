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
    FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ServicePackage, ServiceType, BillingCycle } from "@/types/services";
import { servicePackageService } from "@/services/service-package-service";

const formSchema = z.object({
    name: z.string().min(2, "Tên gói phải có ít nhất 2 ký tự"),
    description: z.string().optional(),
    type: z.nativeEnum(ServiceType),
    price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
    billing_cycle: z.nativeEnum(BillingCycle),
    is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface ServicePackageFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    servicePackage?: ServicePackage | null;
    onSuccess: () => void;
}

export function ServicePackageFormModal({
    open,
    onOpenChange,
    servicePackage,
    onSuccess,
}: ServicePackageFormModalProps) {
    const { toast } = useToast();
    const isEditing = !!servicePackage;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            type: ServiceType.OTHER,
            price: 0,
            billing_cycle: BillingCycle.MONTHLY,
            is_active: true,
        },
    });

    useEffect(() => {
        if (servicePackage) {
            form.reset({
                name: servicePackage.name,
                description: servicePackage.description || "",
                type: servicePackage.type,
                price: servicePackage.price,
                billing_cycle: servicePackage.billing_cycle,
                is_active: servicePackage.is_active,
            });
        } else {
            form.reset({
                name: "",
                description: "",
                type: ServiceType.OTHER,
                price: 0,
                billing_cycle: BillingCycle.MONTHLY,
                is_active: true,
            });
        }
    }, [servicePackage, form, open]);

    const onSubmit = async (values: FormValues) => {
        try {
            if (isEditing && servicePackage) {
                await servicePackageService.updatePackage(servicePackage.id, values);
                toast({ title: "Thành công", description: "Đã cập nhật gói dịch vụ." });
            } else {
                await servicePackageService.createPackage(values);
                toast({ title: "Thành công", description: "Đã tạo gói dịch vụ mới." });
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Không thể lưu gói dịch vụ.",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Chỉnh sửa Gói Dịch vụ" : "Thêm Gói Dịch vụ Mới"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Cập nhật thông tin chi tiết cho gói dịch vụ này."
                            : "Điền thông tin để tạo gói dịch vụ mới cho sinh viên."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField<FormValues, "name">
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên gói dịch vụ</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ví dụ: Giặt ủi tháng 10kg" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField<FormValues, "type">
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Loại dịch vụ</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            key={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn loại" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={ServiceType.LAUNDRY}>Giặt ủi</SelectItem>
                                                <SelectItem value={ServiceType.CLEANING}>Dọn dẹp</SelectItem>
                                                <SelectItem value={ServiceType.WATER}>Nước uống</SelectItem>
                                                <SelectItem value={ServiceType.PARKING}>Giữ xe</SelectItem>
                                                <SelectItem value={ServiceType.INTERNET}>Internet</SelectItem>
                                                <SelectItem value={ServiceType.OTHER}>Khác</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField<FormValues, "billing_cycle">
                                control={form.control}
                                name="billing_cycle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Chu kỳ thanh toán</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            key={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn chu kỳ" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={BillingCycle.ONE_TIME}>Một lần</SelectItem>
                                                <SelectItem value={BillingCycle.MONTHLY}>Hàng tháng</SelectItem>
                                                <SelectItem value={BillingCycle.SEMESTER}>Học kỳ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField<FormValues, "price">
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Giá (VND)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="50000"
                                            value={field.value}
                                            onChange={e => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField<FormValues, "description">
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả (Tùy chọn)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Mô tả chi tiết về gói dịch vụ..." {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField<FormValues, "is_active">
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Kích hoạt</FormLabel>
                                        <FormDescription>
                                            Hiển thị gói này cho sinh viên đăng ký
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Hủy
                            </Button>
                            <Button type="submit">
                                {isEditing ? "Lưu thay đổi" : "Tạo gói mới"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
