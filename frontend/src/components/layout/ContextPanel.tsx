import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { navigationData, ModuleNav } from "@/lib/navigation-data";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function ContextPanel() {
    const { activeDivision, activeModule } = useAppStore();
    const location = useLocation();

    // Get data for the active division and module
    // If activeModule is null or invalid, fallback to the first key in the division data
    const divData = navigationData[activeDivision] || {};
    const currentModuleKey = activeModule || Object.keys(divData)[0];
    const moduleData: ModuleNav | undefined = divData[currentModuleKey];

    if (!moduleData) {
        return (
            <div className="w-[240px] h-full border-r border-border bg-sidebar p-4">
                <p className="text-muted-foreground text-sm">Select a module</p>
            </div>
        );
    }

    return (
        <div className="w-[250px] h-full border-r border-border bg-sidebar flex flex-col z-40 transform transition-transform duration-300">
            {/* Header */}
            <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
                <span className="font-semibold capitalize text-lg tracking-tight">
                    {currentModuleKey}
                </span>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {/* Section 1: Info / Stats */}
                    {moduleData.info.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Overview
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {/* Placeholder for stats - normally these would be real components passed in */}
                                <div className="bg-sidebar-accent/50 p-2 rounded-md">
                                    <span className="block text-xl font-bold">25.9k</span>
                                    <span className="text-[10px] text-muted-foreground">Deliveries</span>
                                </div>
                                <div className="bg-sidebar-accent/50 p-2 rounded-md">
                                    <span className="block text-xl font-bold">4.6k</span>
                                    <span className="text-[10px] text-muted-foreground">On Way</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 2: Pages (Navigation) */}
                    <div className="space-y-1">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Pages
                        </h4>
                        <nav className="space-y-1">
                            {moduleData.pages.map((item) => (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                        location.pathname === item.href
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 decoration-none" // decoration-none added
                                    )}
                                >
                                    {item.icon && <item.icon className="w-4 h-4 opacity-70" />}
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <Separator className="bg-sidebar-border" />

                    {/* Section 3: Quick Actions */}
                    <div className="space-y-1">
                        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Quick Actions
                        </h4>
                        <nav className="space-y-1">
                            {moduleData.quickActions.map((item) => (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                                >
                                    {item.icon && <item.icon className="w-4 h-4 opacity-70" />}
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
