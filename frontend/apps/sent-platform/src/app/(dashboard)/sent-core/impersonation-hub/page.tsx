"use client";

import * as React from "react";
import {
    Shield,
    Monitor,
    Users,
    Briefcase,
    ArrowRight,
    LogOut
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    Button,
    Badge
} from "@sent/platform-ui";
import { useRouter, useSearchParams } from "next/navigation";

export default function ImpersonationHubPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const tenant = searchParams.get('tenant') || "Unknown Org";
    const identity = searchParams.get('identity') || "System Admin";

    // Simulate "entering" a module (which actually just redirects to a page with the new sidebar)
    const handleEnterModule = (modulePath: string) => {
        // Dispatch the "impersonate-simulation-check" event to fallback if context is lost (in a real app, this is persistent)
        // For this mock, we assume layout.tsx is handling the state based on the previous action
        router.push(modulePath);
    };

    const handleExit = () => {
        // Dispatch exit event
        window.dispatchEvent(new Event('exit-ghost-mode')); // Logic needs to be added to layout
        router.push('/sent-core');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-12 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-sm font-medium mb-4">
                    <Shield className="h-4 w-4" />
                    Ghost Mode Active
                </div>
                <h1 className="text-4xl font-bold">Welcome to {tenant}</h1>
                <p className="text-xl text-muted-foreground">
                    You are viewing as <span className="font-semibold text-foreground">{identity}</span>
                </p>
                <p className="text-sm text-muted-foreground/60 max-w-md mx-auto">
                    Select a module to begin your session. All actions are recorded in the global audit trail.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full px-6">

                {/* SENTpulse */}
                <Card className="hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group" onClick={() => handleEnterModule('/sent-core/dashboard-client-view')}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Monitor className="h-5 w-5 text-blue-500" />
                                SENTpulse
                            </div>
                            <Badge variant="secondary">Active</Badge>
                        </CardTitle>
                        <CardDescription>RMM & IT Management</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            Manage devices, assets, patching, and automation policies.
                        </p>
                        <div className="flex items-center text-blue-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Enter Module <ArrowRight className="h-4 w-4 ml-1" />
                        </div>
                    </CardContent>
                </Card>

                {/* SENTsec */}
                <Card className="hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer group">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-purple-500" />
                                SENTsec
                            </div>
                            <Badge variant="secondary">Active</Badge>
                        </CardTitle>
                        <CardDescription>Security & Compliance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            View threat streams, configure EDR, and audit compliance.
                        </p>
                        <div className="flex items-center text-purple-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Enter Module <ArrowRight className="h-4 w-4 ml-1" />
                        </div>
                    </CardContent>
                </Card>

                {/* SENTpeople */}
                <Card className="hover:border-green-500/50 hover:bg-green-500/5 transition-all cursor-pointer group">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-green-500" />
                                SENTpeople
                            </div>
                            <Badge variant="secondary" className="bg-muted">Not Configured</Badge>
                        </CardTitle>
                        <CardDescription>HRIS & Payroll</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Employee management, payroll processing, and recruiting.
                        </p>
                        <Button variant="ghost" className="w-full justify-start pl-0 hover:bg-transparent" disabled>
                            Module Not Active
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Button variant="outline" className="mt-12 text-muted-foreground hover:text-foreground" onClick={handleExit}>
                <LogOut className="h-4 w-4 mr-2" />
                Cancel Session
            </Button>
        </div>
    );
}
