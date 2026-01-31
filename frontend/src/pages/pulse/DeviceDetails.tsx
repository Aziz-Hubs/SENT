import React, { useState } from "react";
import SystemActivityChart from "./SystemActivityChart";
import {
  Activity,
  ArrowLeft,
  Terminal,
  Cpu,
  HardDrive,
  MemoryStick, // Changed from Memory to MemoryStick if Memory is not available or checking import
  MoreVertical,
  Play,
  RotateCcw,
  Trash2,
  Monitor,
  ShieldCheck,
} from "lucide-react";
import ProcessesTab from "./ProcessesTab";
import ServicesTab from "./ServicesTab";
import FilesTab from "./FilesTab";
import PatchesTab from "./PatchesTab";
import NetworkTab from "./NetworkTab";
import SoftwareTab from "./SoftwareTab";
import TerminalComponent from "./TerminalComponent";
import RemoteDesktopComponent from "./RemoteDesktopComponent";
import LogsTab from "./LogsTab";
import EnvironmentTab from "./EnvironmentTab";
// ... existing imports

// ... existing code ...
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock Data Types
interface Device {
  id: string;
  hostname: string;
  ip: string;
  os: string;
  status: "online" | "offline" | "warning";
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
}

interface DeviceDetailsProps {
  device: Device;
  onBack: () => void;
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({ device, onBack }) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {device.hostname}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono">{device.ip}</span>
            <span>•</span>
            <span>{device.os}</span>
            <span>•</span>
            <Badge
              variant="outline"
              className={
                device.status === "online"
                  ? "text-emerald-500 border-emerald-500/20"
                  : "text-slate-500 border-slate-500/20"
              }
            >
              {device.status}
            </Badge>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.go.bridge.PulseBridge.RebootDevice(device.id)}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reboot
          </Button>
          <Button
            variant="outline"
            className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
            onClick={() =>
              window.go.bridge.PulseBridge.ShutdownDevice(device.id)
            }
          >
            <Monitor className="mr-2 h-4 w-4" /> Shutdown
          </Button>
          <Button variant="default">
            <Terminal className="mr-2 h-4 w-4" /> Remote Shell
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="remote">Remote Desktop</TabsTrigger>
          <TabsTrigger value="console">Terminal</TabsTrigger>
          <TabsTrigger value="network">Network (SNMP)</TabsTrigger>
          <TabsTrigger value="software">Software</TabsTrigger>
          <TabsTrigger value="processes">Processes</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="logs">Event Logs</TabsTrigger>
          <TabsTrigger value="env">Env Vars</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="patches">Patches</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Load</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{device.cpu}%</div>
                <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${device.cpu}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Intel Core i7-12700H @ 2.30GHz
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory</CardTitle>
                {/* Fallback icon if MemoryStick not in lucide react version, check imports later */}
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{device.memory}%</div>
                <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${device.memory}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  12.4 GB / 16.0 GB Used
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Disk Usage
                </CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{device.disk}%</div>
                <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500"
                    style={{ width: `${device.disk}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  C:\ Volume (NVMe SSD)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security</CardTitle>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">
                  Protected
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Windows Defender</span>
                    <span className="text-emerald-500">Active</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Definitions</span>
                    <span>Up to date</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemActivityChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processes" className="h-[500px]">
          <ProcessesTab deviceId={device.id} />
        </TabsContent>

        <TabsContent value="remote" className="h-[600px]">
          <RemoteDesktopComponent deviceId={device.id} />
        </TabsContent>

        <TabsContent value="network" className="h-[500px]">
          <NetworkTab deviceId={device.id} />
        </TabsContent>

        <TabsContent value="software" className="h-[500px]">
          <SoftwareTab deviceId={device.id} />
        </TabsContent>

        <TabsContent value="console" className="h-[500px]">
          <TerminalComponent deviceId={device.id} />
        </TabsContent>

        <TabsContent value="services" className="h-[500px]">
          <ServicesTab deviceId={device.id} />
        </TabsContent>
        <TabsContent value="logs" className="h-[500px]">
          <LogsTab deviceId={device.id} />
        </TabsContent>
        <TabsContent value="env" className="h-[500px]">
          <EnvironmentTab deviceId={device.id} />
        </TabsContent>
        <TabsContent value="files" className="h-[500px]">
          <FilesTab deviceId={device.id} />
        </TabsContent>
        <TabsContent value="patches" className="h-[500px]">
          <PatchesTab deviceId={device.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeviceDetails;
