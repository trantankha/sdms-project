"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DebouncedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: string;
    onValueChange: (value: string) => void;
    debounce?: number;
}

export function DebouncedInput({
    value: initialValue,
    onValueChange,
    debounce = 500,
    className,
    ...props
}: DebouncedInputProps) {
    const [value, setValue] = useState(initialValue || "");

    useEffect(() => {
        setValue(initialValue || "");
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (value !== initialValue) {
                onValueChange(value);
            }
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value, debounce, initialValue, onValueChange]);

    return (
        <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={cn("max-w-sm", className)} // Default max-w-sm but overrideable
            {...props}
        />
    );
}
