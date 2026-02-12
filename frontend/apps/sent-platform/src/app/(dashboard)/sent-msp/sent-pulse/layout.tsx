"use client";

import { AppShell } from "@sent/platform-ui";
import { sentRmmConfig } from "@/config/nav-config";

export default function SentPulseLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppShell navConfig={sentRmmConfig} title="SENTpulse">
            {children}
        </AppShell>
    );
}
