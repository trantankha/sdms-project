"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const BANK_NAME = "Ngân hàng SDMS trực tuyến";

// Ensure API URL includes /api/v1
const getApiUrl = () => {
    let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    if (url.endsWith('/')) url = url.slice(0, -1);
    if (!url.endsWith('/api/v1')) url += '/api/v1';
    return url;
};

const API_URL = getApiUrl();

function PaymentForm() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const orderDesc = searchParams.get("orderDesc");
    const signature = searchParams.get("signature");
    const createDate = searchParams.get("createDate");
    const ipAddr = searchParams.get("ipAddr");
    const billingName = searchParams.get("billingName") || "NGUYEN VAN A";
    const studentInfo = searchParams.get("studentInfo");
    const [cardNumber, setCardNumber] = useState("9704198526191432198");
    const [cardName, setCardName] = useState(billingName.toUpperCase());
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [processing, setProcessing] = useState(false);
    const { toast } = useToast();

    if (!orderId || !amount || !signature) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
                <AlertCircle className="w-12 h-12 mb-4" />
                <h1 className="text-xl font-bold">Yêu cầu thanh toán không hợp lệ</h1>
                <p>Thiếu thông tin thanh toán cần thiết.</p>
            </div>
        );
    }

    const handleConfirmCard = () => {
        if (!cardNumber || !cardName) return;
        setStep(2);
    };

    const handleConfirmPayment = async () => {
        if (otp !== "123456") {
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Mã OTP không đúng (Gợi ý: 123456)"
            });
            return;
        }

        setProcessing(true);

        try {
            // 1. Call IPN to Backend (Simulate Bank Logic)
            // In real world, Bank Server calls Merchant Server. 
            // Here, Frontend (Bank Page) calls Backend (Merchant) directly via IPN endpoint.

            // Generate simulation Transaction No
            const transactionNo = Math.floor(10000000 + Math.random() * 90000000).toString();

            const payload = {
                orderId,
                amount,
                orderDesc,
                createDate,
                ipAddr,
                signature, // Send back original signature for verification (simplified simulation)
                responseCode: "00", // Success
                vnp_TransactionNo: transactionNo,
                studentInfo, // Include for signature verification if present
                billingName, // Crucial for valid signature
            };

            await axios.post(`${API_URL}/payment/ipn`, payload);

            // 2. Success UI
            toast({
                title: "Thành công",
                description: "Giao dịch thành công!"
            });

            // 3. Redirect back after short delay (Mocking Bank -> Merchant Return)
            setTimeout(() => {
                const returnParams = new URLSearchParams({
                    payment: "success", // UI helper
                    orderId: orderId || "",
                    amount: amount || "",
                    orderDesc: orderDesc || "",
                    createDate: createDate || "",
                    ipAddr: ipAddr || "",
                    signature: signature || "",
                    billingName: billingName || "",
                    studentInfo: studentInfo || "",
                    responseCode: "00",
                    vnp_TransactionNo: transactionNo
                });
                window.location.href = `/student/finance?${returnParams.toString()}`;
            }, 2000);

        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Lỗi",
                description: "Lỗi xử lý giao dịch từ phía Merchant!"
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Card className="w-full max-w-lg shadow-2xl border-t-4 border-t-blue-600">
            <CardHeader className="text-center border-b bg-gray-50/50">
                <div className="flex justify-center mb-2">
                    <ShieldCheck className="w-12 h-12 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-blue-800">{BANK_NAME}</CardTitle>
                <CardDescription>Cổng thanh toán an toàn</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4 text-sm">
                    <div className="space-y-1 pb-4 border-b">
                        <p className="text-md text-red-600 uppercase tracking-wider font-bold mb-2">Thông tin đơn hàng</p>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Mã giao dịch:</span>
                            <span className="font-mono text-gray-900">{orderId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Nội dung:</span>
                            <span className="font-medium text-gray-900 line-clamp-2 text-right text-xs max-w-[200px]">{decodeURIComponent(orderDesc || "")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Ngày tạo:</span>
                            <span className="text-gray-900">{createDate ? `${createDate.slice(6, 8)}/${createDate.slice(4, 6)}/${createDate.slice(0, 4)} ${createDate.slice(8, 10)}:${createDate.slice(10, 12)}` : "N/A"}</span>
                        </div>
                    </div>

                    <div className="space-y-1 pb-4 border-b">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Khách hàng</p>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Họ và tên:</span>
                            <span className="font-bold text-gray-900">{billingName}</span>
                        </div>
                        {studentInfo && (
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-gray-600">Khu vực:</span>
                                <span className="font-semibold text-gray-800">{decodeURIComponent(studentInfo)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-semibold text-gray-700">Tổng thanh toán:</span>
                        <span className="text-2xl font-bold text-blue-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount))}
                        </span>
                    </div>
                </div>

                {step === 1 ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <Label>Số thẻ</Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <Input
                                    className="pl-10 font-mono"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    placeholder="0000 0000 0000 0000"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Tên chủ thẻ</Label>
                            <Input
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-xs text-yellow-800 flex items-start gap-2">
                            <Lock className="w-3 h-3 mt-0.5" />
                            <span>Mã OTP đã được gửi đến số điện thoại đăng ký. (Gợi ý: 123456)</span>
                        </div>
                        <div className="space-y-2">
                            <Label>Nhập mã OTP</Label>
                            <Input
                                className="text-center tracking-[1em] font-bold text-xl"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="------"
                            />
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                {step === 1 ? (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleConfirmCard}>
                        Tiếp tục
                    </Button>
                ) : (
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={handleConfirmPayment}
                        disabled={processing}
                    >
                        {processing ? <LoaderIcon /> : "Xác nhận thanh toán"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

function LoaderIcon() {
    return (
        <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            ></circle>
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
        </svg>
    )
}

export default function PaymentGatewayPage() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Suspense fallback={<div>Đang tải cổng thanh toán...</div>}>
                <PaymentForm />
            </Suspense>
        </div>
    );
}
