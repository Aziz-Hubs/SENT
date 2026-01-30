import React, { useState, useEffect } from 'react';
import TopologyMap from '../components/grid/TopologyMap';
import { PortGrid } from '../components/grid/PortGrid';
import { 
  Network, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Search, 
  Download, 
  Cpu, 
  LayoutGrid,
  Plus
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const GridPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const breadcrumbs = [
    { label: "Infrastructure" },
    { label: "SENTgrid Net" }
  ];

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-[400px] w-full rounded-xl" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <Skeleton className="h-[150px] w-full rounded-xl" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <PageHeader 
        title="SENTgrid" 
        description="Network Automation, Topology Matrix & Configuration Orchestration"
        icon={Network}
        breadcrumbs={breadcrumbs}
        primaryAction={{
          label: "Run Discovery",
          icon: Search,
          onClick: () => toast.info("Discovery Started", { description: "Crawling LLDP/CDP neighbor tables." })
        }}
      >
        <Button variant="outline" className="gap-2 h-9 text-xs">
            <Download className="h-3.5 w-3.5" /> Export CAS
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-none shadow-md">
             <CardHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <LayoutGrid className="h-3 w-3 text-primary" /> Global Topology Discovery
                </CardTitle>
                <div className="flex gap-4">
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-emerald-500/10 text-emerald-600 border-none">3 ONLINE</Badge>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-red-500/10 text-red-600 border-none">1 DRIFT</Badge>
                </div>
             </CardHeader>
             <CardContent className="p-0">
                <TopologyMap />
             </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
             <CardHeader className="p-4 border-b bg-muted/30">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Activity className="h-3 w-3 text-primary" /> Configuration Drift Engine
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 font-mono text-sm space-y-2 bg-muted/10">
                <div className="flex gap-4 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                   <span className="opacity-50">+</span>
                   <span>ip route 0.0.0.0 0.0.0.0 10.255.255.1</span>
                </div>
                <div className="flex gap-4 text-red-600 dark:text-red-400 bg-red-500/5 p-2 rounded border border-red-500/10">
                   <span className="opacity-50">-</span>
                   <span>ip route 0.0.0.0 0.0.0.0 10.255.255.2</span>
                </div>
                <div className="text-muted-foreground p-2">
                   <span className="opacity-50"> </span>
                   <span>interface GigabitEthernet0/1</span>
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <PortGrid deviceName="Core-SW-01" />
          
          <Card className="border-none shadow-md">
             <CardHeader className="p-4 border-b bg-muted/30">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Worker Pool Status</CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-muted-foreground text-xs font-medium">Active Workers</span>
                   <span className="text-emerald-600 font-mono font-bold">12 / 64</span>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                   <div className="bg-primary h-full w-[20%]" />
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-muted-foreground text-xs font-medium">Avg Latency</span>
                   <span className="text-foreground font-mono font-bold text-sm">42ms</span>
                </div>
             </CardContent>
          </Card>

          <Card className="bg-red-500/5 border-red-500/20 shadow-none">
             <CardHeader className="p-4 pb-2">
                <CardTitle className="text-red-600 dark:text-red-500 font-bold text-sm flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> Security Alert
                </CardTitle>
             </CardHeader>
             <CardContent className="p-4 pt-0 space-y-4">
                <p className="text-[10px] text-red-600/80 dark:text-red-400/80 leading-relaxed font-medium">
                    SENTreflex detected lateral movement from MAC <span className="font-mono font-bold">00:1A:2B:3C:4D:5E</span> on <span className="font-bold">Dist-SW-02</span> Port <span className="font-bold">Gi0/12</span>.
                </p>
                <Button className="w-full bg-red-600 hover:bg-red-700 h-9 font-bold text-xs">
                    EXECUTE QUARANTINE
                </Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GridPage;
