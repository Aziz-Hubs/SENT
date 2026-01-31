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
  History,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Execution {
  id: number;
  scriptName: string;
  device: string;
  status: "success" | "failed" | "running";
  exitCode: number | null;
  startTime: string;
  duration: string;
}

const ExecutionHistoryPage: React.FC = () => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setExecutions([
      {
        id: 1,
        scriptName: "Get-SystemInfo.ps1",
        device: "SRV-DC01",
        status: "success",
        exitCode: 0,
        startTime: new Date().toISOString(),
        duration: "2.4s",
      },
      {
        id: 2,
        scriptName: "Cleanup-TempFiles.ps1",
        device: "WKST-HR-04",
        status: "success",
        exitCode: 0,
        startTime: new Date(Date.now() - 3600000).toISOString(),
        duration: "5.1s",
      },
      {
        id: 3,
        scriptName: "Install-Updates.ps1",
        device: "DB-PROD-01",
        status: "failed",
        exitCode: 1,
        startTime: new Date(Date.now() - 7200000).toISOString(),
        duration: "45.2s",
      },
      {
        id: 4,
        scriptName: "Check-ServiceHealth.sh",
        device: "SRV-FILE01",
        status: "running",
        exitCode: null,
        startTime: new Date(Date.now() - 60000).toISOString(),
        duration: "1m+",
      },
    ]);
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "success":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
    }
  };

  const filteredExecutions = executions.filter(
    (e) =>
      e.scriptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.device.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Execution Log</h2>
          <p className="text-muted-foreground text-sm">
            Script execution history and results
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by script or device..."
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
              <TableHead>Script</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Exit Code</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Started</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExecutions.map((exec) => (
              <TableRow key={exec.id}>
                <TableCell>{getStatusIcon(exec.status)}</TableCell>
                <TableCell className="font-medium font-mono text-sm">
                  {exec.scriptName}
                </TableCell>
                <TableCell>{exec.device}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusStyle(exec.status)}
                  >
                    {exec.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {exec.exitCode !== null ? exec.exitCode : "-"}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {exec.duration}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(exec.startTime), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="mr-2 h-4 w-4" /> View Output
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

export default ExecutionHistoryPage;
