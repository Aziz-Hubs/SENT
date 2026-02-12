import type { Metadata } from "next";
import "@sent/platform-ui/globals.css";

export const metadata: Metadata = {
    title: "SENT Platform",
    description: "Enterprise-grade unified platform for MSP, ERP, and Security operations",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-background font-sans antialiased">
                {children}
            </body>
        </html>
    );
}
