"use client";

import { useEffect, useState } from "react";
import { servicePackageService } from "@/services/service-package-service";
import { ServicePackage, Subscription } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Wrench, Check, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function StudentServicesPage() {
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [pkgData, subData] = await Promise.all([
                servicePackageService.getPackages({ is_active: true }),
                servicePackageService.getMySubscriptions()
            ]);
            setPackages(pkgData);
            setSubscriptions(subData);
        } catch (err) {
            console.error("Failed to load services data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (packageId: string) => {
        try {
            await servicePackageService.subscribe({
                service_id: packageId,
                quantity: 1
            });
            toast({
                title: "Thành công",
                description: "Đăng ký dịch vụ thành công!",
            });
            loadData(); // Refresh list
        } catch (error: any) {
            // Extract error message from API response if available
            const errorMessage = error.response?.data?.detail || error.message || "Đăng ký thất bại. Vui lòng thử lại.";

            toast({
                title: "Đăng ký thất bại",
                description: errorMessage,
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const billingCycleLabels: Record<string, string> = {
        MOT_LAN: "lần",
        HANG_THANG: "tháng",
        HOC_KY: "học kỳ"
    };

    const serviceTypeLabels: Record<string, string> = {
        DON_DEP: "Dọn dẹp",
        GIAT_LA: "Giặt là",
        GIAO_NUOC: "Giao nước",
        KHAC: "Khác",
        GIU_XE: "Giữ xe",
        INTERNET: "Internet"
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dịch vụ & Tiện ích</h2>
                <p className="text-muted-foreground">Đăng ký và quản lý các dịch vụ đi kèm.</p>
            </div>

            <Tabs defaultValue="my-services" className="w-full">
                <TabsList>
                    <TabsTrigger value="my-services">Của tôi ({subscriptions.length})</TabsTrigger>
                    <TabsTrigger value="available">Dịch vụ có sẵn</TabsTrigger>
                </TabsList>

                <TabsContent value="my-services" className="space-y-4 mt-4">
                    {subscriptions.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
                            Bạn chưa đăng ký dịch vụ nào.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {subscriptions.map((sub) => {
                                // Lookup package details since Subscription object only has minimal info
                                const pkg = packages.find(p => p.id === sub.service_id);
                                return (
                                    <Card key={sub.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="absolute top-0 right-0 p-2">
                                            <Badge variant={sub.is_active ? 'default' : 'secondary'} className={sub.is_active ? "bg-green-600 hover:bg-green-700" : ""}>
                                                {sub.is_active ? 'Đang sử dụng' : 'Không hoạt động'}
                                            </Badge>
                                        </div>
                                        <CardHeader>
                                            <CardTitle>{sub.service_name || pkg?.name || "Dịch vụ"}</CardTitle>
                                            <CardDescription>{pkg ? (serviceTypeLabels[pkg.type] || pkg.type) : "Dịch vụ"}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-bold text-primary">
                                                    {pkg ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price) : "N/A"}
                                                </span>
                                                <span className="text-sm text-muted-foreground font-medium">
                                                    / {pkg ? (billingCycleLabels[pkg.billing_cycle] || pkg.billing_cycle) : ""}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="available" className="space-y-4 mt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {packages.map((pkg) => {
                            const isSubscribed = subscriptions.some(s => s.service_id === pkg.id && s.is_active);
                            return (
                                <Card key={pkg.id} className="flex flex-col hover:shadow-lg transition-shadow border-l-4 border-l-primary/50">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="flex items-center gap-2">
                                                {pkg.name}
                                            </CardTitle>
                                            {isSubscribed && <Badge variant="secondary" className="bg-green-100 text-green-700"><Check className="h-3 w-3 mr-1" /> Đã sở hữu</Badge>}
                                        </div>
                                        <CardDescription>{serviceTypeLabels[pkg.type] || pkg.type} - {pkg.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="mt-2 flex items-baseline gap-1 bg-muted/50 p-2 rounded-lg w-fit">
                                            <span className="text-xl font-bold text-primary">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                                            </span>
                                            <span className="text-sm font-medium text-muted-foreground">
                                                / {billingCycleLabels[pkg.billing_cycle] || pkg.billing_cycle}
                                            </span>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" disabled={isSubscribed} onClick={() => handleSubscribe(pkg.id)}>
                                            {isSubscribed ? (
                                                <>
                                                    <Check className="mr-2 h-4 w-4" /> Đã đăng ký
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="mr-2 h-4 w-4" /> Đăng ký ngay
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
