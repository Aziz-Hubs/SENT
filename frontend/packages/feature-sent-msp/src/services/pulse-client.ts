/**
 * SENTpulse ConnectRPC Client
 * 
 * This module provides a type-safe client for the SENTpulse DashboardService.
 * It wraps the generated ConnectRPC client and maps Proto types to Domain types
 * for seamless integration with the frontend.
 */

import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { Timestamp } from "@bufbuild/protobuf";
import { DashboardService, AgentService } from "../gen/sentpulse/v1/pulse_connect";

import {
    ScriptLanguage as ProtoScriptLanguage,
    AlertSeverity as ProtoAlertSeverity,
    DeviceStatus as ProtoDeviceStatus,
    DeviceType as ProtoDeviceType,
    OS as ProtoOS,
} from "../gen/sentpulse/v1/pulse_pb";
import type {
    Device as ProtoDevice,
    Script as ProtoScript,
    TelemetryPoint,
    PulseSettings as ProtoPulseSettings,
} from "../gen/sentpulse/v1/pulse_pb";
import type {
    Stats,
    Alert,
    AlertSeverity,
    Device,
    DeviceStatus,
    DeviceType,
    OS,
    Script,
    ScriptLanguage,
    PulseSettings,
} from "../types";

// API base URL - defaults to localhost in development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

// Create the transport
const transport = createConnectTransport({
    baseUrl: API_BASE_URL,
});

// Create the client
const client = createClient(DashboardService, transport);
export const agentClient = createClient(AgentService, transport);

/**
 * PulseService provides a high-level API for SENTpulse operations.
 * It abstracts the Proto/RPC details and returns domain objects.
 */
export class PulseService {
    private organizationId: string;

    constructor(organizationId: string) {
        this.organizationId = organizationId;
    }

    setOrganizationId(orgId: string) {
        this.organizationId = orgId;
    }

    /**
     * Get paginated list of devices
     */
    async getDevices(pageSize: number = 50, pageToken?: string): Promise<Device[]> {
        const response = await client.listDevices({
            organizationId: this.organizationId,
            pageSize,
            pageToken: pageToken || "",
        });

        return response.devices.map(d => this.mapDevice(d));
    }

    private mapDevice(d: ProtoDevice): Device {
        return {
            id: d.id,
            name: d.name,
            organizationId: this.organizationId,
            type: this.mapDeviceType(d.type),
            status: this.mapDeviceStatus(d.status),
            os: this.mapOS(d.os),
            osInfo: d.osInfo ? {
                name: d.osInfo.name,
                version: d.osInfo.version,
                build: d.osInfo.build,
                architecture: d.osInfo.architecture,
                platform: d.osInfo.platform,
            } : undefined,
            osVersion: d.osInfo?.version || "Unknown",
            osEdition: undefined,
            ip: d.ip,
            localIp: d.localIp,
            macAddress: d.macAddress,
            lastSeen: d.lastSeen ? d.lastSeen.toDate().toISOString() : new Date().toISOString(),
            uptime: d.uptime ? Number(d.uptime.seconds) : 0,

            client: d.client,
            site: d.site,
            createdAt: undefined,
            updatedAt: undefined,
            cpuUsage: d.cpuUsage,
            memoryUsage: d.memoryUsage,
            diskUsage: d.diskUsage,
            tags: d.tags,
            hardware: d.hardware ? {
                manufacturer: d.hardware.manufacturer,
                model: d.hardware.model,
                serialNumber: d.hardware.serialNumber,
                biosVersion: d.hardware.biosVersion,
                processorModel: d.hardware.processorModel,
                processorCores: d.hardware.processorCores,
                ramTotalBytes: Number(d.hardware.ramTotalBytes),
                ramUsedBytes: Number(d.hardware.ramUsedBytes),
            } : undefined,
            networkInterfaces: d.networkInterfaces.map(i => ({
                name: i.name,
                mac: i.macAddress,
                status: (i.status === "up" ? "connected" : "disconnected") as any,
                ip: i.ipV4,
            })),
            storageDrives: d.storageDrives.map(s => ({
                letter: s.name,
                model: s.model,
                total: Number(s.totalBytes) / (1024 * 1024 * 1024), // GB
                used: Number(s.usedBytes) / (1024 * 1024 * 1024), // GB
                smartStatus: s.smartStatus as any,
            })),
            installedSoftware: d.installedSoftware.map(s => ({
                name: s.name,
                publisher: s.publisher,
                version: s.version,
                installDate: s.installDate ? s.installDate.toDate().toISOString() : "",
            })),
            processes: d.processes.map(p => ({
                pid: p.pid,
                name: p.name,
                cpu: p.cpuPercent,
                memory: Number(p.memoryBytes) / (1024 * 1024), // MB
                user: p.user,
            })),
            patches: d.patches.map(p => ({
                kbId: p.kbId,
                title: p.title,
                classification: this.mapPatchCategory(p.category),
                severity: this.mapPatchSeverity(p.severity),
                releaseDate: p.releaseDate ? p.releaseDate.toDate().toISOString() : "",
                status: this.mapPatchStatus(p.status),
            })),

            auditLog: [],
            currentUser: d.currentUser,
            security: d.security ? {
                antivirus: {
                    name: d.security.antivirus?.name || "None",
                    status: (d.security.antivirus?.status || "not_found") as any,
                },
                firewall: d.security.firewallEnabled,
                encryption: d.security.encryptionEnabled,
            } : undefined,
            rustdeskId: d.rustdeskId,
            rustdeskPassword: d.rustdeskPassword,
        } as unknown as Device;
    }

    private mapPatchCategory(c: number): any {
        switch (c) {
            case 1: return "security";
            case 2: return "critical";
            case 3: return "feature";
            case 4: return "updates";
            case 5: return "drivers";
            default: return "other";
        }
    }

    private mapPatchSeverity(s: number): any {
        switch (s) {
            case 4: return "critical";
            case 3: return "important";
            case 2: return "moderate";
            case 1: return "low";
            default: return "low";
        }
    }

    private mapPatchStatus(s: number): any {
        switch (s) {
            case 2: return "installed";
            case 1: return "missing";
            case 3: return "failed";
            default: return "missing";
        }
    }

    private mapDeviceType(t: ProtoDeviceType): DeviceType {
        switch (t) {
            case ProtoDeviceType.SERVER: return "server";
            case ProtoDeviceType.WORKSTATION: return "workstation";
            case ProtoDeviceType.NETWORK: return "network";
            case ProtoDeviceType.IOT: return "iot";
            default: return "workstation";
        }
    }

    private mapDeviceStatus(s: ProtoDeviceStatus): DeviceStatus {
        switch (s) {
            case ProtoDeviceStatus.ONLINE: return "online";
            case ProtoDeviceStatus.OFFLINE: return "offline";
            case ProtoDeviceStatus.WARNING: return "warning";
            case ProtoDeviceStatus.MAINTENANCE: return "maintenance";
            default: return "offline";
        }
    }

    private mapOS(os: ProtoOS): OS {
        switch (os) {
            case ProtoOS.OS_WINDOWS: return "windows";
            case ProtoOS.OS_LINUX: return "linux";
            case ProtoOS.OS_MACOS: return "macos";
            case ProtoOS.OS_UNSPECIFIED: return "windows"; // fallback
            default: return "windows";
        }
    }

    /**
     * Get a single device by ID
     */
    async getDevice(deviceId: string): Promise<Device | undefined> {
        try {
            const response = await client.getDevice({ deviceId });
            return this.mapDevice(response);
        } catch (e) {
            console.error("Failed to get device", e);
            return undefined;
        }
    }

    /**
     * Get aggregated statistics
     */
    async getStats(): Promise<Stats> {
        const response = await client.getStats({
            organizationId: this.organizationId,
        });
        return {
            totalDevices: response.totalDevices,
            online: response.online,
            offline: response.offline,
            warning: response.warning,
            criticalAlerts: response.criticalAlerts,
            healthScore: response.healthScore,
        };
    }

    /**
     * Get list of alerts
     */
    async getAlerts(limit?: number, unresolvedOnly: boolean = false): Promise<Alert[]> {
        const response = await client.listAlerts({
            organizationId: this.organizationId,
            limit,
            unresolvedOnly,
            pageSize: limit || 20,
        });
        return response.alerts.map(a => ({
            id: a.id,
            organizationId: this.organizationId,
            deviceId: a.deviceId,
            deviceName: a.deviceName,
            severity: this.mapAlertSeverity(a.severity),
            title: a.title,
            description: a.description,
            timestamp: a.timestamp ? a.timestamp.toDate().toISOString() : new Date().toISOString(),
            acknowledged: a.acknowledged,
        }));
    }

    private mapAlertSeverity(severity: ProtoAlertSeverity): AlertSeverity {
        switch (severity) {
            case ProtoAlertSeverity.CRITICAL:
                return "critical";
            case ProtoAlertSeverity.WARNING:
                return "warning";
            case ProtoAlertSeverity.INFO:
                return "info";
            default:
                return "info";
        }
    }

    /**
     * Acknowledge an alert
     */
    async acknowledgeAlert(alertId: string): Promise<void> {
        await client.acknowledgeAlert({ alertId });
    }

    /**
     * Get list of scripts
     */
    async getScripts(): Promise<Script[]> {
        const response = await client.listScripts({
            organizationId: this.organizationId,
        });
        return response.scripts.map(s => this.mapScript(s));
    }

    private mapScript(s: ProtoScript): Script {
        return {
            id: s.id,
            name: s.name,
            description: s.description,
            language: this.mapScriptLanguage(s.language),
            lastRun: s.lastRun ? s.lastRun.toDate().toISOString() : undefined,
            successRate: s.successRate,
            tags: s.tags,
            content: undefined, // Proto list doesn't include content? Check proto. If implicit, undefined.
            // Proto Script message has no content field in lines 302-310 (Step 4610).
            // So content is undefined.
        };
    }

    private mapScriptLanguage(l: ProtoScriptLanguage): ScriptLanguage {
        switch (l) {
            case ProtoScriptLanguage.POWERSHELL: return "powershell";
            case ProtoScriptLanguage.BASH: return "bash";
            case ProtoScriptLanguage.PYTHON: return "python";
            default: return "powershell";
        }
    }

    /**
     * Reboot a device
     */
    async rebootDevice(deviceId: string): Promise<string> {
        const response = await client.rebootDevice({ deviceId });
        return response.jobId;
    }

    /**
     * Shutdown a device
     */
    async shutdownDevice(deviceId: string): Promise<string> {
        const response = await client.shutdownDevice({ deviceId });
        return response.jobId;
    }

    /**
     * Run a script on a device
     */
    async runScript(deviceId: string, scriptId?: string, inlineScript?: string, language?: "powershell" | "bash" | "python"): Promise<string> {
        let protoLanguage = ProtoScriptLanguage.POWERSHELL;
        if (language === "bash") protoLanguage = ProtoScriptLanguage.BASH;
        if (language === "python") protoLanguage = ProtoScriptLanguage.PYTHON;

        const response = await client.runScript({
            deviceId,
            scriptId,
            inlineScript,
            language: protoLanguage
        });
        return response.jobId;
    }

    /**
     * Get historical telemetry for a device
     */
    async getDeviceTelemetry(deviceId: string, startTime?: Date, endTime?: Date): Promise<TelemetryPoint[]> {
        const response = await client.getDeviceTelemetry({
            deviceId,
            startTime: startTime ? Timestamp.fromDate(startTime) : undefined,
            endTime: endTime ? Timestamp.fromDate(endTime) : undefined,
        });
        return response.points.map(p => ({
            time: p.time ? p.time.toDate().toISOString() : new Date().toISOString(),
            cpuUsage: p.cpuUsage,
            memoryUsage: p.memoryUsage,
            diskUsage: p.diskUsage,
        })) as any;
    }

    /**
     * Get monitoring settings for the organization
     */
    async getPulseSettings(): Promise<PulseSettings> {
        const response = await client.getPulseSettings({
            organizationId: this.organizationId,
        });
        return this.mapPulseSettings(response);
    }

    /**
     * Update monitoring settings
     */
    async updatePulseSettings(settings: PulseSettings): Promise<PulseSettings> {
        // Convert Domain settings to Proto settings (Partial)
        const protoSettings = {
            organizationId: settings.organizationId,
            cpuThreshold: settings.cpuThreshold,
            memoryThreshold: settings.memoryThreshold,
            diskThreshold: settings.diskThreshold,
            offlineThresholdMinutes: settings.offlineThresholdMinutes,
            // updatedAt is usually server-managed on update, but if we pass it:
            updatedAt: settings.updatedAt ? Timestamp.fromDate(new Date(settings.updatedAt)) : undefined,
        } as ProtoPulseSettings; // Cast as it matches shape mostly

        const response = await client.updatePulseSettings({
            settings: protoSettings,
        });
        return this.mapPulseSettings(response.settings!);
    }

    private mapPulseSettings(s: ProtoPulseSettings): PulseSettings {
        return {
            organizationId: s.organizationId,
            cpuThreshold: s.cpuThreshold,
            memoryThreshold: s.memoryThreshold,
            diskThreshold: s.diskThreshold,
            offlineThresholdMinutes: s.offlineThresholdMinutes,
            updatedAt: s.updatedAt ? s.updatedAt.toDate().toISOString() : undefined,
        };
    }

    /**
     * Get list of services
     */
    async listServices(deviceId: string): Promise<any[]> {
        const response = await client.listServices({
            deviceId,
        });
        return response.services.map(s => ({
            name: s.name,
            displayName: s.displayName,
            status: s.status,
            startType: s.startType,
            description: s.description,
        }));
    }

    /**
     * Start a service
     */
    async startService(deviceId: string, serviceName: string): Promise<string> {
        const response = await client.startService({
            deviceId,
            serviceName,
        });
        return response.jobId;
    }

    /**
     * Stop a service
     */
    async stopService(deviceId: string, serviceName: string): Promise<string> {
        const response = await client.stopService({
            deviceId,
            serviceName,
        });
        return response.jobId;
    }

    /**
     * Restart a service
     */
    async restartService(deviceId: string, serviceName: string): Promise<string> {
        const response = await client.restartService({
            deviceId,
            serviceName,
        });
        return response.jobId;
    }

    /**
     * Get list of processes
     */
    async listProcesses(deviceId: string): Promise<any[]> {
        const response = await client.listProcesses({
            deviceId,
        });
        return response.processes.map(p => ({
            pid: p.pid,
            name: p.name,
            cpuPercent: p.cpuPercent,
            memoryBytes: Number(p.memoryBytes),
            user: p.user,
            status: p.status,
        }));
    }

    /**
     * Kill a process
     */
    async killProcess(deviceId: string, pid: number): Promise<string> {
        const response = await client.killProcess({
            deviceId,
            pid,
        });
        return response.jobId;
    }

    /**
     * Get list of patches
     */
    async listPatches(deviceId: string): Promise<any[]> {
        const response = await client.listPatches({
            deviceId,
        });
        return response.patches.map(p => ({
            id: p.id,
            kbId: p.kbId,
            title: p.title,
            description: p.description,
            severity: p.severity,
            category: p.category,
            sizeBytes: Number(p.sizeBytes),
            releaseDate: p.releaseDate ? p.releaseDate.toDate().toISOString() : "",
            installDate: p.installDate ? p.installDate.toDate().toISOString() : "",
            status: p.status,
        }));
    }

    /**
     * Install patches
     */
    async installPatches(deviceId: string, patchIds: string[]): Promise<string> {
        const response = await client.installPatches({
            deviceId,
            patchIds,
        });
        return response.jobId;
    }

    /**
     * List directory contents
     */
    async listDirectory(deviceId: string, path: string): Promise<any> {
        const response = await client.listDirectory({
            deviceId,
            path,
        });
        return {
            entries: response.entries.map(e => ({
                name: e.name,
                path: e.path,
                sizeBytes: Number(e.sizeBytes),
                isDirectory: e.isDirectory,
                modTime: e.modTime ? e.modTime.toDate().toISOString() : "",
                mode: e.mode,
            })),
            currentPath: response.currentPath,
            parentPath: response.parentPath,
        };
    }

    /**
     * Read a file from the device
     */
    async readFile(deviceId: string, path: string): Promise<{ content: Uint8Array, sizeBytes: number, mimeType: string }> {
        const response = await client.readFile({
            deviceId,
            path,
        });
        return {
            content: response.content,
            sizeBytes: Number(response.sizeBytes),
            mimeType: response.mimeType,
        };
    }
}


// Default singleton instance for dev/testing
// In a real app, you'd likely use a hook to get the service with the correct context-provided org ID
export const pulseService = new PulseService(process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || "42318d05-0d38-4fc7-9163-4ba8565d68f0");
