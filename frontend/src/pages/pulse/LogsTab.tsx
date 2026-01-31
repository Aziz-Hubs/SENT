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
import { RefreshCw, AlertTriangle, Info, AlertCircle } from "lucide-react";

interface LogsTabProps {
  deviceId: string;
}

const LogsTab: React.FC<LogsTabProps> = ({ deviceId }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await window.go.bridge.PulseBridge.GetEventLogs(deviceId);
      setLogs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [deviceId]);

  const getLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
        return (
          <Badge
            variant="destructive"
            className="flex gap-1 w-20 justify-center"
          >
            <AlertCircle className="w-3 h-3" /> Error
          </Badge>
        );
      case "warning":
        return (
          <Badge
            variant="outline"
            className="text-yellow-500 border-yellow-500/20 flex gap-1 w-20 justify-center"
          >
            <AlertTriangle className="w-3 h-3" /> Warn
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="text-blue-500 border-blue-500/20 flex gap-1 w-20 justify-center"
          >
            <Info className="w-3 h-3" /> Info
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4 fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">
          System Logs (Last 50 Events)
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh Logs
        </Button>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900/30 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[100px]">Level</TableHead>
              <TableHead className="w-[200px]">Source</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center h-24 text-muted-foreground"
                >
                  {loading
                    ? "Loading logs..."
                    : "No recent errors or warnings found."}
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => (
                <TableRow
                  key={index}
                  className="border-zinc-800 hover:bg-zinc-900/50"
                >
                  <TableCell className="font-mono text-xs">
                    {log.time}
                  </TableCell>
                  <TableCell>{getLevelBadge(log.level)}</TableCell>
                  <TableCell
                    className="font-medium text-xs truncate max-w-[200px]"
                    title={log.source}
                  >
                    {log.source}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.message}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LogsTab;
