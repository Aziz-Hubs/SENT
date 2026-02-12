"use client";

import * as React from "react";
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Globe,
    Server,
    Wifi,
    Zap,
    Users,
    DollarSign,
    PlayCircle
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Badge
} from "@sent/platform-ui";

export default function NocWallboardPage() {
    // Mock data for the wallboard
    const [sockets, setSockets] = React.useState(1243);
    const [errorRate, setErrorRate] = React.useState(0.02);
    const [revenue, setRevenue] = React.useState(45200);

    // Simulate real-time updates
    React.useEffect(() => {
        const interval = setInterval(() => {
            setSockets(prev => Math.floor(prev + (Math.random() * 20 - 5)));
            setErrorRate(prev => Math.max(0, Math.min(5, prev + (Math.random() * 0.05 - 0.02))));
            setRevenue(prev => prev + (Math.random() > 0.8 ? 50 : 0));
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">NOC Wallboard</h1>
                        <p className="text-muted-foreground">
                            Global systems telemetry and operational pulse.
                        </p>
                    </div>
                    <Badge variant="outline" className="text-green-500 border-green-500 px-3 py-1 animate-pulse">
                        LIVE
                    </Badge>
                </div>
            </div>

            {/* Critical Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Live Sockets */}
                <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-card to-blue-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Live Socket Connections</CardTitle>
                        <Wifi className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">{sockets.toLocaleString()}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <span className="text-green-500 flex items-center gap-1 mr-2">
                                <ArrowUpRight className="h-3 w-3" />
                                +12%
                            </span>
                            vs last hour
                        </div>
                    </CardContent>
                </Card>

                {/* Global Error Rate */}
                <Card className={`border-l-4 bg-gradient-to-br from-card to-red-500/5 ${errorRate > 1 ? 'border-l-red-500 animate-pulse' : 'border-l-green-500'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Global Error Rate (5xx)</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${errorRate > 1 ? 'text-red-500' : 'text-green-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold font-mono ${errorRate > 1 ? 'text-red-500' : 'text-foreground'}`}>
                            {errorRate.toFixed(3)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Target: &lt; 0.1%
                        </p>
                    </CardContent>
                </Card>

                {/* Revenue Pulse */}
                <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-card to-emerald-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue Pulse (MRR)</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">${revenue.toLocaleString()}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <span className="text-emerald-500 flex items-center gap-1 mr-2">
                                <ArrowUpRight className="h-3 w-3" />
                                +$850
                            </span>
                            today
                        </div>
                    </CardContent>
                </Card>

                {/* Active Provisioning Jobs */}
                <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-card to-purple-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Provisioning Jobs</CardTitle>
                        <PlayCircle className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">2</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Active Workers
                        </p>
                        <div className="h-1 mt-2 w-full bg-purple-500/20 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 animate-indeterminate-bar" style={{ width: '40%' }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Regional Status (Minified) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Region Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <span className="text-sm font-medium">US-East-1 (Virginia)</span>
                                </div>
                                <span className="text-xs text-muted-foreground font-mono">24ms • 30/30 Nodes</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <span className="text-sm font-medium">EU-Central-1 (Frankfurt)</span>
                                </div>
                                <span className="text-xs text-muted-foreground font-mono">18ms • 15/15 Nodes</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                                    <span className="text-sm font-medium">AP-Northeast-1 (Tokyo)</span>
                                </div>
                                <span className="text-xs text-muted-foreground font-mono">145ms • 14/15 Nodes</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Latest System Events */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Operational Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="text-muted-foreground w-12 text-xs">10:42</div>
                                <div className="font-medium text-purple-500">Provisioning</div>
                                <div>Started initialization for <span className="font-semibold">TechStart Jordan</span>.</div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="text-muted-foreground w-12 text-xs">10:40</div>
                                <div className="font-medium text-red-500">Alert</div>
                                <div>High latency detected in AP-Northeast-1. Auto-scaling triggered.</div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="text-muted-foreground w-12 text-xs">10:35</div>
                                <div className="font-medium text-blue-500">Security</div>
                                <div>Blocked 12,400 IP addresses from Global Blocklist update.</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
