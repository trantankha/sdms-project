"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { requestService } from "@/services/request-service";
import { RequestStatus, MaintenanceRequest } from "@/types";
import { CreateRequestModal } from "./create-request-modal";

export default function StudentRequestsPage() {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await requestService.getMyRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const filteredRequests = requests.filter(req =>
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openRequests = filteredRequests.filter(r => r.status === RequestStatus.OPEN || r.status === RequestStatus.IN_PROGRESS);
    const closedRequests = filteredRequests.filter(r => r.status === RequestStatus.DONE || r.status === RequestStatus.REJECTED);

    const getStatusBadge = (status: RequestStatus) => {
        switch (status) {
            case RequestStatus.OPEN:
                return <Badge variant="outline" className="border-blue-500 text-blue-500"><AlertCircle className="w-3 h-3 mr-1" /> Mới</Badge>;
            case RequestStatus.IN_PROGRESS:
                return <Badge variant="outline" className="border-orange-500 text-orange-500"><Clock className="w-3 h-3 mr-1" /> Đang xử lý</Badge>;
            case RequestStatus.DONE:
                return <Badge variant="outline" className="border-green-500 text-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Hoàn thành</Badge>;
            case RequestStatus.REJECTED:
                return <Badge variant="outline" className="border-gray-500 text-gray-500"><XCircle className="w-3 h-3 mr-1" /> Đã hủy/Từ chối</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Yêu cầu & Hỗ trợ</h2>
                    <p className="text-muted-foreground">Gửi báo cáo sự cố hoặc yêu cầu hỗ trợ từ ban quản lý.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Tạo yêu cầu mới
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Tìm kiếm yêu cầu..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <Tabs defaultValue="open" className="w-full">
                <TabsList>
                    <TabsTrigger value="open">Đang xử lý ({openRequests.length})</TabsTrigger>
                    <TabsTrigger value="closed">Đã đóng ({closedRequests.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="open" className="mt-4 space-y-4">
                    {openRequests.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                            Không có yêu cầu nào đang chờ xử lý.
                        </div>
                    ) : (
                        openRequests.map(req => (
                            <RequestCard key={req.id} request={req} getStatusBadge={getStatusBadge} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="closed" className="mt-4 space-y-4">
                    {closedRequests.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
                            Chưa có yêu cầu nào đã đóng.
                        </div>
                    ) : (
                        closedRequests.map(req => (
                            <RequestCard key={req.id} request={req} getStatusBadge={getStatusBadge} />
                        ))
                    )}
                </TabsContent>
            </Tabs>

            <CreateRequestModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onSuccess={fetchRequests}
            />
        </div>
    );
}

function RequestCard({ request, getStatusBadge }: { request: MaintenanceRequest, getStatusBadge: (s: RequestStatus) => React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <CardDescription>{format(new Date(request.created_at), "dd/MM/yyyy HH:mm")}</CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-foreground/80 mb-2">
                    {request.description || "Không có mô tả chi tiết."}
                </div>
                {request.room_code && (
                    <div className="text-xs font-semibold text-muted-foreground bg-muted inline-block px-2 py-1 rounded">
                        Phòng: {request.room_code}
                    </div>
                )}
                {request.ai_analysis_result && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-md">
                        <strong>AI Phân tích:</strong> {request.ai_analysis_result}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
