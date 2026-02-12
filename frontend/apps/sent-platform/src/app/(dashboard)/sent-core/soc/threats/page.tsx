"use client";

import * as React from "react";
import {
    ShieldAlert,
    Shield,
    Globe,
    Zap,
    Lock,
    Search,
    Filter
} from "lucide-react";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Input,
    Badge,
} from "@sent/platform-ui";

export default function SocThreatsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Global SOC</h1>
                    <p className="text-muted-foreground">
                        Real-time threat intelligence and attack vector analysis.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="destructive">
                        <Zap className="mr-2 h-4 w-4" />
                        Active Containment Mode
                    </Button>
                </div>
            </div>

            {/* Heatmap Section */}
            <Card className="bg-zinc-950 border-zinc-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-zinc-100">Global Threat Heatmap</CardTitle>
                            <CardDescription className="text-zinc-400">Live attack volume by industry sector.</CardDescription>
                        </div>
                        <Badge variant="outline" className="border-red-500 text-red-500 animate-pulse bg-red-500/10">
                            CRITICAL: Finance Sector Under Attack
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-2 h-[400px]">
                        {/* Finance Sector - UNDER ATTACK */}
                        <div className="col-span-1 row-span-2 bg-red-900/40 border border-red-500/50 rounded-lg p-4 relative group cursor-pointer hover:bg-red-900/60 transition-all">
                            <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-red-500 animate-ping" />
                            <h3 className="text-xl font-bold text-red-200">Finance</h3>
                            <div className="mt-2 space-y-1">
                                <p className="text-sm text-red-300">5 Tenants Impacted</p>
                                <p className="text-sm text-red-300">Vector: Phishing / Ransomware</p>
                                <p className="text-2xl font-mono font-bold text-red-100 mt-4">1,240 Events/m</p>
                            </div>

                            {/* Hover tooltip */}
                            <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                <div className="text-center">
                                    <p className="font-bold text-red-500 mb-2">ALERT DETAILS</p>
                                    <p className="text-sm text-zinc-300">Coordinated attack on JP Morgan & Acme Finance.</p>
                                    <Button size="sm" variant="destructive" className="mt-4">View Incident</Button>
                                </div>
                            </div>
                        </div>

                        {/* Healthcare - Normal */}
                        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-4">
                            <h3 className="text-lg font-bold text-emerald-200">Healthcare</h3>
                            <p className="text-sm text-emerald-400">Stable</p>
                            <p className="text-lg font-mono text-emerald-100 mt-2">12 Events/m</p>
                        </div>

                        {/* Manufacturing - Warning */}
                        <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4">
                            <h3 className="text-lg font-bold text-yellow-200">Manufacturing</h3>
                            <p className="text-sm text-yellow-400">Elevated Traffic</p>
                            <p className="text-lg font-mono text-yellow-100 mt-2">45 Events/m</p>
                        </div>

                        {/* Retail - Normal */}
                        <div className="col-span-2 bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
                            <h3 className="text-lg font-bold text-blue-200">Retail</h3>
                            <p className="text-sm text-blue-400">Normal Baseline</p>
                            <p className="text-lg font-mono text-blue-100 mt-2">89 Events/m</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Global Blocks */}
            <Card>
                <CardHeader>
                    <CardTitle>Global Blocklist Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded bg-secondary/50">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-purple-500" />
                                <div>
                                    <p className="font-medium">Auto-Block: 192.168.x.x Subnet</p>
                                    <p className="text-xs text-muted-foreground">Source: SENTgrid AI • Reason: Brute Force</p>
                                </div>
                            </div>
                            <Badge>Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded bg-secondary/50">
                            <div className="flex items-center gap-3">
                                <Lock className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="font-medium">Policy: Geo-Block North Korea</p>
                                    <p className="text-xs text-muted-foreground">Source: Admin • Scope: Global</p>
                                </div>
                            </div>
                            <Badge>Active</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
