"use client";

import * as React from "react";
import {
    GitBranch,
    GitCommit,
    CheckCircle2,
    Clock,
    PlayCircle,
    XCircle,
    Box
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Badge,
    Button
} from "@sent/platform-ui";

export default function DeploymentsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
                    <p className="text-muted-foreground">
                        CI/CD Pipeline status and release management for the SENT Monolith.
                    </p>
                </div>
                <Button>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Trigger Manual Build
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Current Production */}
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Production Environment</CardTitle>
                        <CardDescription>Current running version in global clusters.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/20">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                    <Box className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">v2.4.0-release</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <GitCommit className="h-3 w-3" />
                                        <span className="font-mono">8f3a2c1</span>
                                        <span>•</span>
                                        <span>Deployed 2h ago by @abdul</span>
                                    </div>
                                </div>
                            </div>
                            <Badge className="bg-green-500">Active</Badge>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold">Deployment Health</h4>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Database Migrations</span>
                                <span className="text-muted-foreground">Verified</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Asset CDN Sync</span>
                                <span className="text-muted-foreground">Verified</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Canary Tests</span>
                                <span className="text-muted-foreground">Passed (100%)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pipeline Queue */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Pipeline Queue</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className="mt-1">
                                <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">feat: new-billing-module</h4>
                                <p className="text-xs text-muted-foreground">Running Tests (45%)...</p>
                                <div className="h-1 mt-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: '45%' }} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 border rounded-lg opacity-60">
                            <div className="mt-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">fix: overflow-issue</h4>
                                <p className="text-xs text-muted-foreground">Queued</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 border rounded-lg border-red-500/20 bg-red-500/5">
                            <div className="mt-1">
                                <XCircle className="h-4 w-4 text-red-500" />
                            </div>
                            <div>
                                <h4 className="font-medium text-sm">chore: update-deps</h4>
                                <p className="text-xs text-muted-foreground">Failed: Lint Error</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
