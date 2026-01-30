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
import { Search, Play, StopCircle, RotateCw, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

declare global {
  interface Window {
    // Extending previous declaration
  }
}

interface ServiceInfo {
  name: string;
  displayName: string;
  status: string;
}

interface ServicesTabProps {
  deviceId: string;
}

const ServicesTab: React.FC<ServicesTabProps> = ({ deviceId }) => {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchServices = async () => {
    setLoading(true);
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        const res = await w.go.bridge.PulseBridge.GetServices(deviceId);
        setServices(res || []);
      } else {
        // Mock
        setServices([
          {
            name: "wuauserv",
            displayName: "Windows Update",
            status: "running",
          },
          { name: "Spooler", displayName: "Print Spooler", status: "running" },
          {
            name: "TeamViewer",
            displayName: "TeamViewer Remote",
            status: "stopped",
          },
        ]);
      }
    } catch (err) {
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [deviceId]);

  const handleAction = async (name: string, action: string) => {
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        await w.go.bridge.PulseBridge.ControlService(deviceId, name, action);
      }
      toast.success(`Service ${action} command sent`);
      fetchServices();
    } catch (err) {
      toast.error(`Failed to ${action} service`);
    }
  };

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.displayName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchServices}
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
              <TableHead>Display Name</TableHead>
              <TableHead>Service Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.map((s) => (
              <TableRow key={s.name}>
                <TableCell className="font-medium">{s.displayName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {s.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={s.status === "running" ? "default" : "secondary"}
                  >
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {s.status === "stopped" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAction(s.name, "start")}
                      >
                        <Play className="h-4 w-4 text-emerald-500" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAction(s.name, "stop")}
                      >
                        <StopCircle className="h-4 w-4 text-rose-500" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAction(s.name, "restart")}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ServicesTab;
