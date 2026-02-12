"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "../ui/tooltip";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "../ui/hover-card";

export type NavItem = {
    title: string;
    href?: string;
    icon: LucideIcon;
    variant?: "ghost" | "default";
    label?: string; // For badges like "9" or "New"
    labelColor?: "default" | "red" | "blue";
    items?: NavItem[]; // For nested items
    isExpanded?: boolean; // For default open state
    actionId?: string; // For things that trigger actions instead of navigation (e.g. Search)
};

export type NavZone = {
    id: string;
    title?: string;
    items: NavItem[];
    className?: string;
};

interface SidebarItemProps {
    item: NavItem;
    isCollapsed: boolean;
    onClick?: () => void;
}

export function SidebarItem({ item, isCollapsed, onClick }: SidebarItemProps) {
    const pathname = usePathname();
    const isActive = item.href ? pathname === item.href : false;
    // Check if any child is active
    const isChildActive = item.items?.some(
        (child) => child.href && pathname === child.href
    );

    const [isOpen, setIsOpen] = React.useState(item.isExpanded || isChildActive);

    // Auto-expand if child is active
    React.useEffect(() => {
        if (isChildActive) {
            setIsOpen(true);
        }
    }, [isChildActive]);

    const Icon = item.icon;

    // Render content based on collapsed state and hierarchy

    // 1. Leaf Node (Link or Action)
    if (!item.items || item.items.length === 0) {
        const content = (
            <Link
                href={item.href || "#"}
                onClick={(e) => {
                    if (item.actionId) {
                        e.preventDefault();
                        // Handle Omni-Search / Search by simulating Cmd+K for command palette
                        if (item.actionId === 'search' || item.actionId === 'omni-search') {
                            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }));
                        } else {
                            // Dispatch a custom window event for this actionId
                            // layout.tsx listens for events like 'impersonate-ghost', 'onboard-tenant', etc.
                            window.dispatchEvent(new CustomEvent(item.actionId));
                        }
                        onClick?.();
                    }
                }}
                className={cn(
                    "group relative flex items-center gap-x-3 rounded-md px-2 py-2 text-sm font-medium",
                    "transition-all duration-200 ease-out",
                    "hover:bg-accent hover:text-accent-foreground hover:translate-x-0.5",
                    "active:scale-[0.98]",
                    isActive && "bg-accent text-accent-foreground",
                    isCollapsed && "justify-center px-2"
                )}
            >
                <Icon className={cn(
                    "h-4 w-4 shrink-0 transition-all duration-200",
                    "group-hover:scale-110",
                    isActive && "text-primary"
                )} />
                {!isCollapsed && (
                    <span className="truncate flex-1 transition-transform duration-200 group-hover:translate-x-0.5">
                        {item.title}
                    </span>
                )}
                {!isCollapsed && item.label && (
                    <Badge
                        variant={item.labelColor === 'red' ? 'destructive' : 'secondary'}
                        className={cn(
                            "ml-auto text-[10px] px-1.5 h-5 min-w-5 flex items-center justify-center",
                            "transition-transform duration-200 group-hover:scale-105",
                            item.labelColor === 'red' && "animate-pulse"
                        )}
                    >
                        {item.label}
                    </Badge>
                )}
                {/* Status indicator dot for micro-mode or subtle indication */}
                {item.labelColor === 'red' && isCollapsed && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                )}
            </Link>
        );

        if (isCollapsed) {
            return (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>{content}</TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-4">
                            {item.title}
                            {item.label && (
                                <span className="ml-auto text-muted-foreground">
                                    {item.label}
                                </span>
                            )}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return content;
    }

    // 2. Parent Node (Collapsible)
    if (isCollapsed) {
        return (
            <HoverCard openDelay={100} closeDelay={150}>
                <HoverCardTrigger asChild>
                    <div className={cn(
                        "group relative flex items-center justify-center gap-x-3 rounded-md px-2 py-2 text-sm font-medium",
                        "transition-all duration-200 ease-out cursor-pointer",
                        "hover:bg-accent hover:text-accent-foreground",
                        "active:scale-[0.98]",
                        isChildActive && "bg-accent/50 text-accent-foreground"
                    )}>
                        <Icon className={cn(
                            "h-4 w-4 shrink-0 transition-all duration-200",
                            "group-hover:scale-110"
                        )} />
                        {/* Indicator that there are children */}
                        <span className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                    </div>
                </HoverCardTrigger>
                <HoverCardContent
                    side="right"
                    align="start"
                    sideOffset={8}
                    className="w-48 p-1"
                >
                    <div className="flex flex-col gap-0.5">
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {item.title}
                        </div>
                        {item.items.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = subItem.href ? pathname === subItem.href : false;
                            return (
                                <Link
                                    key={subItem.title}
                                    href={subItem.href || "#"}
                                    onClick={(e) => {
                                        if (subItem.actionId) {
                                            e.preventDefault();
                                            window.dispatchEvent(new CustomEvent(subItem.actionId));
                                        }
                                    }}
                                    className={cn(
                                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                                        "transition-all duration-150",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        "active:scale-[0.98]",
                                        isSubActive && "bg-accent text-accent-foreground"
                                    )}
                                >
                                    <SubIcon className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                                    <span className="truncate">{subItem.title}</span>
                                    {subItem.label && (
                                        <Badge
                                            variant={subItem.labelColor === 'red' ? 'destructive' : 'secondary'}
                                            className="ml-auto text-[9px] px-1 h-4"
                                        >
                                            {subItem.label}
                                        </Badge>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </HoverCardContent>
            </HoverCard>
        )
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleTrigger asChild>
                <button
                    onClick={onClick}
                    className={cn(
                        "group flex w-full items-center gap-x-3 rounded-md px-2 py-2 text-sm font-medium",
                        "transition-all duration-200 ease-out",
                        "hover:bg-accent hover:text-accent-foreground hover:translate-x-0.5",
                        "active:scale-[0.98]",
                        isChildActive && !isOpen && "bg-accent/50"
                    )}
                >
                    <Icon className={cn(
                        "h-4 w-4 shrink-0 transition-all duration-200",
                        "group-hover:scale-110"
                    )} />
                    <span className="truncate flex-1 text-left transition-transform duration-200 group-hover:translate-x-0.5">
                        {item.title}
                    </span>
                    <ChevronRight
                        className={cn(
                            "h-4 w-4 shrink-0 transition-all duration-300 ease-out",
                            "group-hover:translate-x-0.5",
                            isOpen && "rotate-90"
                        )}
                    />
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 my-1 ml-4 border-l pl-2 border-border/50 animate-in slide-in-from-top-1 fade-in duration-200">
                {item.items.map((subItem) => (
                    <SidebarItem
                        key={subItem.title}
                        item={subItem}
                        isCollapsed={false} // Always expanded inside accordion
                    />
                ))}
            </CollapsibleContent>
        </Collapsible>
    );
}
