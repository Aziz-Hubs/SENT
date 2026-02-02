import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi } from "lucide-react";
import { PulseService } from "@/lib/api/services";

export default function PulseDashboard() {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await PulseService.GetDevices();
                setDevices(data || []);
            } catch (e) {
                console.error("Failed to load devices", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const onlineCount = devices.filter(d => d.status === 'online').length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Pulse</h2>
                    <p className="text-muted-foreground">RMM and Device Monitoring.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
                        <Wifi className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "..." : onlineCount}</div>
                        <p className="text-xs text-muted-foreground">Across your entire fleet</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
