"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, User, Mail, Lock, BookOpen, Eye, EyeOff, Phone, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authService } from "@/services/auth-service";

const registerSchema = z.object({
    full_name: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    student_code: z.string().optional(),
    phone_number: z.string().min(10, "Số điện thoại không hợp lệ").regex(/^[0-9]+$/, "Chỉ được nhập số"),
    gender: z.string().min(1, "Vui lòng chọn giới tính"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            full_name: "",
            email: "",
            student_code: "",
            phone_number: "",
            gender: "", // Initialize empty
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: RegisterValues) => {
        setIsLoading(true);
        setError(null);
        try {
            // Remove confirmPassword before sending to backend
            const { confirmPassword, ...registerData } = data;
            await authService.register(registerData);

            // Auto Login
            const { user } = await authService.login({
                username: data.email,
                password: data.password
            });

            setSuccess(true); // Keep state for a split second or notification

            if (user.role === 'SINH_VIEN') {
                router.push("/student/dashboard");
            } else {
                router.push("/admin/dashboard");
            }

        } catch (err: any) {
            console.error("Registration/Login failed:", err);
            const errorMessage = err.response?.data?.detail || "Đăng ký thất bại. Vui lòng thử lại.";
            setError(errorMessage);
            setIsLoading(false);
        }
        // Do not set isLoading false on success to prevent UI flash before redirect
    };

    if (success) {
        return (
            <div className="flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                        <p className="text-lg font-medium text-primary">Đăng ký thành công! Đang vào hệ thống...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-4 py-8">
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
                        Đăng ký tài khoản
                    </CardTitle>
                    <CardDescription>
                        Điền đầy đủ thông tin để tham gia hệ thống KTX
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
                            <Label htmlFor="full_name">Họ và tên</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="full_name"
                                    placeholder="Nguyễn Văn A"
                                    className="pl-9 bg-background/50"
                                    disabled={isLoading}
                                    {...register("full_name")}
                                />
                            </div>
                            {errors.full_name && <p className="text-destructive text-xs font-medium">{errors.full_name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="sinhvien@university.edu.vn"
                                    className="pl-9 bg-background/50"
                                    disabled={isLoading}
                                    {...register("email")}
                                />
                            </div>
                            {errors.email && <p className="text-destructive text-xs font-medium">{errors.email.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="student_code">Mã SV</Label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="student_code"
                                        placeholder="SV123"
                                        className="pl-9 bg-background/50"
                                        disabled={isLoading}
                                        {...register("student_code")}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Giới tính</Label>
                                <Select onValueChange={(val) => setValue("gender", val)} defaultValue="">
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue placeholder="Chọn" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NAM">Nam</SelectItem>
                                        <SelectItem value="NU">Nữ</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.gender && <p className="text-destructive text-xs font-medium">{errors.gender.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Số điện thoại</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone_number"
                                    placeholder="0912345678"
                                    className="pl-9 bg-background/50"
                                    disabled={isLoading}
                                    {...register("phone_number")}
                                />
                            </div>
                            {errors.phone_number && <p className="text-destructive text-xs font-medium">{errors.phone_number.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Mật khẩu</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
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
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Xác nhận</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="pl-9 pr-10 bg-background/50"
                                        disabled={isLoading}
                                        {...register("confirmPassword")}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className="sr-only">
                                            {showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                        </span>
                                    </Button>
                                </div>
                                {errors.confirmPassword && <p className="text-destructive text-xs font-medium">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-11 mt-2 text-base shadow-md hover:shadow-lg transition-all" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang đăng ký...
                                </>
                            ) : (
                                "Đăng ký tài khoản"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                    <div>
                        Đã có tài khoản?{" "}
                        <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4 transition-colors">
                            Đăng nhập
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
