"use client";

import { useState } from "react";
import {
    AlertTriangle,
    CheckCircle,
    Info,
    Filter,
    Search,
    Check,
    Loader2
} from "lucide-react";
import {
    Alert,
    AlertSeverity,
    rmmService
} from "@sent/feature-sent-msp";
import {
    Button,
    Input,
    Badge,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    cn
} from "@sent/platform-ui";

interface AlertsFeedProps {
    initialAlerts: Alert[];
}

export function AlertsFeed({ initialAlerts }: AlertsFeedProps) {
    const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
    const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | "all">("all");
    const [showAcknowledged, setShowAcknowledged] = useState(false);
    const [acknowledging, setAcknowledging] = useState<string | null>(null);

    const filteredAlerts = alerts.filter(alert => {
        const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity;
        const matchesAck = showAcknowledged ? true : !alert.acknowledged;
        return matchesSeverity && matchesAck;
    });

    const handleAcknowledge = async (alertId: string) => {
        setAcknowledging(alertId);
        try {
            await rmmService.acknowledgeAlert(alertId);
            setAlerts(prev => prev.map(a =>
                a.id === alertId ? { ...a, acknowledged: true } : a
            ));
        } catch (error) {
            console.error("Failed to acknowledge alert:", error);
        } finally {
            setAcknowledging(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg border">
                <div className="flex items-center gap-2">
                    <Button
                        variant={filterSeverity === "all" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setFilterSeverity("all")}
                    >
                        All
                    </Button>
                    <Button
                        variant={filterSeverity === "critical" ? "destructive" : "ghost"}
                        size="sm"
                        onClick={() => setFilterSeverity("critical")}
                        className={filterSeverity === "critical" ? "" : "text-destructive hover:text-destructive"}
                    >
                        Critical
                    </Button>
                    <Button
                        variant={filterSeverity === "warning" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setFilterSeverity("warning")}
                        className={filterSeverity === "warning" ? "bg-yellow-500/20 text-yellow-700" : "text-yellow-600 hover:text-yellow-700"}
                    >
                        Warning
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAcknowledged(!showAcknowledged)}
                    >
                        {showAcknowledged ? "Hide Acknowledged" : "Show Acknowledged"}
                    </Button>
                </div>
            </div>

            {/* Feed */}
            <div className="space-y-2">
                {filteredAlerts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No alerts found matching your filters.
                    </div>
                )}

                {filteredAlerts.map(alert => (
                    <div
                        key={alert.id}
                        className={cn(
                            "flex flex-col sm:flex-row gap-4 p-4 rounded-lg border transition-all hover:bg-muted/30",
                            alert.severity === "critical" ? "border-l-4 border-l-destructive" :
                                alert.severity === "warning" ? "border-l-4 border-l-yellow-500" :
                                    "border-l-4 border-l-blue-500",
                            alert.acknowledged && "opacity-60 bg-muted/50"
                        )}
                    >
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{alert.title}</span>
                                {alert.acknowledged && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                        <Check className="w-3 h-3 mr-1" /> Acknowledged
                                    </span>
                                )}
                                <span className="text-xs text-muted-foreground ml-auto sm:ml-2">
                                    {new Date(alert.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <p className="text-sm text-foreground/80">
                                {alert.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                <span>Device: <span className="font-medium text-foreground">{alert.deviceName}</span></span>
                                <span>•</span>
                                <span>ID: {alert.id}</span>
                            </div>
                        </div>
                        <div className="flex sm:flex-col gap-2 justify-center sm:min-w-[120px]">
                            {!alert.acknowledged && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    disabled={acknowledging === alert.id}
                                    onClick={() => handleAcknowledge(alert.id)}
                                >
                                    {acknowledging === alert.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        "Acknowledge"
                                    )}
                                </Button>
                            )}
                            <Button size="sm" variant="ghost" className="w-full">
                                Create Ticket
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
