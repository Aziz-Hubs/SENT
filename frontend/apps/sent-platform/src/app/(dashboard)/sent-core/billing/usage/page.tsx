"use client";

import * as React from "react";
import {
    Monitor,
    Users,
    Mail,
    Cloud
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@sent/platform-ui";

export default function SaasUsagePage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold tracking-tight">SaaS Usage Aggregation</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Microsoft 365 */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                            <Cloud className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-base">Microsoft 365</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Business Standard Seats</span>
                                <span className="font-bold">1,240</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">E5 Enterprise Seats</span>
                                <span className="font-bold">450</span>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t">
                                <span className="font-semibold">Total Reselled MRR</span>
                                <span className="font-bold text-green-600">$42,500</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Google Workspace */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-red-500" />
                            <CardTitle className="text-base">Google Workspace</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Business Starter</span>
                                <span className="font-bold">850</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Enterprise Plus</span>
                                <span className="font-bold">120</span>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t">
                                <span className="font-semibold">Total Reselled MRR</span>
                                <span className="font-bold text-green-600">$18,200</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
