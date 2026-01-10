"use client";

import { useEffect, useState } from "react";
import { communicationService } from "@/services/communication-service";
import { Announcement } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bell, Calendar, Megaphone } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export default function StudentNewsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const data = await communicationService.getAnnouncements();
                // Filter publicly (though backend should ideally handle privacy/targeting)
                // For now show all that are PUBLISHED
                const published = data.filter(a => a.status === 'DA_DANG');
                setAnnouncements(published);
            } catch (err) {
                console.error("Failed to fetch news", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Tin tức & Thông báo</h2>
                <p className="text-muted-foreground">Cập nhật những thông tin mới nhất từ ban quản lý.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {announcements.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-muted-foreground border rounded-lg border-dashed">
                        Chưa có thông báo nào.
                    </div>
                ) : (
                    announcements.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl leading-tight">{item.title}</CardTitle>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(item.created_at), "dd 'thg' MM, yyyy", { locale: vi })}
                                        </div>
                                    </div>
                                    <Badge variant={item.priority === 'QUAN_TRONG' ? 'destructive' : 'secondary'}>
                                        {item.priority === 'QUAN_TRONG' ? 'Quan trọng' : 'Tin tức'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                    {item.content}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="link" className="p-0 h-auto">Xem chi tiết</Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
