"use client";


import {
    Device,
    DeviceStatus,
    DeviceType,
} from "../../types";
import {
    Badge,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    cn
} from "@sent/platform-ui";
import {
    Laptop,
    Server,
    Network,
    Cpu,
    Activity,
    Clock,
    Tag,
    MoreHorizontal,
    Power,
    RefreshCw,
    Terminal,
    Monitor
} from "lucide-react";
import { pulseService as rmmService } from "../../services/pulse-client";
import { formatDistanceToNow, isValid, parseISO } from "date-fns";

interface DeviceHeaderProps {
    device: Device;
    onRefresh?: () => void;
    onTerminal?: () => void;
}

export function DeviceHeader({ device, onRefresh, onTerminal }: DeviceHeaderProps) {

    // Helpers for icons and colors
    const getDeviceIcon = (type: DeviceType) => {
        switch (type) {
            case "server": return <Server className="h-6 w-6" />;
            case "workstation": return <Laptop className="h-6 w-6" />;
            case "network": return <Network className="h-6 w-6" />;
            case "iot": return <Cpu className="h-6 w-6" />;
            default: return <Laptop className="h-6 w-6" />;
        }
    };

    const getStatusColor = (status: DeviceStatus) => {
        switch (status) {
            case "online": return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
            case "offline": return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
            case "warning": return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
            case "maintenance": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
            default: return "bg-gray-500/10 text-gray-500";
        }
    };

    const getStatusLabel = (status: DeviceStatus) => {
        switch (status) {
            case "online": return "Online";
            case "offline": return "Offline";
            case "warning": return "Warning";
            case "maintenance": return "Maintenance";
            default: return "Unknown";
        }
    };

    const parseDate = (d: string | undefined) => {
        if (!d) return null;
        const date = parseISO(d);
        return isValid(date) ? date : null;
    };

    const lastSeenDate = parseDate(device.lastSeen);
    const lastSeen = lastSeenDate ? formatDistanceToNow(lastSeenDate, { addSuffix: true }) : "Never";

    // Uptime in domain is seconds (number)
    const uptimeStr = device.uptime ? `${Math.floor(device.uptime / 3600)}h ${Math.floor((device.uptime % 3600) / 60)}m` : "Unknown";

    return (
        <div className="flex flex-col gap-4 border-b border-border bg-card p-6">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary")}>
                        {getDeviceIcon(device.type)}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{device.name}</h1>
                            <Badge variant="outline" className={cn("border-0 font-medium", getStatusColor(device.status))}>
                                {getStatusLabel(device.status)}
                            </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">
                                    {device.osInfo?.name || "Unknown OS"}
                                </span>
                                {device.osInfo?.version && <span>{device.osInfo.version}</span>}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Activity className="h-4 w-4" />
                                <span>Seen {lastSeen}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>Uptime: {uptimeStr}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                                    {device.ip}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs text-muted-foreground">
                                    {device.macAddress}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        disabled={!device.rustdeskId}
                        onClick={() => {
                            if (device.rustdeskId) {
                                let url = `rustdesk://${device.rustdeskId}`;
                                if (device.rustdeskPassword) {
                                    url += `?password=${device.rustdeskPassword}`;
                                }
                                window.location.href = url;
                            }
                        }}
                    >
                        <Monitor className="mr-2 h-4 w-4" />
                        Remote Desktop
                    </Button>
                    <Button variant="outline" size="sm" onClick={onRefresh}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={onTerminal}>
                        <Terminal className="mr-2 h-4 w-4" />
                        Terminal
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Power className="mr-2 h-4 w-4" />
                                Actions
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Power Operations</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-orange-500 focus:text-orange-500 cursor-pointer"
                                onClick={async () => {
                                    if (confirm("Are you sure you want to reboot this device?")) {
                                        const jobId = await rmmService.rebootDevice(device.id);
                                        console.log("Reboot job created:", jobId);
                                    }
                                }}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reboot Device
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={async () => {
                                    if (confirm("Are you sure you want to SHUT DOWN this device?")) {
                                        const jobId = await rmmService.shutdownDevice(device.id);
                                        console.log("Shutdown job created:", jobId);
                                    }
                                }}
                            >
                                <Power className="mr-2 h-4 w-4" />
                                Shutdown Device
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Tags & Metadata */}
            <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-2">
                    {device.tags.length > 0 ? (
                        device.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="px-2 py-0 text-xs">
                                {tag}
                            </Badge>
                        ))
                    ) : (
                        <span className="text-sm text-muted-foreground italic">No tags</span>
                    )}
                </div>
            </div>
        </div>
    );
}
