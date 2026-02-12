"use client";

import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Database,
    HardDrive,
    MoreHorizontal,
    Plus,
    Search,
    Server,
    Shield,
    Users
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
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@sent/platform-ui";
import Link from "next/link";

export default function SentCoreDashboard() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
                    <p className="text-muted-foreground">
                        Global control plane for all SENT tenants and infrastructure.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Search className="mr-2 h-4 w-4" />
                        Search Tenant
                    </Button>
                    <Link href="/sent-core/partner-registration">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Onboard Partner
                        </Button>
                    </Link>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                            +2 from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Health</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">99.99%</div>
                        <p className="text-xs text-muted-foreground">
                            All regions operational
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Provisioning</CardTitle>
                        <Database className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">1</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting verification
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Platform Admins</CardTitle>
                        <Shield className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">
                            Active session count
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Organization Status Table - 4 Cols */}
                <Card className="col-span-full lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Tenant Organizations</CardTitle>
                        <CardDescription>
                            Recent activity and status of managed organizations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Region</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Acme Corp</TableCell>
                                    <TableCell>us-east-1</TableCell>
                                    <TableCell><Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/10">Active</Badge></TableCell>
                                    <TableCell>Enterprise</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>View Overview</DropdownMenuItem>
                                                <DropdownMenuItem>Manage Settings</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">Suspend Tenant</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Globex Inc</TableCell>
                                    <TableCell>eu-central-1</TableCell>
                                    <TableCell><Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/10">Active</Badge></TableCell>
                                    <TableCell>Professional</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>View Overview</DropdownMenuItem>
                                                <DropdownMenuItem>Manage Settings</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">Suspend Tenant</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Soylent Corp</TableCell>
                                    <TableCell>us-west-2</TableCell>
                                    <TableCell><Badge variant="outline" className="text-orange-500 border-orange-500 bg-orange-500/10">Provisioning</Badge></TableCell>
                                    <TableCell>Startup</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>View Overview</DropdownMenuItem>
                                                <DropdownMenuItem>Manage Settings</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">Cancel Provisioning</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Initech</TableCell>
                                    <TableCell>us-east-1</TableCell>
                                    <TableCell><Badge variant="outline" className="text-red-500 border-red-500 bg-red-500/10">Suspended</Badge></TableCell>
                                    <TableCell>Enterprise</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>View Overview</DropdownMenuItem>
                                                <DropdownMenuItem>Reactivate</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">Archive Data</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Infrastructure Status - 3 Cols */}
                <Card className="col-span-full lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Infrastructure Capacity</CardTitle>
                        <CardDescription>
                            Global resource utilization across all regions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Server className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Compute (vCPU)</span>
                                    </div>
                                    <span className="text-muted-foreground">412 / 600 Allocated</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: '68%' }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Storage (NVMe)</span>
                                    </div>
                                    <span className="text-muted-foreground">8.2 / 50 TB Used</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                    <div className="h-full bg-purple-500" style={{ width: '16%' }} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Database className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Database Connections</span>
                                    </div>
                                    <span className="text-muted-foreground">1,204 / 5,000</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                    <div className="h-full bg-green-500" style={{ width: '24%' }} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h4 className="text-sm font-medium mb-4">Recent Audit Events</h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 text-sm">
                                    <div className="mt-0.5 h-2 w-2 rounded-full bg-green-500 shrink-0" />
                                    <div>
                                        <p className="font-medium">New Tenant Provisioned</p>
                                        <p className="text-xs text-muted-foreground">Acme Corp was successfully created.</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">2 mins ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 text-sm">
                                    <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                    <div>
                                        <p className="font-medium">Backup Completed</p>
                                        <p className="text-xs text-muted-foreground">Daily snapshot for Region EU-Central-1.</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">15 mins ago</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 text-sm">
                                    <div className="mt-0.5 h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                                    <div>
                                        <p className="font-medium">Scaling Event</p>
                                        <p className="text-xs text-muted-foreground">Added 2 nodes to US-West-2 cluster.</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">1 hour ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
