
// Lucide icons removed as they are not used in the service layer

// --- Types ---

import {
    Device,
    DeviceStatus,
    DeviceType,
    OS,
    Alert,
    AlertSeverity,
    Script,
    Stats,
    NetworkInterface,
    StorageDrive,
    InstalledSoftware,
    DeviceProcess,
    Patch,
    AuditLogEntry,
    SecurityPosture
} from "../types";

// Re-export types for backward compatibility if needed, or rely on index.ts
export type {
    Device,
    DeviceStatus,
    DeviceType,
    OS,
    Alert,
    AlertSeverity,
    Script,
    Stats,
    NetworkInterface,
    StorageDrive,
    InstalledSoftware,
    DeviceProcess,
    Patch,
    AuditLogEntry,
    SecurityPosture
};


// --- Mock Data Generators ---

const CLIENTS = ["Acme Corp", "Globex", "Soylent Corp", "Umbrella", "Stark Ind"];
const SITES = ["HQ", "Branch A", "Remote", "Data Center"];
const OS_VERSIONS = {
    windows: ["Server 2022", "Server 2019", "Windows 11", "Windows 10"],
    linux: ["Ubuntu 22.04", "Debian 12", "CentOS 9"],
    macos: ["Sonoma", "Ventura", "Monterey"]
};

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateDevices(count: number): Device[] {
    return Array.from({ length: count }).map((_, i) => {
        const type = randomItem<DeviceType>(["server", "workstation", "workstation", "server"]);
        const os = type === "server" ? randomItem<OS>(["windows", "linux"]) : randomItem<OS>(["windows", "macos"]);
        const status = Math.random() > 0.85 ? (Math.random() > 0.5 ? "offline" : "warning") : "online";
        const manufacturer = randomItem(["Dell", "HP", "Lenovo", "Apple"]);
        const model = manufacturer === "Apple" ? "MacBook Pro" : randomItem(["Latitude 7420", "ThinkPad X1", "ProLiant DL380"]);
        const ramTotal = randomItem([8, 16, 32, 64]);

        return {
            id: `dev-${1000 + i}`,
            name: `${type.toUpperCase()}-${randomInt(100, 999)}`,
            type,
            status,
            os,
            osVersion: randomItem(OS_VERSIONS[os]),
            osEdition: os === "windows" ? "Pro" : undefined,
            ip: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
            localIp: `10.0.${randomInt(1, 255)}.${randomInt(1, 255)}`,
            macAddress: `00:1A:2B:3C:4D:${randomInt(10, 99)}`,
            currentUser: Math.random() > 0.3 ? "jdoe" : undefined,
            uptime: randomInt(3600, 3600 * 24 * 30),
            lastSeen: new Date(Date.now() - randomInt(0, 10000000)).toISOString(),
            cpuUsage: randomInt(5, 95),
            memoryUsage: randomInt(20, 90),
            diskUsage: randomInt(10, 98),
            tags: [randomItem(["Production", "Dev", "Test"]), randomItem(["Priority:High", "Priority:Low"])],
            client: randomItem(CLIENTS),
            site: randomItem(SITES),
            manufacturer,
            model,
            serialNumber: `SN${randomInt(100000, 999999)}`,
            biosVersion: "1.2.3",
            processor: "Intel Core i7-1185G7 @ 3.00GHz",
            ramTotal,
            ramUsed: Math.round(ramTotal * (randomInt(20, 90) / 100)),
            networkInterfaces: [
                { name: "Ethernet", mac: `00:1A:2B:3C:4D:${randomInt(10, 99)}`, status: "connected", ip: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}` }
            ],
            storageDrives: [
                { letter: "C:", model: "NVMe Samsung 980", total: 512, used: randomInt(100, 400), smartStatus: "ok" }
            ],
            installedSoftware: Array.from({ length: 5 }).map((_, j) => ({
                name: `App ${j}`,
                publisher: "Vendor Inc",
                version: "1.0.0",
                installDate: "2023-01-01"
            })),
            processes: Array.from({ length: 10 }).map((_, j) => ({
                pid: randomInt(1000, 9999),
                name: `process-${j}.exe`,
                cpu: randomInt(0, 10),
                memory: randomInt(10, 500),
                user: "system"
            })),
            patches: [
                { kbId: "KB500123", title: "Cumulative Update", classification: "security", severity: "critical", releaseDate: "2023-10-10", status: Math.random() > 0.2 ? "installed" : "missing" }
            ],
            security: {
                antivirus: { name: "Windows Defender", status: "active" },
                firewall: true,
                encryption: true
            },
            auditLog: [
                { id: `log-${i}`, timestamp: new Date().toISOString(), user: "admin", category: "remote_control", details: "Initiated session" }
            ]
        };
    });
}

function generateAlerts(devices: Device[], count: number): Alert[] {
    const titles = [
        "High CPU Usage",
        "Disk Space Low",
        "Service Stopped",
        "Backup Failed",
        "Unusual Network Activity",
        "Patch Installation Failed"
    ];

    return Array.from({ length: count }).map((_, i) => {
        const device = randomItem(devices);
        const severity = randomItem<AlertSeverity>(["critical", "warning", "info"]);

        return {
            id: `alert-${5000 + i}`,
            deviceId: device.id,
            deviceName: device.name,
            severity,
            title: randomItem(titles),
            description: `Detected issue on ${device.name}. Immediate attention suggested.`,
            timestamp: new Date(Date.now() - randomInt(0, 86400000 * 2)).toISOString(),
            acknowledged: Math.random() > 0.7,
        };
    });
}

const MOCK_SCRIPTS: Script[] = [
    { id: "scr-1", name: "Clean Temp Files", description: "Removes temporary files from user profiles.", language: "powershell", lastRun: "2024-03-10T10:00:00Z", successRate: 98, tags: ["maintenance", "disk"] },
    { id: "scr-2", name: "Restart Spooler", description: "Restarts the Print Spooler service.", language: "powershell", lastRun: "2024-03-12T14:30:00Z", successRate: 100, tags: ["service", "fix"] },
    { id: "scr-3", name: "Update Docker", description: "Updates Docker packages via apt-get.", language: "bash", lastRun: "2024-03-11T02:00:00Z", successRate: 90, tags: ["update", "linux"] },
    { id: "scr-4", name: "Check Disk Health", description: "Runs SMART check analysis.", language: "python", lastRun: "2024-03-09T08:15:00Z", successRate: 95, tags: ["diagnostic", "hardware"] },
];

// --- Service Class ---

export class MockRmmService {
    private static _instance: MockRmmService;
    private _devices: Device[];
    private _alerts: Alert[];

    private constructor() {
        this._devices = generateDevices(50);
        this._alerts = generateAlerts(this._devices, 20);
    }

    public static getInstance(): MockRmmService {
        if (!this._instance) {
            this._instance = new MockRmmService();
        }
        return this._instance;
    }

    async getDevices(): Promise<Device[]> {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
        return [...this._devices];
    }

    async getDeviceById(id: string): Promise<Device | undefined> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return this._devices.find(d => d.id === id);
    }

    async getAlerts(limit?: number): Promise<Alert[]> {
        await new Promise(resolve => setTimeout(resolve, 400));
        const sorted = [...this._alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return limit ? sorted.slice(0, limit) : sorted;
    }

    async getStats() {
        await new Promise(resolve => setTimeout(resolve, 300));
        const online = this._devices.filter(d => d.status === "online").length;
        const offline = this._devices.filter(d => d.status === "offline").length;
        const warning = this._devices.filter(d => d.status === "warning").length;
        const criticalAlerts = this._alerts.filter(a => a.severity === "critical" && !a.acknowledged).length;

        return {
            totalDevices: this._devices.length,
            online,
            offline,
            warning,
            criticalAlerts,
            healthScore: Math.round((online / this._devices.length) * 100),
        };
    }

    async getScripts(): Promise<Script[]> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [...MOCK_SCRIPTS];
    }
}

export const rmmService = MockRmmService.getInstance();
