import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Activity, Clock, AlertTriangle } from "lucide-react";

interface NetworkTabProps {
  deviceId: string;
}

// Mock Data for MVP - In real app, fetch from backend via wails
const mockSnmpData = [
  {
    ip: "192.168.1.1",
    type: "Firewall",
    name: "pfSense-Main",
    uptime: "14d 2h 12m",
    interfaces: 8,
    status: "online",
    bandwidth_in: "45 Mbps",
    bandwidth_out: "12 Mbps",
  },
  {
    ip: "192.168.1.50",
    type: "Switch",
    name: "Cisco-SG350",
    uptime: "45d 1h 0m",
    interfaces: 24,
    status: "online",
    bandwidth_in: "120 Mbps",
    bandwidth_out: "115 Mbps",
  },
  {
    ip: "192.168.1.200",
    type: "Printer",
    name: "HP-LaserJet-Pro",
    uptime: "2d 4h 30m",
    interfaces: 1,
    status: "warning", // Low Toner
    bandwidth_in: "0.1 Mbps",
    bandwidth_out: "0.0 Mbps",
    alert: "Low Toner (Black)",
  },
];

const NetworkTab: React.FC<NetworkTabProps> = ({ deviceId }) => {
  return (
    <div className="space-y-4 fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockSnmpData.map((device) => (
          <Card key={device.ip} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Network className="w-4 h-4 text-muted-foreground" />
                {device.name}
              </CardTitle>
              <Badge
                variant={device.status === "online" ? "default" : "destructive"}
                className={
                  device.status === "online"
                    ? "bg-emerald-600 hover:bg-emerald-600"
                    : ""
                }
              >
                {device.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-4 font-mono">
                {device.ip}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Uptime
                  </span>
                  <span>{device.uptime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Interfaces
                  </span>
                  <span>{device.interfaces}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-xs">
                    <span>In: {device.bandwidth_in}</span>
                    <span>Out: {device.bandwidth_out}</span>
                  </div>
                </div>

                {device.alert && (
                  <div className="bg-yellow-500/10 text-yellow-500 text-xs p-2 rounded flex items-center gap-2 mt-2">
                    <AlertTriangle className="w-3 h-3" /> {device.alert}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Device Card */}
        <Card className="border-dashed flex items-center justify-center min-h-[200px] cursor-pointer hover:bg-accent/50 transition-colors">
          <div className="text-center text-muted-foreground">
            <Network className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Add SNMP Device</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NetworkTab;
