import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { GetSystemStatus } from "../../wailsjs/go/bridge/SystemBridge";
import { Activity, Server, Clock, Cpu, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SystemStatus } from "@/lib/types";
import { WorkflowStatus } from "@/components/layout/WorkflowStatus";

/**
 * Dashboard component displays high-level system metrics and recent events.
 * It polls the backend for updates.
 */
export function Dashboard() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uptimeDisplay, setUptimeDisplay] = useState("...");

  // Fetch status on interval
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        if (window.go) {
          const res = await GetSystemStatus();
          setStatus(res as any);
        }
      } catch (err) {
        console.error("Failed to fetch system status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Local tick for uptime counter
  useEffect(() => {
    if (!status?.startTime) return;

    const timer = setInterval(() => {
      const diff = Math.floor(Date.now() / 1000) - status.startTime;
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setUptimeDisplay(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the SENT Native Singularity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Hostname"
          icon={Server}
          value={loading ? "..." : status?.hostname || "Unknown"}
        />
        <StatusCard
          title="System Uptime"
          icon={Activity}
          value={uptimeDisplay}
        />
        <StatusCard
          title="System Time"
          icon={Clock}
          value={
            loading
              ? "..."
              : status
                ? new Date(status.time).toLocaleString()
                : ""
          }
          className="text-sm"
        />
        <StatusCard
          title="Core Load"
          icon={Cpu}
          value="Nominal"
          valueClass="text-green-500"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-7">
        <GlassCard className="col-span-1 md:col-span-4" gradientColor="violet">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Native Bridge operational status
              </CardDescription>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={() => alert("Restarting Core Services...")}
            >
              <Power className="h-4 w-4" /> Restart Core
            </Button>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-white/5">
            <p className="text-muted-foreground">
              Ecosystem visualization placeholder
            </p>
          </CardContent>
        </GlassCard>

        <GlassCard className="col-span-1 md:col-span-3" gradientColor="emerald">
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Logs from the SENTd Kernel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <WorkflowStatus />

            <div className="space-y-4">
              {status?.recentEvents?.map((event: string, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{event}</p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">
                  No events logged.
                </p>
              )}
            </div>
          </CardContent>
        </GlassCard>
      </div>
    </div>
  );
}

// Helper Component for Status Cards
function StatusCard({ title, icon: Icon, value, className, valueClass }: any) {
  return (
    <GlassCard className="hover:shadow-cyan-500/20" gradientColor="cyan">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueClass} ${className}`}>
          {value}
        </div>
      </CardContent>
    </GlassCard>
  );
}
