"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, User as UserIcon, Save, Lock, Mail, Phone, BookOpen, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth-service";
import { User } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ------------------- Schemas -------------------
const profileFormSchema = z.object({
    full_name: z.string().min(2, "Tên phải có ít nhất 2 ký tự."),
    email: z.string().email().readonly(), // Email is read-only usually
    student_code: z.string().optional(),
    phone_number: z.string().min(10, "Số điện thoại không hợp lệ").regex(/^[0-9]+$/, "Chỉ được nhập số"),
    gender: z.string().min(1, "Vui lòng chọn giới tính"),
    avatar_url: z.string().optional(),
});

const passwordFormSchema = z.object({
    current_password: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    new_password: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirm_password: z.string().min(6, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirm_password"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function StudentProfilePage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // ------------------- Forms -------------------
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        mode: "onChange",
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: ""
        }
    });

    // ------------------- Fetch Data -------------------
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await authService.me();
                setUser(currentUser);
                // Reset form with user data
                profileForm.reset({
                    full_name: currentUser.full_name || "",
                    email: currentUser.email || "",
                    student_code: currentUser.student_code || "",
                    phone_number: currentUser.phone_number || "",
                    gender: currentUser.gender || "",
                    avatar_url: currentUser.avatar_url || "",
                });
            } catch (error) {
                console.error("Failed to fetch user", error);
                toast({
                    variant: "destructive",
                    title: "Lỗi tải thông tin",
                    description: "Không thể tải thông tin cá nhân. Vui lòng tải lại trang.",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [profileForm, toast]);

    // ------------------- Handlers -------------------
    async function onUpdateProfile(data: ProfileFormValues) {
        if (!user) return;
        setUpdating(true);
        try {
            await authService.updateProfile(user.id, {
                full_name: data.full_name,
                phone_number: data.phone_number,
                gender: data.gender,
                avatar_url: data.avatar_url,
                // Student code usually managed by admin, but allowing update if backend permits
            });

            // Refresh local user state
            const updated = await authService.me();
            setUser(updated);
            profileForm.reset({
                ...data,
                email: updated.email, // keep email from backend
            });

            toast({
                title: "Cập nhật thành công",
                description: "Thông tin hồ sơ của bạn đã được lưu.",
            });
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Cập nhật thất bại",
                description: error.response?.data?.detail || "Có lỗi xảy ra khi lưu thông tin.",
            });
        } finally {
            setUpdating(false);
        }
    }

    async function onChangePassword(data: PasswordFormValues) {
        if (!user) return;
        setUpdating(true);
        try {
            await authService.changePassword(user.id, {
                current_password: data.current_password,
                new_password: data.new_password,
            });

            passwordForm.reset();
            toast({
                title: "Đổi mật khẩu thành công",
                description: "Mật khẩu của bạn đã được cập nhật.",
            });
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Đổi mật khẩu thất bại",
                description: error.response?.data?.detail || "Mật khẩu hiện tại không đúng hoặc có lỗi hệ thống.",
            });
        } finally {
            setUpdating(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 container max-w-4xl mx-auto pb-10">
            <div>
                <h3 className="text-3xl font-bold tracking-tight">Hồ sơ cá nhân</h3>
                <p className="text-muted-foreground">
                    Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.
                </p>
            </div>
            <Separator />

            <div className="flex flex-col md:flex-row gap-8">
                {/* User Card (Left/Top) */}
                <div className="md:w-1/3">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto w-24 h-24 mb-4 relative">
                                <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                                    <AvatarImage src={user?.avatar_url || ""} alt={user?.full_name || ""} />
                                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                        {user?.full_name?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle>{user?.full_name}</CardTitle>
                            <CardDescription>{user?.email}</CardDescription>
                            <div className="mt-4 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                {user?.role === "SINH_VIEN" ? "Sinh viên" : user?.role}
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Forms (Right/Bottom) */}
                <div className="flex-1">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="w-full justify-start mb-6 bg-transparent p-0 border-b rounded-none h-auto">
                            <TabsTrigger
                                value="general"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                            >
                                Thông tin chung
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                            >
                                Bảo mật & Mật khẩu
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab: General Info */}
                        <TabsContent value="general">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông tin cơ bản</CardTitle>
                                    <CardDescription>Cập nhật thông tin liên lạc và cá nhân của bạn.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...profileForm}>
                                        <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                                            <FormField
                                                control={profileForm.control}
                                                name="full_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Họ và tên</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input placeholder="Nhập họ tên" {...field} className="pl-9" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={profileForm.control}
                                                    name="phone_number"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Số điện thoại</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                    <Input placeholder="09xxxxxxxx" {...field} className="pl-9" />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={profileForm.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Email (Không thể thay đổi)</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                    <Input {...field} disabled className="pl-9 bg-muted" />
                                                                </div>
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={profileForm.control}
                                                    name="student_code"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Mã sinh viên</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                    <Input placeholder="SVxxxxxx" {...field} className="pl-9" disabled /> {/* Usually disabled for students */}
                                                                </div>
                                                            </FormControl>
                                                            <FormDescription className="text-xs">Liên hệ quản trị viên để sửa Mã SV</FormDescription>
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={profileForm.control}
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
                                                control={profileForm.control}
                                                name="avatar_url"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Avatar URL</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="https://example.com/avatar.png" {...field} />
                                                        </FormControl>
                                                        <FormDescription>Dán đường dẫn ảnh đại diện của bạn.</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex justify-end pt-4">
                                                <Button type="submit" disabled={updating}>
                                                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Lưu thay đổi
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tab: Security */}
                        <TabsContent value="security">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Đổi mật khẩu</CardTitle>
                                    <CardDescription>Để bảo mật, vui lòng không chia sẻ mật khẩu của bạn.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Form {...passwordForm}>
                                        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                                            <FormField
                                                control={passwordForm.control}
                                                name="current_password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Mật khẩu hiện tại</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input type="password" placeholder="••••••" {...field} className="pl-9" />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={passwordForm.control}
                                                    name="new_password"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Mật khẩu mới</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                    <Input type="password" placeholder="••••••" {...field} className="pl-9" />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={passwordForm.control}
                                                    name="confirm_password"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                    <Input type="password" placeholder="••••••" {...field} className="pl-9" />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="flex justify-end pt-4">
                                                <Button type="submit" disabled={updating} variant="secondary">
                                                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Đổi mật khẩu
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
