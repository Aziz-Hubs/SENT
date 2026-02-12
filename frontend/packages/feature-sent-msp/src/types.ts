export type DeviceStatus = "online" | "offline" | "warning" | "maintenance";
export type DeviceType = "server" | "workstation" | "network" | "iot";
export type OS = "windows" | "linux" | "macos";

export interface Device {
    id: string;
    organizationId?: string;
    siteId?: string;
    name: string;
    type: DeviceType;
    status: DeviceStatus;
    os: OS;
    osInfo?: OSInfo;
    osVersion: string;
    osEdition?: string; // e.g. "Pro", "Enterprise"
    ip: string;
    localIp?: string;
    macAddress?: string;
    lastSeen: string; // ISO date string
    uptime?: number; // seconds
    currentUser?: string;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    tags: string[];
    client: string;
    site: string;
    createdAt?: string;
    updatedAt?: string;

    // Hardware Info
    hardware?: HardwareInfo;
    networkInterfaces: NetworkInterface[];
    storageDrives: StorageDrive[];

    // Software & Security
    installedSoftware: InstalledSoftware[];
    processes: DeviceProcess[];
    patches: Patch[];
    auditLog: AuditLogEntry[];
    security?: SecurityPosture;

    // Remote Access
    rustdeskId?: string;
    rustdeskPassword?: string;
}

export interface OSInfo {
    name: string;
    version: string;
    build: string;
    architecture: string;
    platform: string;
}

export interface HardwareInfo {
    manufacturer: string;
    model: string;
    serialNumber: string;
    biosVersion: string;
    processorModel: string;
    processorCores: number;
    ramTotalBytes: number; // raw bytes from proto
    ramUsedBytes: number; // raw bytes from proto
    // Mapped helpers if needed, but keeping raw for now to match proto
    ramTotal?: number; // GB (optional helper)
    ramUsed?: number; // GB (optional helper)
}


export interface NetworkInterface {
    name: string;
    mac: string;
    status: "connected" | "disconnected" | "disabled";
    ip?: string;
}

export interface StorageDrive {
    letter: string;
    model: string;
    total: number; // GB
    used: number; // GB
    smartStatus: "ok" | "fail" | "warning";
}

export interface InstalledSoftware {
    name: string;
    publisher: string;
    version: string;
    installDate: string;
}

export interface DeviceProcess {
    pid: number;
    name: string;
    cpu: number; // %
    memory: number; // MB
    user: string;
}

export interface Patch {
    kbId: string;
    title: string;
    classification: "security" | "critical" | "service_pack" | "driver" | "other";
    severity: "critical" | "important" | "moderate" | "low";
    releaseDate: string;
    status: "installed" | "missing" | "failed";
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    user: string; // "System" or technician name
    category: "remote_control" | "script_run" | "alert_trigger" | "system_state";
    details: string;
}

export interface SecurityPosture {
    antivirus: {
        name: string;
        status: "active" | "snoozed" | "outdated" | "not_found";
    };
    firewall: boolean; // true = on
    encryption: boolean; // true = on (BitLocker/FileVault)
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface Alert {
    id: string;
    organizationId?: string;
    deviceId: string;
    deviceName: string;
    severity: AlertSeverity;
    title: string;
    description: string;
    timestamp: string; // ISO date string
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: string;
    resolved?: boolean;
    resolvedAt?: string;
}

export type ScriptLanguage = "powershell" | "bash" | "python";

export interface Script {
    id: string;
    name: string;
    description: string;
    language: ScriptLanguage;
    content?: string;
    lastRun?: string; // ISO date string or undefined
    successRate: number;
    tags: string[];
}

export interface Stats {
    totalDevices: number;
    online: number;
    offline: number;
    warning: number;
    criticalAlerts: number;
    healthScore: number;
}

export interface PulseSettings {
    organizationId: string;
    cpuThreshold: number;
    memoryThreshold: number;
    diskThreshold: number;
    offlineThresholdMinutes: number;
    updatedAt?: string;
}

export interface ServiceItem {
    name: string;
    displayName: string;
    status: string;
    startType: string;
}

export interface FileSystemEntry {
    name: string;
    path: string;
    isDirectory: boolean;
    sizeBytes: string | number | bigint;
    modTime: string;
}
