import React, { useState, useEffect } from "react";
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
  Bell,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Alert {
  id: number;
  device: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Mock data
    setAlerts([
      {
        id: 1,
        device: "SRV-DC01",
        severity: "critical",
        message: "CPU usage exceeded 95%",
        timestamp: new Date().toISOString(),
        acknowledged: false,
      },
      {
        id: 2,
        device: "WKST-HR-04",
        severity: "warning",
        message: "Disk space below 20%",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        acknowledged: false,
      },
      {
        id: 3,
        device: "DB-PROD-01",
        severity: "info",
        message: "Patch installation completed",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        acknowledged: true,
      },
      {
        id: 4,
        device: "SRV-FILE01",
        severity: "critical",
        message: "Service 'Spooler' stopped unexpectedly",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        acknowledged: false,
      },
    ]);
  }, []);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const filteredAlerts = alerts.filter(
    (a) =>
      a.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.message.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Alerts</h2>
          <p className="text-muted-foreground text-sm">
            Active and historical alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button size="sm">
            <CheckCircle className="mr-2 h-4 w-4" /> Acknowledge All
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search alerts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>{getSeverityIcon(alert.severity)}</TableCell>
                <TableCell className="font-medium">{alert.device}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getSeverityStyle(alert.severity)}
                  >
                    {alert.severity}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {alert.message}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(alert.timestamp), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  {alert.acknowledged ? (
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-500"
                    >
                      Ack'd
                    </Badge>
                  ) : (
                    <Button variant="ghost" size="sm">
                      Acknowledge
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AlertsPage;
