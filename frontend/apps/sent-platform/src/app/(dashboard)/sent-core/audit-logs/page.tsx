"use client";

import * as React from "react";
import {
    Calendar,
    ChevronDown,
    Clock,
    Download,
    FileText,
    Filter,
    Search,
    ShieldAlert,
    User
} from "lucide-react";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@sent/platform-ui";

interface AuditLog {
    id: string;
    action: string;
    actor: string;
    target: string;
    timestamp: string;
    status: "success" | "failure" | "warning";
    details: string;
}

const mockLogs: AuditLog[] = [
    { id: "log_1", action: "Tenant Creation", actor: "admin@sent.com", target: "Acme Corp", timestamp: "2024-03-10T14:30:00Z", status: "success", details: "Provisioned new tenant environment" },
    { id: "log_2", action: "Policy Update", actor: "system", target: "Global Security Policy", timestamp: "2024-03-10T14:25:00Z", status: "success", details: "Auto-applied patch KB40239 to all regions" },
    { id: "log_3", action: "Login Attempt", actor: "unknown", target: "Admin Console", timestamp: "2024-03-10T14:15:00Z", status: "failure", details: "Failed login from IP 192.168.1.105" },
    { id: "log_4", action: "User Suspension", actor: "support@sent.com", target: "user_123 (Initech)", timestamp: "2024-03-10T13:45:00Z", status: "success", details: "Suspended due to suspicious activity" },
    { id: "log_5", action: "Database Backup", actor: "system", target: "EU-Central-1 DB", timestamp: "2024-03-10T12:00:00Z", status: "success", details: "Daily snapshot completed" },
    { id: "log_6", action: "API Key Rotation", actor: "devops@sent.com", target: "Service Account A", timestamp: "2024-03-10T11:30:00Z", status: "warning", details: "Key rotated but legacy key still active for 1hr" },
    { id: "log_7", action: "Feature Flag Toggle", actor: "pm@sent.com", target: "Beta Dashboard", timestamp: "2024-03-10T10:15:00Z", status: "success", details: "Enabled for 5% of users" },
    { id: "log_8", action: "Tenant Deletion", actor: "admin@sent.com", target: "Test Corp", timestamp: "2024-03-09T16:00:00Z", status: "success", details: "Permanently removed test tenant" },
];

export default function AuditLogsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground">
                        Comprehensive record of all administrative actions and system events.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Calendar className="mr-2 h-4 w-4" />
                        Date Range
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>System Activity</CardTitle>
                        <div className="flex items-center gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search logs..." className="pl-8" />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filter
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuCheckboxItem checked>Success</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked>Failure</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked>Warning</DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Actor</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{log.action}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="h-3 w-3" />
                                            {log.actor}
                                        </div>
                                    </TableCell>
                                    <TableCell>{log.target}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                log.status === "success" ? "text-green-500 border-green-500 bg-green-500/10" :
                                                    log.status === "failure" ? "text-red-500 border-red-500 bg-red-500/10" :
                                                        "text-yellow-500 border-yellow-500 bg-yellow-500/10"
                                            }
                                        >
                                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right max-w-[300px] truncate" title={log.details}>
                                        {log.details}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
