"use client";

import * as React from "react";
import {
    Map,
    Server,
    Cpu,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Globe
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Badge,
    Progress
} from "@sent/platform-ui";

export default function RegionsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Cloud Regions</h1>
                <p className="text-muted-foreground">
                    Physical infrastructure health and capacity across all availability zones.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Active Region: US-East-1 */}
                <Card className="border-t-4 border-t-green-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>US-East-1</CardTitle>
                            </div>
                            <Badge className="bg-green-500 hover:bg-green-600">Healthy</Badge>
                        </div>
                        <CardDescription>N. Virginia (Primary)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Compute Capacity</span>
                                <span className="font-mono">78%</span>
                            </div>
                            <Progress value={78} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Storage IOPS</span>
                                <span className="font-mono">45%</span>
                            </div>
                            <Progress value={45} className="h-2" />
                        </div>
                        <div className="pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Server className="h-3 w-3" />
                                142 Nodes
                            </div>
                            <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                24ms Latency
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Region: EU-Central-1 */}
                <Card className="border-t-4 border-t-green-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>EU-Central-1</CardTitle>
                            </div>
                            <Badge className="bg-green-500 hover:bg-green-600">Healthy</Badge>
                        </div>
                        <CardDescription>Frankfurt (GDPR)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Compute Capacity</span>
                                <span className="font-mono">42%</span>
                            </div>
                            <Progress value={42} className="h-2" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Storage IOPS</span>
                                <span className="font-mono">30%</span>
                            </div>
                            <Progress value={30} className="h-2" />
                        </div>
                        <div className="pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Server className="h-3 w-3" />
                                86 Nodes
                            </div>
                            <div className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                18ms Latency
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Warning Region: AP-Northeast-1 */}
                <Card className="border-t-4 border-t-yellow-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-muted-foreground" />
                                <CardTitle>AP-Northeast-1</CardTitle>
                            </div>
                            <Badge variant="outline" className="border-yellow-500 text-yellow-500">Degraded</Badge>
                        </div>
                        <CardDescription>Tokyo (Backup)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Compute Capacity</span>
                                <span className="font-mono text-yellow-500">92%</span>
                            </div>
                            <Progress value={92} className="h-2 bg-yellow-900/20" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Storage IOPS</span>
                                <span className="font-mono">60%</span>
                            </div>
                            <Progress value={60} className="h-2" />
                        </div>
                        <div className="pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Server className="h-3 w-3" />
                                45 Nodes
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                <AlertTriangle className="h-3 w-3" />
                                High Load
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Map Placeholder */}
            <Card className="bg-muted/30 border-dashed">
                <CardContent className="h-[400px] flex items-center justify-center flex-col gap-4 text-muted-foreground">
                    <Map className="h-16 w-16 opacity-20" />
                    <p>Interactive Connection Map (Leaflet/Mapbox) would render here.</p>
                </CardContent>
            </Card>
        </div>
    );
}
