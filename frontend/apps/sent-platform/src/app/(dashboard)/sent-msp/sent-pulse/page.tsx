export const dynamic = "force-dynamic";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Button,
    cn
} from "@sent/platform-ui";
import {
    Activity,
    CheckCircle,
    Server,
    ShieldAlert,
    Plus,
    Terminal,
    ArrowUpRight,
    Laptop,
    Wifi
} from "lucide-react";
import { rmmService } from "@sent/feature-sent-msp";


export default async function SentPulseDashboard() {
    const stats = await rmmService.getStats();
    const recentAlerts = await rmmService.getAlerts(5);

    // Calculate percentages for the health bar
    const onlinePct = (stats.online / stats.totalDevices) * 100;
    const warningPct = (stats.warning / stats.totalDevices) * 100;
    const offlinePct = (stats.offline / stats.totalDevices) * 100;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
                    <p className="text-muted-foreground">
                        Real-time infrastructure monitoring and response.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                        <Terminal className="mr-2 h-4 w-4" />
                        Run Script
                    </Button>
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Device
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Health Score Widget */}
                <Card className="relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.healthScore}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Overall infrastructure score
                        </p>
                        <div className="mt-3 h-2 w-full rounded-full bg-secondary overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-1000"
                                style={{ width: `${stats.healthScore}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-500">{stats.online}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                            <span>12 reconnects in last hour</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-destructive">{stats.criticalAlerts}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Unacknowledged alerts
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Patch Compliance</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-500">92%</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <span>8 devices missing critical updates</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Infrastructure Status - 4 Cols */}
                <Card className="col-span-full lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Infrastructure Status</CardTitle>
                        <CardDescription>
                            Real-time breakdown of all monitored endpoints.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* Visual Status Bar */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Device Availability</span>
                                    <span className="text-muted-foreground">{stats.totalDevices} Total</span>
                                </div>
                                <div className="flex h-4 w-full overflow-hidden rounded-full font-bold text-white text-[10px] text-center leading-4">
                                    <div style={{ width: `${onlinePct}%` }} className="bg-green-500">
                                        {onlinePct > 10 && `${Math.round(onlinePct)}%`}
                                    </div>
                                    <div style={{ width: `${warningPct}%` }} className="bg-yellow-500">
                                        {warningPct > 10 && `${Math.round(warningPct)}%`}
                                    </div>
                                    <div style={{ width: `${offlinePct}%` }} className="bg-destructive">
                                        {offlinePct > 10 && `${Math.round(offlinePct)}%`}
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                    <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-green-500" /> Online</div>
                                    <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-yellow-500" /> Warning</div>
                                    <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-destructive" /> Offline</div>
                                </div>
                            </div>

                            {/* Device Type Breakdown (CSS Bar Charts) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Server className="h-4 w-4" /> Servers
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: '85%' }} />
                                        </div>
                                        <span className="text-xs font-bold">85%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Laptop className="h-4 w-4" /> Workstations
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-purple-500" style={{ width: '92%' }} />
                                        </div>
                                        <span className="text-xs font-bold">92%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Wifi className="h-4 w-4" /> Network
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-cyan-500" style={{ width: '98%' }} />
                                        </div>
                                        <span className="text-xs font-bold">98%</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Activity className="h-4 w-4" /> IoT / Other
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-slate-500" style={{ width: '100%' }} />
                                        </div>
                                        <span className="text-xs font-bold">100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Alerts Feed - 3 Cols */}
                <Card className="col-span-full lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Alert Feed</CardTitle>
                        <CardDescription>
                            Latest critical events requiring attention.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentAlerts.map((alert) => (
                                <div key={alert.id} className="flex items-start gap-4 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <div className={cn(
                                        "mt-1 h-2 w-2 rounded-full shrink-0",
                                        alert.severity === "critical" ? "bg-destructive animate-pulse" :
                                            alert.severity === "warning" ? "bg-yellow-500" : "bg-blue-500"
                                    )} />
                                    <div className="space-y-1 overflow-hidden">
                                        <p className="text-sm font-medium leading-none truncate">
                                            {alert.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {alert.deviceName} • {new Date(alert.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 ml-auto shrink-0">
                                        <ArrowUpRight className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full text-xs h-8">
                                View All Alerts
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
