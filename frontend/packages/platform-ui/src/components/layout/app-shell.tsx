"use client";

import * as React from "react";
import { Menu } from "lucide-react";
// import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Sheet, SheetContent } from "../ui/sheet";
import { Sidebar } from "./sidebar";
import { CommandPalette } from "./command-palette";
import { NavZone } from "./sidebar-item";

interface AppShellProps {
    children: React.ReactNode;
    navConfig: NavZone[];
    title?: string;
}

export function AppShell({ children, navConfig, title = "SENT" }: AppShellProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col h-full shrink-0">
                <Sidebar
                    navConfig={navConfig}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    isMobile={false}
                    title={title}
                />
            </div>

            {/* Mobile Sidebar (Sheet) */}
            <div className="md:hidden">
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetContent side="left" className="p-0 w-[280px]">
                        <Sidebar
                            navConfig={navConfig}
                            isCollapsed={false}
                            setIsCollapsed={() => { }}
                            isMobile={true}
                            closeMobileSidebar={() => setIsMobileOpen(false)}
                            title={title}
                        />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">

                {/* Mobile Header Trigger */}
                <div className="md:hidden flex items-center p-4 border-b">
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                    <span className="ml-2 font-bold">{title}</span>
                </div>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    {children}
                </div>

                <CommandPalette />
            </main>
        </div>
    );
}
