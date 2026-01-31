import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Search, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface SoftwareInfo {
  name: string;
  version: string;
  publisher: string;
  install_date: string;
}

interface SoftwareTabProps {
  deviceId: string;
}

const SoftwareTab: React.FC<SoftwareTabProps> = ({ deviceId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [software, setSoftware] = useState<SoftwareInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSoftware = async () => {
    setLoading(true);
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        const res =
          await w.go.bridge.PulseBridge.GetSoftwareInventory(deviceId);
        setSoftware(res || []);
      }
    } catch (err) {
      toast.error("Failed to fetch software inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoftware();
  }, [deviceId]);

  const filteredSoftware = software.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.publisher.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search software..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-1 pl-8 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSoftware}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Inventory
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900/30 overflow-hidden min-h-[400px]">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
              <TableHead className="w-[300px]">Software Name</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Publisher</TableHead>
              <TableHead>Install Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  Scanning for software...
                </TableCell>
              </TableRow>
            ) : filteredSoftware.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  No software found matching "{searchTerm}"
                </TableCell>
              </TableRow>
            ) : (
              filteredSoftware.map((app, index) => (
                <TableRow
                  key={index}
                  className="border-zinc-800 hover:bg-zinc-900/50"
                >
                  <TableCell className="font-medium flex items-center gap-2">
                    <Package className="w-4 h-4 text-zinc-500" />
                    {app.name}
                  </TableCell>
                  <TableCell>{app.version}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {app.publisher}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {app.install_date || "--"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-red-400 hover:bg-red-400/10 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-muted-foreground text-center">
        Showing {filteredSoftware.length} applications installed on {deviceId}
      </div>
    </div>
  );
};

export default SoftwareTab;
