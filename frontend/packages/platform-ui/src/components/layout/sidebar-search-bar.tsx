"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

// Sample searchable entities that rotate in the placeholder
const searchableEntities = [
    "Acme Corp",
    "Globex Industries",
    "TechStart Jordan",
    "Umbrella Corp",
    "Cyberdyne Systems",
    "invoices",
    "audit logs",
    "patch policies",
    "user: john@acme.com",
    "device: DC-PROD-01",
    "ticket #4521",
    "region: eu-central-1",
    "alert: critical",
];

interface SidebarSearchBarProps {
    isCollapsed: boolean;
    onClick?: () => void;
}

export function SidebarSearchBar({ isCollapsed, onClick }: SidebarSearchBarProps) {
    const [placeholderText, setPlaceholderText] = React.useState(searchableEntities[0]);
    const [isAnimating, setIsAnimating] = React.useState(false);

    // Rotate placeholder text every 3 seconds
    React.useEffect(() => {
        if (isCollapsed) return;

        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setPlaceholderText(prev => {
                    const currentIndex = searchableEntities.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % searchableEntities.length;
                    return searchableEntities[nextIndex];
                });
                setIsAnimating(false);
            }, 150); // Fade out duration
        }, 3000);

        return () => clearInterval(interval);
    }, [isCollapsed]);

    const handleClick = () => {
        // Trigger Cmd+K to open command palette
        document.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'k',
            metaKey: true,
            ctrlKey: true,
            bubbles: true
        }));
        onClick?.();
    };

    if (isCollapsed) {
        return (
            <button
                onClick={handleClick}
                className={cn(
                    "flex items-center justify-center w-full h-9 rounded-md",
                    "bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                )}
            >
                <Search className="h-4 w-4 text-muted-foreground" />
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={cn(
                "flex items-center w-full h-9 px-3 rounded-md gap-2",
                "bg-muted/50 hover:bg-muted border border-border/50",
                "transition-all duration-200 cursor-pointer group"
            )}
        >
            <Search className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
            <div className="h-4 w-px bg-border/70" /> {/* Separator */}
            <span
                className={cn(
                    "text-sm text-muted-foreground truncate flex-1 text-left",
                    "transition-all duration-150",
                    isAnimating ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"
                )}
            >
                {placeholderText}
            </span>
            <kbd className="inline-flex h-5 select-none items-center gap-0.5 rounded border bg-background px-1 font-mono text-[9px] font-medium text-muted-foreground shrink-0">
                <span className="text-[10px] leading-none">⌘</span>K
            </kbd>
        </button>
    );
}
