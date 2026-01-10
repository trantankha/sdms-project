import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth-service";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
    full_name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    phone_number: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ").optional().or(z.literal("")),
    gender: z.string().optional(),
    avatar_url: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: "",
            phone_number: "",
            gender: "NAM",
            avatar_url: "",
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                full_name: user.full_name || "",
                phone_number: user.phone_number || "",
                gender: user.gender || "NAM",
                avatar_url: user.avatar_url || "",
            });
        }
    }, [user, form]);

    async function onSubmit(data: ProfileFormValues) {
        if (!user) return;
        setIsLoading(true);
        try {
            // Sanitize data: Convert empty strings to null for backend compatibility
            const payload = {
                ...data,
                phone_number: data.phone_number === "" ? null : data.phone_number,
                avatar_url: data.avatar_url === "" ? null : data.avatar_url,
            };

            await authService.updateProfile(user.id, payload as any);

            // Manually update store
            await authService.me();

            toast({
                title: "Thành công",
                description: "Cập nhật hồ sơ thành công",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Lỗi",
                description: "Cập nhật thất bại",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={form.getValues("avatar_url") || ""} />
                    <AvatarFallback className="text-2xl">{user.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="text-lg font-medium">{user.email}</h3>
                    <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Họ và Tên</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nhập họ tên..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="phone_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số điện thoại</FormLabel>
                                    <FormControl>
                                        <Input placeholder="0912..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Giới tính</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn giới tính" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="NAM">Nam</SelectItem>
                                            <SelectItem value="NU">Nữ</SelectItem>
                                            <SelectItem value="HON_HOP">Khác</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="avatar_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL Ảnh đại diện</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Lưu thay đổi
                    </Button>
                </form>
            </Form>
        </div>
    );
}
