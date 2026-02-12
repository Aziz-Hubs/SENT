"use client";

import { useEffect, useState } from "react";
// import { Patch, PatchSeverity, PatchCategory, PatchStatus } from "../../gen/sentpulse/v1/pulse_pb";
import { pulseService } from "../../services/pulse-client";
import { Card, CardContent, CardHeader, CardTitle } from "@sent/platform-ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@sent/platform-ui";
import { Badge } from "@sent/platform-ui";
import { Button } from "@sent/platform-ui";
import { Input } from "@sent/platform-ui";
import { Search, RefreshCw, AlertCircle, Download, CheckCircle, Shield, AlertTriangle, Info } from "lucide-react";

interface PatchesTabProps {
    deviceId: string;
}

export function PatchesTab({ deviceId }: PatchesTabProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [patches, setPatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [installing, setInstalling] = useState<string[]>([]); // Array of patch IDs being installed

    const fetchPatches = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await pulseService.listPatches(deviceId);
            // Sort by severity (Critical first)
            const severityOrder: Record<string, number> = {
                critical: 4,
                important: 3,
                moderate: 2,
                low: 1,
            };
            const sorted = [...data].sort((a, b) => {
                const orderA = severityOrder[a.severity] || 0;
                const orderB = severityOrder[b.severity] || 0;
                return orderB - orderA;
            });
            setPatches(sorted);
        } catch (err: any) {
            setError(err.message || "Failed to load patches");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatches();
    }, [deviceId]);

    const handleInstall = async (patchId: string) => {
        setInstalling(prev => [...prev, patchId]);
        try {
            await pulseService.installPatches(deviceId, [patchId]);
        } catch (err: any) {
            console.error(`Failed to install patch ${patchId}`, err);
        } finally {
            setInstalling(prev => prev.filter(id => id !== patchId));
        }
    };

    const handleInstallAll = async () => {
        const toInstall = filteredPatches.filter(p => p.status === "missing").map(p => p.id);
        if (toInstall.length === 0) return;

        setInstalling(toInstall);
        try {
            await pulseService.installPatches(deviceId, toInstall);
        } catch (err: any) {
            console.error("Failed to install all patches", err);
        } finally {
            setInstalling([]);
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case "critical":
                return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Critical</Badge>;
            case "important":
                return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600 gap-1"><AlertCircle className="h-3 w-3" /> Important</Badge>;
            case "moderate":
                return <Badge variant="secondary" className="gap-1"><Info className="h-3 w-3" /> Moderate</Badge>;
            case "low":
                return <Badge variant="outline" className="gap-1">Low</Badge>;
            default:
                return <Badge variant="outline">{severity || "Unknown"}</Badge>;
        }
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case "security":
                return <Badge variant="outline" className="border-blue-500 text-blue-500 gap-1"><Shield className="h-3 w-3" /> Security</Badge>;
            case "critical":
                return <Badge variant="outline" className="border-red-500 text-red-500">Critical Update</Badge>;
            case "feature":
                return <Badge variant="outline" className="border-green-500 text-green-500">Feature</Badge>;
            case "drivers":
                return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Driver</Badge>;
            default:
                return <Badge variant="outline">{category || "Update"}</Badge>;
        }
    };

    const filteredPatches = patches.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const pendingInstallCount = filteredPatches.filter(p => p.status === "missing").length;

    return (
        <div className="grid gap-6">
            <div className="flex items-center gap-4 justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search patches (KB, Title)..."
                            className="pl-9 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchPatches} disabled={loading} className="gap-2">
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                {pendingInstallCount > 0 && (
                    <Button
                        size="sm"
                        onClick={handleInstallAll}
                        disabled={loading || installing.length > 0}
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Install All ({pendingInstallCount})
                    </Button>
                )}
            </div>

            {error && (
                <div className="p-4 border border-destructive/50 bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Available Updates ({filteredPatches.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>ID / Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && patches.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">Checking for updates...</TableCell>
                                    </TableRow>
                                ) : filteredPatches.length > 0 ? (
                                    filteredPatches.map((patch) => (
                                        <TableRow key={patch.id}>
                                            <TableCell>{getSeverityBadge(patch.severity)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{patch.title}</span>
                                                    <span className="text-xs text-muted-foreground">{patch.id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getCategoryBadge(patch.category)}</TableCell>
                                            <TableCell>
                                                {patch.sizeBytes && Number(patch.sizeBytes) > 0 ? (Number(patch.sizeBytes) / 1024 / 1024).toFixed(2) + " MB" : "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {patch.status === "installed" ? (
                                                    <Badge variant="outline" className="border-green-500 text-green-500 gap-1">
                                                        <CheckCircle className="h-3 w-3" /> Installed
                                                    </Badge>
                                                ) : (
                                                    <Button
                                                        variant="ghost" size="sm"
                                                        disabled={installing.includes(patch.id)}
                                                        onClick={() => handleInstall(patch.id)}
                                                        className="gap-1 h-8"
                                                    >
                                                        {installing.includes(patch.id) ? (
                                                            <>
                                                                <RefreshCw className="h-3 w-3 animate-spin" /> Installing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Download className="h-3 w-3" /> Install
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            No patches found. System is up to date.
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
