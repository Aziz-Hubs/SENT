import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Ticket,
  Clock,
  ShieldAlert,
  User,
  Timer,
  FileText,
  Plus,
  Kanban,
  List,
  MoreVertical,
  Zap,
  MessageSquare,
} from "lucide-react";

// @ts-ignore
import { GetTickets, AssignTicket } from "../../wailsjs/go/pilot/PilotBridge";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { ContextSidebar } from "@/components/layout/ContextSidebar";

/**
 * Pilot page serves as the operational cockpit for ITSM.
 * Standardized with Phase 3 UI/UX mandates.
 */
export function Helpdesk() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"kanban" | "list">("kanban");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const { setContextSidebar, toggleContext, isContextOpen } = useAppStore();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      if (window.go) {
        const res = await GetTickets();
        setTickets(res || []);
      }
    } catch (err) {
      toast.error("Failed to load tickets");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleTicketClick = (ticket: any) => {
    setSelectedTicket(ticket);
    setContextSidebar(<TicketDetails ticket={ticket} />);
    toggleContext(true);
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "p1":
        return "bg-red-600 text-white hover:bg-red-700";
      case "p2":
        return "bg-orange-500 text-white hover:bg-orange-600";
      case "p3":
        return "bg-blue-500 text-white hover:bg-blue-600";
      default:
        return "bg-slate-500 text-white hover:bg-slate-600";
    }
  };

  const breadcrumbs = [{ label: "Infrastructure" }, { label: "SENTpilot PSA" }];

  if (loading && tickets.length === 0) {
    return (
      <div className="space-y-6 fade-in">
        <Skeleton className="h-10 w-48" />
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
        title="SENTpilot"
        description="ITSM Cockpit & Incident Response"
        icon={Ticket}
        breadcrumbs={breadcrumbs}
        primaryAction={{
          label: "New Incident",
          icon: Plus,
          onClick: () =>
            toast.info("New Incident", {
              description: "Opening rapid intake form.",
            }),
        }}
      >
        <div className="flex bg-muted rounded-lg p-1 border">
          <Button
            variant={activeTab === "kanban" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-3 gap-2 text-xs"
            onClick={() => setActiveTab("kanban")}
          >
            <Kanban className="h-3.5 w-3.5" /> Kanban
          </Button>
          <Button
            variant={activeTab === "list" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 px-3 gap-2 text-xs"
            onClick={() => setActiveTab("list")}
          >
            <List className="h-3.5 w-3.5" /> List
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Open Tickets"
          icon={FileText}
          value={
            tickets.filter(
              (t) => t.status !== "resolved" && t.status !== "closed",
            ).length
          }
          color="text-blue-500"
        />
        <StatsCard
          title="Avg Resolution"
          icon={Timer}
          value="2.4h"
          color="text-green-500"
        />
        <StatsCard
          title="P1 Critical"
          icon={ShieldAlert}
          value={tickets.filter((t) => t.priority === "p1").length}
          color="text-red-500"
        />
        <StatsCard
          title="Unassigned"
          icon={User}
          value={tickets.filter((t) => !t.assignee).length}
          color="text-amber-500"
        />
      </div>

      {tickets.length === 0 && !loading ? (
        <EmptyState
          icon={Ticket}
          title="No Active Tickets"
          description="Your queue is empty. New incidents submitted via the SENTpulse agent will appear here."
          action={{
            label: "Create Manual Ticket",
            onClick: () => {},
          }}
        />
      ) : activeTab === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 custom-scrollbar">
          <KanbanColumn
            title="New"
            tickets={tickets.filter((t) => t.status === "new")}
            priorityColor={getPriorityColor}
            onTicketClick={handleTicketClick}
          />
          <KanbanColumn
            title="In Progress"
            tickets={tickets.filter((t) => t.status === "in_progress")}
            priorityColor={getPriorityColor}
            onTicketClick={handleTicketClick}
          />
          <KanbanColumn
            title="Waiting"
            tickets={tickets.filter((t) => t.status === "waiting")}
            priorityColor={getPriorityColor}
            onTicketClick={handleTicketClick}
          />
          <KanbanColumn
            title="Resolved"
            tickets={tickets.filter((t) => t.status === "resolved")}
            priorityColor={getPriorityColor}
            onTicketClick={handleTicketClick}
          />
          <KanbanColumn
            title="Closed"
            tickets={tickets.filter((t) => t.status === "closed")}
            priorityColor={getPriorityColor}
            onTicketClick={handleTicketClick}
          />
        </div>
      ) : (
        <Card className="overflow-hidden border-none shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-20 pl-6">ID</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t) => (
                  <TableRow
                    key={t.id}
                    className="hover:bg-muted/50 cursor-pointer group transition-colors"
                    onClick={() => handleTicketClick(t)}
                  >
                    <TableCell className="font-mono text-[10px] text-muted-foreground pl-6">
                      #{t.id}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getPriorityColor(t.priority)} h-5 px-1.5 text-[10px] border-none`}
                      >
                        {t.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      {t.subject}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {t.requester}
                    </TableCell>
                    <TableCell className="text-xs">
                      {t.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/20">
                            {t.assignee[0].toUpperCase()}
                          </div>
                          <span className="font-medium">{t.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[10px]">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="capitalize h-5 text-[10px]"
                      >
                        {t.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-[10px] text-muted-foreground pr-6">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Inject Context Sidebar content directly into MasterLayout via Portal or shared component */}
      {isContextOpen && (
        <ContextSidebar
          isOpen={isContextOpen}
          onClose={() => toggleContext(false)}
          title={`Ticket #${selectedTicket?.id}`}
        >
          <TicketDetails ticket={selectedTicket} />
        </ContextSidebar>
      )}
    </div>
  );
}

function TicketDetails({ ticket }: any) {
  if (!ticket) return null;
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge className="bg-red-600 border-none">
            {ticket.priority.toUpperCase()}
          </Badge>
          <Badge variant="outline">{ticket.status.toUpperCase()}</Badge>
        </div>
        <h2 className="text-xl font-bold mt-2">{ticket.subject}</h2>
        <p className="text-xs text-muted-foreground italic">
          Created on {new Date(ticket.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">
            Requester
          </span>
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-primary" />
            <span className="text-sm font-medium">{ticket.requester}</span>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">
            Assignee
          </span>
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-primary" />
            <span className="text-sm font-medium">
              {ticket.assignee || "Unassigned"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase text-muted-foreground">
          Chained Remediation
        </span>
        <div className="grid gap-2">
          <Button
            variant="outline"
            className="justify-start gap-2 h-9 text-xs"
            onClick={() => toast.success("Running Playbook...")}
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" /> Flush DNS & Restart
            Spooler
          </Button>
          <Button variant="outline" className="justify-start gap-2 h-9 text-xs">
            <Zap className="h-3.5 w-3.5 text-blue-500" /> Force Patch Update
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase text-muted-foreground">
          Activity Timeline
        </span>
        <div className="border rounded-lg p-3 bg-muted/30 min-h-[100px] flex flex-col items-center justify-center text-center">
          <MessageSquare className="h-4 w-4 text-muted-foreground/40 mb-2" />
          <p className="text-[10px] text-muted-foreground">
            No recent comments or system events.
          </p>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ title, tickets, priorityColor, onTicketClick }: any) {
  return (
    <div className="flex flex-col gap-3 min-w-[280px]">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground/70">
          {title}
        </h3>
        <Badge
          variant="secondary"
          className="rounded-full h-5 w-5 p-0 flex items-center justify-center text-[10px]"
        >
          {tickets.length}
        </Badge>
      </div>
      <div className="flex-1 space-y-3">
        {tickets.map((t: any) => (
          <Card
            key={t.id}
            className={`group cursor-pointer hover:border-primary transition-all border-l-4 ${t.priority === "p1" ? "border-l-red-600 shadow-md" : "border-l-slate-300"} hover:shadow-lg`}
            onClick={() => onTicketClick(t)}
          >
            <CardContent className="p-3 space-y-3">
              <div className="flex justify-between items-start">
                <Badge
                  className={`${priorityColor(t.priority)} text-[9px] h-4 px-1.5 border-none`}
                >
                  {t.priority.toUpperCase()}
                </Badge>
                <span className="text-[10px] font-mono opacity-40 group-hover:opacity-100 transition-opacity">
                  #{t.id}
                </span>
              </div>
              <p className="text-sm font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {t.subject}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  <div
                    className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-bold"
                    title={t.requester}
                  >
                    {t.requester ? t.requester[0].toUpperCase() : "U"}
                  </div>
                  {t.assignee && (
                    <div
                      className="h-6 w-6 rounded-full bg-primary/20 text-primary border-2 border-background flex items-center justify-center text-[8px] font-bold"
                      title={t.assignee}
                    >
                      {t.assignee[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-medium">
                  <Clock className="h-3 w-3" /> 2h
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatsCard({ title, icon: Icon, value, color }: any) {
  return (
    <Card className="bg-card border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
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
