"use client";


import { Device } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@sent/platform-ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@sent/platform-ui";
import { Badge } from "@sent/platform-ui";
import { Cpu, HardDrive, Network } from "lucide-react";

interface HardwareTabProps {
    device: Device;
}

export function HardwareTab({ device }: HardwareTabProps) {
    const hw = device.hardware;

    const formatBytes = (bytes: number | undefined) => {
        if (!bytes) return "0 GB";
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    };

    return (
        <div className="grid gap-6">

            {/* CPU & Memory Details */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    <CardTitle>Processor & Memory</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Manufacturer</span>
                        <p className="font-medium">{hw?.manufacturer || "Unknown"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Model</span>
                        <p className="font-medium">{hw?.model || "Unknown"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Processor</span>
                        <p className="font-medium">{hw?.processorModel || "Unknown"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Cores</span>
                        <p className="font-medium">{hw?.processorCores || "Unknown"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Serial Number</span>
                        <p className="font-medium">{hw?.serialNumber || "Unknown"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">BIOS Version</span>
                        <p className="font-medium">{hw?.biosVersion || "Unknown"}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Total RAM</span>
                        <p className="font-medium">
                            {formatBytes(hw?.ramTotalBytes)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Storage Drives */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    <CardTitle>Storage Drives</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Used</TableHead>
                                <TableHead>Free</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {device.storageDrives.length > 0 ? (
                                device.storageDrives.map((drive, i) => {
                                    const totalGB = drive.total;
                                    const usedGB = drive.used;
                                    const freeGB = totalGB - usedGB;
                                    const percent = totalGB > 0 ? (usedGB / totalGB) * 100 : 0;

                                    return (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{drive.letter}</TableCell>
                                            <TableCell>{drive.model || "Unknown"}</TableCell>
                                            <TableCell>{totalGB.toFixed(1)} GB</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span>{usedGB.toFixed(1)} GB</span>
                                                    <div className="h-1.5 w-full rounded-full bg-secondary">
                                                        <div
                                                            className="h-full rounded-full bg-primary"
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{freeGB.toFixed(1)} GB</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={drive.smartStatus === "fail" ? "text-red-500 border-red-500" : "text-green-500 border-green-500"}>
                                                    {drive.smartStatus || "OK"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No storage drives detected
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Network Interfaces */}
            <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                    <Network className="h-5 w-5" />
                    <CardTitle>Network Interfaces</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>MAC Address</TableHead>
                                <TableHead>IP</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {device.networkInterfaces.length > 0 ? (
                                device.networkInterfaces.map((nic, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{nic.name}</TableCell>
                                        <TableCell className="font-mono text-xs">{nic.mac}</TableCell>
                                        <TableCell className="font-mono text-xs">{nic.ip}</TableCell>
                                        <TableCell>
                                            <Badge variant={nic.status === "connected" ? "default" : "secondary"}>
                                                {nic.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No network interfaces detected
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
