'use client';

import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authService } from "@/services/auth-service";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, logout, user } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const verifyAuth = async () => {
            if (!isAuthenticated) {
                // Not authenticated properly, redirect
                // router.push("/login"); // Middleware handles this mostly, but good backup
                setIsChecking(false);
                return;
            }

            try {
                // Optional: Check if token is still valid by calling /me
                // This prevents the "Flash" where we show dashboard but API calls fail 401
                await authService.me({ skipGlobalErrorHandler: true });
                setIsChecking(false);
            } catch (error) {
                // Token invalid
                console.error("Session verification failed", error);

                // We use skipGlobalErrorHandler, so the modal WON'T show from the interceptor.
                // We can safely redirect here.
                logout();
                router.push("/login");

                // Do NOT set isChecking(false) here. 
                // Keep showing loader until redirect happens.
            }
        };

        verifyAuth();
    }, []);

    // Show loading spinner while checking auth
    if (isChecking) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Đang tải dữ liệu...</span>
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    );
}
