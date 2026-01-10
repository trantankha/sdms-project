'use client';

import { StudentSidebar } from "@/components/layout/student-sidebar";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, user, logout } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const verifyAuth = async () => {
            // Basic client-side check. Middleware does the heavy lifting.
            if (!isAuthenticated) {
                setIsChecking(false);
                return;
            }

            // Double check role client-side
            if (user && user.role !== 'SINH_VIEN') {
                router.push('/admin/dashboard');
                return;
            }

            setIsChecking(false);
        };

        verifyAuth();
    }, []);

    if (isChecking && isAuthenticated) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Đang tải dữ liệu...</span>
            </div>
        );
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <StudentSidebar />
            <div className="flex flex-col">
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
                <ChatWidget />
            </div>
        </div>
    );
}
