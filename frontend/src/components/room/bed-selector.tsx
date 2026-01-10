import { BedStatus } from "@/types/enums";
import { cn } from "@/lib/utils";
import { Check, User, Ban, Wrench } from "lucide-react";

interface Bed {
    id: string;
    label: string;
    status: string; // BedStatus
    // is_occupied? no, status is enough
}

interface BedSelectorProps {
    beds: Bed[];
    selectedBedId?: string;
    onSelect: (bedId: string) => void;
}

export function BedSelector({ beds, selectedBedId, onSelect }: BedSelectorProps) {
    // Sort beds by label to look nice
    const sortedBeds = [...beds].sort((a, b) => a.label.localeCompare(b.label));

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {sortedBeds.map((bed) => {
                const isSelected = bed.id === selectedBedId;
                const isAvailable = bed.status === "TRONG";
                const isOccupied = bed.status === "DANG_O";
                const isMaintenance = bed.status === "BAO_TRI";

                // Map status to visual
                let statusColor = "bg-secondary text-secondary-foreground hover:bg-secondary/80";
                let Icon = User;

                if (isAvailable) {
                    statusColor = "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 cursor-pointer";
                    if (isSelected) {
                        statusColor = "bg-green-600 text-white border-green-600 ring-2 ring-green-600 ring-offset-2";
                    }
                    Icon = Check;
                } else if (isOccupied) {
                    statusColor = "bg-red-100 text-red-500 border-red-200 opacity-70 cursor-not-allowed";
                    Icon = User;
                } else if (isMaintenance) {
                    statusColor = "bg-yellow-100 text-yellow-700 border-yellow-200 opacity-70 cursor-not-allowed";
                    Icon = Wrench;
                } else { // Reserved etc
                    statusColor = "bg-gray-100 text-gray-500 border-gray-200 opacity-70 cursor-not-allowed";
                    Icon = Ban;
                }

                return (
                    <div
                        key={bed.id}
                        onClick={() => isAvailable && onSelect(bed.id)}
                        className={cn(
                            "relative flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-200",
                            statusColor
                        )}
                    >
                        <Icon className="h-6 w-6 mb-2" />
                        <span className="font-semibold">{bed.label}</span>
                        <span className="text-xs uppercase mt-1">
                            {isAvailable ? (isSelected ? "Đã chọn" : "Còn trống") :
                                isOccupied ? "Đã có người" :
                                    isMaintenance ? "Bảo trì" : "Không thể chọn"}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
