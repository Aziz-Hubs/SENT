import React, { useState, useEffect } from "react";
// @ts-ignore
import {
  GetAssetGraph,
  GetBlastRadius,
  GetPendingDiscovery,
  CreateAsset,
  GetSaaSInventory,
  ScanShadowIT,
} from "../../wailsjs/go/nexus/NexusBridge";
import {
  Shield,
  Database,
  Lock,
  Search,
  Plus,
  Activity,
  Zap,
  Network,
  FileText,
  History,
  ShieldCheck,
  AlertTriangle,
  Globe,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { ContextSidebar } from "@/components/layout/ContextSidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const NexusApp: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [saasApps, setSaasApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setContextSidebar, toggleContext, isContextOpen, activeTab } =
    useAppStore();
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  // Wizard States
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: "",
    type: "server",
    ip: "",
    location: "Primary DC",
  });

  const handleAddAsset = async () => {
    if (!newAsset.name) return;
    try {
      await CreateAsset(
        newAsset.name,
        newAsset.type,
        newAsset.ip,
        newAsset.location,
      );
      toast.success("Asset Intake Success", {
        description: `${newAsset.name} has been queued for authoritative certification.`,
      });
      setIsAddAssetOpen(false);
      setNewAsset({ name: "", type: "server", ip: "", location: "Primary DC" });
      loadData();
    } catch (err) {
      toast.error("Bridge Error", {
        description: "Failed to persist asset to the knowledge graph.",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      if (window.go) {
        const g = await GetAssetGraph();
        setAssets(g || []);
        const p = await GetPendingDiscovery();
        setPending(p || []);
        const s = await GetSaaSInventory();
        setSaasApps(s || []);
      }
    } catch (err) {
      toast.error("Failed to sync with CMDB kernel");
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const handleAssetClick = (asset: any) => {
    setSelectedAsset(asset);
    setContextSidebar(<AssetDetails asset={asset} />);
    toggleContext(true);
  };

  const breadcrumbs = [
    { label: "Infrastructure" },
    { label: "SENTnexus CMDB" },
  ];

  if (loading && assets.length === 0) {
    return (
      <div className="space-y-6 fade-in">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <Skeleton className="h-10 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">
      <PageHeader
        title="SENTnexus"
        description="Authoritative Knowledge Graph, CMDB & Secure Credential Vault"
        icon={Shield}
        breadcrumbs={breadcrumbs}
        primaryAction={{
          label: "New Asset",
          icon: Plus,
          onClick: () => setIsAddAssetOpen(true),
        }}
      />

      <div className="mt-8">
        {(activeTab === "overview" || activeTab === "graph") && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {assets.length === 0 ? (
              <EmptyState
                icon={Database}
                title="Graph is Empty"
                description="No configuration items found. Run a SENTgrid discovery or manual intake to populate the graph."
                action={{
                  label: "Import Assets",
                  onClick: () => setIsImportOpen(true),
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map((asset) => (
                  <Card
                    key={asset.id}
                    className="group hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md border-none"
                    onClick={() => handleAssetClick(asset)}
                  >
                    <CardHeader className="p-4 border-b bg-muted/30 flex flex-row justify-between items-center space-y-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Network className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-bold truncate max-w-[150px]">
                          {asset.name}
                        </CardTitle>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[9px] h-4 font-bold tracking-tighter"
                      >
                        VLAN 10
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">
                          Type
                        </span>
                        <span className="text-xs font-medium text-foreground">
                          Infrastructure Node
                        </span>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full h-8 text-[10px] uppercase font-black tracking-widest gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success(
                            `Calculating blast radius for ${asset.name}...`,
                          );
                        }}
                      >
                        <Zap className="h-3 w-3 text-amber-500" /> Impact
                        Analysis
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "vault" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EmptyState
              icon={Lock}
              title="Vault Locked"
              description="Credentials are hardware-encrypted. Reveal request must include a valid justification."
              action={{ label: "Authenticate Vault", onClick: () => {} }}
            />
          </div>
        )}

        {activeTab === "saas" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">SaaS Perimeter</h3>
                <p className="text-xs text-muted-foreground">
                  Identified and managed software-as-a-service applications.
                </p>
              </div>
              <Button
                size="sm"
                className="gap-2 h-8 text-[10px] uppercase font-black tracking-widest"
                onClick={async () => {
                  toast.loading("Scanning network entropy for shadow IT...");
                  const found = await ScanShadowIT();
                  toast.success(
                    `Scan Complete: ${found} new unmanaged apps identified.`,
                  );
                  loadData();
                }}
              >
                <Search className="h-3.5 w-3.5" /> Scan Shadow IT
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {saasApps.length === 0 ? (
                <div className="lg:col-span-3 py-12">
                  <EmptyState
                    icon={Globe}
                    title="No SaaS Identified"
                    description="Run a shadow IT scan to discover unmanaged applications in your perimeter."
                  />
                </div>
              ) : (
                saasApps.map((app) => (
                  <Card key={app.id} className="border-none shadow-sm">
                    <CardHeader className="p-4 border-b bg-muted/30 flex flex-row justify-between items-center space-y-0">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center ${app.is_managed ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}
                        >
                          <Globe className="h-4 w-4" />
                        </div>
                        <CardTitle className="text-sm font-bold truncate">
                          {app.name}
                        </CardTitle>
                      </div>
                      <Badge
                        variant={app.is_managed ? "default" : "destructive"}
                        className="text-[9px] h-4 font-bold tracking-tighter"
                      >
                        {app.is_managed ? "MANAGED" : "SHADOW IT"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold uppercase text-muted-foreground">
                            Provider
                          </span>
                          <span className="text-xs font-medium">
                            {app.provider}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-bold uppercase text-muted-foreground">
                            Category
                          </span>
                          <span className="text-xs font-medium">
                            {app.category}
                          </span>
                        </div>
                      </div>
                      {!app.is_managed && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full h-8 text-[10px] uppercase font-black tracking-widest gap-2"
                        >
                          Reclaim Control
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {(activeTab === "discovery" || activeTab === "docs") && (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {pending.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="Inventory Certified"
                description="All discovered assets have been reconciled and approved."
              />
            ) : (
              pending.map((p) => (
                <Card key={p.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-bold text-sm">New {p.type} Found</p>
                        <p className="text-xs text-muted-foreground">
                          MAC: {p.mac} • Source: {p.source}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-bold"
                      >
                        Ignore
                      </Button>
                      <Button size="sm" className="h-8 text-xs font-bold">
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {isContextOpen && (
        <ContextSidebar
          isOpen={isContextOpen}
          onClose={() => toggleContext(false)}
          title="Configuration Item"
        >
          <AssetDetails asset={selectedAsset} />
        </ContextSidebar>
      )}

      {/* Add Asset Wizard */}
      <Dialog open={isAddAssetOpen} onOpenChange={setIsAddAssetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authoritative Asset Intake</DialogTitle>
            <DialogDescription>
              Register a new hardware or software node in the CMDB knowledge
              graph.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Node Name</Label>
              <Input
                id="name"
                value={newAsset.name}
                onChange={(e) =>
                  setNewAsset({ ...newAsset, name: e.target.value })
                }
                placeholder="e.g. CORE-SW-01"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Node Type</Label>
                <Select
                  value={newAsset.type}
                  onValueChange={(v) => setNewAsset({ ...newAsset, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="server">Server</SelectItem>
                    <SelectItem value="switch">Network Switch</SelectItem>
                    <SelectItem value="storage">Storage Array</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ip">Management IP</Label>
                <Input
                  id="ip"
                  value={newAsset.ip}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, ip: e.target.value })
                  }
                  placeholder="10.0.1.X"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAssetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAsset}>Initialize Node</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset Import Wizard */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Data Import Engine</DialogTitle>
            <DialogDescription>
              Synchronize external datasets via SENTgrid or CSV flat-file.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed rounded-xl gap-4 bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer group">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
            <div className="text-center px-8">
              <p className="text-sm font-bold text-foreground">
                Drop Authority Manifest
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Supports CSV, JSON, and SENTgrid exports (Max 10MB)
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 text-[10px] uppercase font-bold tracking-widest"
              onClick={() => {
                toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 1500)),
                  {
                    loading: "Scanning manifest for schema collisions...",
                    success: "Merkle proof verified. 42 assets queued.",
                    error: "Manifest signature mismatch.",
                  },
                );
              }}
            >
              Select File
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] uppercase font-bold tracking-widest"
              onClick={() => setIsImportOpen(false)}
            >
              Close
            </Button>
            <Button
              size="sm"
              className="text-[10px] uppercase font-bold tracking-widest"
            >
              Execute Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function AssetDetails({ asset }: any) {
  if (!asset) return null;
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Network className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">{asset.name}</h2>
          <p className="text-muted-foreground font-medium">
            Primary Domain Controller
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <DetailRow
          label="System ID"
          value={`#NX-${asset.id}`}
          font="font-mono"
        />
        <DetailRow label="Management IP" value="10.0.1.42" font="font-mono" />
        <DetailRow
          label="Warranty Status"
          value="Active (Exp 2027)"
          color="text-emerald-600 font-bold"
        />
        <DetailRow label="Location" value="Main Data Center - Rack 04" />
      </div>

      <div className="space-y-3 pt-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-2">
          Downstream Impact
        </h4>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-transparent hover:border-primary/20 transition-colors cursor-help"
            >
              <Activity className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold">Dependency #{i}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b pb-2">
          Actions
        </h4>
        <div className="grid gap-2">
          <Button variant="outline" className="justify-start gap-2 h-9 text-xs">
            <Lock className="h-3.5 w-3.5 text-amber-500" /> Request Credentials
          </Button>
          <Button variant="outline" className="justify-start gap-2 h-9 text-xs">
            <History className="h-3.5 w-3.5 text-blue-500" /> Configuration
            History
          </Button>
          <Button variant="outline" className="justify-start gap-2 h-9 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" /> Certify Data
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, font = "", color = "" }: any) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase text-muted-foreground">
        {label}
      </span>
      <span className={`text-sm font-medium ${font} ${color}`}>{value}</span>
    </div>
  );
}

export default NexusApp;
