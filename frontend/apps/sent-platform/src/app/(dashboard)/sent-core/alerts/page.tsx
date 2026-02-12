"use client";

import * as React from "react";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Filter,
    MoreHorizontal,
    Search,
    ShieldAlert,
    XCircle
} from "lucide-react";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Badge,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@sent/platform-ui";

interface Alert {
    id: string;
    title: string;
    severity: "critical" | "high" | "medium" | "low";
    source: string;
    timestamp: string;
    status: "open" | "acknowledged" | "resolved";
    description: string;
}

const mockAlerts: Alert[] = [
    { id: "al_1", title: "High Latency in US-East-1", severity: "critical", source: "Infrastructure / Network", timestamp: "10 mins ago", status: "open", description: "Average latency exceeded 500ms for 5 consecutive minutes." },
    { id: "al_2", title: "Database Connection Spike", severity: "high", source: "Tenant: Acme Corp", timestamp: "25 mins ago", status: "acknowledged", description: "Connection pool utilization at 95%." },
    { id: "al_3", title: "Failed Backup Job", severity: "medium", source: "Backup Service", timestamp: "1 hour ago", status: "open", description: "Daily backup for Region EU-Central-1 failed to complete." },
    { id: "al_4", title: "Unusual Login Activity", severity: "medium", source: "Identity / ZITADEL", timestamp: "2 hours ago", status: "resolved", description: "Multiple failed login attempts from single IP detected." },
    { id: "al_5", title: "SSL Certificate Expiry", severity: "low", source: "Load Balancer", timestamp: "1 day ago", status: "open", description: "Certificate for *.sent.com expires in 15 days." },
];

export default function PlatformAlertsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Platform Alerts</h1>
                    <p className="text-muted-foreground">
                        Real-time monitoring of critical platform issues and anomalies.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="destructive">
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Acknowledge All Critical
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                        <XCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">1</div>
                        <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">3</div>
                        <p className="text-xs text-muted-foreground">Across all severities</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">12</div>
                        <p className="text-xs text-muted-foreground">Mean time to resolution: 45m</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Active Alerts</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search alerts..." className="pl-8" />
                            </div>
                            <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {mockAlerts.map((alert) => (
                            <div key={alert.id} className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex gap-4">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${alert.severity === "critical" ? "bg-destructive animate-pulse" :
                                            alert.severity === "high" ? "bg-orange-500" :
                                                alert.severity === "medium" ? "bg-yellow-500" :
                                                    "bg-blue-500"
                                        }`} />
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-sm">{alert.title}</h4>
                                            <Badge variant="secondary" className="text-xs">{alert.source}</Badge>
                                            {alert.status === "open" && <Badge variant="outline" className="text-destructive border-destructive bg-destructive/10">Open</Badge>}
                                            {alert.status === "acknowledged" && <Badge variant="outline" className="text-orange-500 border-orange-500 bg-orange-500/10">Ack</Badge>}
                                            {alert.status === "resolved" && <Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/10">Resolved</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                                            <Clock className="h-3 w-3" />
                                            {alert.timestamp}
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        <DropdownMenuItem>Assign to Me</DropdownMenuItem>
                                        <DropdownMenuItem>Acknowledge</DropdownMenuItem>
                                        <DropdownMenuItem className="text-green-500">Resolve</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
