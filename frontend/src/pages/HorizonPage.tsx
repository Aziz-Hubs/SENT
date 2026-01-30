import React, { useState, useEffect } from "react";
import { HealthScoreCard } from "../components/horizon/HealthScoreCard";
import { BudgetWall } from "../components/horizon/BudgetWall";
import { StrategicRoadmap } from "../components/horizon/StrategicRoadmap";
import {
  FileText,
  Send,
  Download,
  LayoutDashboard,
  TrendingUp,
  PieChart,
  Settings,
  Calendar,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ControlPanel,
  type ScenarioLevers,
} from "../components/horizon/ControlPanel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
// @ts-ignore
import * as Bridge from "../../wailsjs/go/horizon/HorizonBridge";

const HorizonPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [commentary, setCommentary] = useState(
    "Infrastructure is currently stable. Recommend prioritizing the server refresh in Q3 to avoid the projected budget wall. Security compliance remains high, though 3rd party patching needs attention.",
  );

  const [projects, setProjects] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    priority: "MEDIUM",
    cost: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [showControls, setShowControls] = useState(true);
  const [levers, setLevers] = useState<ScenarioLevers>({
    revenueGrowth: 12,
    inflationRate: 3.5,
    headcountGrowth: 5,
    opexEfficiency: 0,
    marketCondition: "stagnant",
    showVariance: true,
  });

  const baseForecastData = [
    { month: "Jan", amount: 1200, isPeak: false },
    { month: "Feb", amount: 1500, isPeak: false },
    { month: "Mar", amount: 1100, isPeak: false },
    { month: "Apr", amount: 1800, isPeak: false },
    { month: "May", amount: 2000, isPeak: false },
    { month: "Jun", amount: 7600, isPeak: true }, // The Wall
    { month: "Jul", amount: 1400, isPeak: false },
    { month: "Aug", amount: 1600, isPeak: false },
    { month: "Sep", amount: 1900, isPeak: false },
    { month: "Oct", amount: 2100, isPeak: false },
    { month: "Nov", amount: 1800, isPeak: false },
    { month: "Dec", amount: 2500, isPeak: false },
  ];

  const fetchRoadmap = async () => {
    try {
      const data = await Bridge.GetRoadmap();
      setProjects(data || []);
    } catch (err) {
      console.error("Failed to fetch roadmap:", err);
      toast.error("Cloud Sync Failed", {
        description: "Could not retrieve strategic roadmap from the vault.",
      });
    }
  };

  useEffect(() => {
    fetchRoadmap();
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // The Physics Engine: Stochastic Logic for Scenarios
  const scenarioData = React.useMemo(() => {
    const marketMultipliers = {
      bull: 1.15,
      stagnant: 1.0,
      bear: 0.85,
    };

    return baseForecastData.map((item) => {
      // Base modifiers
      const inflationFactor = 1 + levers.inflationRate / 100;
      const headcountFactor = 1 + levers.headcountGrowth / 100;
      const marketFactor =
        marketMultipliers[
          levers.marketCondition as keyof typeof marketMultipliers
        ] || 1.0;

      // Compound calculation
      let multiplier = 1;

      if (item.isPeak) {
        multiplier = inflationFactor * marketFactor;
      } else {
        multiplier = inflationFactor * headcountFactor * marketFactor;
      }

      if (levers.opexEfficiency > 0) {
        multiplier = multiplier * (1 - levers.opexEfficiency / 100);
      }

      const scenarioAmount = Math.round(item.amount * multiplier);

      return {
        ...item,
        scenarioAmount,
        delta: scenarioAmount - item.amount,
      };
    });
  }, [baseForecastData, levers]);

  const handleSaveProject = async () => {
    if (!newProject.name || !newProject.cost) {
      toast.error("Validation Error", {
        description: "Please provide a project name and estimated cost.",
      });
      return;
    }

    try {
      await Bridge.AddProject(
        newProject.name,
        newProject.description,
        newProject.priority,
        parseFloat(newProject.cost),
        newProject.date,
      );
      toast.success("Strategic Project Created", {
        description: `${newProject.name} has been added to the technology roadmap.`,
      });
      setIsAddDialogOpen(false);
      setNewProject({
        name: "",
        description: "",
        priority: "MEDIUM",
        cost: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchRoadmap();
    } catch (err) {
      console.error(err);
      toast.error("Execution Error", {
        description: "Failed to persist the project to the database.",
      });
    }
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await Bridge.GenerateQBR(commentary);
      toast.success("QBR Report generated and saved to SENTvault.");
    } catch (err) {
      console.error(err);
      toast.error("Report Generation Failed");
    }
    setIsGenerating(false);
  };

  const breadcrumbs = [
    { label: "Infrastructure" },
    { label: "SENThorizon vCIO" },
  ];

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        title="SENThorizon"
        description="Strategic vCIO Insight Engine & Lifecycle Roadmap"
        icon={TrendingUp}
        breadcrumbs={breadcrumbs}
        primaryAction={{
          label: "Generate QBR",
          icon: FileText,
          onClick: handleGenerateReport,
        }}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-9 text-xs"
            onClick={() => setShowControls(!showControls)}
          >
            {showControls ? (
              <PanelLeftClose className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftOpen className="h-3.5 w-3.5" />
            )}
            {showControls ? "Hide Controls" : "Show Simulator"}
          </Button>
          <Button variant="outline" className="gap-2 h-9 text-xs">
            <Calendar className="h-3.5 w-3.5" /> Roadmap Settings
          </Button>
        </div>
      </PageHeader>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Collapsible Control Deck */}
        <div
          className={`transition-all duration-300 ease-in-out ${showControls ? "w-full lg:w-80 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}
        >
          <ControlPanel levers={levers} setLevers={setLevers} />
        </div>

        <div className="flex-1 space-y-8 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3">
              <BudgetWall
                data={scenarioData}
                showVariance={levers.showVariance}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <HealthScoreCard
                score={82}
                performance={88}
                security={75}
                lifecycle={92}
              />

              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="p-4 border-b bg-muted/30">
                  <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Send className="h-3 w-3 text-primary" /> vCIO Strategic
                    Commentary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <textarea
                    value={commentary}
                    onChange={(e) => setCommentary(e.target.value)}
                    className="w-full h-48 text-sm leading-relaxed text-foreground bg-muted/20 p-4 rounded-xl border-none focus:ring-2 focus:ring-primary/20 resize-none transition-all outline-none"
                    placeholder="Enter executive summary..."
                  />
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-[10px] text-muted-foreground italic font-medium flex items-center gap-1">
                      <Zap className="h-2.5 w-2.5" /> Auto-saved to SENTnexus
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] uppercase font-bold tracking-widest"
                    >
                      Update Insights
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <StrategicRoadmap
                projects={projects}
                onAddProject={() => setIsAddDialogOpen(true)}
              />
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" /> New Strategic
                    Project
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Core Switch Refresh"
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cost">Estimated Cost ($)</Label>
                    <Input
                      id="cost"
                      type="number"
                      placeholder="0.00"
                      value={newProject.cost}
                      onChange={(e) =>
                        setNewProject({ ...newProject, cost: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2 text-xs">
                    <Label>Priority Level</Label>
                    <Select
                      value={newProject.priority}
                      onValueChange={(val) =>
                        setNewProject({ ...newProject, priority: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">LOW</SelectItem>
                        <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                        <SelectItem value="HIGH">HIGH</SelectItem>
                        <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Target Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newProject.date}
                      onChange={(e) =>
                        setNewProject({ ...newProject, date: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProject}>
                    Add to Roadmap
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizonPage;
