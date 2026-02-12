"use client";

import { useState, useEffect } from "react";
import {
    Save,
    RefreshCw,
    ShieldAlert,
    Settings,
    Activity,
    HardDrive,
    Cpu,
    WifiOff
} from "lucide-react";
import {
    rmmService,
    PulseSettings
} from "@sent/feature-sent-msp";
import {
    Button,
    Input,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Label,
    Slider
} from "@sent/platform-ui";

export default function SettingsPage() {
    const [settings, setSettings] = useState<PulseSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await rmmService.getPulseSettings();
            setSettings({
                organizationId: data.organizationId,
                cpuThreshold: data.cpuThreshold,
                memoryThreshold: data.memoryThreshold,
                diskThreshold: data.diskThreshold,
                offlineThresholdMinutes: data.offlineThresholdMinutes,
            });
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            await rmmService.updatePulseSettings(settings);
            // Optionally show success toast
        } catch (error) {
            console.error("Failed to save settings:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="text-center p-12 text-muted-foreground">
                Failed to load settings. Please try again later.
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Pulse Settings</h1>
                    <p className="text-muted-foreground">Configure global monitoring thresholds for your organization.</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Resource Usage Thresholds */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Resource Thresholds
                        </CardTitle>
                        <CardDescription>
                            Alert when resource usage exceeds these percentages.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label className="flex items-center gap-2">
                                    <Cpu className="w-4 h-4" /> CPU Usage (%)
                                </Label>
                                <span className="text-sm font-medium">{settings.cpuThreshold}%</span>
                            </div>
                            <Slider
                                value={[settings.cpuThreshold]}
                                max={100}
                                step={1}
                                onValueChange={([val]) => setSettings({ ...settings, cpuThreshold: val })}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label className="flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Memory Usage (%)
                                </Label>
                                <span className="text-sm font-medium">{settings.memoryThreshold}%</span>
                            </div>
                            <Slider
                                value={[settings.memoryThreshold]}
                                max={100}
                                step={1}
                                onValueChange={([val]) => setSettings({ ...settings, memoryThreshold: val })}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label className="flex items-center gap-2">
                                    <HardDrive className="w-4 h-4" /> Disk Usage (%)
                                </Label>
                                <span className="text-sm font-medium">{settings.diskThreshold}%</span>
                            </div>
                            <Slider
                                value={[settings.diskThreshold]}
                                max={100}
                                step={1}
                                onValueChange={([val]) => setSettings({ ...settings, diskThreshold: val })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Availability Thresholds */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <WifiOff className="w-5 h-5 text-destructive" />
                            Availability Settings
                        </CardTitle>
                        <CardDescription>
                            Configure when a device is considered offline.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label>Offline Timeout (Minutes)</Label>
                            <div className="flex gap-4 items-center">
                                <Input
                                    type="number"
                                    value={settings.offlineThresholdMinutes}
                                    onChange={(e) => setSettings({ ...settings, offlineThresholdMinutes: parseInt(e.target.value) || 5 })}
                                    className="w-24"
                                />
                                <span className="text-sm text-muted-foreground">
                                    A device will trigger an "Offline" alert after this many minutes of inactivity.
                                </span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/30 pt-6">
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-warning mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium">Pro-active Monitoring</p>
                                <p className="text-muted-foreground">These thresholds apply to all devices in your organization immediately after saving.</p>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
