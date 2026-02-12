"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
    rmmService as pulseService,
    Device,
    DeviceHeader,
    OverviewTab,
    HardwareTab,
    SoftwareTab,
    ServiceTab,
    ProcessTab,
    PatchesTab,
    FileExplorerTab
} from "@sent/feature-sent-msp";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sent/platform-ui";
import { AlertCircle, Terminal as TerminalIcon } from "lucide-react";

// Dynamically import Terminal with SSR disabled
const Terminal = dynamic(() => import("@sent/feature-sent-msp").then(m => m.Terminal), { ssr: false });

export default function DeviceDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const [device, setDevice] = useState<Device | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showTerminal, setShowTerminal] = useState(false);

    console.log("DeviceDetailPage rendering, device:", device); // Debug log


    const fetchDevice = async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const d = await pulseService.getDevice(id);
            if (d) {
                setDevice(d);
            } else {
                setError("Device not found");
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch device details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevice();
    }, [id]);

    if (loading) {
        return <div className="p-6">Loading device details...</div>;
    }

    if (error || !device) {
        return (
            <div className="p-6">
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <h5 className="font-medium leading-none tracking-tight">Error</h5>
                    </div>
                    <div className="mt-2 text-sm opacity-90">
                        {error || "Device not found"}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <DeviceHeader
                device={device}
                onRefresh={fetchDevice}
                onTerminal={() => setShowTerminal(!showTerminal)}
            />

            {showTerminal && (
                <div className="h-96 border-b border-border bg-black p-4 relative">
                    <div className="absolute top-2 right-2 z-10">
                        <button onClick={() => setShowTerminal(false)} className="text-white hover:text-gray-300">
                            Close
                        </button>
                    </div>
                    <Terminal sessionId={id} />
                </div>
            )}

            <div className="flex-1 p-6 space-y-6 overflow-auto">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="hardware">Hardware</TabsTrigger>
                        <TabsTrigger value="software">Software</TabsTrigger>
                        <TabsTrigger value="services">Services</TabsTrigger>
                        <TabsTrigger value="processes">Processes</TabsTrigger>
                        <TabsTrigger value="patches">Patches</TabsTrigger>
                        <TabsTrigger value="files">Files</TabsTrigger>
                        <TabsTrigger value="logs">Logs & Scripts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <OverviewTab device={device} />
                    </TabsContent>

                    <TabsContent value="hardware" className="mt-6">
                        <HardwareTab device={device} />
                    </TabsContent>

                    <TabsContent value="software" className="mt-6">
                        <SoftwareTab device={device} />
                    </TabsContent>

                    <TabsContent value="services" className="mt-6">
                        <ServiceTab deviceId={id} />
                    </TabsContent>

                    <TabsContent value="processes" className="mt-6">
                        <ProcessTab deviceId={id} />
                    </TabsContent>

                    <TabsContent value="patches" className="mt-6">
                        <PatchesTab deviceId={id} />
                    </TabsContent>

                    <TabsContent value="files" className="mt-6">
                        <FileExplorerTab deviceId={id} />
                    </TabsContent>

                    <TabsContent value="logs" className="mt-6">
                        <div className="border rounded-lg p-8 text-center text-muted-foreground bg-muted/20">
                            <TerminalIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
                            <p>Logs and Script history coming soon</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
