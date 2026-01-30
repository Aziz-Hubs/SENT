import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Plus, Play, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Job {
  id: number;
  name: string;
  schedule: string;
  targets: string[];
  script_name: string;
  script_id: number;
  last_run: string;
  next_run: string;
}

interface Script {
  id: number;
  name: string;
}

const JobScheduler: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    scriptId: "",
    target: "all", // MVP: all or specific (comma separated)
    schedule: "", // Cron expression
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        const res = await w.go.bridge.PulseBridge.ListJobs();
        setJobs(res || []);

        // Also fetch scripts for the dropdown
        const scriptRes = await w.go.bridge.PulseBridge.ListScripts();
        setScripts(scriptRes || []);
      } else {
        // Mock data
        setJobs([
          {
            id: 1,
            name: "Daily Cleanup",
            schedule: "0 0 * * *",
            targets: ["all"],
            script_name: "Cleanup-Temp",
            script_id: 2,
            last_run: "Yesterday",
            next_run: "Today",
          },
        ]);
        setScripts([
          { id: 1, name: "Get-SystemInfo" },
          { id: 2, name: "Cleanup-Temp" },
        ]);
      }
    } catch (err) {
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSave = async () => {
    try {
      const w = window as any;
      const targets =
        formData.target === "all"
          ? ["all"]
          : formData.target.split(",").map((s) => s.trim());

      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        await w.go.bridge.PulseBridge.CreateJob(
          formData.name,
          parseInt(formData.scriptId),
          targets,
          formData.schedule,
        );
        toast.success("Job scheduled");
        fetchJobs();
        setIsModalOpen(false);
      } else {
        toast.success("Mock: Job scheduled");
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error("Failed to create job");
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 fade-in h-4/5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Scheduler</h1>
          <p className="text-muted-foreground">
            Automate tasks across your fleet.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Schedule Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Schedule a script to run automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Job Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Weekly Maintenance"
                />
              </div>
              <div className="space-y-2">
                <Label>Script</Label>
                <Select
                  value={formData.scriptId}
                  onValueChange={(v) =>
                    setFormData({ ...formData, scriptId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a script..." />
                  </SelectTrigger>
                  <SelectContent>
                    {scripts.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Devices</Label>
                <Select
                  value={formData.target}
                  onValueChange={(v) => setFormData({ ...formData, target: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    {/* Feature: Add groups later */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Schedule (Cron)</Label>
                <Input
                  value={formData.schedule}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule: e.target.value })
                  }
                  placeholder="0 0 * * * (Daily at midnight)"
                />
                <p className="text-xs text-muted-foreground">
                  Type "manual" for manual execution only.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Create Job</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Script</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Targets</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No jobs scheduled.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="font-medium">{j.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {j.script_name}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {j.schedule || "Manual"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {j.targets.join(", ")}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {j.last_run ? j.last_run : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Play className="h-4 w-4 text-green-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default JobScheduler;
