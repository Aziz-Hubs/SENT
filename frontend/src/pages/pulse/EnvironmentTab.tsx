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
import { RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EnvironmentTabProps {
  deviceId: string;
}

const EnvironmentTab: React.FC<EnvironmentTabProps> = ({ deviceId }) => {
  const [envs, setEnvs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchEnvs = async () => {
    setLoading(true);
    try {
      const data = await window.go.bridge.PulseBridge.GetEnvVars(deviceId);
      setEnvs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvs();
  }, [deviceId]);

  const filtered = envs.filter(
    (e) =>
      e.key.toLowerCase().includes(search.toLowerCase()) ||
      e.value.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4 fade-in">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter variables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-zinc-900/50 border-zinc-800"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchEnvs}
          disabled={loading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-900/30 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
              <TableHead className="w-[300px]">Variable Name</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center h-24 text-muted-foreground"
                >
                  No environment variables found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((e, index) => (
                <TableRow
                  key={index}
                  className="border-zinc-800 hover:bg-zinc-900/50"
                >
                  <TableCell className="font-mono text-sm font-semibold text-blue-400">
                    {e.key}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground max-w-xl break-all">
                    {e.value}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-muted-foreground text-center">
        {filtered.length} variables
      </div>
    </div>
  );
};

export default EnvironmentTab;
