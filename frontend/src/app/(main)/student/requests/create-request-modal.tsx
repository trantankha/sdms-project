"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { requestService } from "@/services/request-service";
import { useToast } from "@/hooks/use-toast";
import { eventBus, REFRESH_SIDEBAR } from "@/lib/events";

const formSchema = z.object({
    title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự").max(100, "Tiêu đề quá dài"),
    description: z.string().max(500, "Mô tả không quá 500 ký tự").optional(),
});

interface CreateRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateRequestModal({ open, onOpenChange, onSuccess }: CreateRequestModalProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            await requestService.createRequest(values);
            toast({
                title: "Thành công",
                description: "Yêu cầu hỗ trợ đã được gửi.",
            });
            form.reset();
            eventBus.emit(REFRESH_SIDEBAR);
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Không thể tạo yêu cầu. Vui lòng thử lại.",
            });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tạo yêu cầu mới</DialogTitle>
                    <DialogDescription>
                        Gửi báo cáo sự cố hư hỏng hoặc yêu cầu hỗ trợ khác.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tiêu đề</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ví dụ: Hỏng bóng đèn, Mất nước..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả chi tiết</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Mô tả cụ thể vị trí và tình trạng..."
                                            className="resize-none h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Cung cấp càng nhiều chi tiết càng tốt để chúng tôi hỗ trợ nhanh hơn.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
