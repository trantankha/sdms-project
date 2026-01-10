"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/profile-form";
import { ChangePasswordForm } from "@/components/change-password-form";

export default function AdminSettingsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Cài đặt Tài khoản</h2>
            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
                    <TabsTrigger value="security">Bảo mật</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium">Thông tin cá nhân</h3>
                            <p className="text-sm text-muted-foreground">
                                Cập nhật tên, số điện thoại và ảnh đại diện của bạn.
                            </p>
                        </div>
                        <div className="max-w-xl">
                            <ProfileForm />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="security">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium">Đổi mật khẩu</h3>
                            <p className="text-sm text-muted-foreground">
                                Thay đổi mật khẩu đăng nhập của bạn.
                            </p>
                        </div>
                        <div className="max-w-xl">
                            <ChangePasswordForm />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
