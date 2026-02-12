import { useEffect, useState } from "react";
import { Device } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@sent/platform-ui";
import { Progress } from "@sent/platform-ui";
import {
    Cpu,
    HardDrive,
    MemoryStick,
    Shield,
    Wifi,
    History
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { pulseService } from "../../services/pulse-client";
import { isValid, parseISO } from "date-fns";

interface OverviewTabProps {
    device: Device;
}

export function OverviewTab({ device }: OverviewTabProps) {
    const [telemetry, setTelemetry] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTelemetry = async () => {
            setLoading(true);
            try {
                // Fetch last 24h
                const points = await pulseService.getDeviceTelemetry(device.id);
                setTelemetry(points);
            } catch (err) {
                console.error("Failed to fetch telemetry history", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTelemetry();
    }, [device.id]);

    // Format data for Recharts
    const chartData = telemetry.map(p => {
        const date = p.time ? parseISO(p.time) : null;
        return {
            time: date && isValid(date) ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            cpu: p.cpuUsage,
            memory: p.memoryUsage,
            disk: p.diskUsage,
        };
    });

    const formatBytes = (bytes: number | undefined) => {
        if (!bytes) return "0 GB";
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{device.cpuUsage.toFixed(1)}%</div>
                    <Progress value={device.cpuUsage} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                        {device.hardware?.processorModel || "Unknown Processor"}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                    <MemoryStick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{device.memoryUsage.toFixed(1)}%</div>
                    <Progress value={device.memoryUsage} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                        {formatBytes(device.hardware?.ramUsedBytes)} / {formatBytes(device.hardware?.ramTotalBytes)}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{device.diskUsage.toFixed(1)}%</div>
                    <Progress value={device.diskUsage} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                        {device.storageDrives.length > 0 ? (
                            `${device.storageDrives[0].letter} (${device.storageDrives[0].used.toFixed(1)}GB / ${device.storageDrives[0].total.toFixed(1)}GB)`
                        ) : "No drives detected"}
                    </p>
                </CardContent>
            </Card>

            {/* Performance History Chart */}
            <Card className="col-span-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-semibold">Resource Performance History (24h)</CardTitle>
                    <History className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="h-[300px] w-full">
                        {loading ? (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                Loading historical data...
                            </div>
                        ) : chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                    <XAxis
                                        dataKey="time"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}%`}
                                        domain={[0, 100]}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#f8fafc" }}
                                        itemStyle={{ fontSize: '12px' }}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Line
                                        type="monotone"
                                        dataKey="cpu"
                                        name="CPU %"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="memory"
                                        name="Memory %"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="disk"
                                        name="Disk %"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                No historical data available for this device yet.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* General Info */}
            <Card className="col-span-full md:col-span-1">
                <CardHeader>
                    <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">RustDesk ID</span>
                        <span className="text-sm font-mono text-primary font-bold">{device.rustdeskId || "Not Registered"}</span>
                    </div>
                    {device.rustdeskId && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Remote Password</span>
                            <span className="text-sm font-mono text-muted-foreground">{device.rustdeskPassword || "••••••••"}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">OS Name</span>
                        <span className="text-sm text-muted-foreground">{device.osInfo?.name || "Unknown"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Version</span>
                        <span className="text-sm text-muted-foreground">{device.osInfo?.version || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Build</span>
                        <span className="text-sm text-muted-foreground">{device.osInfo?.build || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Architecture</span>
                        <span className="text-sm text-muted-foreground">{device.osInfo?.architecture || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Last Boot</span>
                        <span className="text-sm text-muted-foreground">
                            {device.uptime ? new Date(Date.now() - device.uptime * 1000).toLocaleString() : "Unknown"}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Network Info Summary */}
            <Card className="col-span-full md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle>Network Status</CardTitle>
                    <Wifi className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Local IP</span>
                        <span className="text-sm text-muted-foreground">{device.localIp || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">MAC Address</span>
                        <span className="text-sm text-muted-foreground">{device.macAddress || "N/A"}</span>
                    </div>
                    <div className="pt-4">
                        <h4 className="mb-2 text-sm font-medium">Active Interfaces</h4>
                        <div className="grid gap-2">
                            {device.networkInterfaces
                                .filter(nic => nic.status === "connected")
                                .slice(0, 3)
                                .map((nic, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <span>{nic.name}</span>
                                        <span className="text-muted-foreground">{nic.ip}</span>
                                    </div>
                                ))}
                            {device.networkInterfaces.filter(nic => nic.status === "connected").length === 0 && (
                                <div className="text-xs text-muted-foreground">No active interfaces</div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Summary */}
            <Card className="col-span-full md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle>Security Posture</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Antivirus</span>
                        <span className="text-sm text-muted-foreground">
                            {device.security?.antivirus?.name || "Not Detected"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Firewall</span>
                        <span className={device.security?.firewall ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                            {device.security?.firewall ? "Enabled" : "Disabled"}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Encryption</span>
                        <span className={device.security?.encryption ? "text-green-500 text-sm" : "text-gray-500 text-sm"}>
                            {device.security?.encryption ? "Enabled" : "Disabled/Unknown"}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
