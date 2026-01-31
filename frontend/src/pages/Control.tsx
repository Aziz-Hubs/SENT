import React, { useState, useEffect } from "react";
import {
  Shield,
  Zap,
  AlertTriangle,
  BarChart3,
  Users,
  ExternalLink,
  Trash2,
  LayoutGrid,
  PieChart,
  Lock,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, MoreHorizontal, ArrowRightCircle } from "lucide-react";

import { useAppStore } from "@/store/useAppStore";

const ControlPage: React.FC = () => {
  const { activeTab } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const apps = [
    {
      name: "Microsoft 365",
      provider: "Microsoft",
      status: "Healthy",
      users: 450,
      cost: "$5,400",
    },
    {
      name: "Google Workspace",
      provider: "Google",
      status: "Healthy",
      users: 380,
      cost: "$4,560",
    },
    {
      name: "Slack",
      provider: "Slack Technologies",
      status: "Warning",
      users: 210,
      cost: "$2,100",
    },
    {
      name: "Salesforce",
      provider: "Salesforce Inc.",
      status: "Healthy",
      users: 45,
      cost: "$3,375",
    },
  ];

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.provider.toLowerCase().includes(search.toLowerCase()),
  );

  const breadcrumbs = [
    { label: "Infrastructure" },
    { label: "SENTcontrol SMP" },
  ];

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        title="SENTcontrol"
        description="SaaS Management, License Optimization & Cloud Governance"
        icon={Shield}
        breadcrumbs={breadcrumbs}
        primaryAction={{
          label: "Connect SaaS App",
          icon: Plus,
          onClick: () =>
            toast.info("New Connection", {
              description: "Opening SaaS connector gallery.",
            }),
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-gradient-to-br from-red-500/10 via-background to-background border-red-500/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <AlertTriangle className="h-32 w-32 text-red-500" />
          </div>
          <CardContent className="p-8">
            <div className="flex flex-col gap-1">
              <span className="text-red-500 font-bold tracking-widest text-xs uppercase">
                Optimization ROI Target
              </span>
              <h2 className="text-5xl font-black tracking-tighter">
                $3,420.00
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Total reclaimable waste identified from{" "}
                <span className="text-foreground font-bold">
                  7 underutilized enterprise licenses
                </span>{" "}
                and{" "}
                <span className="text-foreground font-bold">
                  2 shadow subscriptions
                </span>
                .
              </p>
            </div>
            <div className="flex gap-4 mt-6">
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold h-10 px-6">
                <Zap className="h-4 w-4 mr-2" /> Start Automation Bulk-Reclaim
              </Button>
              <Button
                variant="outline"
                className="h-10 px-6 border-red-500/20 text-red-500 hover:bg-red-500/5"
              >
                Download Forensic Export (PDF)
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-rows-2 gap-4">
          <StatsCard
            title="Total SaaS Spend"
            value="$42,850"
            color="text-emerald-500"
            icon={PieChart}
          />
          <StatsCard
            title="MFA Compliance"
            value="92%"
            color="text-blue-500"
            icon={Lock}
          />
        </div>
      </div>

      <div className="mt-8">
        {(activeTab === "overview" || activeTab === "managed") && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-72 group">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
                <Input
                  placeholder="Search inventory..."
                  className="pl-9 h-9 border-none shadow-sm bg-background/50 backdrop-blur-sm focus-visible:ring-indigo-500/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {selectedApps.length > 0 && (
                <div className="flex gap-2 animate-in slide-in-from-right-2">
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <ArrowRightCircle className="h-4 w-4" /> Bulk Move
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-9 font-bold"
                  >
                    Deprovision ({selectedApps.length})
                  </Button>
                </div>
              )}
            </div>
            <Card className="border-none shadow-md overflow-hidden bg-background/40 backdrop-blur-md">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-12 pl-6">
                        <Checkbox
                          checked={
                            selectedApps.length === filteredApps.length &&
                            filteredApps.length > 0
                          }
                          onCheckedChange={(checked) =>
                            setSelectedApps(
                              checked ? filteredApps.map((a) => a.name) : [],
                            )
                          }
                        />
                      </TableHead>
                      <TableHead>Application</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Monthly Cost</TableHead>
                      <TableHead className="text-right pr-6">
                        Management
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApps.map((app, i) => (
                      <TableRow
                        key={i}
                        className={`group hover:bg-muted/50 transition-colors ${selectedApps.includes(app.name) ? "bg-indigo-500/5" : ""}`}
                      >
                        <TableCell className="pl-6">
                          <Checkbox
                            checked={selectedApps.includes(app.name)}
                            onCheckedChange={(checked) => {
                              setSelectedApps((prev) =>
                                checked
                                  ? [...prev, app.name]
                                  : prev.filter((n) => n !== app.name),
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-sm">{app.name}</div>
                          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                            {app.provider}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              app.status === "Healthy"
                                ? "secondary"
                                : "destructive"
                            }
                            className="h-5 text-[10px]"
                          >
                            {app.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {app.users}
                        </TableCell>
                        <TableCell className="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {app.cost}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toast.info(`Managing ${app.name}`)}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] font-bold uppercase tracking-tighter"
                            >
                              Optimization
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "shadow" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <Card className="bg-amber-500/5 border-amber-500/20 shadow-none">
                <CardContent className="p-6 flex items-start gap-4">
                  <AlertTriangle className="h-8 w-8 text-amber-500 shrink-0" />
                  <div>
                    <h3 className="font-bold text-amber-700 dark:text-amber-400">
                      Unmanaged Assets Detected
                    </h3>
                    <p className="text-sm text-amber-600 dark:text-amber-500/80 max-w-2xl mt-1">
                      The Discovery Engine has correlated SENTcapital financial
                      records with SENTgrid SNI flow logs. The following
                      applications are being used without corporate oversight.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-amber-500" /> Risk Scoring
                    Matrix (Forensic Discovery)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">
                          Unvetted Application
                        </TableHead>
                        <TableHead>Usage Frequency</TableHead>
                        <TableHead>Data Sensitivity</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead className="text-right pr-6">
                          Mitigation Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        {
                          name: "Dropbox",
                          frequency: "High (200+ Requests/hr)",
                          sensitivity: "Level 4 (PII/Client Data)",
                          score: 88,
                          class: "bg-red-500/10 text-red-500",
                        },
                        {
                          name: "Miro",
                          frequency: "Medium (Intermittent)",
                          sensitivity: "Level 2 (Internal IP)",
                          score: 42,
                          class: "bg-yellow-500/10 text-yellow-500",
                        },
                        {
                          name: "ChatGPT (Personal)",
                          frequency: "Extreme (Continuous)",
                          sensitivity: "Level 5 (Unauth AI Training)",
                          score: 95,
                          class: "bg-red-600/20 text-red-600",
                        },
                        {
                          name: "Calendly",
                          frequency: "Low (API Only)",
                          sensitivity: "Level 1 (Public)",
                          score: 14,
                          class: "bg-green-500/10 text-green-500",
                        },
                      ].map((app, i) => (
                        <TableRow
                          key={i}
                          className="group hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="pl-6">
                            <div className="font-bold text-sm">{app.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              DETECTED VIA SENTGRID FLOW ANALYTICS
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {app.frequency}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {app.sensitivity}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${app.score > 70 ? "bg-red-500" : "bg-yellow-500"}`}
                                  style={{ width: `${app.score}%` }}
                                />
                              </div>
                              <Badge
                                className={`h-5 text-[10px] font-bold ${app.class}`}
                              >
                                {app.score} / 100
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px] font-bold"
                              >
                                VET ASSET
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-7 text-[10px] font-bold"
                              >
                                BLOCK FLOW
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <Card className="bg-primary/5 border-primary/20 shadow-none">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="p-3 bg-primary rounded-xl text-primary-foreground">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary">
                        Automated Downgrades Active
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        SENTcontrol is automatically transitioning underutilized
                        premium licenses to standard tiers.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="bg-background">
                    Configure Policy
                  </Button>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    user: "john.doe@company.com",
                    app: "Microsoft 365",
                    from: "E5",
                    to: "E3",
                    savings: "$23.00/mo",
                    reason: "No advanced security features used in 60 days",
                  },
                  {
                    user: "jane.smith@company.com",
                    app: "Slack",
                    from: "Enterprise",
                    to: "Pro",
                    savings: "$12.00/mo",
                    reason: "User not in restricted security channels",
                  },
                ].map((rec, i) => (
                  <Card
                    key={i}
                    className="hover:border-emerald-500/50 transition-colors"
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-black text-xs border">
                          {rec.user[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{rec.user}</div>
                          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                            {rec.app}: {rec.from} → {rec.to}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                          +{rec.savings}
                        </div>
                        <div className="text-[10px] text-muted-foreground max-w-[250px] leading-tight mt-1 italic">
                          {rec.reason}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function StatsCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-black ${color}`}>{value}</div>
      </CardContent>
      <div className={`h-1 w-full opacity-10 ${color.replace("text", "bg")}`} />
    </Card>
  );
}

export default ControlPage;
