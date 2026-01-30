import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// Removed conflicting global declaration

interface ProcessInfo {
  pid: number;
  name: string;
  username: string;
  cpu: number;
  memory: number;
}

interface ProcessesTabProps {
  deviceId: string;
}

const ProcessesTab: React.FC<ProcessesTabProps> = ({ deviceId }) => {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProcesses = async () => {
    setLoading(true);
    try {
      // In a real Wails app, we'd use the generated JS bindings
      // For now, let's assume the mock or try to call if defined
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        const res = await w.go.bridge.PulseBridge.GetProcesses(deviceId);
        setProcesses(res || []);
      } else {
        // Fallback Dummy Data for development without full backend
        setProcesses([
          {
            pid: 1,
            name: "systemd",
            username: "root",
            cpu: 0.1,
            memory: 12000000,
          },
          {
            pid: 452,
            name: "sent-agent",
            username: "root",
            cpu: 2.5,
            memory: 45000000,
          },
          {
            pid: 1203,
            name: "chrome",
            username: "user",
            cpu: 12.4,
            memory: 450000000,
          },
        ]);
      }
    } catch (err) {
      toast.error("Failed to fetch processes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [deviceId]);

  const handleKill = async (pid: number) => {
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        await w.go.bridge.PulseBridge.KillProcess(deviceId, pid);
      }
      toast.success(`Killed process ${pid}`);
      fetchProcesses();
    } catch (err) {
      toast.error(`Failed to kill process ${pid}`);
    }
  };

  const filteredProcesses = processes.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search processes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchProcesses}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="border rounded-md flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Process Name</TableHead>
              <TableHead>PID</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">CPU</TableHead>
              <TableHead className="text-right">Memory</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProcesses.map((p) => (
              <TableRow key={p.pid}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.pid}</TableCell>
                <TableCell>{p.username}</TableCell>
                <TableCell className="text-right">
                  {p.cpu.toFixed(1)}%
                </TableCell>
                <TableCell className="text-right">
                  {(p.memory / 1024 / 1024).toFixed(0)} MB
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    onClick={() => handleKill(p.pid)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProcessesTab;
