"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Violation, ViolationSeverity } from "@/types/conduct";
import { format } from "date-fns";
import { Calendar, AlertTriangle, FileText, User as UserIcon, Trash2, Edit } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { conductService } from "@/services/conduct-service";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ViolationDetailSheetProps {
    violation: Violation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit: (violation: Violation) => void;
    onRefresh: () => void;
}

export function ViolationDetailSheet({
    violation,
    open,
    onOpenChange,
    onEdit,
    onRefresh
}: ViolationDetailSheetProps) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    if (!violation) return null;

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await conductService.deleteViolation(violation.id);
            toast({ title: "Thành công", description: "Đã xóa hồ sơ vi phạm." });
            onRefresh();
            onOpenChange(false);
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể xóa hồ sơ.", variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex items-center gap-4">
                        <StatusBadge status={violation.severity} type="violation" className="px-3 py-1 text-sm" />
                        <span className="text-sm text-muted-foreground ml-auto">
                            Ngày tạo: {format(new Date(violation.created_at || new Date()), "dd/MM/yyyy HH:mm")}
                        </span>
                    </div>
                    <SheetTitle className="text-2xl font-bold mt-2">{violation.title}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        Ngày vi phạm: {format(new Date(violation.violation_date), "dd/MM/yyyy")}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Student Profile Section */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/40 border">
                        <Avatar className="h-12 w-12 border-2 border-background">
                            <AvatarImage src={violation.student?.avatar_url} />
                            <AvatarFallback>{violation.student?.full_name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h4 className="font-semibold text-base">{violation.student?.full_name || "Unknown"}</h4>
                            <div className="text-sm text-muted-foreground flex flex-col gap-0.5">
                                <span className="font-mono">{violation.student?.student_code}</span>
                                <span>{violation.student?.email}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Details Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2 text-lg">
                            <FileText className="h-5 w-5 text-primary" />
                            Chi tiết Sư việc
                        </h3>
                        <div className="bg-muted/20 p-4 rounded-md border min-h-[100px] text-sm leading-relaxed whitespace-pre-wrap">
                            {violation.description}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5 p-3 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Điểm trừ rèn luyện</span>
                            <div className="text-2xl font-bold text-red-700 dark:text-red-400">-{violation.points_deducted}</div>
                        </div>
                        {/* Placeholder for future metadata like "Location" or "Reported By" */}
                    </div>

                </div>

                <SheetFooter className="mt-8 flex-col sm:flex-row gap-3 sm:gap-2 border-t pt-6">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full sm:w-auto" disabled={isDeleting}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa Hồ sơ
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Hồ sơ vi phạm này sẽ bị xóa vĩnh viễn khỏi hệ thống.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                    Xóa
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button className="w-full sm:w-auto" onClick={() => onEdit(violation)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
