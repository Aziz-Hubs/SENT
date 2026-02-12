"use client";

import { useEffect, useState } from "react";
import { DeviceProcess } from "../../types";
import { pulseService } from "../../services/pulse-client";
import { Card, CardContent, CardHeader, CardTitle } from "@sent/platform-ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@sent/platform-ui";

import { Button } from "@sent/platform-ui";
import { Input } from "@sent/platform-ui";
import { Trash2, Search, RefreshCw, AlertCircle } from "lucide-react";

interface ProcessTabProps {
    deviceId: string;
}

export function ProcessTab({ deviceId }: ProcessTabProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [processes, setProcesses] = useState<DeviceProcess[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchProcesses = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await pulseService.listProcesses(deviceId);
            setProcesses(data);
        } catch (err: any) {
            setError(err.message || "Failed to load processes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProcesses();
    }, [deviceId]);

    const handleKill = async (pid: number) => {
        setActionLoading(pid);
        try {
            await pulseService.killProcess(deviceId, pid);
            // Ideally wait or poll job
        } catch (err: any) {
            console.error(`Failed to kill process ${pid}`, err);
            // Show error toast
        } finally {
            setActionLoading(null);
        }
    };

    const filteredProcesses = processes.filter(proc =>
        proc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.pid.toString().includes(searchTerm)
    );

    return (
        <div className="grid gap-6">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search processes..."
                        className="pl-9 w-full md:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="sm" onClick={fetchProcesses} className="flex items-center gap-2">
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
                    <CardTitle>Running Processes ({filteredProcesses.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>PID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">CPU %</TableHead>
                                    <TableHead className="text-right">Memory</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && processes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">Loading processes...</TableCell>
                                    </TableRow>
                                ) : filteredProcesses.length > 0 ? (
                                    filteredProcesses.map((proc) => (
                                        <TableRow key={proc.pid}>
                                            <TableCell className="font-mono text-xs">{proc.pid}</TableCell>
                                            <TableCell className="font-medium truncate max-w-[200px]" title={proc.name}>
                                                {proc.name}
                                            </TableCell>
                                            <TableCell>{proc.user || "System"}</TableCell>
                                            <TableCell className="text-right font-mono">{proc.cpu.toFixed(1)}%</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {proc.memory.toFixed(1)} MB
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost" size="icon" title="Kill Process"
                                                    disabled={!!actionLoading}
                                                    onClick={() => handleKill(proc.pid)}
                                                    className="text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No processes found
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
