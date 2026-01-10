"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; // Correct hook
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { contractService } from "@/services/contract-service";
import { Contract, LiquidationRequest } from "@/types/contracts";
import { format } from "date-fns";
import { Loader2, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";

export default function LiquidationPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { toast } = useToast();
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [penaltyAmount, setPenaltyAmount] = useState(0);
    const [damageFee, setDamageFee] = useState(0);
    const [notes, setNotes] = useState("");

    // Calculated
    const [refundAmount, setRefundAmount] = useState(0);

    useEffect(() => {
        loadContract();
    }, [params.id]);

    useEffect(() => {
        if (contract) {
            // Calculate Refund = Deposit - Penalty - Damage
            // Assuming deposit is refundable.
            const deposit = contract.deposit_amount || 0;
            const refund = Math.max(0, deposit - penaltyAmount - damageFee);
            setRefundAmount(refund);
        }
    }, [penaltyAmount, damageFee, contract]);

    const loadContract = async () => {
        try {
            const data = await contractService.getContract(params.id);
            setContract(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load contract details",
                variant: "destructive",
            });
            router.push("/admin/contracts");
        } finally {
            setLoading(false);
        }
    };

    const handleLiquidate = async () => {
        if (!contract) return;

        setSubmitting(true);
        try {
            const payload: LiquidationRequest = {
                contract_id: contract.id,
                penalty_amount: penaltyAmount,
                damage_fee: damageFee,
                notes: notes,
            };

            await contractService.liquidateContract(payload);

            toast({
                title: "Success",
                description: "Contract liquidated successfully",
            });
            router.push("/admin/contracts");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to liquidate contract",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!contract) return null;

    return (
        <div className="mx-auto max-w-2xl">
            <Button variant="ghost" className="mb-4 pl-0" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Contracts
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Liquidation & Contract Termination</CardTitle>
                    <CardDescription>
                        Process termination for contract #{contract.id.substring(0, 8)}...
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Contract Details */}
                    <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Student ID:</span>
                            <div className="font-medium">{contract.student_id ? contract.student_id.substring(0, 8) : 'N/A'}...</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Bed ID:</span>
                            <div className="font-medium">{contract.bed_id ? contract.bed_id.substring(0, 8) : 'N/A'}...</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Start Date:</span>
                            <div className="font-medium">{contract.created_at ? format(new Date(contract.created_at), 'PPP') : 'N/A'}</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">End Date:</span>
                            <div className="font-medium">{contract.end_date ? format(new Date(contract.end_date), 'PPP') : 'N/A'}</div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Status:</span>
                            <div><StatusBadge status={contract.status} type="contract" /></div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Deposit Being Held:</span>
                            <div className="text-lg font-bold text-primary">
                                {contract.deposit_amount?.toLocaleString() || 0} VND
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Cost Calculation */}
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Deductions
                        </h3>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="penalty">Penalty Amount (VND)</Label>
                                <Input
                                    id="penalty"
                                    type="number"
                                    value={penaltyAmount}
                                    onChange={(e) => setPenaltyAmount(Number(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">For early termination, etc.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="damage">Damage/Repair Fee (VND)</Label>
                                <Input
                                    id="damage"
                                    type="number"
                                    value={damageFee}
                                    onChange={(e) => setDamageFee(Number(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">For broken assets, cleaning.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Liquidation Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Explain deductions or reason for termination..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-lg bg-muted p-4">
                        <div className="flex justify-between text-sm">
                            <span>Initial Deposit:</span>
                            <span>{contract.deposit_amount?.toLocaleString()} VND</span>
                        </div>
                        <div className="flex justify-between text-sm text-destructive mt-1">
                            <span>Less: Deductions:</span>
                            <span>- {(penaltyAmount + damageFee).toLocaleString()} VND</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Refund to Student:</span>
                            <span className="text-green-600">{refundAmount.toLocaleString()} VND</span>
                        </div>
                    </div>

                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full"
                        variant={refundAmount < 0 ? "destructive" : "default"}
                        onClick={handleLiquidate}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirm Liquidation
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
