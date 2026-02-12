"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Monitor,
    Server,
    Laptop,
    Search,
    Filter,
    MoreHorizontal,
    Terminal,
    RefreshCcw,
    Cpu,
    HardDrive
} from "lucide-react";
import {
    Device,
    DeviceStatus
} from "@sent/feature-sent-msp";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Input,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    cn
} from "@sent/platform-ui"; // Assuming Badge exists or I'll use standard css

interface DevicesTableProps {
    initialDevices: Device[];
}

export function DevicesTable({ initialDevices }: DevicesTableProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<DeviceStatus | "all">("all");

    const filteredDevices = initialDevices.filter(device => {
        const matchesSearch = device.name.toLowerCase().includes(search.toLowerCase()) ||
            device.client.toLowerCase().includes(search.toLowerCase()) ||
            device.ip.includes(search);
        const matchesStatus = statusFilter === "all" || device.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleRowClick = (deviceId: string) => {
        router.push(`/sent-msp/sent-pulse/devices/${deviceId}`);
    };

    return (
        <div className="space-y-4">
            {/* Filters Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex w-full sm:w-auto items-center gap-2">
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search devices, IP, or client..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Status: {statusFilter === "all" ? "All" : statusFilter}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setStatusFilter("online")}>Online</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("offline")}>Offline</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("warning")}>Warning</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex items-center gap-2">
                    <Button>Add Device</Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[50px]">

                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Device Name
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Status
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Client / Site
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                    Resources
                                </th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredDevices.map((device) => (
                                <tr
                                    key={device.id}
                                    onClick={() => handleRowClick(device.id)}
                                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                                >
                                    <td className="p-4 align-middle">
                                        {device.type === 'server' ? <Server className="h-4 w-4 text-muted-foreground" /> : <Laptop className="h-4 w-4 text-muted-foreground" />}
                                    </td>
                                    <td className="p-4 align-middle font-medium">
                                        <div className="flex flex-col">
                                            <span>{device.name}</span>
                                            <span className="text-xs text-muted-foreground text-nowrap">{device.os} {device.osVersion} • {device.ip}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className={cn(
                                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                            device.status === 'online' ? "border-transparent bg-green-500/15 text-green-700 hover:bg-green-500/25" :
                                                device.status === 'offline' ? "border-transparent bg-red-500/15 text-red-700 hover:bg-red-500/25" :
                                                    "border-transparent bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25"
                                        )}>
                                            {device.status}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{device.client}</span>
                                            <span className="text-xs text-muted-foreground">{device.site}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle w-[200px]">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <Cpu className="mr-1 h-3 w-3" /> CPU: {device.cpuUsage}%
                                            </div>
                                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full", device.cpuUsage > 90 ? "bg-red-500" : "bg-blue-500")}
                                                    style={{ width: `${device.cpuUsage}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                <HardDrive className="mr-1 h-3 w-3" /> RAM: {device.memoryUsage}%
                                            </div>
                                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full", device.memoryUsage > 90 ? "bg-red-500" : "bg-purple-500")}
                                                    style={{ width: `${device.memoryUsage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>
                                                    <Terminal className="mr-2 h-4 w-4" /> Connect (Terminal)
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Monitor className="mr-2 h-4 w-4" /> Remote Control
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    onClick={async () => {
                                                        try {
                                                            await import("@sent/feature-sent-msp").then(m => m.rmmService.rebootDevice(device.id));
                                                            // Optional: Show toast
                                                        } catch (e) {
                                                            console.error("Failed to reboot", e);
                                                        }
                                                    }}
                                                >
                                                    <RefreshCcw className="mr-2 h-4 w-4" /> Reboot Device
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="text-xs text-muted-foreground">
                Showing {filteredDevices.length} of {initialDevices.length} devices
            </div>
        </div>
    );
}
