import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusConfig } from "@/lib/status-config";

// Enhanced professional palettes
const EXTENDED_VARIANTS = {
    // Warning: Warm amber/orange, clear visibility but not alarming
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",

    // Success: Crisp emerald/green, solid indication of completion
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",

    // Info: Trustworthy blue, standard information
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",

    // Purple: Premium/Special status
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",

    // Cyan: Neutral but distinct from blue
    cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",

    // Destructive: Clear error/danger signal, kept red
    destructive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
};

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    status: string | any;
    type?: "transfer" | "utility" | "payment" | "invoice" | "contract" | "priority" | "scope" | "announcement" | "room" | "service_type" | "billing_cycle" | "user" | "violation" | "request";
    showIcon?: boolean;
}

export function StatusBadge({ status, type, showIcon = true, className, ...props }: StatusBadgeProps) {
    const config = getStatusConfig(status, type);

    if (!config) return null;

    const { label, variant, icon: Icon } = config;

    // Check if it's a standard variant from ui/badge or one of our custom ones
    const isCustomVariant = ["warning", "success", "info", "purple", "cyan"].includes(variant as string);

    // Base badge classes from standard Badge component are mostly structural
    // We can reuse Badge but override className for custom variants

    const customClass = isCustomVariant ? EXTENDED_VARIANTS[variant as keyof typeof EXTENDED_VARIANTS] : "";

    return (
        <Badge
            variant={isCustomVariant ? "outline" : variant as any}
            className={cn(
                "gap-1.5 whitespace-nowrap", // Add spacing for icon
                isCustomVariant && "border", // Ensure border exists for our custom soft styles
                customClass,
                className
            )}
            {...props}
        >
            {showIcon && Icon && <Icon className="h-3.5 w-3.5" />}
            {label}
        </Badge>
    );
}
