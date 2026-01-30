import React from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Briefcase,
  Plus,
  Calendar as CalendarIcon,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface Project {
  id: number;
  name: string;
  status: "PLANNED" | "APPROVED" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  cost: number;
  date: string;
}

export const StrategicRoadmap: React.FC<{
  projects: Project[];
  onAddProject?: () => void;
}> = ({ projects, onAddProject }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4 text-indigo-500" />;
      default:
        return <Briefcase className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityVariant = (
    prio: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (prio) {
      case "CRITICAL":
        return "destructive";
      case "HIGH":
        return "default"; // Using default for High
      case "MEDIUM":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-card">
      <CardHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <Briefcase className="h-3 w-3 text-primary" /> Technology Roadmap
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[10px] gap-1 px-2"
          onClick={onAddProject}
        >
          <Plus className="h-3 w-3" /> Add Project
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {projects.map((p) => (
            <div
              key={p.id}
              className="p-4 hover:bg-muted/50 transition-colors flex items-center gap-4 group cursor-pointer"
            >
              <div className="p-2 bg-muted rounded-lg group-hover:bg-background transition-colors shadow-sm">
                {getStatusIcon(p.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-sm text-foreground truncate">
                    {p.name}
                  </span>
                  <Badge
                    variant={getPriorityVariant(p.priority)}
                    className="text-[10px] px-1.5 py-0 h-4 min-w-[50px] justify-center"
                  >
                    {p.priority}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" /> {p.date}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-foreground/80">
                    <DollarSign className="h-3 w-3" /> {formatCurrency(p.cost)}
                  </span>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <AlertTriangle className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
