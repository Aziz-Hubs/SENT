"use client";

import * as React from "react";
import {
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { SidebarItem, NavZone } from "./sidebar-item";
import { SidebarSearchBar } from "./sidebar-search-bar";

interface SidebarProps {
    navConfig: NavZone[];
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    isMobile: boolean;
    closeMobileSidebar?: () => void;
    title?: string;
}

export function Sidebar({
    navConfig,
    isCollapsed,
    setIsCollapsed,
    isMobile,
    closeMobileSidebar,
    title = "SENTrmm",
}: SidebarProps) {
    // Separate zones - support both sentRmmConfig and sentCoreConfig zone IDs
    const zone1 = navConfig.find((z) => z.id === "command-center" || z.id === "global-command");
    const zone2 = navConfig.find((z) => z.id === "core-ops" || z.id === "platform-admin");
    const zone3 = navConfig.find((z) => z.id === "admin-utility" || z.id === "system-utilities");

    if (isMobile) {
        // Render full sidebar for mobile sheet
        return (
            <div className="flex h-full flex-col gap-4">
                {/* Mobile Header */}
                <div className="flex items-center px-4 py-2 border-b h-14">
                    <span className="font-bold text-lg">{title}</span>
                </div>

                <ScrollArea className="flex-1 px-2">
                    <div className="space-y-6 py-4">
                        {/* Zone 1 */}
                        {zone1 && (
                            <div className="space-y-1">
                                {zone1.items.map((item) => (
                                    <SidebarItem key={item.title} item={item} isCollapsed={false} onClick={closeMobileSidebar} />
                                ))}
                            </div>
                        )}
                        <Separator />
                        {/* Zone 2 */}
                        {zone2 && (
                            <div className="space-y-1">
                                {zone2.title && <h3 className="mb-2 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{zone2.title}</h3>}
                                {zone2.items.map((item) => (
                                    <SidebarItem key={item.title} item={item} isCollapsed={false} onClick={closeMobileSidebar} />
                                ))}
                            </div>
                        )}
                        <Separator />
                        {/* Zone 3 */}
                        {zone3 && (
                            <div className="space-y-1 mt-auto">
                                {zone3.items.map((item) => (
                                    <SidebarItem key={item.title} item={item} isCollapsed={false} onClick={closeMobileSidebar} />
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        );
    }

    // Desktop Sidebar
    return (
        <aside
            className={cn(
                "relative flex flex-col h-full border-r bg-background transition-all duration-300 ease-in-out",
                isCollapsed ? "w-[52px]" : "w-[240px]"
            )}
        >
            {/* Toggle Button */}
            <div className="absolute -right-3 top-6 z-20">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full shadow-md bg-background border-muted-foreground/20 hover:bg-accent"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? (
                        <ChevronsRight className="h-3 w-3" />
                    ) : (
                        <ChevronsLeft className="h-3 w-3" />
                    )}
                </Button>
            </div>

            {/* Zone 1: Command Center (Sticky Top) */}
            <div className={cn("flex flex-col gap-2 p-2", !isCollapsed && "px-3")}>
                {/* Logo / Brand */}
                <div className={cn("flex items-center h-10 mb-2 transition-all overflow-hidden", isCollapsed ? "justify-center" : "px-2")}>
                    {/* Placeholder Logo */}
                    <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                        {title.charAt(0)}
                    </div>
                    {!isCollapsed && (
                        <span className="ml-2 font-bold text-lg truncate">{title}</span>
                    )}
                </div>

                {zone1?.items.map((item) => {
                    // Render special SearchBar for omni-search action
                    if (item.actionId === 'omni-search' || item.actionId === 'search') {
                        return (
                            <SidebarSearchBar
                                key={item.title}
                                isCollapsed={isCollapsed}
                            />
                        );
                    }
                    return (
                        <SidebarItem key={item.title} item={item} isCollapsed={isCollapsed} />
                    );
                })}
            </div>

            <Separator className="mx-2 w-auto bg-border/50" />

            {/* Zone 2: Core Operations (Scrollable Middle) */}
            <ScrollArea className="flex-1 px-2 py-2">
                {zone2 && (
                    <div className="space-y-1">
                        {!isCollapsed && zone2.title && (
                            <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider animate-in fade-in duration-300">
                                {zone2.title}
                            </h3>
                        )}
                        {zone2.items.map((item) => (
                            <SidebarItem key={item.title} item={item} isCollapsed={isCollapsed} />
                        ))}
                    </div>
                )}
            </ScrollArea>

            <Separator className="mx-2 w-auto bg-border/50" />

            {/* Zone 3: Admin & Utility (Sticky Bottom) */}
            <div className="p-2 mt-auto">
                {zone3?.items.map((item) => (
                    <SidebarItem key={item.title} item={item} isCollapsed={isCollapsed} />
                ))}
            </div>
        </aside>
    );
}
