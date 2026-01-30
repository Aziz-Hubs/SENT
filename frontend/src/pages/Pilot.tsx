import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Ticket,
  Briefcase,
  Clock,
  AlertCircle,
  CheckCircle2,
  Search,
  Plus,
  MoreVertical,
  Timer,
  BarChart3,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAppStore } from "@/store/useAppStore";
import { ContextSidebar } from "@/components/layout/ContextSidebar";
import { cn } from "@/lib/utils";

// Mock Data for Tickets
const MOCK_TICKETS = [
  {
    id: "TICK-1024",
    title: "Server Offline: DB-PROD-01",
    client: "Acme Corp",
    priority: "critical",
    status: "open",
    assignedTo: "Aziz",
    created: "2 hrs ago",
    sla: "1 hr remaining",
  },
  {
    id: "TICK-1025",
    title: "User cannot reset password",
    client: "Globex Inc",
    priority: "medium",
    status: "in_progress",
    assignedTo: "Sarah",
    created: "4 hrs ago",
    sla: "4 hrs remaining",
  },
  {
    id: "TICK-1026",
    title: "New Employee Onboarding",
    client: "Soylent Corp",
    priority: "low",
    status: "open",
    assignedTo: "Unassigned",
    created: "1 day ago",
    sla: "2 days remaining",
  },
];

// Mock Projects
const MOCK_PROJECTS = [
  {
    id: "PROJ-200",
    name: "Office 365 Migration",
    client: "Acme Corp",
    progress: 75,
    status: "on_track",
    deadline: "2024-03-30",
  },
  {
    id: "PROJ-201",
    name: "Network Upgrade - NY Office",
    client: "Globex Inc",
    progress: 30,
    status: "at_risk",
    deadline: "2024-04-15",
  },
];

export function Pilot() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const { setContextSidebar, toggleContext, isContextOpen } = useAppStore();
  const [activeTab, setActiveTab] = useState("tickets");

  const handleTicketClick = (ticket: any) => {
    toast.info(`Opening Ticket ${ticket.id}`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-100 border-red-200";
      case "high":
        return "text-orange-600 bg-orange-100 border-orange-200";
      case "medium":
        return "text-blue-600 bg-blue-100 border-blue-200";
      default:
        return "text-slate-600 bg-slate-100 border-slate-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "in_progress":
        return "bg-amber-500/10 text-amber-600 border-amber-200";
      case "resolved":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  const breadcrumbs = [{ label: "Service" }, { label: "SENTpilot PSA" }];

  return (
    <div className="space-y-6 fade-in p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="SENTpilot"
        description="Professional Services Automation (PSA) & Helpdesk"
        icon={Briefcase}
        breadcrumbs={breadcrumbs}
        primaryAction={{
          label: "New Ticket",
          icon: Plus,
          onClick: () => toast.info("Create Ticket Wizard"),
        }}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Open Tickets"
          value={tickets.length.toString()}
          icon={Ticket}
          color="text-blue-500"
          footer="2 Critical"
        />
        <StatsCard
          title="Avg Response Time"
          value="14m"
          icon={Timer}
          color="text-emerald-500"
          footer="-2m vs last week"
        />
        <StatsCard
          title="SLA Breaches"
          value="0"
          icon={AlertCircle}
          color="text-red-500"
          footer="100% Compliance"
        />
        <StatsCard
          title="Active Projects"
          value={projects.length.toString()}
          icon={BarChart3}
          color="text-purple-500"
          footer="1 At Risk"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="tickets" className="gap-2">
            <Ticket className="h-4 w-4" /> Service Desk
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <Briefcase className="h-4 w-4" /> Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ticket Queue</CardTitle>
                <CardDescription>
                  Manage support requests and incidents.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Search tickets..." className="w-64" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>SLA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow
                      key={t.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleTicketClick(t)}
                    >
                      <TableCell className="font-mono font-medium text-primary">
                        {t.id}
                      </TableCell>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.client}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "uppercase text-[10px]",
                            getPriorityColor(t.priority),
                          )}
                        >
                          {t.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize border",
                            getStatusColor(t.status),
                          )}
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{t.assignedTo}</TableCell>
                      <TableCell
                        className={cn(
                          "text-xs font-mono",
                          t.sla.includes("remaining")
                            ? "text-emerald-600"
                            : "text-red-500",
                        )}
                      >
                        {t.sla}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>
                Track project timelines and milestones.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow
                      key={p.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.client}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {p.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            p.status === "on_track"
                              ? "text-emerald-600 border-emerald-200"
                              : "text-amber-600 border-amber-200",
                          )}
                        >
                          {p.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {p.deadline}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color, footer }: any) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{footer}</p>
        </div>
      </CardContent>
    </Card>
  );
}
