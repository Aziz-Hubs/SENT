import React from "react";
import { IconRail } from "./IconRail";
import { ContextPanel } from "./ContextPanel";
import { useAppStore } from "@/store/useAppStore";
// import { Toaster } from "@/components/ui/sonner"; // Assuming sonner is installed or will be

// Placeholder for main content area until pages are built
const MainContent = ({ children }: { children: React.ReactNode }) => (
    <main className="flex-1 h-screen overflow-auto bg-background relative z-10 transition-all duration-300 ease-in-out">
        {children}
    </main>
);

export function Shell({ children }: { children: React.ReactNode }) {
    const { activeDivision } = useAppStore();

    return (
        <div className="flex w-full h-screen bg-background overflow-hidden relative">
            {/* 1. Primary Icon Rail (Fixed Width) */}
            <IconRail />

            {/* 2. Secondary Context Panel (Fixed Width for now, could be resizable) */}
            <ContextPanel />

            {/* 3. Main Content Area */}
            <MainContent>{children}</MainContent>

            {/* 4. Global Toaster */}
            {/* <Toaster /> */}
        </div>
    );
}
