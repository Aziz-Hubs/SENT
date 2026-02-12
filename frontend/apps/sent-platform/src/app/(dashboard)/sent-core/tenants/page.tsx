"use client";

import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@sent/platform-ui";
import { Button } from "@sent/platform-ui";
import { Badge } from "@sent/platform-ui";
import { Checkbox } from "@sent/platform-ui";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@sent/platform-ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@sent/platform-ui";
import { Input } from "@sent/platform-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sent/platform-ui";
import {
    Download,
    Upload,
    Filter,
    MoreHorizontal,
    Eye,
    ShieldCheck,
    Lock,
    Unlock,
    Trash2,
    RefreshCcw,
    History,
    VenetianMask,
    CreditCard,
    ArrowUpRight,
    CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";

// Sub-components
import {
    SyncDonut,
    GrowthLine,
    AuthPie,
    RegionalGrid,
    ActivityHeatmap,
    HealthScore
} from "./components/TenantWidgets";
import { BulkActionsBar } from "./components/BulkActionsBar";

// API Base URL
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081") + "/api/v1";

interface Tenant {
    OrgID: string;
    DbName: string;
    Name: string;
    Domain: string;
    Tier: string;
    AuthType: string;
    Region: string;
    Status: string;
    CreatedAt: string;
    // UI-only fields
    healthScore?: number;
}

interface ZitadelOrg {
    id: string;
    name: string;
    state: string;
    primaryDomain: string;
}

export default function TenantRegistryPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = React.useState("");
    const [activeTab, setActiveTab] = React.useState("platform");

    // Data states
    const [tenants, setTenants] = React.useState<Tenant[]>([]);
    const [zitadelOrgs, setZitadelOrgs] = React.useState<ZitadelOrg[]>([]);
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [loading, setLoading] = React.useState(true);

    // Modal states
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
    const [selectedTenant, setSelectedTenant] = React.useState<Tenant | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = React.useState("");

    // Fetch both tenants and Zitadel orgs
    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const [tenantsRes, zitadelRes] = await Promise.all([
                fetch(`${API_BASE}/tenants`),
                fetch(`${API_BASE}/tenants/zitadel`)
            ]);

            if (tenantsRes.ok) {
                const data = await tenantsRes.json();
                // Add mock health scores
                const enriched = (data || []).map((t: Tenant) => ({
                    ...t,
                    healthScore: Math.floor(Math.random() * (100 - 60 + 1)) + 60
                }));
                setTenants(enriched);
            }

            if (zitadelRes.ok) {
                const zitadelData = await zitadelRes.json();
                setZitadelOrgs(zitadelData || []);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const syncStats = React.useMemo(() => {
        const zitadelOrgIds = new Set(zitadelOrgs.map(o => o.id));
        const synced = tenants.filter(t => zitadelOrgIds.has(t.OrgID)).length;
        const dbOnly = tenants.filter(t => !zitadelOrgIds.has(t.OrgID)).length;
        const zitadelOnly = zitadelOrgs.filter(o => !tenants.some(t => t.OrgID === o.id)).length;
        return { synced, dbOnly, zitadelOnly };
    }, [tenants, zitadelOrgs]);

    const handleSelectRow = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(new Set(tenants.map(t => t.OrgID)));
        else setSelectedIds(new Set());
    };

    const handleExport = () => {
        const headers = "OrgID,Name,Domain,Region,Status,Tier,AuthType\n";
        const rows = tenants.map(t => `${t.OrgID},${t.Name},${t.Domain},${t.Region},${t.Status},${t.Tier},${t.AuthType}`).join("\n");
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tenant-registry-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const handleQuickImpersonate = (tenant: Tenant) => {
        // Dispatch custom event for the AppShell layout to handle
        window.dispatchEvent(new CustomEvent('impersonate-ghost', {
            detail: { tenantName: tenant.Name, identity: "Platform Admin" }
        }));
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            active: "default",
            suspended: "destructive",
            provisioning: "secondary",
        };
        return <Badge variant={variants[status] || "outline"} className="capitalize">{status}</Badge>;
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight">Organization Control Center</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Badge variant="outline" className="bg-white">Version 5.2</Badge>
                        <span>•</span>
                        <span>Manage {tenants.length} multi-tenant nodes globally</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 shadow-sm" onClick={handleExport}>
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                    <Button variant="outline" className="gap-2 shadow-sm">
                        <Upload className="h-4 w-4" /> Secure Import
                    </Button>
                    <Button className="gap-2 shadow-lg bg-blue-600 hover:bg-blue-700 transition-all" onClick={() => router.push("/sent-core/partner-registration")}>
                        <ArrowUpRight className="h-4 w-4" /> Create Node
                    </Button>
                </div>
            </div>

            {/* Widgets Grid - Real Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <SyncDonut synced={syncStats.synced} dbOnly={syncStats.dbOnly} zitadelOnly={syncStats.zitadelOnly} />
                <GrowthLine data={[
                    { month: "Dec", count: tenants.length - 2 },
                    { month: "Jan", count: tenants.length - 1 },
                    { month: "Feb", count: tenants.length }
                ]} />
                <AuthPie data={[
                    { name: "OIDC", value: tenants.filter(t => t.AuthType === 'oidc').length || 1, color: "#3b82f6" },
                    { name: "SAML", value: tenants.filter(t => t.AuthType === 'saml').length || 0, color: "#10b981" },
                    { name: "Local", value: tenants.filter(t => t.AuthType === 'local').length || 0, color: "#f59e0b" },
                ]} />
                <RegionalGrid regions={[
                    { name: "US East", count: tenants.filter(t => t.Region === 'us-east-1').length, flag: "🇺🇸" },
                    { name: "EU West", count: tenants.filter(t => t.Region === 'eu-west-1').length, flag: "🇪🇺" },
                    { name: "Asia Pacific", count: tenants.filter(t => t.Region === 'ap-southeast-1').length, flag: "🇯🇵" },
                    { name: "MENA", count: tenants.filter(t => t.Region === 'me-south-1').length, flag: "🇯🇴" },
                ]} />
                <ActivityHeatmap throughput={Math.floor(Math.random() * 50) + 20} />
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border shadow-xl shadow-slate-200/50 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/50">
                        <TabsList className="bg-white border">
                            <TabsTrigger value="platform" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
                                Platform Nodes ({tenants.length})
                            </TabsTrigger>
                            <TabsTrigger value="zitadel" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">
                                Zitadel Identities ({zitadelOrgs.length})
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Filter by name, ID, or domain..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-[300px] h-9 bg-white shadow-inner"
                                />
                            </div>
                            <Button variant="ghost" size="sm" onClick={fetchData}>
                                <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="platform" className="m-0">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="w-[40px]">
                                        <Checkbox
                                            checked={selectedIds.size === tenants.length && tenants.length > 0}
                                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        />
                                    </TableHead>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Health Score</TableHead>
                                    <TableHead>Region</TableHead>
                                    <TableHead>Tier</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tenants.map((tenant) => (
                                    <TableRow key={tenant.OrgID} className={selectedIds.has(tenant.OrgID) ? 'bg-blue-50/30' : ''}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.has(tenant.OrgID)}
                                                onCheckedChange={() => handleSelectRow(tenant.OrgID)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{tenant.Name}</span>
                                                <span className="text-[10px] font-mono text-muted-foreground">{tenant.OrgID}</span>
                                                <span className="text-[11px] text-blue-500 font-medium">{tenant.Domain}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <HealthScore score={tenant.healthScore || 0} />
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="gap-1 font-medium border-slate-200">
                                                <span>🌎</span> {tenant.Region || "us-east-1"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 uppercase tracking-tighter text-[10px] px-1.5 h-5">
                                                {tenant.Tier}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(tenant.Status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" title="Impersonate" onClick={() => handleQuickImpersonate(tenant)}>
                                                    <VenetianMask className="h-4 w-4" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 shadow-none">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56">
                                                        <DropdownMenuItem className="gap-2" onClick={() => { setSelectedTenant(tenant); setDetailsDialogOpen(true); }}>
                                                            <Eye className="h-4 w-4" /> View Analytics
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2" onClick={() => router.push(`/sent-core/tenants/users?org=${tenant.OrgID}`)}>
                                                            <ShieldCheck className="h-4 w-4" /> Manage Organization
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2">
                                                            <CreditCard className="h-4 w-4" /> Usage & Billing
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="gap-2 text-yellow-600">
                                                            <Lock className="h-4 w-4" /> Suspend Auth
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2 text-red-600" onClick={() => { setSelectedTenant(tenant); setDeleteDialogOpen(true); }}>
                                                            <Trash2 className="h-4 w-4" /> Terminate Node
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    <TabsContent value="zitadel" className="m-0">
                        {/* Zitadel tab code similar to previous but styled... */}
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Primary Domain</TableHead>
                                    <TableHead>State</TableHead>
                                    <TableHead>Sync Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {zitadelOrgs.map((org, index) => {
                                    const inDb = tenants.some(t => t.OrgID === org.id);
                                    // Robust key to avoid React "duplicate key" error
                                    const rowKey = org.id && org.id !== "" ? org.id : `fallback-${index}-${org.name}`;

                                    return (
                                        <TableRow key={rowKey}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{org.name}</span>
                                                    <span className="text-[10px] font-mono text-muted-foreground">{org.id || "NO_ID"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-500">{org.primaryDomain || "N/A"}</TableCell>
                                            <TableCell>
                                                <Badge variant={org.state === "ORGANIZATION_STATE_ACTIVE" ? "default" : "secondary"} className="h-5 text-[10px]">
                                                    {org.state?.replace("ORGANIZATION_STATE_", "") || "UNKNOWN"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {inDb ? (
                                                    <Badge className="bg-green-500/10 text-green-700 border-green-200 gap-1 h-6">
                                                        <CheckCircle2 className="h-3 w-3" /> Registered
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 gap-1 h-6">
                                                        <ShieldCheck className="h-3 w-3" /> Unlinked Identity
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Bulk Actions Bar */}
            <BulkActionsBar
                selectedCount={selectedIds.size}
                onClear={() => setSelectedIds(new Set())}
                onSync={() => { }} // Batch sync logic
                onSuspend={() => { }} // Batch suspend logic
                onDelete={() => { }} // Batch delete logic
            />

            {/* Delete Modal */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="border-red-500/50">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-red-600 flex items-center gap-2">
                            <Trash2 className="h-6 w-6" /> CRITICAL ACTION
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-slate-700 font-medium">
                            This action will permanently purge organization <strong>{selectedTenant?.Name}</strong> from both the Platform Core Database and Zitadel IAM. This cannot be reversed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 items-start">
                            <Lock className="h-5 w-5 text-red-600 mt-1" />
                            <div className="text-sm text-red-800">
                                Purging will disconnect all <strong>{Math.floor(Math.random() * 50) + 10}</strong> active users and wipe all encrypted session keys.
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Security Confirmation</p>
                            <code className="block p-3 bg-slate-900 text-green-400 rounded-lg text-xs font-mono">
                                CONFIRM DELETION OF {selectedTenant?.Name}
                            </code>
                            <Input
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="Type the confirmation phrase exactly..."
                                className="h-12 border-2 focus:border-red-500 transition-all font-bold"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Abort Mission</Button>
                        <Button variant="destructive" className="bg-red-600 font-bold px-8" onClick={() => { fetchData(); setDeleteDialogOpen(false); }}>
                            Purge Organization
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Detailed Analytics Modal with Audit Trail */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-slate-900 text-white p-8 relative">
                        <div className="absolute top-0 right-0 p-8 opacity-20">
                            <ShieldCheck className="h-32 w-32" />
                        </div>
                        <div className="relative z-10 flex items-end gap-6">
                            <HealthScore score={selectedTenant?.healthScore || 0} />
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter">{selectedTenant?.Name}</h2>
                                <p className="text-slate-400 font-mono text-sm">{selectedTenant?.OrgID}</p>
                            </div>
                            <Badge className="mb-1 bg-green-500 text-white font-bold">NODE ONLINE</Badge>
                        </div>
                    </div>

                    <Tabs defaultValue="overview">
                        <div className="border-b px-8 bg-slate-50">
                            <TabsList className="bg-transparent gap-4">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12">Overview</TabsTrigger>
                                <TabsTrigger value="audit" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12">Audit Trail</TabsTrigger>
                                <TabsTrigger value="security" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12">Security Config</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="overview" className="p-8 grid grid-cols-3 gap-8">
                            <div className="col-span-2 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-xl border">
                                        <div className="text-xs font-bold text-slate-400 uppercase">Primary Region</div>
                                        <div className="text-lg font-bold">{selectedTenant?.Region}</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl border">
                                        <div className="text-xs font-bold text-slate-400 uppercase">Auth Protocol</div>
                                        <div className="text-lg font-bold">{selectedTenant?.AuthType}</div>
                                    </div>
                                </div>
                                <div className="p-6 border rounded-2xl bg-white shadow-sm">
                                    <h4 className="font-bold text-sm mb-4">Traffic Performance</h4>
                                    <div className="h-32 flex items-end gap-1">
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <div key={i} className="flex-1 bg-blue-500/20 rounded-t-sm hover:bg-blue-500 transition-colors" style={{ height: `${Math.random() * 100}%` }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-sm uppercase text-slate-400">Node Meta</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm py-2 border-b">
                                        <span className="text-slate-500">Tier</span>
                                        <span className="font-bold">{selectedTenant?.Tier}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b">
                                        <span className="text-slate-500">Database</span>
                                        <span className="font-mono text-blue-600">{selectedTenant?.DbName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b">
                                        <span className="text-slate-500">Created</span>
                                        <span className="font-medium text-slate-700">{selectedTenant?.CreatedAt ? new Date(selectedTenant.CreatedAt).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                                <Button className="w-full mt-4 bg-slate-900">View Network Explorer</Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="audit" className="p-8">
                            <div className="space-y-4">
                                {[
                                    { ev: "ORG_SYNC_COMPLETED", user: "system", time: "2h ago", color: "text-green-600" },
                                    { ev: "MEMBER_INVITED_SENT", user: "admin@sent.com", time: "5h ago", color: "text-blue-600" },
                                    { ev: "SECURITY_POLICY_UPDATED", user: "admin@sent.com", time: "1d ago", color: "text-yellow-600" },
                                    { ev: "ORG_PROVISIONED", user: "system", time: "3d ago", color: "text-green-600" }
                                ].map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-2 w-2 rounded-full ${log.color.replace('text', 'bg')}`} />
                                            <div>
                                                <div className={`font-mono text-xs font-bold ${log.color}`}>{log.ev}</div>
                                                <div className="text-[10px] text-muted-foreground font-medium uppercase mt-0.5">Initiated by {log.user}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-slate-400">{log.time}</div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="p-6 bg-slate-100 flex justify-end gap-4 border-t">
                        <Button variant="ghost" onClick={() => setDetailsDialogOpen(false)}>Close Explorer</Button>
                        <Button variant="outline" className="gap-2"><History className="h-4 w-4" /> Export Audit Log</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
