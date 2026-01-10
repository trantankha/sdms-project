import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Trophy, TrendingUp } from "lucide-react";

export function DashboardBanner() {
    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-6 text-white shadow-lg mt-6 group">
            {/* Abstract Background Shapes */}
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-transform duration-700 group-hover:scale-150" />
            <div className="absolute top-1/2 -left-12 h-32 w-32 rounded-full bg-pink-500/20 blur-2xl transition-transform duration-500 group-hover:translate-x-12" />

            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
                                <Sparkles className="h-5 w-5 text-yellow-300" />
                            </span>
                            <span className="inline-flex items-center rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-medium text-indigo-100 backdrop-blur-md border border-white/10">
                                Thông tin thông minh
                            </span>
                        </div>
                        <h3 className="text-xl font-bold leading-tight">
                            Hệ thống hoạt động ổn định!
                        </h3>
                        <p className="mt-1 text-sm text-indigo-100/90 max-w-full">
                            Không có sự cố nào được ghi nhận trong 24h qua.
                        </p>
                    </div>
                </div>

                {/* Mini Stats Row */}
                <div className="grid grid-cols-2 gap-3 my-1">
                    <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-colors">
                        <div className="flex items-center gap-2 text-indigo-200 text-xs mb-1">
                            <Trophy className="h-3 w-3" />
                            <span>Hiệu suất</span>
                        </div>
                        <span className="text-lg font-bold">98%</span>
                    </div>
                    <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm border border-white/5 hover:bg-white/15 transition-colors">
                        <div className="flex items-center gap-2 text-indigo-200 text-xs mb-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>Tương tác</span>
                        </div>
                        <span className="text-lg font-bold">+12%</span>
                    </div>
                </div>

                <div className="mt-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="w-full justify-between bg-white text-indigo-600 hover:bg-indigo-50 font-semibold shadow-sm group/btn"
                    >
                        <span>Xem chi tiết báo cáo</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
