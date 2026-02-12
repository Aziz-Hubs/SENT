import { useState } from "react";
import { Device } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@sent/platform-ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@sent/platform-ui";
import { Badge } from "@sent/platform-ui";

import { Input } from "@sent/platform-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sent/platform-ui";
import { AppWindow, Cpu, ShieldCheck, Search } from "lucide-react";
import { parseISO, isValid, format } from "date-fns";

interface SoftwareTabProps {
    device: Device;
}

export function SoftwareTab({ device }: SoftwareTabProps) {
    const [searchTerm, setSearchTerm] = useState("");

    // Filter Software
    const filteredSoftware = device.installedSoftware.filter(sw =>
        sw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sw.publisher.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter Processes
    const filteredProcesses = device.processes.filter(proc =>
        proc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proc.user.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return "-";
        const date = parseISO(dateStr);
        return isValid(date) ? format(date, "MMM dd, yyyy") : "-";
    };

    return (
        <div className="grid gap-6">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search software or processes..."
                        className="pl-9 w-full md:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="installed" className="w-full">
                <TabsList>
                    <TabsTrigger value="installed" className="flex items-center gap-2">
                        <AppWindow className="h-4 w-4" />
                        Installed Software
                        <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0.5 text-xs">
                            {device.installedSoftware.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="processes" className="flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        Running Processes
                        <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0.5 text-xs">
                            {device.processes.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="patches" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Patches & Updates
                        <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0.5 text-xs">
                            {device.patches.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="installed" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Installed Applications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Publisher</TableHead>
                                            <TableHead>Version</TableHead>
                                            <TableHead>Install Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSoftware.length > 0 ? (
                                            filteredSoftware.map((sw, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-medium">{sw.name}</TableCell>
                                                    <TableCell>{sw.publisher || "-"}</TableCell>
                                                    <TableCell>{sw.version || "-"}</TableCell>
                                                    <TableCell>
                                                        {formatDate(sw.installDate)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center md:h-24">
                                                    No software found matching filter or detected
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="processes" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Running Processes (Snapshot)</CardTitle>
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
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProcesses.length > 0 ? (
                                            filteredProcesses.map((proc, i) => (
                                                <TableRow key={i} className="hover:bg-muted/50">
                                                    <TableCell className="font-mono text-xs">{proc.pid}</TableCell>
                                                    <TableCell className="font-medium truncate max-w-[200px]" title={proc.name}>
                                                        {proc.name}
                                                    </TableCell>
                                                    <TableCell>{proc.user || "System"}</TableCell>
                                                    <TableCell className="text-right font-mono">{proc.cpu.toFixed(1)}%</TableCell>
                                                    <TableCell className="text-right font-mono">
                                                        {proc.memory.toFixed(1)} MB
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center md:h-24">
                                                    No processes found matching filter or detected
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="patches" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Patches & Updates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>KB ID</TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Severity</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Release Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {device.patches.length > 0 ? (
                                            device.patches.map((patch, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-mono text-xs font-medium">{patch.kbId}</TableCell>
                                                    <TableCell className="truncate max-w-[300px]" title={patch.title}>{patch.title}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={patch.severity === "critical" ? "destructive" : "outline"}>
                                                            {patch.severity}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={patch.status === "installed" ? "default" : "secondary"} className={patch.status === "missing" || patch.status === "failed" ? "text-yellow-500 border-yellow-500" : ""}>
                                                            {patch.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(patch.releaseDate)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center md:h-24 text-muted-foreground">
                                                    No patch information available
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
