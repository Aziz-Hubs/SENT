"use client";

import * as React from "react";
import {
    Database,
    HardDrive,
    Activity,
    CheckCircle2,
    Search,
    RefreshCw
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Badge,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Input
} from "@sent/platform-ui";

export default function DatabasesPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Database Clusters</h1>
                <p className="text-muted-foreground">
                    Management of the Multi-Tenant Persistence Layer (PostgreSQL + TimescaleDB).
                </p>
            </div>

            {/* Core Systems */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-blue-500/5 border-blue-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-medium">Platform Catalog (sent_platform)</CardTitle>
                            <CardDescription>Central Tenant Registry & Routing</CardDescription>
                        </div>
                        <Database className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                            <Badge className="bg-green-500 hover:bg-green-600">Operational</Badge>
                            <span className="text-sm text-muted-foreground">Uptime: 99.99%</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Connections</p>
                                <p className="font-mono font-bold">452/1000</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Cache Hit</p>
                                <p className="font-mono font-bold">98.2%</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Size</p>
                                <p className="font-mono font-bold">12 GB</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-purple-500/5 border-purple-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-medium">Identity Store (ZITADEL)</CardTitle>
                            <CardDescription>Authentication & Authorization Data</CardDescription>
                        </div>
                        <HardDrive className="h-5 w-5 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                            <Badge className="bg-green-500 hover:bg-green-600">Operational</Badge>
                            <span className="text-sm text-muted-foreground">CockroachDB Cluster</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Nodes</p>
                                <p className="font-mono font-bold">3</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Replication</p>
                                <p className="font-mono font-bold">Sync</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Events</p>
                                <p className="font-mono font-bold">1.2M</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tenant Shards */}
            <Card>
                <CardHeader>
                    <CardTitle>Tenant Database Shards</CardTitle>
                    <CardDescription>Individual isolated databases per tenant organization.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search database name..." className="pl-8" />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Database Name</TableHead>
                                <TableHead>Assigned Org</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>IOPS</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-mono">tenant_db_acme_01</TableCell>
                                <TableCell>Acme Corp</TableCell>
                                <TableCell><Badge variant="outline" className="text-green-500 border-green-500">Online</Badge></TableCell>
                                <TableCell>145 GB</TableCell>
                                <TableCell>Low</TableCell>
                                <TableCell className="text-right"><RefreshCw className="h-4 w-4 ml-auto text-muted-foreground cursor-pointer hover:text-foreground" /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-mono">tenant_db_globex_04</TableCell>
                                <TableCell>Globex Inc</TableCell>
                                <TableCell><Badge variant="outline" className="text-green-500 border-green-500">Online</Badge></TableCell>
                                <TableCell>24 GB</TableCell>
                                <TableCell>Idle</TableCell>
                                <TableCell className="text-right"><RefreshCw className="h-4 w-4 ml-auto text-muted-foreground cursor-pointer hover:text-foreground" /></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-mono">tenant_db_start_99</TableCell>
                                <TableCell>TechStart Jordan</TableCell>
                                <TableCell><Badge variant="outline" className="text-blue-500 border-blue-500 animate-pulse">Provisioning</Badge></TableCell>
                                <TableCell>0.1 GB</TableCell>
                                <TableCell>High</TableCell>
                                <TableCell className="text-right"><RefreshCw className="h-4 w-4 ml-auto text-muted-foreground cursor-pointer hover:text-foreground" /></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
