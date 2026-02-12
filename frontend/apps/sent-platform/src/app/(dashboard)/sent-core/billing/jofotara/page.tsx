"use client";

import * as React from "react";
import {
    CheckCircle2,
    XCircle,
    RefreshCw,
    Building,
    FileCheck
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Badge
} from "@sent/platform-ui";

export default function JoFotaraPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">JoFotara Gateway</h1>
                    <p className="text-muted-foreground">
                        Real-time integration status with ISTD (Jordan Income and Sales Tax Department).
                    </p>
                </div>
                <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Failed Submissions
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-1 border-t-4 border-t-green-500">
                    <CardHeader>
                        <CardTitle className="text-lg">Gateway Status</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-2xl font-bold text-green-500">OPERATIONAL</h3>
                        <p className="text-sm text-muted-foreground mt-2">API Response: 120ms</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Daily Transmission Stats</CardTitle>
                        <CardDescription>Invoices pushed to Government API today.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 border rounded bg-green-500/5">
                                <p className="text-muted-foreground text-sm">Successful</p>
                                <p className="text-3xl font-bold text-green-600">4,281</p>
                            </div>
                            <div className="p-4 border rounded bg-red-500/5">
                                <p className="text-muted-foreground text-sm">Rejected</p>
                                <p className="text-3xl font-bold text-red-600">12</p>
                            </div>
                            <div className="p-4 border rounded bg-yellow-500/5">
                                <p className="text-muted-foreground text-sm">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600">45</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
