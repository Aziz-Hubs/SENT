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
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Download,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface PatchInfo {
  id: string;
  title: string;
  severity: string;
  size: number;
  published: string;
  installed: boolean;
}

interface PatchesTabProps {
  deviceId: string;
}

const PatchesTab: React.FC<PatchesTabProps> = ({ deviceId }) => {
  const [patches, setPatches] = useState<PatchInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [selectedPatches, setSelectedPatches] = useState<Set<string>>(
    new Set(),
  );

  const fetchPatches = async () => {
    setLoading(true);
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        const res = await w.go.bridge.PulseBridge.ScanPatches(deviceId);
        setPatches(res || []);
      } else {
        // Mock data for development
        setPatches([
          {
            id: "KB5034441",
            title: "2024-01 Cumulative Update for Windows 11",
            severity: "Critical",
            size: 524288000,
            published: "2024-01-09",
            installed: false,
          },
          {
            id: "KB5034204",
            title: "2024-01 .NET Framework Security Update",
            severity: "Important",
            size: 52428800,
            published: "2024-01-09",
            installed: false,
          },
          {
            id: "KB5034203",
            title: "Windows Defender Definition Update",
            severity: "Moderate",
            size: 10485760,
            published: "2024-01-15",
            installed: false,
          },
        ]);
      }
    } catch (err) {
      toast.error("Failed to scan patches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatches();
  }, [deviceId]);

  const handleInstallSelected = async () => {
    if (selectedPatches.size === 0) {
      toast.warning("No patches selected");
      return;
    }

    setInstalling(true);
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        await w.go.bridge.PulseBridge.InstallPatches(
          deviceId,
          Array.from(selectedPatches),
        );
        toast.success(`Installing ${selectedPatches.size} patches...`);
        // Refresh after install
        setTimeout(fetchPatches, 2000);
      } else {
        toast.success("Mock: Installing patches...");
      }
    } catch (err) {
      toast.error("Failed to install patches");
    } finally {
      setInstalling(false);
      setSelectedPatches(new Set());
    }
  };

  const handleInstallAll = async () => {
    setInstalling(true);
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        await w.go.bridge.PulseBridge.InstallPatches(deviceId, []);
        toast.success("Installing all patches...");
        setTimeout(fetchPatches, 5000);
      } else {
        toast.success("Mock: Installing all patches...");
      }
    } catch (err) {
      toast.error("Failed to install patches");
    } finally {
      setInstalling(false);
    }
  };

  const togglePatch = (id: string) => {
    const newSet = new Set(selectedPatches);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedPatches(newSet);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> Critical
          </Badge>
        );
      case "important":
        return (
          <Badge variant="default" className="gap-1 bg-orange-500">
            <ShieldCheck className="h-3 w-3" /> Important
          </Badge>
        );
      case "moderate":
        return (
          <Badge variant="secondary" className="gap-1">
            <Info className="h-3 w-3" /> Moderate
          </Badge>
        );
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "Unknown";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const pendingPatches = patches.filter((p) => !p.installed);
  const criticalCount = pendingPatches.filter(
    (p) => p.severity.toLowerCase() === "critical",
  ).length;

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Patch Management</h3>
          <p className="text-sm text-muted-foreground">
            {pendingPatches.length} pending updates
            {criticalCount > 0 && (
              <span className="text-red-500 ml-2">
                ({criticalCount} critical)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPatches}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Scan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleInstallSelected}
            disabled={installing || selectedPatches.size === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Install Selected ({selectedPatches.size})
          </Button>
          <Button
            size="sm"
            onClick={handleInstallAll}
            disabled={installing || pendingPatches.length === 0}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Install All
          </Button>
        </div>
      </div>

      {/* Patches Table */}
      <div className="border rounded-md flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Published</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingPatches.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  System is up to date
                </TableCell>
              </TableRow>
            ) : (
              pendingPatches.map((patch) => (
                <TableRow key={patch.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPatches.has(patch.id)}
                      onCheckedChange={() => togglePatch(patch.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs font-medium">
                    {patch.id}
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {patch.title}
                  </TableCell>
                  <TableCell>{getSeverityBadge(patch.severity)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatSize(patch.size)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {patch.published}
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

export default PatchesTab;
