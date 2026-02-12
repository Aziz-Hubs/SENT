"use client";

import { useEffect, useState } from "react";
import { ServiceItem } from "../../types";
import { pulseService } from "../../services/pulse-client";
import { Card, CardContent, CardHeader, CardTitle } from "@sent/platform-ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@sent/platform-ui";
import { Badge } from "@sent/platform-ui";
import { Button } from "@sent/platform-ui";
import { Input } from "@sent/platform-ui";
import { Play, Square, RotateCw, Search, RefreshCw, AlertCircle } from "lucide-react";

interface ServiceTabProps {
    deviceId: string;
}

export function ServiceTab({ deviceId }: ServiceTabProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await pulseService.listServices(deviceId);
            setServices(data);
        } catch (err: any) {
            setError(err.message || "Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, [deviceId]);

    const handleAction = async (serviceName: string, action: "start" | "stop" | "restart") => {
        setActionLoading(serviceName);
        try {
            if (action === "start") {
                await pulseService.startService(deviceId, serviceName);
            } else if (action === "stop") {
                await pulseService.stopService(deviceId, serviceName);
            } else if (action === "restart") {
                await pulseService.restartService(deviceId, serviceName);
            }
            // Ideally we should poll for job status or wait a bit, 
            // but for now let's just refresh after a purely optimistic delay or user refresh
            // Showing a toast would be good here.
        } catch (err: any) {
            console.error(`Failed to ${action} service`, err);
            // Show error toast
        } finally {
            setActionLoading(null);
        }
    };

    const filteredServices = services.filter(svc =>
        svc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        svc.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid gap-6">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search services..."
                        className="pl-9 w-full md:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="sm" onClick={fetchServices} className="flex items-center gap-2">
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>System Services ({filteredServices.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Display Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Start Type</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && services.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">Loading services...</TableCell>
                                    </TableRow>
                                ) : filteredServices.length > 0 ? (
                                    filteredServices.map((svc) => (
                                        <TableRow key={svc.name}>
                                            <TableCell className="font-medium">{svc.name}</TableCell>
                                            <TableCell>{svc.displayName}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={svc.status === "running" ? "default" : "secondary"}
                                                    className={svc.status === "stopped" ? "bg-muted text-muted-foreground" : ""}
                                                >
                                                    {svc.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{svc.startType}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    {svc.status !== "running" && (
                                                        <Button
                                                            variant="ghost" size="icon" title="Start"
                                                            disabled={!!actionLoading}
                                                            onClick={() => handleAction(svc.name, "start")}
                                                        >
                                                            <Play className="h-4 w-4 text-green-500" />
                                                        </Button>
                                                    )}
                                                    {svc.status === "running" && (
                                                        <Button
                                                            variant="ghost" size="icon" title="Stop"
                                                            disabled={!!actionLoading}
                                                            onClick={() => handleAction(svc.name, "stop")}
                                                        >
                                                            <Square className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost" size="icon" title="Restart"
                                                        disabled={!!actionLoading}
                                                        onClick={() => handleAction(svc.name, "restart")}
                                                    >
                                                        <RotateCw className={`h-4 w-4 text-blue-500 ${actionLoading === svc.name ? "animate-spin" : ""}`} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No services found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
