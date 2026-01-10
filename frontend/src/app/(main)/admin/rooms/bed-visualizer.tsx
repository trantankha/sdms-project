import { Bed } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BedVisualizerProps {
    totalBeds: number;
    occupiedCount: number;
}

export function BedVisualizer({ totalBeds, occupiedCount }: BedVisualizerProps) {
    // Generate an array representing beds. 
    // True = Occupied, False = Empty
    const beds = Array.from({ length: totalBeds }).map((_, i) => i < occupiedCount);

    return (
        <div className="flex gap-1.5 flex-wrap">
            {beds.map((isOccupied, index) => (
                <Tooltip key={index}>
                    <TooltipTrigger asChild>
                        <div
                            className={`
                                p-1 rounded-md transition-all
                                ${isOccupied
                                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-slate-50 text-slate-300 dark:bg-slate-800/50 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-700"
                                }
                            `}
                        >
                            <Bed className={`h-4 w-4 ${isOccupied ? "fill-current" : ""}`} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{isOccupied ? "Đã có người" : "Giường trống"}</p>
                    </TooltipContent>
                </Tooltip>
            ))}
        </div>
    );
}
