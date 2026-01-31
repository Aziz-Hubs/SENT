import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Laptop,
  Search,
  RefreshCw,
  Power,
  Terminal,
  MoreHorizontal,
  Server,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeviceDetails from "./pulse/DeviceDetails";
import ScriptRepository from "./pulse/ScriptRepository";
import JobScheduler from "./pulse/JobScheduler";
import DashboardPage from "./pulse/DashboardPage";
import AlertsPage from "./pulse/AlertsPage";
import PoliciesPage from "./pulse/PoliciesPage";
import ExecutionHistoryPage from "./pulse/ExecutionHistoryPage";
import ReportsPage from "./pulse/ReportsPage";
import PatchesTab from "./pulse/PatchesTab";
import SoftwareTab from "./pulse/SoftwareTab";
import FilesTab from "./pulse/FilesTab";
import { useAppStore } from "@/store/useAppStore";

interface Agent {
  id: number;
  hostname: string;
  os: string;
  ip: string;
  status: "online" | "offline" | "warning";
  last_seen: string;
  cpu?: number;
  memory?: number;
  disk?: number;
  uptime?: string;
}

const PulsePage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<Agent | null>(null);
  const { activeTab } = useAppStore();

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        const res = await w.go.bridge.PulseBridge.GetAgents();
        setAgents(res || []);
      } else {
        // Mock data
        setAgents([
          {
            id: 1,
            hostname: "SRV-DC01",
            os: "windows",
            ip: "10.0.1.5",
            status: "online",
            last_seen: new Date().toISOString(),
            cpu: 12,
            memory: 64,
            disk: 45,
            uptime: "14d",
          },
          {
            id: 2,
            hostname: "WKST-HR-04",
            os: "windows",
            ip: "10.0.2.104",
            status: "online",
            last_seen: new Date().toISOString(),
            cpu: 5,
            memory: 32,
            disk: 20,
            uptime: "2d",
          },
          {
            id: 3,
            hostname: "DB-PROD-01",
            os: "linux",
            ip: "10.0.1.20",
            status: "online",
            last_seen: new Date().toISOString(),
            cpu: 45,
            memory: 82,
            disk: 60,
            uptime: "120d",
          },
        ]);
      }
    } catch (err) {
      toast.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(
    (a) =>
      a.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ip.includes(searchTerm),
  );

  if (selectedDevice) {
    return (
      <div className="p-6 h-full flex flex-col fade-in">
        <div className="mb-4">
          <Button variant="ghost" onClick={() => setSelectedDevice(null)}>
            ← Back to Dashboard
          </Button>
        </div>
        <DeviceDetails
          device={{
            ...selectedDevice,
            id: selectedDevice.id.toString(),
            disk: selectedDevice.disk || 0,
            uptime: selectedDevice.uptime || "Unknown",
            cpu: selectedDevice.cpu || 0,
            memory: selectedDevice.memory || 0,
          }}
          onBack={() => setSelectedDevice(null)}
        />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    return status === "online"
      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      : "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "devices":
      case "overview":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search devices by hostname or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hostname</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgents.map((agent) => (
                    <TableRow
                      key={agent.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedDevice(agent)}
                    >
                      <TableCell className="font-medium flex items-center gap-2">
                        <Laptop className="h-4 w-4 text-slate-500" />
                        {agent.hostname}
                      </TableCell>
                      <TableCell className="uppercase text-xs font-bold text-muted-foreground">
                        {agent.os}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {agent.ip}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(agent.status)}
                        >
                          {agent.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDistanceToNow(new Date(agent.last_seen), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              Remote Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setSelectedDevice(agent)}
                            >
                              <Terminal className="mr-2 h-4 w-4" /> Connect
                              Terminal
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Power className="mr-2 h-4 w-4" /> Reboot Device
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      case "scripts":
        return <ScriptRepository />;
      case "jobs":
        return <JobScheduler />;
      case "dashboard":
        return <DashboardPage />;
      case "alerts":
        return <AlertsPage />;
      case "patches":
        return <PatchesTab deviceId="fleet" />;
      case "software":
        return <SoftwareTab deviceId="fleet" />;
      case "policies":
        return <PoliciesPage />;
      case "history":
        return <ExecutionHistoryPage />;
      case "remote":
        return (
          <div className="p-6 text-muted-foreground">
            Select a device from the Devices tab to initiate a remote session.
          </div>
        );
      case "files":
        return <FilesTab deviceId="fleet" />;
      case "reports":
        return <ReportsPage />;
      default:
        return (
          <div className="p-6 text-muted-foreground">
            Select a page from the navigation.
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pulse RMM</h1>
          <p className="text-muted-foreground">
            Remote Monitoring & Management Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAgents} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">{renderContent()}</div>
    </div>
  );
};

export default PulsePage;
