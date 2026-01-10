"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, User, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth-service";

const loginSchema = z.object({
    username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginValues) => {
        setIsLoading(true);
        setError(null);
        try {
            const { user } = await authService.login(data);
            if (user.role === 'SINH_VIEN') {
                router.push("/student/dashboard");
            } else {
                router.push("/admin/dashboard");
            }
        } catch (err: any) {
            // Only log unexpected errors. 403 is expected for banned users.
            if (err.response?.status !== 403) {
                console.error("Login failed:", err);
            }
            const errorMessage = err.response?.data?.detail || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <Link href="http://utehy.edu.vn/" target="_blank" rel="noopener noreferrer" className="inline-block transition-transform hover:scale-105">
                            <div className="bg-white p-4 rounded-full">
                                <Image
                                    src="/logo-utehy.png"
                                    alt="Logo UTEHY"
                                    width={100}
                                    height={100}
                                    className="w-25 h-25 object-contain"
                                    priority
                                />
                            </div>
                        </Link>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-primary">
                        Hệ Thống Quản Lý KTX
                    </CardTitle>
                    <CardDescription className="text-base">
                        Đăng nhập để truy cập hệ thống
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center font-medium border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="username">Tên đăng nhập</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="username"
                                    placeholder="Nhập mã nhân viên hoặc email"
                                    className="pl-9 bg-background/50"
                                    disabled={isLoading}
                                    {...register("username")}
                                />
                            </div>
                            {errors.username && <p className="text-destructive text-xs font-medium">{errors.username.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Mật khẩu</Label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder=" • • • • • • • •"
                                    className="pl-9 pr-10 bg-background/50"
                                    disabled={isLoading}
                                    {...register("password")}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="sr-only">
                                        {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    </span>
                                </Button>
                            </div>
                            {errors.password && <p className="text-destructive text-xs font-medium">{errors.password.message}</p>}
                        </div>
                        <Button type="submit" className="w-full h-11 text-base shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Đăng nhập"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
                    <div>
                        Chưa có tài khoản?{" "}
                        <Link href="/register" className="text-primary font-medium hover:underline underline-offset-4 transition-colors">
                            Đăng ký ngay
                        </Link>
                    </div>
                    <div className="text-xs text-muted-foreground/60">
                        &copy; 2026 University Dormitory Management System
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
