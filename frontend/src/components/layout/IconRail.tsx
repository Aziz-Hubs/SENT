import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import {
    Building2,
    Settings2,
    Briefcase,
    LayoutGrid
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";

export function IconRail() {
    const { activeDivision, setDivision } = useAppStore();

    const divisions = [
        { id: 'erp', label: 'ERP', icon: Briefcase, color: "text-brand-erp" }, // We will map these colors in globals
        { id: 'msp', label: 'MSP', icon: Building2, color: "text-brand-msp" },
    ];

    return (
        <div className="h-full w-[60px] flex flex-col items-center py-4 border-r border-border bg-card z-50">
            <div className="mb-4">
                <LayoutGrid className="w-8 h-8 text-primary" />
            </div>

            <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                <TooltipProvider delayDuration={0}>
                    {divisions.map((div) => (
                        <Tooltip key={div.id}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setDivision(div.id as any)}
                                    className={cn(
                                        "w-full aspect-square flex items-center justify-center rounded-lg transition-all duration-200",
                                        activeDivision === div.id
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <div.icon className="w-5 h-5" />
                                    <span className="sr-only">{div.label}</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="font-semibold">
                                {div.label} Division
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </nav>

            <div className="mt-auto">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                    <Settings2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
