
"use client";

import Link from "next/link";
import { CircleUser, Menu, Package2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { LogoutConfirmDialog } from "@/components/logout-confirm-dialog";

export function Header() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <div className="w-full flex-1">
                <form>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Tìm kiếm..."
                            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                        />
                    </div>
                </form>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <CircleUser className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user?.full_name || user?.email || "Tài khoản"}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Cài đặt</DropdownMenuItem>
                    <DropdownMenuItem>Hỗ trợ</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <LogoutConfirmDialog>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            Đăng xuất
                        </DropdownMenuItem>
                    </LogoutConfirmDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
